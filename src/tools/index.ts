import { Tool } from 'langchain/tools'
import { StructuredTool } from '@langchain/core/tools'
import { AgentRuntime } from 'move-agent-kit'
import FetchABITool from './Fetch_ABI'
import CallFunctionTool from './CallFunction'

export const createCustomTools = (aptosAgent: AgentRuntime): (Tool | StructuredTool)[] => {
  const tools: (Tool | StructuredTool)[] = []

  tools.push(new CallFunctionTool())
  tools.push(new FetchABITool())

  return tools
}
