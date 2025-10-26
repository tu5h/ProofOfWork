// Mock for @concordium/web-sdk
class MockConcordiumGRPCClient {
  constructor(nodeUrl, timeout) {
    this.nodeUrl = nodeUrl;
    this.timeout = timeout;
  }

  async getAccountInfo(accountAddress) {
    return {
      accountAmount: 20000000000, // 20,000 CCD in microCCD
      accountCredentials: [{ credentialType: 'initial' }],
      accountNonce: Math.floor(Math.random() * 1000)
    };
  }

  async getConsensusStatus() {
    return {
      bestBlock: 'test-block-hash',
      genesisTime: '2021-05-11T12:00:00Z',
      slotDuration: 250
    };
  }
}

class MockConcordiumHdWallet {
  constructor() {
    this.accounts = new Map();
  }

  generateAccount() {
    return {
      address: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c',
      privateKey: 'mock-private-key'
    };
  }
}

module.exports = {
  ConcordiumGRPCClient: MockConcordiumGRPCClient,
  ConcordiumHdWallet: MockConcordiumHdWallet
};
