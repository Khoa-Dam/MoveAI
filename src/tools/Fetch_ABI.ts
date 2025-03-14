import { StructuredTool } from '@langchain/core/tools'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'
import { z } from 'zod'

class FetchABITool extends StructuredTool {
  name = 'fetch_move_module_abi'
  description = 'This tool fetches the ABI of a specific Move module from the Aptos blockchain.'

  // Define schema for input validation
  schema = z.object({
    moduleAddress: z.string().describe('The address of the module (e.g., "0x1")'),
    moduleName: z.string().describe('The name of the module (e.g., "coin")')
  })

  private aptos: Aptos

  constructor() {
    super()
    // Initialize Aptos client
    const config = new AptosConfig({ network: Network.DEVNET })
    this.aptos = new Aptos(config)
  }

  async _call(input: z.infer<typeof this.schema>, runManager?: any, config?: any): Promise<string> {
    const { moduleAddress, moduleName } = input

    try {
      // Fetch the specific module
      const module = await this.aptos.getAccountModule({
        accountAddress: moduleAddress,
        moduleName
      })

      // Return the module ABI as JSON
      return JSON.stringify(module.abi)
    } catch (error: any) {
      return JSON.stringify({ error: `Error fetching module ABI: ${error.message}` })
    }
  }
}

export default FetchABITool
