import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { initializeAptos } from '../utils/aptosConfig'

class CallFunctionTool extends StructuredTool {
  name = 'call_function'
  description =
    'Tool to call any function on Aptos blockchain. Example usage: moduleAddress=0x05452fa342fdeb4d6dca674d335cdfb174fc289e85fd217b10d40b94a6804e60, moduleName=message, functionName=set_message, typeArguments=["0x1::aptos_coin::AptosCoin"], args=["your message"]. The tool handles function calls automatically with your provided parameters.'
  schema = z.object({
    moduleAddress: z.string().describe('The contract address on Aptos blockchain'),
    moduleName: z.string().describe('The name of the Move module/contract'),
    functionName: z.string().describe('The function name to call'),
    typeArguments: z.array(z.string()).optional().describe('Type arguments for generic functions (optional)'),
    args: z.array(z.any()).describe('Arguments for the function as an array')
  })
  constructor() {
    super()
  }
  async _call(input: z.infer<typeof this.schema>, runManager?: any, config?: any): Promise<string> {
    const { moduleAddress, moduleName, functionName, typeArguments = [], args } = input

    console.log('Calling functionxbxcbxcb:', { moduleAddress, moduleName, functionName, args })
    try {
      const { aptos, account } = await initializeAptos()

      if (!account || !account.accountAddress) {
        throw new Error('Account initialization failed')
      }

      const transactionData: any = {
        function: `${moduleAddress}::${moduleName}::${functionName}`,
        functionArguments: args
      }

      if (typeArguments && typeArguments.length > 0) {
        transactionData.typeArguments = typeArguments
      }

      const txn = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: transactionData
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

      // const executedTransaction = await aptos.waitForTransaction({
      //   transactionHash: committedTxn.hash.toString()
      // })

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
