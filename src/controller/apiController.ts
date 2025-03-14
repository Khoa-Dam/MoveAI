import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from '@aptos-labs/ts-sdk'
import { ChatAnthropic } from '@langchain/anthropic'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { AgentRuntime, LocalSigner, createAptosTools } from 'move-agent-kit'
import { createCustomTools } from '../tools'
import { TextEncoder } from 'util'
import dotenv from 'dotenv'
import { EventEmitter } from 'events'
import { MemorySaver } from '@langchain/langgraph'
dotenv.config()

const llm = new ChatAnthropic({
  temperature: 0.7,
  model: 'claude-3-5-sonnet-latest',
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const handleApiRequest = async (req: any, res: any) => {
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

    const aptosTools = createAptosTools(aptosAgent)
    const customTools = createCustomTools(aptosAgent)
    const tools = [...aptosTools, ...customTools]
    // const tools = createAptosTools(aptosAgent)
    const memory = new MemorySaver()

    // Create React agent
    const agent = createReactAgent({
      llm,
      tools, // Combine custom tools with Aptos tools
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
    const body = req.body
    const messages = body.messages ?? []
    const showIntermediateSteps = body.show_intermediate_steps ?? false

    const eventStream = await agent.streamEvents(
      { messages },
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
          if (event === 'on_chat_model_stream') {
            if (data.chunk.content) {
              if (typeof data.chunk.content === 'string') {
                controller.enqueue(textEncoder.encode(data.chunk.content))
              } else {
                for (const content of data.chunk.content) {
                  controller.enqueue(textEncoder.encode(content.text ? content.text : ''))
                }
              }
            }
          }
        }
        controller.close()
      }
    })

    const reader = transformStream.getReader()
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' })

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
    res.end() // End the response
    return // Add return to ensure no additional response is sent
  } catch (error) {
    console.error('Request error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred',
      status: 'error'
    })
  }
}
