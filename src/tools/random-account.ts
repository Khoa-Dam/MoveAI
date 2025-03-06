import { Tool } from 'langchain/tools'
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'

class RandomAccountTool extends Tool {
  name = 'random_account'
  description = 'Generates a random account identifier'

  constructor() {
    super()
  }

  async _call(args: string): Promise<string> {
    // Generate a new private key
    const privateKey = Ed25519PrivateKey.generate() // Generate a new Ed25519 private key

    const account = Account.fromPrivateKey({ privateKey })

    // Extract account details
    const accountAddress = account.accountAddress // Get the account address
    const publicKey = account.publicKey // Get the public key

    // Log the generated account details
    console.log(
      `Generated random account: Address: ${accountAddress}, Public Key: ${publicKey}, Private Key: ${privateKey.toString()}`
    )

    // Return the account details as a string
    return `Generated random account: Address: ${accountAddress}, Public Key: ${publicKey}, Private Key: ${privateKey.toString()}`
  }
}

export default RandomAccountTool
