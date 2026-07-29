const prisma = require('../config/prisma')

const workspace = async (req, res, next) => {
  try {
    const { slug } = req.params

    if (!slug) {
      return res.status(400).json({ error: 'workspace slug is required' })
    }

    const workspaceData = await prisma.workspace.findUnique({
      where: { slug }
    })

    if (!workspaceData) {
      return res.status(404).json({ error: 'workspace not found' })
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.userId,
          workspaceId: workspaceData.id
        }
      }
    })

    if (!member) {
      return res.status(403).json({ error: 'you are not a member of this workspace' })
    }

    req.workspace = workspaceData
    req.workspaceMember = member

    next()
  } catch (err) {
    next(err)
  }
}

module.exports = workspace