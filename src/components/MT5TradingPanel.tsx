
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, Settings, Wifi, WifiOff, DollarSign, Activity } from 'lucide-react';
import { useMT5Trading } from '@/hooks/useMT5Trading';
import { MT5Account } from '@/services/mt5ApiService';

const MT5TradingPanel = () => {
  const {
    isConnected,
    account,
    positions,
    accountInfo,
    isAutoTradingEnabled,
    isConnecting,
    tradingHistory,
    connectToMT5,
    disconnectFromMT5,
    toggleAutoTrading,
    updateRiskSettings,
    closePosition,
    getRiskSettings,
    clearTradingHistory
  } = useMT5Trading();

  const [connectionForm, setConnectionForm] = useState<MT5Account>({
    login: '',
    password: '',
    serverName: '',
    isDemo: true
  });

  const [riskForm, setRiskForm] = useState(getRiskSettings());

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    await connectToMT5(connectionForm);
  };

  const handleRiskUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateRiskSettings(riskForm);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPositionColor = (type: string) => {
    return type === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  if (!isConnected) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <WifiOff className="w-5 h-5" />
            Connect to MT5
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <Label htmlFor="login" className="text-slate-300">Login</Label>
              <Input
                id="login"
                type="text"
                value={connectionForm.login}
                onChange={(e) => setConnectionForm({...connectionForm, login: e.target.value})}
                placeholder="MT5 Account Number"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={connectionForm.password}
                onChange={(e) => setConnectionForm({...connectionForm, password: e.target.value})}
                placeholder="MT5 Password"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="server" className="text-slate-300">Server</Label>
              <Input
                id="server"
                type="text"
                value={connectionForm.serverName}
                onChange={(e) => setConnectionForm({...connectionForm, serverName: e.target.value})}
                placeholder="Server Name (e.g., Demo-Server)"
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="demo"
                checked={connectionForm.isDemo}
                onCheckedChange={(checked) => setConnectionForm({...connectionForm, isDemo: checked})}
              />
              <Label htmlFor="demo" className="text-slate-300">Demo Account</Label>
            </div>
            
            <Button 
              type="submit" 
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? 'Connecting...' : 'Connect to MT5'}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Important Notice</span>
            </div>
            <p className="text-yellow-300 text-xs">
              Automated trading involves substantial risk of loss. Only use demo accounts for testing. 
              Never risk more than you can afford to lose.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-400" />
            MT5 Trading ({account?.isDemo ? 'Demo' : 'Live'})
          </div>
          <Button
            onClick={disconnectFromMT5}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300"
          >
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Account Info */}
            {accountInfo && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs">Balance</div>
                  <div className="text-white font-semibold">
                    {formatCurrency(accountInfo.balance, accountInfo.currency)}
                  </div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs">Equity</div>
                  <div className="text-white font-semibold">
                    {formatCurrency(accountInfo.equity, accountInfo.currency)}
                  </div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs">Free Margin</div>
                  <div className="text-white font-semibold">
                    {formatCurrency(accountInfo.freeMargin, accountInfo.currency)}
                  </div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs">Margin Level</div>
                  <div className="text-white font-semibold">
                    {accountInfo.marginLevel.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
            
            {/* Auto Trading Toggle */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-200 font-medium">Auto Trading</span>
                </div>
                <Switch
                  checked={isAutoTradingEnabled}
                  onCheckedChange={toggleAutoTrading}
                />
              </div>
              <p className="text-slate-400 text-xs">
                {isAutoTradingEnabled 
                  ? 'AI signals will automatically execute trades based on your risk settings'
                  : 'AI signals will be displayed but not executed automatically'
                }
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="positions" className="space-y-3">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No open positions
              </div>
            ) : (
              positions.map((position) => (
                <div key={position.ticket} className="bg-slate-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getPositionColor(position.type)} bg-opacity-20`}>
                        {position.type}
                      </Badge>
                      <span className="text-white font-medium">{position.symbol}</span>
                    </div>
                    <Button
                      onClick={() => closePosition(position.ticket)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300"
                    >
                      Close
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-400">Volume</div>
                      <div className="text-white">{position.volume}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Open Price</div>
                      <div className="text-white">{position.openPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Profit</div>
                      <div className={`${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(position.profit)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-200 font-medium">Trading History</span>
              <Button
                onClick={clearTradingHistory}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300"
              >
                Clear
              </Button>
            </div>
            
            {tradingHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No trading history
              </div>
            ) : (
              tradingHistory.slice(-10).reverse().map((record, index) => (
                <div key={index} className="bg-slate-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">
                      {record.timestamp.toLocaleTimeString()}
                    </span>
                    <Badge className={`${record.executed ? 'bg-green-600' : 'bg-red-600'}`}>
                      {record.executed ? 'Executed' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    {record.signal.tradePlan.direction} | 
                    Confidence: {record.signal.tradePlan.confidence}% | 
                    Entry: ${record.signal.tradePlan.entry}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <form onSubmit={handleRiskUpdate} className="space-y-4">
              <div>
                <Label htmlFor="maxRisk" className="text-slate-300">Max Risk per Trade (%)</Label>
                <Input
                  id="maxRisk"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={riskForm.maxRiskPercentage}
                  onChange={(e) => setRiskForm({...riskForm, maxRiskPercentage: parseFloat(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="maxPosition" className="text-slate-300">Max Position Size (Lots)</Label>
                <Input
                  id="maxPosition"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10"
                  value={riskForm.maxPositionSize}
                  onChange={(e) => setRiskForm({...riskForm, maxPositionSize: parseFloat(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="maxPositions" className="text-slate-300">Max Open Positions</Label>
                <Input
                  id="maxPositions"
                  type="number"
                  min="1"
                  max="10"
                  value={riskForm.maxOpenPositions}
                  onChange={(e) => setRiskForm({...riskForm, maxOpenPositions: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="useStopLoss"
                  checked={riskForm.useStopLoss}
                  onCheckedChange={(checked) => setRiskForm({...riskForm, useStopLoss: checked})}
                />
                <Label htmlFor="useStopLoss" className="text-slate-300">Use Stop Loss</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="useTakeProfit"
                  checked={riskForm.useTakeProfit}
                  onCheckedChange={(checked) => setRiskForm({...riskForm, useTakeProfit: checked})}
                />
                <Label htmlFor="useTakeProfit" className="text-slate-300">Use Take Profit</Label>
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Update Risk Settings
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MT5TradingPanel;
