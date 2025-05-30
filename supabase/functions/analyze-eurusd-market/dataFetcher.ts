
export const fetchMarketData = async (symbol: string, timeframe: string) => {
  const API_KEY = Deno.env.get('TWELVE_DATA_KEY');
  
  if (!API_KEY) {
    throw new Error('TWELVE_DATA_KEY is not set');
  }

  console.log(`Fetching EUR/USD market data for ${symbol} on ${timeframe} timeframe`);

  const baseParams = {
    symbol,
    interval: timeframe,
    apikey: API_KEY,
    outputsize: '50'
  };

  // Fetch OHLCV data
  const ohlcvResponse = await fetch(
    `https://api.twelvedata.com/time_series?${new URLSearchParams(baseParams)}`
  );
  const ohlcvData = await ohlcvResponse.json();

  if (ohlcvData.status === 'error') {
    throw new Error(`OHLCV API Error: ${ohlcvData.message}`);
  }

  // Fetch technical indicators
  const ema8Response = await fetch(
    `https://api.twelvedata.com/ema?${new URLSearchParams({...baseParams, time_period: '8'})}`
  );
  const ema8Data = await ema8Response.json();

  const ema21Response = await fetch(
    `https://api.twelvedata.com/ema?${new URLSearchParams({...baseParams, time_period: '21'})}`
  );
  const ema21Data = await ema21Response.json();

  const rsiResponse = await fetch(
    `https://api.twelvedata.com/rsi?${new URLSearchParams({...baseParams, time_period: '14'})}`
  );
  const rsiData = await rsiResponse.json();

  const macdResponse = await fetch(
    `https://api.twelvedata.com/macd?${new URLSearchParams(baseParams)}`
  );
  const macdData = await macdResponse.json();

  const vwapResponse = await fetch(
    `https://api.twelvedata.com/vwap?${new URLSearchParams(baseParams)}`
  );
  const vwapData = await vwapResponse.json();

  const atrResponse = await fetch(
    `https://api.twelvedata.com/atr?${new URLSearchParams({...baseParams, time_period: '14'})}`
  );
  const atrData = await atrResponse.json();

  return {
    ohlcvData,
    ema8Data,
    ema21Data,
    rsiData,
    macdData,
    vwapData,
    atrData
  };
};
