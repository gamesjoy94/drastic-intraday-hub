export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class APIErrorHandler {
  static handleMarketDataError(error: any): ApiError {
    if (error?.message?.includes('rate limit') || error?.message?.includes('API credits')) {
      return {
        message: 'API rate limit exceeded. Please wait before trying again.',
        code: 'RATE_LIMIT',
        status: 429
      };
    }

    if (error?.message?.includes('TWELVE_DATA_KEY')) {
      return {
        message: 'Market data service configuration error.',
        code: 'CONFIG_ERROR',
        status: 500
      };
    }

    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return {
        message: 'Network connection error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        status: 503
      };
    }

    return {
      message: error?.message || 'An unexpected error occurred during market analysis.',
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }

  static handleMT5Error(error: any): ApiError {
    if (error?.message?.includes('connection')) {
      return {
        message: 'MT5 connection failed. Please check your credentials.',
        code: 'MT5_CONNECTION_ERROR',
        status: 401
      };
    }

    if (error?.message?.includes('trade')) {
      return {
        message: 'Trade execution failed. Please try again.',
        code: 'TRADE_ERROR',
        status: 400
      };
    }

    return {
      message: error?.message || 'MT5 operation failed.',
      code: 'MT5_ERROR',
      status: 500
    };
  }

  static isRetryableError(error: ApiError): boolean {
    return ['NETWORK_ERROR', 'TRADE_ERROR'].includes(error.code || '');
  }
}

export default APIErrorHandler;