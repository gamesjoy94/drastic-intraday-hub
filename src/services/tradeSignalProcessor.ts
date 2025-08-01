
import { mt5ApiService, TradeOrder } from './mt5ApiService';

interface RiskSettings {
  maxRiskPercentage: number;
  maxPositionSize: number;
  useStopLoss: boolean;
  useTakeProfit: boolean;
  maxOpenPositions: number;
  minConfidence: number;
  allowedSymbols: string[];
}

interface AIAnalysis {
  tradePlan: {
    direction: string;
    entry: number;
    stopLoss: number;
    takeProfit: number;
    confidence: number;
    positionSize: string;
  };
  currentPrice: number;
  symbol?: string;
}

interface SignalRecord {
  timestamp: Date;
  signal: AIAnalysis;
  executed: boolean;
  result?: any;
  reason?: string;
}

class TradeSignalProcessor {
  private riskSettings: RiskSettings = {
    maxRiskPercentage: 2,
    maxPositionSize: 0.1,
    useStopLoss: true,
    useTakeProfit: true,
    maxOpenPositions: 3,
    minConfidence: 70,
    allowedSymbols: ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY']
  };

  private isAutoTradingEnabled = false;
  private tradingHistory: SignalRecord[] = [];

  constructor() {
    this.loadSettings();
    this.loadHistory();
  }

  private loadSettings() {
    const stored = localStorage.getItem('mt5_risk_settings');
    if (stored) {
      try {
        this.riskSettings = { ...this.riskSettings, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load risk settings:', error);
      }
    }
  }

  private saveSettings() {
    localStorage.setItem('mt5_risk_settings', JSON.stringify(this.riskSettings));
  }

  private loadHistory() {
    const stored = localStorage.getItem('mt5_trading_history');
    if (stored) {
      try {
        const history = JSON.parse(stored);
        this.tradingHistory = history.map((record: any) => ({
          ...record,
          timestamp: new Date(record.timestamp)
        }));
      } catch (error) {
        console.error('Failed to load trading history:', error);
      }
    }
  }

  private saveHistory() {
    localStorage.setItem('mt5_trading_history', JSON.stringify(this.tradingHistory));
  }

  setRiskSettings(settings: Partial<RiskSettings>) {
    this.riskSettings = { ...this.riskSettings, ...settings };
    this.saveSettings();
    console.log('Risk settings updated:', this.riskSettings);
  }

  getRiskSettings(): RiskSettings {
    return { ...this.riskSettings };
  }

  enableAutoTrading() {
    this.isAutoTradingEnabled = true;
    console.log('Auto trading enabled');
  }

  disableAutoTrading() {
    this.isAutoTradingEnabled = false;
    console.log('Auto trading disabled');
  }

  isAutoTradingActive(): boolean {
    return this.isAutoTradingEnabled;
  }

  async processAISignal(analysis: AIAnalysis): Promise<boolean> {
    const signalRecord: SignalRecord = {
      timestamp: new Date(),
      signal: analysis,
      executed: false
    };

    try {
      if (!this.isAutoTradingEnabled) {
        signalRecord.reason = 'Auto trading disabled';
        this.tradingHistory.push(signalRecord);
        this.saveHistory();
        return false;
      }

      if (!mt5ApiService.isAccountConnected()) {
        signalRecord.reason = 'MT5 not connected';
        this.tradingHistory.push(signalRecord);
        this.saveHistory();
        return false;
      }

      // Validate signal
      const validation = this.validateSignal(analysis);
      if (!validation.isValid) {
        signalRecord.reason = validation.reason;
        this.tradingHistory.push(signalRecord);
        this.saveHistory();
        return false;
      }

      // Check position limits
      const positions = await mt5ApiService.getPositions();
      if (positions.length >= this.riskSettings.maxOpenPositions) {
        signalRecord.reason = `Maximum open positions reached (${this.riskSettings.maxOpenPositions})`;
        this.tradingHistory.push(signalRecord);
        this.saveHistory();
        return false;
      }

      // Calculate position size
      const accountInfo = await mt5ApiService.getAccountInfo();
      const positionSize = this.calculatePositionSize(analysis, accountInfo.balance);

      if (positionSize <= 0) {
        signalRecord.reason = 'Invalid position size calculated';
        this.tradingHistory.push(signalRecord);
        this.saveHistory();
        return false;
      }

      // Create trade order
      const symbol = analysis.symbol || 'XAUUSD';
      const order: TradeOrder = {
        symbol: symbol,
        action: analysis.tradePlan.direction.toUpperCase() === 'LONG' || analysis.tradePlan.direction.toUpperCase() === 'BUY' ? 'BUY' : 'SELL',
        volume: positionSize,
        price: analysis.tradePlan.entry,
        stopLoss: this.riskSettings.useStopLoss ? analysis.tradePlan.stopLoss : undefined,
        takeProfit: this.riskSettings.useTakeProfit ? analysis.tradePlan.takeProfit : undefined,
        comment: `AI_Signal_${analysis.tradePlan.confidence}%_${Date.now()}`,
        magic: 12345
      };

      // Execute trade
      const result = await mt5ApiService.executeTrade(order);
      
      signalRecord.executed = result.success;
      signalRecord.result = result;
      
      if (!result.success) {
        signalRecord.reason = result.error;
      }

      this.tradingHistory.push(signalRecord);
      this.saveHistory();

      if (result.success) {
        console.log('AI signal executed successfully:', result);
        return true;
      } else {
        console.error('Trade execution failed:', result.error);
        return false;
      }

    } catch (error) {
      console.error('Error processing AI signal:', error);
      signalRecord.reason = error.message;
      this.tradingHistory.push(signalRecord);
      this.saveHistory();
      return false;
    }
  }

  private validateSignal(analysis: AIAnalysis): { isValid: boolean; reason?: string } {
    // Check if signal direction is valid
    const direction = analysis.tradePlan.direction.toUpperCase();
    if (!direction || direction === 'NO TRADE' || direction === 'NEUTRAL') {
      return { isValid: false, reason: 'No trade signal or neutral direction' };
    }

    // Check confidence threshold
    if (analysis.tradePlan.confidence < this.riskSettings.minConfidence) {
      return { 
        isValid: false, 
        reason: `Confidence too low: ${analysis.tradePlan.confidence}% < ${this.riskSettings.minConfidence}%` 
      };
    }

    // Check if symbol is allowed
    const symbol = analysis.symbol || 'XAUUSD';
    if (!this.riskSettings.allowedSymbols.includes(symbol)) {
      return { isValid: false, reason: `Symbol ${symbol} not in allowed list` };
    }

    // Check if entry price is reasonable
    if (analysis.tradePlan.entry <= 0) {
      return { isValid: false, reason: 'Invalid entry price' };
    }

    // Check price difference from current price
    const priceDiff = Math.abs(analysis.tradePlan.entry - analysis.currentPrice);
    const maxPriceDiff = analysis.currentPrice * 0.02; // 2% maximum difference
    
    if (priceDiff > maxPriceDiff) {
      return { 
        isValid: false, 
        reason: `Entry price too far from current: ${priceDiff.toFixed(2)} > ${maxPriceDiff.toFixed(2)}` 
      };
    }

    // Check stop loss and take profit
    if (this.riskSettings.useStopLoss && analysis.tradePlan.stopLoss <= 0) {
      return { isValid: false, reason: 'Invalid stop loss level' };
    }

    if (this.riskSettings.useTakeProfit && analysis.tradePlan.takeProfit <= 0) {
      return { isValid: false, reason: 'Invalid take profit level' };
    }

    return { isValid: true };
  }

  private calculatePositionSize(analysis: AIAnalysis, accountBalance: number): number {
    const riskAmount = accountBalance * (this.riskSettings.maxRiskPercentage / 100);
    const stopLossDistance = Math.abs(analysis.tradePlan.entry - analysis.tradePlan.stopLoss);
    
    if (stopLossDistance === 0) {
      return Math.min(0.01, this.riskSettings.maxPositionSize);
    }

    // Calculate position size based on risk
    // For gold (XAUUSD), pip value is different
    const symbol = analysis.symbol || 'XAUUSD';
    let pipValue = 1;
    
    if (symbol === 'XAUUSD') {
      pipValue = 0.1; // For gold, 1 pip = $0.1 per 0.01 lot
    } else if (symbol.includes('USD')) {
      pipValue = 10; // For major pairs, 1 pip = $10 per lot
    }

    const positionSize = riskAmount / (stopLossDistance * pipValue);
    
    // Apply maximum position size limit
    return Math.min(Math.max(positionSize, 0.01), this.riskSettings.maxPositionSize);
  }

  getTradingHistory(): SignalRecord[] {
    return [...this.tradingHistory].reverse(); // Most recent first
  }

  clearTradingHistory() {
    this.tradingHistory = [];
    this.saveHistory();
    console.log('Trading history cleared');
  }

  getPerformanceStats() {
    const total = this.tradingHistory.length;
    const executed = this.tradingHistory.filter(r => r.executed).length;
    const successful = this.tradingHistory.filter(r => r.executed && r.result?.success).length;
    
    return {
      totalSignals: total,
      executed: executed,
      executionRate: total > 0 ? (executed / total * 100).toFixed(1) : '0',
      successRate: executed > 0 ? (successful / executed * 100).toFixed(1) : '0'
    };
  }
}

export const tradeSignalProcessor = new TradeSignalProcessor();
export type { RiskSettings, AIAnalysis, SignalRecord };
