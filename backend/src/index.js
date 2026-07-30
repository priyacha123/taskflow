require('dotenv').config()

const express = require('express')
const cors = require('cors')
const authRoutes = require('./../routes/auth')
const workspaceRoutes = require('./../routes/workspaces')
const invitationRoutes = require('./../routes/invitations')
const billingRoutes = require('./../routes/billing')
const projectRoutes = require('./../routes/projects')
const issueRoutes = require('./../routes/issues')
const commentRoutes = require('./../routes/comments')
const labelRoutes = require('./../routes/labels')

const app = express()

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-actual-vercel-url.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  billingRoutes.webhookHandler
)

app.get('/webhook/test', (req, res) => {
  res.json({ registered: true })
})

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', product: 'TaskFlow' })
})

app.use('/auth', authRoutes)
app.use('/workspaces', workspaceRoutes)
app.use('/workspaces', invitationRoutes)
app.use('/workspaces', billingRoutes)
app.use('/workspaces/:slug/projects', projectRoutes)
app.use('/workspaces/:slug/projects/:projectId/issues', issueRoutes)
app.use('/workspaces/:slug/issues/:issueId/comments', commentRoutes)
app.use('/workspaces/:slug/labels', labelRoutes)
app.use('/workspaces/:slug/issues', issueRoutes)
app.use('/invite', invitationRoutes)

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`TaskFlow backend running on port ${PORT}`))