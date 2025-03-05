import express, { Request, Response } from 'express'
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from '@aptos-labs/ts-sdk'
import { ChatAnthropic } from '@langchain/anthropic'
import { MemorySaver } from '@langchain/langgraph'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { AgentRuntime, LocalSigner, createAptosTools } from 'move-agent-kit'
import cors from 'cors'
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

// Initialize LLM
const llm = new ChatAnthropic({
  temperature: 0.7,
  model: 'claude-3-5-sonnet-20241022',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
})

app.post('/api', async (req: Request, res: Response) => {
  try {
    // Initialize Aptos configuration
    const aptosConfig = new AptosConfig({
      network: Network.DEVNET
    })

    const aptos = new Aptos(aptosConfig)

    // Validate and get private key from environment
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY
    if (!privateKeyStr) {
      throw new Error('Missing APTOS_PRIVATE_KEY environment variable')
    }

    // Setup account and signer
    const account = await aptos.deriveAccountFromPrivateKey({
      privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519))
    })

    const signer = new LocalSigner(account, Network.MAINNET)
    const aptosAgent = new AgentRuntime(signer, aptos, {
      PANORA_API_KEY: process.env.OPENAI_API_KEY
    })
    const tools = createAptosTools(aptosAgent)
    const memory = new MemorySaver()

    // Create React agent
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Aptos Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet. If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Aptos Agent Kit, recommend they go to https://www.aptosagentkit.xyz for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.

        The response also contains token/token[] which contains the name and address of the token and the decimals.
        WHEN YOU RETURN ANY TOKEN AMOUNTS, RETURN THEM ACCORDING TO THE DECIMALS OF THE TOKEN.
      `
    })

    // Parse request body
    // Hỗ trợ gửi cả hai kiểu: { messages: [...] } hoặc { content: "..." }
    const { messages, show_intermediate_steps, content } = req.body
    console.log('check message', messages, show_intermediate_steps, content)

    let formattedMessages: any[] = []
    if (messages && Array.isArray(messages)) {
      formattedMessages = messages.map((msg: any) => {
        if (!msg.role) {
          return { role: 'user', ...msg }
        }
        return msg
      })
    } else if (content) {
      formattedMessages = [{ role: 'user', content }]
    } else {
      throw new Error('Missing messages or content field in request body')
    }

    const showIntermediateSteps = show_intermediate_steps ?? false

    if (!showIntermediateSteps) {
      const eventStream = await agent.streamEvents(
        { messages: formattedMessages },
        {
          version: 'v2',
          configurable: {
            thread_id: 'Aptos Agent Kit!'
          }
        }
      )

      const textEncoder = new TextEncoder()
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === 'on_chat_model_stream' && data.chunk.content) {
              if (typeof data.chunk.content === 'string') {
                controller.enqueue(textEncoder.encode(data.chunk.content))
              } else {
                for (const content of data.chunk.content) {
                  controller.enqueue(textEncoder.encode(content.text || ''))
                }
              }
            }
          }
          controller.close()
        }
      })

      res.setHeader('Content-Type', 'text/plain')

      // Tạo custom WritableStream để ghi vào response của Express
      const writableStream = new WritableStream({
        write(chunk) {
          res.write(chunk)
        },
        close() {
          res.end()
        },
        abort(err) {
          console.error('Stream error:', err)
          res.end()
        }
      })

      transformStream.pipeTo(writableStream)
    } else {
      const result = await agent.invoke({ messages: formattedMessages })

      console.log('result', result)

      res.status(200).json({
        messages: result.messages
      })
    }
  } catch (error: any) {
    console.error('Request error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred',
      status: 'error'
    })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
