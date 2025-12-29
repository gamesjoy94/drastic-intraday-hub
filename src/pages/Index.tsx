
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, ArrowRight, Settings } from 'lucide-react';
import TradingDashboard from '../components/TradingDashboard';
import MT5TradingPanel from '../components/MT5TradingPanel';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMT5Panel, setShowMT5Panel] = useState(false);

  if (showDashboard) {
    return <TradingDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">AI Trading Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-slate-700"
              onClick={() => setShowMT5Panel(!showMT5Panel)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showMT5Panel ? 'Hide' : 'Show'} MT5 Panel
            </Button>
            <Link to="/eurusd">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                EUR/USD Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* MT5 Trading Panel Section - Show when toggled */}
        {showMT5Panel && (
          <div className="mb-8">
            <div className="max-w-md mx-auto">
              <MT5TradingPanel />
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Trading
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Advanced market analysis with real-time data, pattern recognition, and intelligent trade planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowDashboard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Start XAUUSD Analysis
            </Button>
            <Link to="/eurusd">
              <Button 
                size="lg" 
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 text-lg px-8 py-3"
              >
                EUR/USD Specialized Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Real-Time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Live market data analysis with AI-enhanced pattern recognition for multiple assets including stocks, forex, and crypto.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                EUR/USD Specialist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Dedicated EUR/USD analysis with advanced trend reversal strategies and forex-specific indicators.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Smart Trade Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                AI-generated trade plans with risk management, entry/exit points, and real-time market insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
