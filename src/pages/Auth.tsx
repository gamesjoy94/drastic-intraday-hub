import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate('/', { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast({ title: 'Account created', description: 'You can start connecting your MT5 bridge.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast({
        title: mode === 'signup' ? 'Sign up failed' : 'Sign in failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-slate-100">
            {mode === 'signup' ? 'Create your trading account' : 'Sign in'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password" type="password" required minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            className="mt-4 text-slate-400 text-sm hover:text-slate-200 w-full text-center"
          >
            {mode === 'signup' ? 'Already have an account? Sign in' : "No account yet? Sign up"}
          </button>

          <Link to="/" className="block mt-2 text-slate-500 text-xs text-center hover:text-slate-300">
            Back to the dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
};

export default Auth;
