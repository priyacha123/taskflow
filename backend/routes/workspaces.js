const express = require('express')
const prisma = require('../config/prisma')
const auth = require('../middleware/auth')
const workspaceMiddleware = require('../middleware/workspace')
const requireRole = require('../middleware/requireRole')
const { generateUniqueSlug } = require('../utils/slugify')

const router = express.Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { userId: req.user.userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true, projects: true }
            }
          }
        }
      }
    })

    res.json(members.map(m => ({
      ...m.workspace,
      role: m.role
    })))
  } catch (err) {
    next(err)
  }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: 'workspace name is required' })
    }

    const existingCount = await prisma.workspaceMember.count({
      where: { userId: req.user.userId, role: 'OWNER' }
    })

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        workspaceMembers: {
          include: { workspace: true }
        }
      }
    })

    const ownedWorkspaces = user.workspaceMembers.filter(m => m.role === 'OWNER')
    const isAnyPro = ownedWorkspaces.some(m => m.workspace.plan === 'PRO')

    if (!isAnyPro && existingCount >= 1) {
      return res.status(403).json({
        error: 'FREE plan allows 1 workspace. Upgrade to PRO for unlimited workspaces.'
      })
    }

    const slug = await generateUniqueSlug(name)

    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name, slug, ownerId: req.user.userId }
      })

      await tx.workspaceMember.create({
        data: {
          userId: req.user.userId,
          workspaceId: workspace.id,
          role: 'OWNER'
        }
      })

      return workspace
    })

    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/:slug', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.workspace.id },
      include: {
        _count: {
          select: { members: true, projects: true }
        }
      }
    })

    res.json({ ...workspace, role: req.workspaceMember.role })
  } catch (err) {
    next(err)
  }
})

router.patch('/:slug', auth, workspaceMiddleware, requireRole('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const { name } = req.body

    const updated = await prisma.workspace.update({
      where: { id: req.workspace.id },
      data: { name }
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

router.delete('/:slug', auth, workspaceMiddleware, requireRole('OWNER'), async (req, res, next) => {
  try {
    await prisma.workspace.delete({
      where: { id: req.workspace.id }
    })

    res.json({ message: 'workspace deleted' })
  } catch (err) {
    next(err)
  }
})

router.get('/:slug/members', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: req.workspace.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { joinedAt: 'asc' }
    })

    res.json(members)
  } catch (err) {
    next(err)
  }
})

router.patch('/:slug/members/:userId', auth, workspaceMiddleware, requireRole('OWNER'), async (req, res, next) => {
  try {
    const { role } = req.body
    const { userId } = req.params

    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'cannot change your own role' })
    }

    const validRoles = ['ADMIN', 'MEMBER']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'role must be ADMIN or MEMBER' })
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: req.workspace.id
        }
      },
      data: { role }
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

router.delete('/:slug/members/:userId', auth, workspaceMiddleware, requireRole('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const { userId } = req.params

    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'cannot remove yourself. Transfer ownership first.' })
    }

    const targetMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: req.workspace.id
        }
      }
    })

    if (!targetMember) {
      return res.status(404).json({ error: 'member not found' })
    }

    if (targetMember.role === 'OWNER') {
      return res.status(403).json({ error: 'cannot remove the workspace owner' })
    }

    if (targetMember.role === 'ADMIN' && req.workspaceMember.role === 'ADMIN') {
      return res.status(403).json({ error: 'admins cannot remove other admins' })
    }

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: req.workspace.id
        }
      }
    })

    res.json({ message: 'member removed' })
  } catch (err) {
    next(err)
  }
})

module.exports = router