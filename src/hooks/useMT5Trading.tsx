
import { useState, useEffect } from 'react';
import { mt5ApiService, MT5Account, MT5Position, MT5AccountInfo } from '../services/mt5ApiService';
import { tradeSignalProcessor, RiskSettings } from '../services/tradeSignalProcessor';
import { useToast } from './use-toast';

export const useMT5Trading = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<MT5Account | null>(null);
  const [positions, setPositions] = useState<MT5Position[]>([]);
  const [accountInfo, setAccountInfo] = useState<MT5AccountInfo | null>(null);
  const [isAutoTradingEnabled, setIsAutoTradingEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tradingHistory, setTradingHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    setIsConnected(mt5ApiService.isAccountConnected());
    setAccount(mt5ApiService.getConnectedAccount());
    setIsAutoTradingEnabled(tradeSignalProcessor.isAutoTradingActive());
    
    // Load trading history
    setTradingHistory(tradeSignalProcessor.getTradingHistory());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isConnected) {
      // Update positions and account info every 30 seconds
      interval = setInterval(async () => {
        try {
          const [newPositions, newAccountInfo] = await Promise.all([
            mt5ApiService.getPositions(),
            mt5ApiService.getAccountInfo()
          ]);
          setPositions(newPositions);
          setAccountInfo(newAccountInfo);
        } catch (error) {
          console.error('Error updating MT5 data:', error);
        }
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const connectToMT5 = async (accountData: MT5Account) => {
    setIsConnecting(true);
    try {
      const success = await mt5ApiService.connect(accountData);
      
      if (success) {
        setIsConnected(true);
        setAccount(accountData);
        
        // Load initial data
        const [initialPositions, initialAccountInfo] = await Promise.all([
          mt5ApiService.getPositions(),
          mt5ApiService.getAccountInfo()
        ]);
        
        setPositions(initialPositions);
        setAccountInfo(initialAccountInfo);
        
        toast({
          title: "MT5 Connected",
          description: `Successfully connected to ${accountData.isDemo ? 'demo' : 'live'} account`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to MT5 account. Please check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('MT5 connection error:', error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to MT5",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectFromMT5 = async () => {
    await mt5ApiService.disconnect();
    setIsConnected(false);
    setAccount(null);
    setPositions([]);
    setAccountInfo(null);
    setIsAutoTradingEnabled(false);
    tradeSignalProcessor.disableAutoTrading();
    
    toast({
      title: "MT5 Disconnected",
      description: "Successfully disconnected from MT5 account",
    });
  };

  const toggleAutoTrading = () => {
    if (isAutoTradingEnabled) {
      tradeSignalProcessor.disableAutoTrading();
      setIsAutoTradingEnabled(false);
      toast({
        title: "Auto Trading Disabled",
        description: "Automatic trade execution has been disabled",
      });
    } else {
      tradeSignalProcessor.enableAutoTrading();
      setIsAutoTradingEnabled(true);
      toast({
        title: "Auto Trading Enabled",
        description: "Automatic trade execution is now active",
      });
    }
  };

  const updateRiskSettings = (settings: Partial<RiskSettings>) => {
    tradeSignalProcessor.setRiskSettings(settings);
    toast({
      title: "Risk Settings Updated",
      description: "Risk management settings have been updated",
    });
  };

  const processAISignal = async (analysis: any) => {
    const result = await tradeSignalProcessor.processAISignal(analysis);
    setTradingHistory(tradeSignalProcessor.getTradingHistory());
    return result;
  };

  const closePosition = async (ticket: string) => {
    try {
      const result = await mt5ApiService.closeTrade(ticket);
      
      if (result.success) {
        // Refresh positions
        const newPositions = await mt5ApiService.getPositions();
        setPositions(newPositions);
        
        toast({
          title: "Position Closed",
          description: `Successfully closed position ${ticket}`,
        });
      } else {
        toast({
          title: "Close Failed",
          description: result.error || "Failed to close position",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error closing position:', error);
      toast({
        title: "Close Error",
        description: "An error occurred while closing the position",
        variant: "destructive",
      });
    }
  };

  return {
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
    processAISignal,
    closePosition,
    getRiskSettings: () => tradeSignalProcessor.getRiskSettings(),
    clearTradingHistory: () => {
      tradeSignalProcessor.clearTradingHistory();
      setTradingHistory([]);
    }
  };
};
