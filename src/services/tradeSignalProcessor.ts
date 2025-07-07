import { mt5ApiService, TradeOrder } from './mt5ApiService';

interface RiskSettings {
  maxRiskPercentage: number;
  maxPositionSize: number;
  useStopLoss: boolean;
  useTakeProfit: boolean;
  maxOpenPositions: number;
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
}

interface SignalRecord {
  timestamp: Date;
  signal: AIAnalysis;
  executed: boolean;
  result?: any;
}

class TradeSignalProcessor {
  private riskSettings: RiskSettings = {
    maxRiskPercentage: 2, // 2% risk per trade
    maxPositionSize: 0.1, // 0.1 lot max
    useStopLoss: true,
    useTakeProfit: true,
    maxOpenPositions: 3
  };

  private isAutoTradingEnabled = false;
  private tradingHistory: SignalRecord[] = [];

  setRiskSettings(settings: Partial<RiskSettings>) {
    this.riskSettings = { ...this.riskSettings, ...settings };
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
    if (!this.isAutoTradingEnabled) {
      console.log('Auto trading disabled, skipping signal');
      return false;
    }

    if (!mt5ApiService.isAccountConnected()) {
      console.log('MT5 not connected, skipping signal');
      return false;
    }

    try {
      // Record the signal
      const signalRecord: SignalRecord = {
        timestamp: new Date(),
        signal: analysis,
        executed: false
      };

      // Validate signal
      if (!this.validateSignal(analysis)) {
        console.log('Signal validation failed');
        signalRecord.executed = false;
        this.tradingHistory.push(signalRecord);
        return false;
      }

      // Check risk management
      const positions = await mt5ApiService.getPositions();
      if (positions.length >= this.riskSettings.maxOpenPositions) {
        console.log('Maximum open positions reached');
        signalRecord.executed = false;
        this.tradingHistory.push(signalRecord);
        return false;
      }

      // Calculate position size
      const accountInfo = await mt5ApiService.getAccountInfo();
      const positionSize = this.calculatePositionSize(analysis, accountInfo.balance);

      // Create trade order
      const order: TradeOrder = {
        symbol: 'XAUUSD', // Gold symbol
        action: analysis.tradePlan.direction === 'LONG' ? 'BUY' : 'SELL',
        volume: positionSize,
        price: analysis.tradePlan.entry,
        stopLoss: this.riskSettings.useStopLoss ? analysis.tradePlan.stopLoss : undefined,
        takeProfit: this.riskSettings.useTakeProfit ? analysis.tradePlan.takeProfit : undefined,
        comment: `AI_Signal_${analysis.tradePlan.confidence}%`,
        magic: 12345 // Unique identifier for our EA
      };

      // Execute trade
      const result = await mt5ApiService.executeTrade(order);
      
      signalRecord.executed = result.success;
      signalRecord.result = result;
      this.tradingHistory.push(signalRecord);

      if (result.success) {
        console.log('Trade executed successfully:', result);
        return true;
      } else {
        console.error('Trade execution failed:', result.error);
        return false;
      }

    } catch (error) {
      console.error('Error processing AI signal:', error);
      return false;
    }
  }

  private validateSignal(analysis: AIAnalysis): boolean {
    // Check if signal is valid
    if (!analysis.tradePlan.direction || analysis.tradePlan.direction === 'NO TRADE') {
      return false;
    }

    // Check confidence threshold
    if (analysis.tradePlan.confidence < 70) {
      console.log('Signal confidence too low:', analysis.tradePlan.confidence);
      return false;
    }

    // Check if entry price is reasonable
    const priceDiff = Math.abs(analysis.tradePlan.entry - analysis.currentPrice);
    const maxPriceDiff = analysis.currentPrice * 0.01; // 1% maximum difference
    
    if (priceDiff > maxPriceDiff) {
      console.log('Entry price too far from current price');
      return false;
    }

    return true;
  }

  private calculatePositionSize(analysis: AIAnalysis, accountBalance: number): number {
    // Calculate position size based on risk percentage
    const riskAmount = accountBalance * (this.riskSettings.maxRiskPercentage / 100);
    const stopLossDistance = Math.abs(analysis.tradePlan.entry - analysis.tradePlan.stopLoss);
    
    if (stopLossDistance === 0) {
      return this.riskSettings.maxPositionSize;
    }

    // Calculate position size based on risk
    const positionSize = riskAmount / stopLossDistance / 100; // Convert to lots
    
    // Apply maximum position size limit
    return Math.min(positionSize, this.riskSettings.maxPositionSize);
  }

  getTradingHistory(): SignalRecord[] {
    return [...this.tradingHistory];
  }

  clearTradingHistory() {
    this.tradingHistory = [];
    console.log('Trading history cleared');
  }
}

export const tradeSignalProcessor = new TradeSignalProcessor();
export type { RiskSettings, AIAnalysis };
