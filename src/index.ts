import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { ChatAnthropic } from '@langchain/anthropic'
import apiRoutes from './router/apiRoute.js'

const app = express()
const port = 3000

// Middleware to parse JSON
app.use(express.json())

const llm = new ChatAnthropic({
  temperature: 0.7,
  model: 'claude-3-5-sonnet-latest',
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Use API routes with proper middleware function
app.use('/api', apiRoutes)

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
