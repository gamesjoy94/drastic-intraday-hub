
const TWELVE_DATA_KEY = Deno.env.get('TWELVE_DATA_KEY');

export async function fetchMarketData(symbol: string, timeframe: string) {
  const [ohlcvResponse, ema8Response, ema21Response, rsiResponse, macdResponse, vwapResponse, atrResponse] = await Promise.all([
    fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=100`),
    fetch(`https://api.twelvedata.com/ema?symbol=${symbol}&interval=${timeframe}&time_period=8&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/ema?symbol=${symbol}&interval=${timeframe}&time_period=21&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/rsi?symbol=${symbol}&interval=${timeframe}&time_period=14&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/macd?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/vwap?symbol=${symbol}&interval=${timeframe}&apikey=${TWELVE_DATA_KEY}&outputsize=50`),
    fetch(`https://api.twelvedata.com/atr?symbol=${symbol}&interval=${timeframe}&time_period=14&apikey=${TWELVE_DATA_KEY}&outputsize=50`)
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
