import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient, supabase } from '../../lib/supabase';
import { User, UserCheck, FlaskConical, ChevronRight } from 'lucide-react';

const EasyResearchAuth: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'participant' | 'researcher'>('participant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up new user
        const { data: authData, error: signUpError } = await authClient.auth.signUp({
          email,
          password,
          options: {
            data: { role }
          }
        });

        if (signUpError) throw signUpError;

        // Create profile
        if (authData.user) {
          await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email,
              role
            });
        }
      } else {
        // Sign in existing user
        const { data: authData, error: signInError } = await authClient.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
      }

      // Get user role and navigate accordingly
      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'researcher') {
          navigate('/easyresearch/researcher');
        } else {
          navigate('/easyresearch');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Easier-research
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {isSignUp && (
          <div className="mb-6">
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              I want to:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole('participant')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'participant' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <UserCheck size={24} className="mx-auto mb-2" style={{ 
                  color: role === 'participant' ? 'var(--color-green)' : 'var(--text-secondary)' 
                }} />
                <p className="text-sm font-medium">Participate</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Take surveys
                </p>
              </button>
              <button
                onClick={() => setRole('researcher')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'researcher' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <FlaskConical size={24} className="mx-auto mb-2" style={{ 
                  color: role === 'researcher' ? 'var(--color-green)' : 'var(--text-secondary)' 
                }} />
                <p className="text-sm font-medium">Research</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Create surveys
                </p>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border-light)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)'
                }}
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)'
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: 'var(--color-green)',
                color: 'white',
                opacity: loading || !email || !password ? 0.5 : 1
              }}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
            style={{ color: 'var(--color-green)' }}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default EasyResearchAuth;
