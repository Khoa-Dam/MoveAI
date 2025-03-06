import { Tool } from 'langchain/tools'
import RandomAccountTool from './random-account'

// Export your tools
export const tools: Tool[] = [
  new RandomAccountTool()
  // Add other existing tools here
]
