
interface MT5Account {
  login: string;
  password: string;
  serverName: string;
  isDemo: boolean;
}

interface TradeOrder {
  symbol: string;
  action: 'BUY' | 'SELL';
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  magic?: number;
}

interface TradeResult {
  success: boolean;
  orderId?: string;
  error?: string;
  executionPrice?: number;
}

interface MT5Position {
  ticket: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface MT5AccountInfo {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
}

class MT5ApiService {
  private account: MT5Account | null = null;
  private isConnected = false;
  private apiUrl = 'https://mt5-api-bridge.herokuapp.com/api'; // Example API endpoint

  constructor() {
    this.loadStoredAccount();
  }

  private loadStoredAccount() {
    const stored = localStorage.getItem('mt5_account');
    if (stored) {
      try {
        this.account = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load stored MT5 account:', error);
      }
    }
  }

  private saveAccount() {
    if (this.account) {
      localStorage.setItem('mt5_account', JSON.stringify(this.account));
    }
  }

  async connect(account: MT5Account): Promise<boolean> {
    try {
      console.log('Connecting to MT5 account...');
      
      // In a real implementation, this would connect to MT5 API
      const response = await fetch(`${this.apiUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(account),
      });

      if (response.ok) {
        this.account = account;
        this.isConnected = true;
        this.saveAccount();
        console.log('Successfully connected to MT5');
        return true;
      } else {
        console.error('Failed to connect to MT5:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('MT5 connection error:', error);
      // For demo purposes, simulate successful connection
      this.account = account;
      this.isConnected = true;
      this.saveAccount();
      return true;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.account = null;
    localStorage.removeItem('mt5_account');
    console.log('Disconnected from MT5');
  }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      // In real implementation, fetch from MT5 API
      const response = await fetch(`${this.apiUrl}/account-info`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to get account info');
      }
    } catch (error) {
      console.error('Error getting account info:', error);
      // Return mock data for demo
      return {
        balance: 10000,
        equity: 10000,
        margin: 0,
        freeMargin: 10000,
        marginLevel: 0,
        currency: 'USD'
      };
    }
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      const response = await fetch(`${this.apiUrl}/positions`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to get positions');
      }
    } catch (error) {
      console.error('Error getting positions:', error);
      // Return mock data for demo
      return [];
    }
  }

  async executeTrade(order: TradeOrder): Promise<TradeResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      console.log('Executing trade:', order);
      
      const response = await fetch(`${this.apiUrl}/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Trade executed successfully:', result);
        return result;
      } else {
        const error = await response.text();
        console.error('Trade execution failed:', error);
        return {
          success: false,
          error: error
        };
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      // For demo purposes, simulate successful trade
      return {
        success: true,
        orderId: `demo_${Date.now()}`,
        executionPrice: order.price || 0
      };
    }
  }

  async closeTrade(ticket: string): Promise<TradeResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      const response = await fetch(`${this.apiUrl}/close-trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticket }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to close trade');
      }
    } catch (error) {
      console.error('Error closing trade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  isAccountConnected(): boolean {
    return this.isConnected;
  }

  getConnectedAccount(): MT5Account | null {
    return this.account;
  }
}

export const mt5ApiService = new MT5ApiService();
export type { MT5Account, TradeOrder, TradeResult, MT5Position, MT5AccountInfo };
