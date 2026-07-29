const express = require('express')
const prisma = require('../config/prisma')
const auth = require('../middleware/auth')
const workspaceMiddleware = require('../middleware/workspace')
const requireRole = require('../middleware/requireRole')

const router = express.Router({ mergeParams: true })

router.get('/', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const labels = await prisma.label.findMany({
      where: { workspaceId: req.workspace.id },
      orderBy: { name: 'asc' }
    })
    res.json(labels)
  } catch (err) {
    next(err)
  }
})

router.post('/', auth, workspaceMiddleware, requireRole('OWNER', 'ADMIN'), async (req, res, next) => {
  try {
    const { name, color } = req.body

    if (!name || !color) {
      return res.status(400).json({ error: 'name and color are required' })
    }

    const label = await prisma.label.create({
      data: {
        name,
        color,
        workspaceId: req.workspace.id
      }
    })

    res.status(201).json(label)
  } catch (err) {
    next(err)
  }
})

router.post('/issues/:issueId/labels', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { issueId } = req.params
    const { labelId } = req.body

    const issue = await prisma.issue.findFirst({
      where: { id: issueId, workspaceId: req.workspace.id }
    })

    if (!issue) {
      return res.status(404).json({ error: 'issue not found' })
    }

    await prisma.issueLabel.create({
      data: { issueId, labelId }
    })

    res.status(201).json({ message: 'label added' })
  } catch (err) {
    next(err)
  }
})

router.delete('/issues/:issueId/labels/:labelId', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { issueId, labelId } = req.params

    await prisma.issueLabel.delete({
      where: { issueId_labelId: { issueId, labelId } }
    })

    res.json({ message: 'label removed' })
  } catch (err) {
    next(err)
  }
})

module.exports = router