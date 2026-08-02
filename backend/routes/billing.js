const express = require('express')
const stripe = require('../config/stripe')
const prisma = require('../config/prisma')
const auth = require('../middleware/auth')
const workspaceMiddleware = require('../middleware/workspace')
const requireRole = require('../middleware/requireRole')

const router = express.Router()

router.get('/:slug/billing/status', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.workspace.id },
      include: {
        _count: {
          select: { members: true, projects: true }
        }
      }
    })

    const limits = {
      FREE: { projects: 5, members: 10 },
      PRO:  { projects: 'unlimited', members: 'unlimited' }
    }

    res.json({
      plan: workspace.plan,
      subscriptionStatus: workspace.subscriptionStatus,
      stripeSubscriptionId: workspace.stripeSubscriptionId,
      usage: {
        projects: workspace._count.projects,
        members: workspace._count.members
      },
      limits: limits[workspace.plan]
    })
  } catch (err) {
    next(err)
  }
})

router.post('/:slug/billing/checkout', auth, workspaceMiddleware, requireRole('OWNER'), async (req, res, next) => {
  try {
    if (req.workspace.plan === 'PRO') {
      return res.status(400).json({ error: 'already on PRO plan' })
    }

    let stripeCustomerId = req.workspace.stripeCustomerId

    if (!stripeCustomerId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId }
      })

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { workspaceId: req.workspace.id, workspaceSlug: req.workspace.slug }
      })

      stripeCustomerId = customer.id

      await prisma.workspace.update({
        where: { id: req.workspace.id },
        data: { stripeCustomerId }
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/workspace/${req.workspace.slug}/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/workspace/${req.workspace.slug}/billing`,
      metadata: {
        workspaceId: req.workspace.id,
        workspaceSlug: req.workspace.slug
      }
    })

    res.json({ url: session.url })
  } catch (err) {
    next(err)
  }
})

router.post('/:slug/billing/portal', auth, workspaceMiddleware, requireRole('OWNER'), async (req, res, next) => {
  try {
    if (!req.workspace.stripeCustomerId) {
      return res.status(400).json({ error: 'no billing account found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: req.workspace.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/workspace/${req.workspace.slug}/billing`
    })

    res.json({ url: session.url })
  } catch (err) {
    next(err)
  }
})

const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: err.message })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const workspaceId = session.metadata.workspaceId

        await prisma.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: 'PRO',
            subscriptionStatus: 'ACTIVE',
            stripeSubscriptionId: session.subscription
          }
        })
        console.log(`Workspace ${workspaceId} upgraded to PRO`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const workspace = await prisma.workspace.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        })

        // Only map statuses we understand. Stripe emits many transient states
        // (trialing, incomplete, paused, incomplete_expired) that must not be
        // treated as cancelled — leave those unchanged.
        const statusMap = {
          active: 'ACTIVE',
          past_due: 'PAST_DUE',
          unpaid: 'PAST_DUE',
          canceled: 'CANCELLED'
        }
        const subscriptionStatus = statusMap[subscription.status]

        if (workspace && subscriptionStatus) {
          await prisma.workspace.update({
            where: { id: workspace.id },
            data: { subscriptionStatus }
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const workspace = await prisma.workspace.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        })

        if (workspace) {
          await prisma.workspace.update({
            where: { id: workspace.id },
            data: {
              plan: 'FREE',
              subscriptionStatus: 'CANCELLED',
              stripeSubscriptionId: null
            }
          })
          console.log(`Workspace ${workspace.id} downgraded to FREE`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const workspace = await prisma.workspace.findFirst({
          where: { stripeCustomerId: invoice.customer }
        })

        if (workspace) {
          await prisma.workspace.update({
            where: { id: workspace.id },
            data: { subscriptionStatus: 'PAST_DUE' }
          })
        }
        break
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = router
module.exports.webhookHandler = webhookHandler