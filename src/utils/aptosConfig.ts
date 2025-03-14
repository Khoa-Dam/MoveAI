import { Aptos, AptosConfig, Network, Ed25519PrivateKey, PrivateKey, PrivateKeyVariants } from '@aptos-labs/ts-sdk'
import dotenv from 'dotenv'
dotenv.config()

export const initializeAptos = async () => {
  const aptosConfig = new AptosConfig({
    network: Network.DEVNET
  })

  const aptos = new Aptos(aptosConfig)

  const privateKeyStr = process.env.APTOS_PRIVATE_KEY
  if (!privateKeyStr) {
    throw new Error('Missing APTOS_PRIVATE_KEY environment variable')
  }

  const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519))
  })

  return { aptos, account }
}