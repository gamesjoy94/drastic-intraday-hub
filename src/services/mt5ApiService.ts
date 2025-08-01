
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
  openTime: string;
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
  private mockPositions: MT5Position[] = [];
  private mockBalance = 10000;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  constructor() {
    this.loadStoredAccount();
    this.initializeMockData();
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
      localStorage.setItem('mt5_account', JSON.stringify({
        ...this.account,
        password: '***' // Don't store password in localStorage for security
      }));
    }
  }

  private initializeMockData() {
    // Initialize some mock positions for demo
    const mockPositionsData = localStorage.getItem('mt5_mock_positions');
    if (mockPositionsData) {
      try {
        this.mockPositions = JSON.parse(mockPositionsData);
      } catch (error) {
        this.mockPositions = [];
      }
    }

    const mockBalanceData = localStorage.getItem('mt5_mock_balance');
    if (mockBalanceData) {
      try {
        this.mockBalance = parseFloat(mockBalanceData);
      } catch (error) {
        this.mockBalance = 10000;
      }
    }
  }

  private saveMockData() {
    localStorage.setItem('mt5_mock_positions', JSON.stringify(this.mockPositions));
    localStorage.setItem('mt5_mock_balance', this.mockBalance.toString());
  }

  async connect(account: MT5Account): Promise<boolean> {
    this.connectionAttempts++;
    
    try {
      console.log(`Attempting to connect to MT5 (attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`);
      
      // Validate account credentials
      if (!account.login || !account.password || !account.serverName) {
        throw new Error('Please fill in all connection fields');
      }

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, simulate successful connection after validation
      if (this.connectionAttempts <= this.maxConnectionAttempts) {
        this.account = account;
        this.isConnected = true;
        this.connectionAttempts = 0;
        this.saveAccount();
        
        console.log(`Successfully connected to MT5 ${account.isDemo ? 'demo' : 'live'} account`);
        return true;
      } else {
        throw new Error('Maximum connection attempts reached');
      }
    } catch (error) {
      console.error('MT5 connection error:', error);
      
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        this.connectionAttempts = 0;
        throw new Error(`Failed to connect after ${this.maxConnectionAttempts} attempts: ${error.message}`);
      }
      
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.account = null;
    this.connectionAttempts = 0;
    localStorage.removeItem('mt5_account');
    console.log('Disconnected from MT5');
  }

  async getAccountInfo(): Promise<MT5AccountInfo> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    // Calculate equity based on positions
    const totalProfit = this.mockPositions.reduce((sum, pos) => sum + pos.profit, 0);
    const equity = this.mockBalance + totalProfit;
    const margin = this.mockPositions.length * 1000; // Simplified margin calculation
    const freeMargin = equity - margin;
    const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;

    return {
      balance: this.mockBalance,
      equity: equity,
      margin: margin,
      freeMargin: freeMargin,
      marginLevel: marginLevel,
      currency: 'USD'
    };
  }

  async getPositions(): Promise<MT5Position[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    // Update current prices and profits for mock positions
    this.mockPositions = this.mockPositions.map(position => {
      // Simulate price movement
      const priceChange = (Math.random() - 0.5) * 2; // -1 to +1
      const newPrice = position.openPrice + priceChange;
      
      // Calculate profit
      const pipValue = 1; // Simplified pip value
      let profit;
      if (position.type === 'BUY') {
        profit = (newPrice - position.openPrice) * position.volume * pipValue * 100;
      } else {
        profit = (position.openPrice - newPrice) * position.volume * pipValue * 100;
      }

      return {
        ...position,
        currentPrice: newPrice,
        profit: profit
      };
    });

    this.saveMockData();
    return [...this.mockPositions];
  }

  async executeTrade(order: TradeOrder): Promise<TradeResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      console.log('Executing trade:', order);
      
      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate order
      if (!order.symbol || !order.action || !order.volume) {
        throw new Error('Invalid order parameters');
      }

      if (order.volume > 10) {
        throw new Error('Order volume too large (max 10 lots)');
      }

      // Check available margin
      const accountInfo = await this.getAccountInfo();
      const requiredMargin = order.volume * 1000; // Simplified margin requirement
      
      if (requiredMargin > accountInfo.freeMargin) {
        throw new Error('Insufficient margin for trade');
      }

      // Create new position
      const executionPrice = order.price || (1800 + Math.random() * 200); // Mock price for XAUUSD
      const newPosition: MT5Position = {
        ticket: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: order.symbol,
        type: order.action,
        volume: order.volume,
        openPrice: executionPrice,
        currentPrice: executionPrice,
        profit: 0,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        openTime: new Date().toISOString()
      };

      this.mockPositions.push(newPosition);
      this.saveMockData();

      console.log('Trade executed successfully:', newPosition);
      return {
        success: true,
        orderId: newPosition.ticket,
        executionPrice: executionPrice
      };

    } catch (error) {
      console.error('Trade execution error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async closeTrade(ticket: string): Promise<TradeResult> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      const positionIndex = this.mockPositions.findIndex(pos => pos.ticket === ticket);
      
      if (positionIndex === -1) {
        throw new Error('Position not found');
      }

      const position = this.mockPositions[positionIndex];
      
      // Update balance with profit/loss
      this.mockBalance += position.profit;
      
      // Remove position
      this.mockPositions.splice(positionIndex, 1);
      this.saveMockData();

      console.log(`Position ${ticket} closed with profit: ${position.profit}`);
      
      return {
        success: true,
        orderId: ticket
      };
    } catch (error) {
      console.error('Error closing trade:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMarketPrice(symbol: string): Promise<number> {
    // Simulate market price for different symbols
    const prices = {
      'XAUUSD': 1950 + Math.random() * 100,
      'EURUSD': 1.08 + Math.random() * 0.02,
      'GBPUSD': 1.25 + Math.random() * 0.03,
      'USDJPY': 148 + Math.random() * 2
    };
    
    return prices[symbol] || 1.0;
  }

  isAccountConnected(): boolean {
    return this.isConnected;
  }

  getConnectedAccount(): MT5Account | null {
    return this.account;
  }

  // Add method to reset demo data
  resetDemoData(): void {
    this.mockPositions = [];
    this.mockBalance = 10000;
    this.saveMockData();
    console.log('Demo data reset');
  }
}

export const mt5ApiService = new MT5ApiService();
export type { MT5Account, TradeOrder, TradeResult, MT5Position, MT5AccountInfo };
