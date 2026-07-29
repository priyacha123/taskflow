const express = require('express')
const prisma = require('../config/prisma')
const auth = require('../middleware/auth')
const workspaceMiddleware = require('../middleware/workspace')
const requireRole = require('../middleware/requireRole')
const { generateUniqueProjectIdentifier } = require('../utils/identifier')

const router = express.Router({ mergeParams: true })

router.get('/', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { workspaceId: req.workspace.id },
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true }
        },
        _count: {
          select: {
            issues: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const statusCounts = await prisma.issue.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: { status: true }
        })

        const counts = {
          TODO: 0,
          IN_PROGRESS: 0,
          IN_REVIEW: 0,
          DONE: 0,
          CANCELLED: 0
        }

        statusCounts.forEach(s => {
          counts[s.status] = s._count.status
        })

        return { ...project, statusCounts: counts }
      })
    )

    res.json(projectsWithCounts)
  } catch (err) {
    next(err)
  }
})

router.post('/', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'project name is required' })
    }

    if (req.workspace.plan === 'FREE') {
      const count = await prisma.project.count({
        where: { workspaceId: req.workspace.id }
      })
      if (count >= 5) {
        return res.status(403).json({
          error: 'FREE plan allows 5 projects. Upgrade to PRO for unlimited projects.'
        })
      }
    }

    const identifier = await generateUniqueProjectIdentifier(name, req.workspace.id)

    const project = await prisma.project.create({
      data: {
        name,
        description,
        identifier,
        workspaceId: req.workspace.id,
        createdById: req.user.userId
      }
    })

    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
})

router.get('/:projectId', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { projectId } = req.params

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        workspaceId: req.workspace.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, avatarUrl: true }
        },
        _count: { select: { issues: true } }
      }
    })

    if (!project) {
      return res.status(404).json({ error: 'project not found' })
    }

    res.json(project)
  } catch (err) {
    next(err)
  }
})

router.patch('/:projectId', auth, workspaceMiddleware, requireRole('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { name, description } = req.body

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: req.workspace.id }
    })

    if (!project) {
      return res.status(404).json({ error: 'project not found' })
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { name, description }
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

router.delete('/:projectId', auth, workspaceMiddleware, requireRole('OWNER'), async (req, res, next) => {
  try {
    const { projectId } = req.params

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: req.workspace.id }
    })

    if (!project) {
      return res.status(404).json({ error: 'project not found' })
    }

    await prisma.project.delete({ where: { id: projectId } })

    res.json({ message: 'project deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router