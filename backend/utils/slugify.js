const prisma = require('../config/prisma')

const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const generateUniqueSlug = async (name) => {
  const base = slugify(name)
  let slug = base
  let counter = 1

  while (true) {
    const existing = await prisma.workspace.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${base}-${counter}`
    counter++
  }
}

module.exports = { slugify, generateUniqueSlug }