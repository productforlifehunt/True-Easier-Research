import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authClient, supabase } from '../../lib/supabase';
import { User, UserCheck, FlaskConical, ChevronRight, ArrowLeft } from 'lucide-react';

const EasyResearchAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'participant' | 'researcher'>('participant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const become = params.get('become');
    const redirect = params.get('redirect');

    if (become === 'researcher') {
      setIsSignUp(true);
      setRole('researcher');
      return;
    }

    if (redirect === 'researcher') {
      setRole('researcher');
      // Don't force signup for existing users
      setIsSignUp(false);
    }
  }, [location.search]);

  const getRedirectTarget = () => {
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get('redirectTo') || (location.state as any)?.from;
    if (!redirectTo || typeof redirectTo !== 'string') return null;
    if (!redirectTo.startsWith('/')) return null;
    if (!redirectTo.startsWith('/easyresearch')) return null;
    return redirectTo;
  };

  const handleAuth = async () => {
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

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

        // For researchers, create researcher record
        if (authData.user && role === 'researcher') {
          try {
            // Get or create default organization
            let { data: org, error: orgError } = await supabase
              .from('organization')
              .select('id')
              .limit(1)
              .maybeSingle();
            
            if (orgError) console.error('Organization lookup error:', orgError);
            
            if (!org) {
              const { data: newOrg, error: createOrgError } = await supabase
                .from('organization')
                .insert({ name: 'My Organization', slug: `org-${Date.now()}`, plan: 'free' })
                .select()
                .single();
              
              if (createOrgError) {
                console.error('Organization creation error:', createOrgError);
                // Continue without org for now
              } else {
                org = newOrg;
              }
            }
            
            // Always create researcher record, even without org
            const { error: researcherError } = await supabase
              .from('researcher')
              .insert({
                user_id: authData.user.id,
                organization_id: org?.id || null,
                role: 'researcher'
              });
              
            if (researcherError) {
              console.error('Researcher creation error:', researcherError);
              // Try upsert in case record already exists
              await supabase
                .from('researcher')
                .upsert({
                  user_id: authData.user.id,
                  organization_id: org?.id || null,
                  role: 'researcher'
                }, { onConflict: 'user_id' });
            }
          } catch (err) {
            console.error('Error setting up researcher:', err);
          }
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
        const redirectTarget = getRedirectTarget();

        // Check if user is a researcher by looking up researchers table
        const { data: researcher } = await supabase
          .from('researcher')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (researcher || user.user_metadata?.role === 'researcher') {
          navigate(redirectTarget ?? '/easyresearch/dashboard', { replace: true });
        } else {
          navigate(redirectTarget ?? '/easyresearch', { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Simple header with back link */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/easyresearch"
            className="flex items-center gap-2"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={20} />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>EasierResearch</span>
            </div>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isSignUp ? 'Start creating professional surveys in minutes' : 'Sign in to continue to your dashboard'}
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
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: role === 'participant' ? 'var(--color-green)' : 'var(--border-light)',
                  backgroundColor: role === 'participant' ? '#f0fdf4' : 'white'
                }}
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
                className="p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: role === 'researcher' ? 'var(--color-green)' : 'var(--border-light)',
                  backgroundColor: role === 'researcher' ? '#f0fdf4' : 'white'
                }}
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
    </div>
  );
};

export default EasyResearchAuth;
