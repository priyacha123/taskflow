require('dotenv').config()
const prisma = require('../config/prisma')
const bcrypt = require('bcrypt')

async function main() {
  console.log('Seeding demo data...')

  const passwordHash = await bcrypt.hash('demo123456', 10)

  const user1 = await prisma.user.create({
    data: { name: 'Demo Owner', email: 'owner@demo.com', passwordHash }
  })

  const user2 = await prisma.user.create({
    data: { name: 'Demo Member', email: 'member@demo.com', passwordHash }
  })

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      ownerId: user1.id
    }
  })

  await prisma.workspaceMember.createMany({
    data: [
      { userId: user1.id, workspaceId: workspace.id, role: 'OWNER' },
      { userId: user2.id, workspaceId: workspace.id, role: 'MEMBER' }
    ]
  })

  const project = await prisma.project.create({
    data: {
      name: 'Engineering',
      identifier: 'ENG',
      workspaceId: workspace.id,
      createdById: user1.id
    }
  })

  const issues = [
    { title: 'Set up CI/CD pipeline', status: 'DONE', priority: 'HIGH', position: 0 },
    { title: 'Design system tokens', status: 'DONE', priority: 'MEDIUM', position: 1 },
    { title: 'API rate limiting', status: 'IN_PROGRESS', priority: 'HIGH', position: 0 },
    { title: 'User authentication flow', status: 'IN_PROGRESS', priority: 'URGENT', position: 1 },
    { title: 'Dashboard analytics', status: 'IN_REVIEW', priority: 'MEDIUM', position: 0 },
    { title: 'Mobile responsive layout', status: 'TODO', priority: 'LOW', position: 0 },
    { title: 'Dark mode support', status: 'TODO', priority: 'MEDIUM', position: 1 },
    { title: 'Email notifications', status: 'TODO', priority: 'LOW', position: 2 },
    { title: 'Export to CSV', status: 'TODO', priority: 'LOW', position: 3 },
    { title: 'Performance audit', status: 'CANCELLED', priority: 'LOW', position: 0 },
  ]

  for (let i = 0; i < issues.length; i++) {
    await prisma.issue.create({
      data: {
        ...issues[i],
        identifier: `ENG-${i + 1}`,
        projectId: project.id,
        workspaceId: workspace.id,
        createdById: user1.id,
        assigneeId: i % 2 === 0 ? user1.id : user2.id
      }
    })
  }

  await prisma.comment.createMany({
    data: [
      { content: 'Starting work on this today.', issueId: (await prisma.issue.findFirst({ where: { identifier: 'ENG-3' } }))!.id, authorId: user1.id },
      { content: 'Looks good, approved for merge.', issueId: (await prisma.issue.findFirst({ where: { identifier: 'ENG-5' } }))!.id, authorId: user2.id }
    ]
  })

  const label = await prisma.label.create({
    data: { name: 'bug', color: '#ef4444', workspaceId: workspace.id }
  })

  console.log('✅ Seed complete')
  console.log('Demo accounts:')
  console.log('  owner@demo.com / demo123456  (OWNER)')
  console.log('  member@demo.com / demo123456 (MEMBER)')
  console.log(`Workspace slug: demo-workspace`)
}

main().catch(console.error).finally(() => prisma.$disconnect())