
import { useState, useEffect } from 'react';
import { Bell, BellRing, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PriceAlert {
  id: string;
  price: number;
  type: 'above' | 'below';
  isActive: boolean;
  triggered: boolean;
}

interface PriceAlertsProps {
  currentPrice: number;
}

const PriceAlerts = ({ currentPrice }: PriceAlertsProps) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    { id: '1', price: 2700, type: 'above', isActive: true, triggered: false },
    { id: '2', price: 2600, type: 'below', isActive: true, triggered: false }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertType, setNewAlertType] = useState<'above' | 'below'>('above');

  // Check for triggered alerts
  useEffect(() => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        const shouldTrigger = alert.isActive && !alert.triggered && 
          ((alert.type === 'above' && currentPrice >= alert.price) ||
           (alert.type === 'below' && currentPrice <= alert.price));
        
        if (shouldTrigger) {
          // Show notification
          const notification = new Notification(`Gold Price Alert!`, {
            body: `Gold has reached ${alert.type} $${alert.price}. Current: $${currentPrice.toFixed(2)}`,
            icon: '/favicon.ico'
          });
          
          setTimeout(() => notification.close(), 5000);
        }
        
        return { ...alert, triggered: shouldTrigger || alert.triggered };
      })
    );
  }, [currentPrice]);

  const addAlert = () => {
    const price = parseFloat(newAlertPrice);
    if (price && price > 0) {
      const newAlert: PriceAlert = {
        id: Date.now().toString(),
        price,
        type: newAlertType,
        isActive: true,
        triggered: false
      };
      setAlerts([...alerts, newAlert]);
      setNewAlertPrice('');
      setShowForm(false);
    }
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const activeAlerts = alerts.filter(alert => alert.isActive && !alert.triggered);
  const triggeredAlerts = alerts.filter(alert => alert.triggered);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Price Alerts
          <button
            onClick={() => setShowForm(!showForm)}
            className="ml-auto p-1 rounded-full bg-yellow-600 hover:bg-yellow-700 transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-3 bg-slate-700 rounded-lg space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Alert price"
                value={newAlertPrice}
                onChange={(e) => setNewAlertPrice(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-yellow-400"
              />
              <select
                value={newAlertType}
                onChange={(e) => setNewAlertType(e.target.value as 'above' | 'below')}
                className="px-3 py-2 bg-slate-600 text-white rounded border border-slate-500"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addAlert}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
              >
                Add Alert
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {triggeredAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-400 flex items-center gap-1">
              <BellRing className="w-4 h-4" />
              Triggered Alerts
            </h4>
            {triggeredAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-2 bg-red-400/10 border border-red-400/20 rounded text-sm">
                <span className="text-red-400">
                  ${alert.price} ({alert.type})
                </span>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-400">Active Alerts</h4>
            {activeAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-2 bg-slate-700 rounded text-sm">
                <span className="text-slate-300">
                  ${alert.price} ({alert.type})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-green-400' : 'bg-gray-400'}`}
                  />
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {alerts.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-4">
            No price alerts set. Click + to add your first alert.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAlerts;
