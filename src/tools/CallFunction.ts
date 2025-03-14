import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { initializeAptos } from '../utils/aptosConfig'

class CallFunctionTool extends StructuredTool {
  name = 'call_function'
  description =
    'Use this tool to call functions on Aptos blockchain moduleAddress=0x05452fa342fdeb4d6dca674d335cdfb174fc289e85fd217b10d40b94a6804e60 moduleName=message functionName=set_message args=["your message"] The tool handles everything automatically'
  schema = z.object({
    moduleAddress: z
      .string()
      .describe(
        'The contract address on Aptos blockchain (e.g. "0x05452fa342fdeb4d6dca674d335cdfb174fc289e85fd217b10d40b94a6804e60" for message module)'
      ),
    moduleName: z.string().describe('The name of the Move module/contract (e.g. "message" for message contract)'),
    functionName: z.string().describe('The function you want to call (e.g. "set_message" to set a new message)'),
    args: z.array(z.any()).describe('Arguments for the function as an array (e.g. ["Hello World"] for set_message)')
  })
  constructor() {
    super()
  }
  async _call(input: z.infer<typeof this.schema>, runManager?: any, config?: any): Promise<string> {
    const { moduleAddress, moduleName, functionName, args } = input

    try {
      const { aptos, account } = await initializeAptos()

      if (!account || !account.accountAddress) {
        throw new Error('Account initialization failed')
      }

      const txn = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: `${moduleAddress}::${moduleName}::${functionName}`,
          functionArguments: args
        }
      })

      if (!txn) {
        throw new Error('Transaction build failed')
      }

      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction: txn
      })

      if (!committedTxn || !committedTxn.hash) {
        throw new Error('Transaction submission failed')
      }

      // Add delay before checking transaction
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const executedTransaction = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash.toString()
      })

      return JSON.stringify({
        status: 'success',
        hash: committedTxn.hash,
        message: `Function ${functionName} called successfully`
      })
    } catch (error: any) {
      console.error('Error details:', {
        error: error.message,
        stack: error.stack,
        context: { moduleAddress, moduleName, functionName, args }
      })
      return JSON.stringify({
        status: 'error',
        error: `Error calling ${functionName}: ${error.message}`
      })
    }
  }
}

export default CallFunctionTool
