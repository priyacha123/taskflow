const express = require('express')
const prisma = require('../config/prisma')
const auth = require('../middleware/auth')
const workspaceMiddleware = require('../middleware/workspace')

const router = express.Router({ mergeParams: true })

router.post('/', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { issueId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
      return res.status(400).json({ error: 'comment content is required' })
    }

    const issue = await prisma.issue.findFirst({
      where: { id: issueId, workspaceId: req.workspace.id }
    })

    if (!issue) {
      return res.status(404).json({ error: 'issue not found' })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        issueId,
        authorId: req.user.userId
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    res.status(201).json(comment)
  } catch (err) {
    next(err)
  }
})

router.delete('/:commentId', auth, workspaceMiddleware, async (req, res, next) => {
  try {
    const { commentId } = req.params

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return res.status(404).json({ error: 'comment not found' })
    }

    if (comment.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'you can only delete your own comments' })
    }

    await prisma.comment.delete({ where: { id: commentId } })

    res.json({ message: 'comment deleted' })
  } catch (err) {
    next(err)
  }
})

module.exports = router