
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, TrendingDown, Settings, Wifi, WifiOff, DollarSign, Activity, RefreshCw, Trash2, BarChart3 } from 'lucide-react';
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
    serverName: 'Demo-Server',
    isDemo: true
  });

  const [riskForm, setRiskForm] = useState(getRiskSettings());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectionForm.login.trim()) {
      alert('Please enter your MT5 login');
      return;
    }
    if (!connectionForm.password.trim()) {
      alert('Please enter your MT5 password');
      return;
    }
    await connectToMT5(connectionForm);
  };

  const handleRiskUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateRiskSettings(riskForm);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getPositionColor = (type: string) => {
    return type === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getPositionIcon = (type: string) => {
    return type === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  // Calculate total profit/loss
  const totalPL = positions.reduce((sum, pos) => sum + pos.profit, 0);

  if (!isConnected) {
    return (
      <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
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
                placeholder="12345678"
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isConnecting}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={connectionForm.password}
                onChange={(e) => setConnectionForm({...connectionForm, password: e.target.value})}
                placeholder="Your MT5 password"
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isConnecting}
              />
            </div>
            
            <div>
              <Label htmlFor="server" className="text-slate-300">Server</Label>
              <Input
                id="server"
                type="text"
                value={connectionForm.serverName}
                onChange={(e) => setConnectionForm({...connectionForm, serverName: e.target.value})}
                placeholder="Demo-Server or Live-Server"
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isConnecting}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="demo"
                checked={connectionForm.isDemo}
                onCheckedChange={(checked) => setConnectionForm({...connectionForm, isDemo: checked})}
                disabled={isConnecting}
              />
              <Label htmlFor="demo" className="text-slate-300">Demo Account</Label>
            </div>
            
            <Button 
              type="submit" 
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect to MT5'
              )}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Demo Mode</span>
            </div>
            <p className="text-yellow-300 text-xs">
              This is a simulation for demonstration purposes. No real trades will be executed.
              Always test with demo accounts first.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-400" />
            MT5 Trading
            <Badge className={`${account?.isDemo ? 'bg-blue-600' : 'bg-red-600'}`}>
              {account?.isDemo ? 'DEMO' : 'LIVE'}
            </Badge>
          </div>
          <Button
            onClick={disconnectFromMT5}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="positions" className="text-xs">Positions</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Account Info Grid */}
            {accountInfo && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs mb-1">Balance</div>
                  <div className="text-white font-semibold text-sm">
                    {formatCurrency(accountInfo.balance, accountInfo.currency)}
                  </div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs mb-1">Equity</div>
                  <div className="text-white font-semibold text-sm">
                    {formatCurrency(accountInfo.equity, accountInfo.currency)}
                  </div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs mb-1">Free Margin</div>
                  <div className="text-white font-semibold text-sm">
                    {formatCurrency(accountInfo.freeMargin, accountInfo.currency)}
                  </div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg">
                  <div className="text-slate-400 text-xs mb-1">P&L</div>
                  <div className={`font-semibold text-sm ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(totalPL, accountInfo.currency)}
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
                  <Badge className={`${isAutoTradingEnabled ? 'bg-green-600' : 'bg-gray-600'}`}>
                    {isAutoTradingEnabled ? 'ON' : 'OFF'}
                  </Badge>
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

            {/* Quick Stats */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-slate-200 font-medium">Quick Stats</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-white font-semibold">{positions.length}</div>
                  <div className="text-slate-400 text-xs">Open Positions</div>
                </div>
                <div>
                  <div className="text-white font-semibold">{tradingHistory.length}</div>
                  <div className="text-slate-400 text-xs">Total Signals</div>
                </div>
                <div>
                  <div className={`font-semibold ${accountInfo && accountInfo.marginLevel < 100 ? 'text-red-400' : 'text-green-400'}`}>
                    {accountInfo ? `${accountInfo.marginLevel.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-slate-400 text-xs">Margin Level</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="positions" className="space-y-3 max-h-96 overflow-y-auto">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No open positions</p>
                <p className="text-xs mt-1">Positions will appear here when trades are executed</p>
              </div>
            ) : (
              positions.map((position) => (
                <div key={position.ticket} className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`${getPositionColor(position.type)} flex items-center gap-1`}>
                        {getPositionIcon(position.type)}
                        <Badge className="bg-opacity-20">
                          {position.type}
                        </Badge>
                      </div>
                      <span className="text-white font-medium">{position.symbol}</span>
                    </div>
                    <Button
                      onClick={() => closePosition(position.ticket)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      Close
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">Volume</div>
                      <div className="text-white font-medium">{position.volume}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Open Price</div>
                      <div className="text-white font-medium">{position.openPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Current</div>
                      <div className="text-white font-medium">{position.currentPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Profit</div>
                      <div className={`font-medium ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(position.profit)}
                      </div>
                    </div>
                  </div>
                  {(position.stopLoss || position.takeProfit) && (
                    <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                      {position.stopLoss && (
                        <div>
                          <div className="text-slate-400">Stop Loss</div>
                          <div className="text-red-400">{position.stopLoss.toFixed(2)}</div>
                        </div>
                      )}
                      {position.takeProfit && (
                        <div>
                          <div className="text-slate-400">Take Profit</div>
                          <div className="text-green-400">{position.takeProfit.toFixed(2)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-200 font-medium">Signal History</span>
              <Button
                onClick={clearTradingHistory}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-600"
                disabled={tradingHistory.length === 0}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-2">
              {tradingHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trading history</p>
                  <p className="text-xs mt-1">Signal processing history will appear here</p>
                </div>
              ) : (
                tradingHistory.slice(0, 20).map((record, index) => (
                  <div key={index} className="bg-slate-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm">
                        {record.timestamp.toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge className={`${record.executed ? 'bg-green-600' : 'bg-red-600'} text-xs`}>
                          {record.executed ? 'Executed' : 'Skipped'}
                        </Badge>
                        <span className="text-slate-300 text-xs">
                          {record.signal.tradePlan.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      <div>
                        {record.signal.tradePlan.direction} @ ${record.signal.tradePlan.entry}
                      </div>
                      {record.reason && (
                        <div className="text-red-300 mt-1">
                          Reason: {record.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <form onSubmit={handleRiskUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="minConfidence" className="text-slate-300">Min Confidence (%)</Label>
                  <Input
                    id="minConfidence"
                    type="number"
                    min="50"
                    max="95"
                    value={riskForm.minConfidence}
                    onChange={(e) => setRiskForm({...riskForm, minConfidence: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
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
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Update Risk Settings
              </Button>
            </form>

            <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Risk Warning</span>
              </div>
              <p className="text-red-300 text-xs">
                Trading involves substantial risk of loss. Past performance is not indicative of future results.
                Only trade with funds you can afford to lose.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MT5TradingPanel;
