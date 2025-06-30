import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    // Small delay to simulate authentication process
    setTimeout(() => {
      const success = login(username, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      {/* Background Logo */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-3 text-blue-400">
          <TrendingUp className="w-8 h-8" />
          <span className="text-xl font-bold">AI Trading Platform</span>
        </div>
      </div>

      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6 text-blue-400" />
            Login
          </CardTitle>
          <p className="text-slate-400">Access your trading dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-200">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-600 bg-red-900/20">
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Demo Credentials:</h3>
            <div className="space-y-1 text-xs text-slate-400">
              <div>Username: <span className="text-blue-400">admin</span> | Password: <span className="text-blue-400">letmein123</span></div>
              <div>Username: <span className="text-blue-400">user1</span> | Password: <span className="text-blue-400">pass456</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
