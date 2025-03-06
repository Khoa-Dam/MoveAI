import express from 'express'

import { ChatAnthropic } from '@langchain/anthropic'
import apiRoute from './router/apiRoute'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.use(apiRoute)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
