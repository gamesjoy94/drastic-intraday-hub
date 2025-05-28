
const TWELVE_DATA_KEY = Deno.env.get('TWELVE_DATA_KEY');

// Convert our timeframe format to TwelveData API format
function convertToApiTimeframe(timeframe: string): string {
  switch (timeframe) {
    case '1min': return '1min';
    case '5min': return '5min';
    case '15min': return '15min';
    case '30min': return '30min';
    case '1h': return '1h';
    case '4h': return '4h';
    case '1D': return '1day';
    default: return '5min'; // Default fallback
  }
}

export async function fetchMarketData(symbol: string, timeframe: string) {
  const apiTimeframe = convertToApiTimeframe(timeframe);
  console.log(`Fetching market data for ${symbol} on ${timeframe} (API: ${apiTimeframe}) timeframe`);

  const [ohlcvResponse, ema8Response, ema21Response, rsiResponse, macdResponse, vwapResponse, atrResponse] = await Promise.all([
    fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${apiTimeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=100`),
    fetch(`https://api.twelvedata.com/ema?symbol=${symbol}&interval=${apiTimeframe}&time_period=8&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/ema?symbol=${symbol}&interval=${apiTimeframe}&time_period=21&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/rsi?symbol=${symbol}&interval=${apiTimeframe}&time_period=14&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/macd?symbol=${symbol}&interval=${apiTimeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/vwap?symbol=${symbol}&interval=${apiTimeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/atr?symbol=${symbol}&interval=${apiTimeframe}&time_period=14&apikey=${TWELVE_DATA_KEY}&outputsize=50`)
  ]);

  const [ohlcvData, ema8Data, ema21Data, rsiData, macdData, vwapData, atrData] = await Promise.all([
    ohlcvResponse.json(),
    ema8Response.json(),
    ema21Response.json(),
    rsiResponse.json(),
    macdResponse.json(),
    vwapResponse.json(),
    atrResponse.json()
  ]);

  // Validate data
  if (ohlcvData.status === 'error') {
    throw new Error(`Market data error: ${ohlcvData.message}`);
  }

  console.log(`Market data fetched successfully for ${timeframe} timeframe`);

  return {
    ohlcvData,
    ema8Data,
    ema21Data,
    rsiData,
    macdData,
    vwapData,
    atrData
  };
}
