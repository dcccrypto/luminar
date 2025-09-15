import { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import bs58 from 'bs58'

class SolanaService {
  private connection: Connection
  private vaultKeypair: Keypair

  constructor() {
    const rpcUrl = process.env.RPC_URL
    const vaultSecretKey = process.env.VAULT_SECRET_KEY

    if (!rpcUrl || !vaultSecretKey) {
      throw new Error('Missing Solana environment variables (RPC_URL, VAULT_SECRET_KEY)')
    }

    this.connection = new Connection(rpcUrl, 'confirmed')
    
    try {
      // Parse the vault secret key (base58 encoded)
      const secretKeyBytes = bs58.decode(vaultSecretKey)
      this.vaultKeypair = Keypair.fromSecretKey(secretKeyBytes)
    } catch (error) {
      throw new Error('Invalid VAULT_SECRET_KEY format. Must be base58 encoded.')
    }
  }

  /**
   * Get the vault's public key
   */
  getVaultAddress(): PublicKey {
    return this.vaultKeypair.publicKey
  }

  /**
   * Get the vault's balance in lamports
   */
  async getVaultBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.vaultKeypair.publicKey)
      return balance
    } catch (error) {
      console.error('Failed to get vault balance:', error)
      throw new Error('Failed to get vault balance')
    }
  }

  /**
   * Get the vault's balance in SOL
   */
  async getVaultBalanceSOL(): Promise<number> {
    const lamports = await this.getVaultBalance()
    return lamports / LAMPORTS_PER_SOL
  }

  /**
   * Transfer SOL from vault to recipient
   */
  async transfer(recipientAddress: string, lamports: number): Promise<string> {
    try {
      // Validate recipient address
      const recipientPubkey = new PublicKey(recipientAddress)
      
      // Check vault balance
      const vaultBalance = await this.getVaultBalance()
      if (vaultBalance < lamports) {
        throw new Error(`Insufficient vault balance. Required: ${lamports} lamports, Available: ${vaultBalance} lamports`)
      }

      // Create transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.vaultKeypair.publicKey,
          toPubkey: recipientPubkey,
          lamports
        })
      )

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = this.vaultKeypair.publicKey

      // Send and confirm transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.vaultKeypair],
        {
          commitment: 'confirmed',
          maxRetries: 3
        }
      )

      console.log(`Transfer successful: ${lamports} lamports to ${recipientAddress}`)
      console.log(`Transaction signature: ${signature}`)

      return signature

    } catch (error) {
      console.error('Solana transfer failed:', error)
      
      if (error instanceof Error) {
        // Handle specific Solana errors
        if (error.message.includes('Insufficient funds')) {
          throw new Error('Insufficient vault balance for transfer')
        }
        if (error.message.includes('Invalid public key')) {
          throw new Error('Invalid recipient address')
        }
        if (error.message.includes('Transaction simulation failed')) {
          throw new Error('Transaction simulation failed')
        }
      }
      
      throw new Error('Solana transfer failed')
    }
  }

  /**
   * Transfer SOL from vault to recipient (SOL amount)
   */
  async transferSOL(recipientAddress: string, solAmount: number): Promise<string> {
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL)
    return this.transfer(recipientAddress, lamports)
  }

  /**
   * Verify a transaction signature
   */
  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const transaction = await this.connection.getTransaction(signature)
      return transaction !== null
    } catch (error) {
      console.error('Failed to verify transaction:', error)
      return false
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(signature: string) {
    try {
      const transaction = await this.connection.getTransaction(signature)
      return transaction
    } catch (error) {
      console.error('Failed to get transaction details:', error)
      throw new Error('Failed to get transaction details')
    }
  }
}

// Export singleton instance
export const solanaService = new SolanaService()
