import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  DollarSign,
  Activity,
  RefreshCw,
  Trash2,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { useMT5Trading } from '@/hooks/useMT5Trading';
import { MT5AccountInput, RiskSettings } from '@/services/mt5ApiService';

const MT5TradingPanel = () => {
  const {
    isConnected,
    account,
    positions,
    accountInfo,
    riskSettings,
    signalHistory,
    isConnecting,
    isRefreshing,
    bridgeError,
    pendingOrder,
    isAutoTradingEnabled,
    connectToMT5,
    disconnectFromMT5,
    refresh,
    updateRiskSettings,
    toggleAutoTrading,
    toggleKillSwitch,
    confirmPendingOrder,
    cancelPendingOrder,
    closePosition,
    closeAllPositions,
    clearSignalHistory,
  } = useMT5Trading();

  const [connectionForm, setConnectionForm] = useState<MT5AccountInput>({
    label: 'My MT5 account',
    login: '',
    serverName: '',
    isDemo: true,
    symbolSuffix: '',
  });

  const [riskForm, setRiskForm] = useState<RiskSettings | null>(null);
  const [liveAck, setLiveAck] = useState(false);

  useEffect(() => {
    if (riskSettings) setRiskForm(riskSettings);
  }, [riskSettings]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    await connectToMT5(connectionForm);
  };

  const handleRiskUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (riskForm) await updateRiskSettings(riskForm);
  };

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const totalPL = positions.reduce((sum, pos) => sum + pos.profit, 0);

  // ---- not connected -------------------------------------------------------
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
              <Label htmlFor="label" className="text-slate-300">Label</Label>
              <Input
                id="label"
                value={connectionForm.label}
                onChange={(e) => setConnectionForm({ ...connectionForm, label: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isConnecting}
                required
              />
            </div>

            <div>
              <Label htmlFor="login" className="text-slate-300">Account number</Label>
              <Input
                id="login"
                value={connectionForm.login}
                onChange={(e) => setConnectionForm({ ...connectionForm, login: e.target.value })}
                placeholder="12345678"
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isConnecting}
                required
              />
            </div>

            <div>
              <Label htmlFor="server" className="text-slate-300">Broker server</Label>
              <Input
                id="server"
                value={connectionForm.serverName}
                onChange={(e) => setConnectionForm({ ...connectionForm, serverName: e.target.value })}
                placeholder="ICMarketsSC-Demo"
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isConnecting}
                required
              />
            </div>

            <div>
              <Label htmlFor="suffix" className="text-slate-300">Symbol suffix (optional)</Label>
              <Input
                id="suffix"
                value={connectionForm.symbolSuffix}
                onChange={(e) => setConnectionForm({ ...connectionForm, symbolSuffix: e.target.value })}
                placeholder=".m or -ECN"
                className="bg-slate-700 border-slate-600 text-white"
                disabled={isConnecting}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="demo"
                checked={connectionForm.isDemo}
                onCheckedChange={(checked) => {
                  setConnectionForm({ ...connectionForm, isDemo: checked });
                  setLiveAck(false);
                }}
                disabled={isConnecting}
              />
              <Label htmlFor="demo" className="text-slate-300">Demo account</Label>
            </div>

            {!connectionForm.isDemo && (
              <div className="p-3 bg-red-900/20 border border-red-600/40 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Live account</span>
                </div>
                <p className="text-red-300 text-xs">
                  Orders placed on this account use real money. Every order will still
                  require manual confirmation.
                </p>
                <label className="flex items-start gap-2 text-red-200 text-xs">
                  <input
                    type="checkbox"
                    checked={liveAck}
                    onChange={(e) => setLiveAck(e.target.checked)}
                    className="mt-0.5"
                  />
                  I understand and accept the risk of trading a live account.
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={isConnecting || (!connectionForm.isDemo && !liveAck)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying with your bridge...
                </>
              ) : (
                'Connect to MT5'
              )}
            </Button>
          </form>

          {bridgeError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <p className="text-red-300 text-xs">{bridgeError}</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
            <p className="text-slate-400 text-xs">
              Your MT5 password never leaves your VPS. The bridge running next to your
              terminal holds the credentials; this app only identifies which account it
              should trade.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---- connected -----------------------------------------------------------
  return (
    <>
      <Card className="bg-slate-800 border-slate-700 w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-400" />
              MT5 Trading
              <Badge className={account?.is_demo ? 'bg-blue-600' : 'bg-red-600'}>
                {account?.is_demo ? 'DEMO' : 'LIVE'}
              </Badge>
              <span className="text-slate-400 text-xs font-normal">{account?.login}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={disconnectFromMT5}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Disconnect
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bridgeError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-red-300 text-xs">{bridgeError}</p>
            </div>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="positions" className="text-xs">Positions</TabsTrigger>
              <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
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
                    <div className="text-slate-400 text-xs mb-1">Open P&L</div>
                    <div className={`font-semibold text-sm ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(totalPL, accountInfo.currency)}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-200 font-medium">Auto Trading</span>
                    <Badge className={isAutoTradingEnabled ? 'bg-green-600' : 'bg-gray-600'}>
                      {isAutoTradingEnabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                  <Switch
                    checked={!!riskSettings?.auto_trading_enabled}
                    disabled={!!riskSettings?.kill_switch_engaged}
                    onCheckedChange={toggleAutoTrading}
                  />
                </div>
                <p className="text-slate-400 text-xs">
                  {riskSettings?.require_manual_confirm || !account?.is_demo
                    ? 'Each signal is validated server-side and then waits for your confirmation.'
                    : 'Signals that pass the server-side risk checks are sent to your broker automatically.'}
                </p>
              </div>

              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-slate-200 font-medium">Kill switch</span>
                    <Badge className={riskSettings?.kill_switch_engaged ? 'bg-red-600' : 'bg-gray-600'}>
                      {riskSettings?.kill_switch_engaged ? 'ENGAGED' : 'OFF'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={closeAllPositions}
                      variant="outline"
                      size="sm"
                      disabled={positions.length === 0}
                      className="border-red-600/60 text-red-300 hover:bg-red-900/30"
                    >
                      Close all
                    </Button>
                    <Switch
                      checked={!!riskSettings?.kill_switch_engaged}
                      onCheckedChange={toggleKillSwitch}
                    />
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Blocks every new order at the server, regardless of what the app sends.
                </p>
              </div>

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
                    <div className="text-white font-semibold">{signalHistory.length}</div>
                    <div className="text-slate-400 text-xs">Signals Logged</div>
                  </div>
                  <div>
                    <div className={`font-semibold ${accountInfo && accountInfo.marginLevel > 0 && accountInfo.marginLevel < 200 ? 'text-red-400' : 'text-green-400'}`}>
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
                </div>
              ) : (
                positions.map((position) => (
                  <div key={position.ticket} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`${position.type === 'BUY' ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                          {position.type === 'BUY'
                            ? <TrendingUp className="w-4 h-4" />
                            : <TrendingDown className="w-4 h-4" />}
                          <Badge className="bg-opacity-20">{position.type}</Badge>
                        </div>
                        <span className="text-white font-medium">{position.symbol}</span>
                        <span className="text-slate-500 text-xs">#{position.ticket}</span>
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
                        <div className="text-slate-400">Open</div>
                        <div className="text-white font-medium">{position.openPrice}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Current</div>
                        <div className="text-white font-medium">{position.currentPrice}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Profit</div>
                        <div className={`font-medium ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(position.profit, accountInfo?.currency)}
                        </div>
                      </div>
                    </div>
                    {(position.stopLoss || position.takeProfit) && (
                      <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                        {position.stopLoss ? (
                          <div>
                            <div className="text-slate-400">Stop Loss</div>
                            <div className="text-red-400">{position.stopLoss}</div>
                          </div>
                        ) : null}
                        {position.takeProfit ? (
                          <div>
                            <div className="text-slate-400">Take Profit</div>
                            <div className="text-green-400">{position.takeProfit}</div>
                          </div>
                        ) : null}
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
                  onClick={clearSignalHistory}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                  disabled={signalHistory.length === 0}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {signalHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No trading history yet</p>
                  </div>
                ) : (
                  signalHistory.map((record) => (
                    <div key={record.id} className="bg-slate-700 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm">
                          {new Date(record.created_at).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge className={`${record.executed ? 'bg-green-600' : 'bg-red-600'} text-xs`}>
                            {record.executed ? 'Executed' : 'Skipped'}
                          </Badge>
                          <span className="text-slate-300 text-xs">{record.confidence ?? '—'}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        <div>{record.symbol} {record.direction} @ {record.entry}</div>
                        {record.reason && (
                          <div className={record.executed ? 'text-slate-400 mt-1' : 'text-red-300 mt-1'}>
                            {record.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {riskForm && (
                <form onSubmit={handleRiskUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Max risk per trade (%)</Label>
                      <Input
                        type="number" step="0.1" min="0.1" max="10"
                        value={riskForm.max_risk_percentage}
                        onChange={(e) => setRiskForm({ ...riskForm, max_risk_percentage: parseFloat(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Max position size (lots)</Label>
                      <Input
                        type="number" step="0.01" min="0.01" max="50"
                        value={riskForm.max_position_size}
                        onChange={(e) => setRiskForm({ ...riskForm, max_position_size: parseFloat(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Max open positions</Label>
                      <Input
                        type="number" min="1" max="20"
                        value={riskForm.max_open_positions}
                        onChange={(e) => setRiskForm({ ...riskForm, max_open_positions: parseInt(e.target.value, 10) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Min confidence (%)</Label>
                      <Input
                        type="number" min="50" max="99"
                        value={riskForm.min_confidence}
                        onChange={(e) => setRiskForm({ ...riskForm, min_confidence: parseInt(e.target.value, 10) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Max price drift (%)</Label>
                      <Input
                        type="number" step="0.01" min="0.01" max="5"
                        value={riskForm.max_slippage_percentage}
                        onChange={(e) => setRiskForm({ ...riskForm, max_slippage_percentage: parseFloat(e.target.value) })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Allowed symbols</Label>
                      <Input
                        value={riskForm.allowed_symbols.join(', ')}
                        onChange={(e) => setRiskForm({
                          ...riskForm,
                          allowed_symbols: e.target.value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
                        })}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Require stop loss</Label>
                      <Switch
                        checked={riskForm.use_stop_loss}
                        onCheckedChange={(v) => setRiskForm({ ...riskForm, use_stop_loss: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Require take profit</Label>
                      <Switch
                        checked={riskForm.use_take_profit}
                        onCheckedChange={(v) => setRiskForm({ ...riskForm, use_take_profit: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Confirm every order manually</Label>
                        <p className="text-slate-500 text-xs">Always on for live accounts.</p>
                      </div>
                      <Switch
                        checked={riskForm.require_manual_confirm || !account?.is_demo}
                        disabled={!account?.is_demo}
                        onCheckedChange={(v) => setRiskForm({ ...riskForm, require_manual_confirm: v })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-slate-200 font-medium">
                      <Bot className="w-4 h-4 text-emerald-400" />
                      Auto-trade from analysis
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Run XAUUSD analysis automatically</Label>
                        <p className="text-slate-500 text-xs">Signals above the threshold are sent to MT5.</p>
                      </div>
                      <Switch
                        checked={riskForm.auto_analysis_enabled}
                        onCheckedChange={(v) => setRiskForm({ ...riskForm, auto_analysis_enabled: v })}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm">
                        <Label className="text-slate-300">Confidence threshold</Label>
                        <span className="text-emerald-400 font-medium">{riskForm.auto_confidence_threshold}%</span>
                      </div>
                      <Slider
                        value={[riskForm.auto_confidence_threshold]}
                        min={50}
                        max={99}
                        step={1}
                        onValueChange={([v]) => setRiskForm({ ...riskForm, auto_confidence_threshold: v })}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Analysis interval (min)</Label>
                        <Input
                          type="number" min="1" max="60"
                          value={riskForm.auto_analysis_interval_minutes}
                          onChange={(e) => setRiskForm({ ...riskForm, auto_analysis_interval_minutes: parseInt(e.target.value, 10) || 2 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Entries per signal</Label>
                        <Input
                          type="number" min="1" max="5"
                          value={riskForm.auto_entries_per_signal}
                          onChange={(e) => setRiskForm({ ...riskForm, auto_entries_per_signal: parseInt(e.target.value, 10) || 1 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Allow auto-trading on live accounts</Label>
                        <p className="text-slate-500 text-xs">Off = automation only touches demo accounts.</p>
                      </div>
                      <Switch
                        checked={riskForm.auto_live_enabled}
                        onCheckedChange={(v) => setRiskForm({ ...riskForm, auto_live_enabled: v })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Auto-manage open trades</Label>
                        <p className="text-slate-500 text-xs">Close trades on the rules below.</p>
                      </div>
                      <Switch
                        checked={riskForm.auto_manage_enabled}
                        onCheckedChange={(v) => setRiskForm({ ...riskForm, auto_manage_enabled: v })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-slate-300 text-xs">Take profit ($)</Label>
                        <Input
                          type="number" step="0.5" min="0"
                          value={riskForm.auto_close_profit_usd}
                          onChange={(e) => setRiskForm({ ...riskForm, auto_close_profit_usd: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-xs">Cut loss ($)</Label>
                        <Input
                          type="number" step="0.5" min="0"
                          value={riskForm.auto_close_loss_usd}
                          onChange={(e) => setRiskForm({ ...riskForm, auto_close_loss_usd: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-xs">Max age (min)</Label>
                        <Input
                          type="number" min="0"
                          value={riskForm.auto_close_max_age_minutes}
                          onChange={(e) => setRiskForm({ ...riskForm, auto_close_max_age_minutes: parseInt(e.target.value, 10) || 0 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs">0 disables that rule.</p>

                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Close trades on reverse signal</Label>
                      <Switch
                        checked={riskForm.auto_close_on_reverse}
                        onCheckedChange={(v) => setRiskForm({ ...riskForm, auto_close_on_reverse: v })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Save risk settings
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingOrder} onOpenChange={(open) => { if (!open) cancelPendingOrder(); }}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100 flex items-center gap-2">
              <AlertTriangle className={pendingOrder?.plan.isDemo ? 'w-5 h-5 text-blue-400' : 'w-5 h-5 text-red-400'} />
              Confirm {pendingOrder?.plan.isDemo ? 'demo' : 'LIVE'} order
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-slate-300 text-sm space-y-1">
                <div>
                  <span className="font-semibold text-white">
                    {pendingOrder?.plan.side} {pendingOrder?.plan.volume} lots {pendingOrder?.plan.symbol}
                  </span>
                </div>
                <div>Market price: {pendingOrder?.plan.marketPrice}</div>
                <div>Stop loss: {pendingOrder?.plan.stopLoss ?? 'none'}</div>
                <div>Take profit: {pendingOrder?.plan.takeProfit ?? 'none'}</div>
                <div>
                  Estimated risk if stopped out:{' '}
                  <span className="text-red-300">
                    {pendingOrder
                      ? formatCurrency(pendingOrder.plan.estimatedRisk, pendingOrder.plan.currency)
                      : ''}
                  </span>
                </div>
                <div className="text-slate-500">Account: {pendingOrder?.plan.accountLabel}</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 border-slate-600 text-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPendingOrder}
              className={pendingOrder?.plan.isDemo ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
            >
              Place order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MT5TradingPanel;
