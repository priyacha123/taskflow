const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.workspaceMember) {
      return res.status(403).json({ error: 'workspace context required' })
    }

    if (!roles.includes(req.workspaceMember.role)) {
      return res.status(403).json({
        error: `this action requires one of: ${roles.join(', ')}`
      })
    }

    next()
  }
}

module.exports = requireRole