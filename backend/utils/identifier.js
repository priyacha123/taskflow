const prisma = require('../config/prisma')

const generateProjectIdentifier = (name) => {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .substring(0, 4) || 'PROJ'
}

const generateUniqueProjectIdentifier = async (name, workspaceId) => {
  const base = generateProjectIdentifier(name)
  let identifier = base
  let counter = 1

  while (true) {
    const existing = await prisma.project.findUnique({
      where: {
        workspaceId_identifier: {
          workspaceId,
          identifier
        }
      }
    })
    if (!existing) return identifier
    identifier = `${base}${counter}`
    counter++
  }
}

const generateIssueIdentifier = async (projectId, workspaceId) => {
  const count = await prisma.issue.count({
    where: { projectId }
  })

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  })

  return `${project.identifier}-${count + 1}`
}

module.exports = {
  generateUniqueProjectIdentifier,
  generateIssueIdentifier
}