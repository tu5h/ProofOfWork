const { exec } = require('child_process');
const path = require('path');

class ConcordiumCLIService {
  constructor() {
    this.cliPath = 'C:\\concordium\\concordium-client.exe';
    this.testnetNode = 'testnet.concordium.com:20000';
  }

  // Execute Concordium CLI command
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject({ error: error.message, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  // Get account balance from CLI
  async getAccountBalance(accountAddress) {
    try {
      const command = `${this.cliPath} account show ${accountAddress} --grpc-ip testnet.concordium.com --grpc-port 20000`;
      const result = await this.executeCommand(command);
      
      // Parse the output to extract balance
      const balanceMatch = result.stdout.match(/Amount:\s*(\d+(?:\.\d+)?)\s*CCD/);
      return balanceMatch ? parseFloat(balanceMatch[1]) : 0;
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return 0;
    }
  }

  // Create a transaction (simplified for demo)
  async createTransaction(fromAccount, toAccount, amount) {
    try {
      // For now, we'll simulate the transaction
      // In a real implementation, you'd use the CLI to create and submit transactions
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      console.log(`📝 Transaction created: ${fromAccount} → ${toAccount} (${amount} CCD)`);
      console.log(`🔗 Transaction hash: ${transactionHash}`);
      
      return {
        success: true,
        hash: transactionHash,
        from: fromAccount,
        to: toAccount,
        amount: amount,
        status: 'pending'
      };
    } catch (error) {
      console.error('Transaction creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test connection to Concordium testnet
  async testConnection() {
    try {
      const command = `${this.cliPath} consensus status --grpc-ip testnet.concordium.com --grpc-port 20000`;
      const result = await this.executeCommand(command);
      
      return {
        connected: true,
        output: result.stdout
      };
    } catch (error) {
      return {
        connected: false,
        error: error.error || error.message
      };
    }
  }
}

module.exports = new ConcordiumCLIService();
