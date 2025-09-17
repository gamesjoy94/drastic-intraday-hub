export interface MarketData {
  currentPrice: number;
  priceChange: number;
  analysisData: any;
  tradePlan: any;
  technicalData?: any;
}

export interface TradingData {
  symbol: string;
  direction: 'BUY' | 'SELL' | 'NO TRADE';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
}

export class DataValidator {
  static validateMarketData(data: any): MarketData | null {
    try {
      if (!data || typeof data !== 'object') {
        console.warn('Invalid market data: not an object');
        return null;
      }

      const currentPrice = this.validateNumber(data.currentPrice, 'currentPrice');
      const priceChange = this.validateNumber(data.priceChange, 'priceChange', true);

      if (currentPrice === null) {
        console.warn('Invalid market data: missing or invalid currentPrice');
        return null;
      }

      return {
        currentPrice,
        priceChange: priceChange ?? 0,
        analysisData: data.analysis || data.analysisData || null,
        tradePlan: data.tradePlan || null,
        technicalData: data.technicalData || null
      };
    } catch (error) {
      console.error('Error validating market data:', error);
      return null;
    }
  }

  static validateTradingData(data: any): TradingData | null {
    try {
      if (!data || typeof data !== 'object') {
        return null;
      }

      const symbol = data.symbol || 'UNKNOWN';
      const direction = this.validateDirection(data.direction);
      const entry = this.validateNumber(data.entry, 'entry');
      const stopLoss = this.validateNumber(data.stopLoss, 'stopLoss');
      const takeProfit = this.validateNumber(data.takeProfit, 'takeProfit');
      const confidence = this.validateNumber(data.confidence, 'confidence', true, 0, 100);

      if (!direction || entry === null || stopLoss === null || takeProfit === null) {
        console.warn('Invalid trading data: missing required fields');
        return null;
      }

      return {
        symbol,
        direction,
        entry,
        stopLoss,
        takeProfit,
        confidence: confidence ?? 50
      };
    } catch (error) {
      console.error('Error validating trading data:', error);
      return null;
    }
  }

  static validateNumber(
    value: any, 
    fieldName: string, 
    allowNull = false, 
    min?: number, 
    max?: number
  ): number | null {
    if (value === null || value === undefined) {
      return allowNull ? null : 0;
    }

    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    
    if (isNaN(num)) {
      console.warn(`Invalid ${fieldName}: not a number`);
      return allowNull ? null : 0;
    }

    if (min !== undefined && num < min) {
      console.warn(`Invalid ${fieldName}: below minimum (${min})`);
      return min;
    }

    if (max !== undefined && num > max) {
      console.warn(`Invalid ${fieldName}: above maximum (${max})`);
      return max;
    }

    return num;
  }

  static validateDirection(value: any): 'BUY' | 'SELL' | 'NO TRADE' | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.toUpperCase().trim();
    
    if (['BUY', 'LONG'].includes(normalized)) return 'BUY';
    if (['SELL', 'SHORT'].includes(normalized)) return 'SELL';
    if (['NO TRADE', 'NONE', 'WAIT'].includes(normalized)) return 'NO TRADE';
    
    return null;
  }

  static sanitizeString(value: any, maxLength = 255): string {
    if (typeof value !== 'string') {
      return String(value || '').slice(0, maxLength);
    }
    return value.trim().slice(0, maxLength);
  }

  static validateTimeframe(timeframe: string): string {
    const validTimeframes = ['1min', '5min', '15min', '30min', '1h', '4h', '1D'];
    return validTimeframes.includes(timeframe) ? timeframe : '5min';
  }

  static validateSymbol(symbol: string): string {
    const validSymbols = ['XAUUSD', 'XAU/USD', 'EURUSD', 'EUR/USD'];
    const normalized = symbol.toUpperCase().replace('/', '');
    
    if (normalized.includes('XAU') || normalized.includes('GOLD')) {
      return 'XAU/USD';
    }
    if (normalized.includes('EUR') && normalized.includes('USD')) {
      return 'EUR/USD';
    }
    
    return 'XAU/USD'; // Default fallback
  }
}

export default DataValidator;