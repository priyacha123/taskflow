const express = require('express')
const prisma = require('../config/prisma')
const auth = require('../middleware/auth')
const workspaceMiddleware = require('../middleware/workspace')
const { generateIssueIdentifier } = require('../utils/identifier')

const router = express.Router({ mergeParams: true })

const getMaxPosition = async (projectId, status) => {
  const result = await prisma.issue.findFirst({
    where: { projectId, status },
    orderBy: { position: 'desc' },
    select: { position: true }
  })
  return result ? result.position + 1 : 0
}

router.get('/', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { view, assignee, priority, status, search } = req.query

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: req.workspace.id }
    })

    if (!project) {
      return res.status(404).json({ error: 'project not found' })
    }

    const where = {
      projectId,
      workspaceId: req.workspace.id,
      ...(assignee && { assigneeId: assignee }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { identifier: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const issues = await prisma.issue.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        labels: {
          include: {
            label: true
          }
        },
        _count: { select: { comments: true } }
      },
      orderBy: { position: 'asc' }
    })

    if (view === 'list') {
      return res.json(issues)
    }

    const grouped = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
      CANCELLED: []
    }

    issues.forEach(issue => {
      grouped[issue.status].push(issue)
    })

    res.json(grouped)
  } catch (err) {
    next(err)
  }
})

router.post('/', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { projectId } = req.params
    const {
      title,
      description,
      status = 'TODO',
      priority = 'NO_PRIORITY',
      assigneeId
    } = req.body

    if (!title) {
      return res.status(400).json({ error: 'issue title is required' })
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: req.workspace.id }
    })

    if (!project) {
      return res.status(404).json({ error: 'project not found' })
    }

    const identifier = await generateIssueIdentifier(projectId, req.workspace.id)
    const position = await getMaxPosition(projectId, status)

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status,
        priority,
        position,
        identifier,
        projectId,
        workspaceId: req.workspace.id,
        assigneeId,
        createdById: req.user.userId
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        labels: {
          include: { label: true }
        }
      }
    })

    res.status(201).json(issue)
  } catch (err) {
    next(err)
  }
})

router.get('/:issueId', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { issueId } = req.params

    const issue = await prisma.issue.findFirst({
      where: {
        id: issueId,
        workspaceId: req.workspace.id
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true }
        },
        labels: {
          include: { label: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!issue) {
      return res.status(404).json({ error: 'issue not found' })
    }

    res.json(issue)
  } catch (err) {
    next(err)
  }
})

router.patch('/:issueId', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { issueId } = req.params
    const {
      title,
      description,
      status,
      priority,
      assigneeId,
      position
    } = req.body

    const issue = await prisma.issue.findFirst({
      where: { id: issueId, workspaceId: req.workspace.id }
    })

    if (!issue) {
      return res.status(404).json({ error: 'issue not found' })
    }

    let newPosition = position

    if (status && status !== issue.status && position === undefined) {
      newPosition = await getMaxPosition(issue.projectId, status)
    }

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(newPosition !== undefined && { position: newPosition })
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true }
        },
        labels: {
          include: { label: true }
        }
      }
    })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

router.delete('/:issueId', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { issueId } = req.params

    const issue = await prisma.issue.findFirst({
      where: { id: issueId, workspaceId: req.workspace.id }
    })

    if (!issue) {
      return res.status(404).json({ error: 'issue not found' })
    }

    await prisma.issue.delete({ where: { id: issueId } })

    res.json({ message: 'issue deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router