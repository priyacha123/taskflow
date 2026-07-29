const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
const { generateUniqueSlug } = require('../utils/slugify')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const slug = await generateUniqueSlug(`${name}s workspace`)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash }
      })

      const workspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug,
          ownerId: user.id
        }
      })

      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'OWNER'
        }
      })

      return { user, workspace }
    })

    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email, name: result.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email
      },
      workspace: {
        id: result.workspace.id,
        name: result.workspace.name,
        slug: result.workspace.slug
      }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: { workspace: true }
    })

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      workspaces: workspaceMembers.map(m => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        plan: m.workspace.plan,
        role: m.role
      }))
    })
  } catch (err) {
    next(err)
  }
})

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
    })

    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: { userId: req.user.userId },
      include: { workspace: true }
    })

    res.json({
      user,
      workspaces: workspaceMembers.map(m => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        plan: m.workspace.plan,
        role: m.role
      }))
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router