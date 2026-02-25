import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authClient, supabase } from '../../lib/supabase';
import { UserCheck, FlaskConical, ChevronRight, ArrowLeft } from 'lucide-react';

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
    if (params.get('become') === 'researcher') { setIsSignUp(true); setRole('researcher'); return; }
    if (params.get('redirect') === 'researcher') { setRole('researcher'); setIsSignUp(false); }
  }, [location.search]);

  const getRedirectTarget = () => {
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get('redirectTo') || (location.state as any)?.from;
    if (!redirectTo || typeof redirectTo !== 'string') return null;
    if (!redirectTo.startsWith('/easyresearch')) return null;
    return redirectTo;
  };

  const handleAuth = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter a password'); return; }
    if (isSignUp && password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await authClient.auth.signUp({ email, password, options: { data: { role } } });
        if (signUpError) throw signUpError;
        if (authData.user && role === 'researcher') {
          try {
            let { data: org } = await supabase.from('organization').select('id').limit(1).maybeSingle();
            if (!org) { const { data: newOrg } = await supabase.from('organization').insert({ name: 'My Organization', slug: `org-${Date.now()}`, plan: 'free' }).select().single(); org = newOrg; }
            await supabase.from('researcher').upsert({ user_id: authData.user.id, organization_id: org?.id || null, role: 'researcher' }, { onConflict: 'user_id' });
          } catch (err) { console.error('Error setting up researcher:', err); }
        }
      } else {
        const { error: signInError } = await authClient.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        const redirectTarget = getRedirectTarget();
        const { data: researcher } = await supabase.from('researcher').select('id').eq('user_id', user.id).maybeSingle();
        if (researcher || user.user_metadata?.role === 'researcher') {
          navigate(redirectTarget ?? '/easyresearch/dashboard', { replace: true });
        } else {
          navigate(redirectTarget ?? '/easyresearch', { replace: true });
        }
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 py-3">
          <Link to="/easyresearch" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft size={16} />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">E</span>
              </div>
              <span className="text-[14px] font-semibold text-slate-900">Easier</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1.5">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-[14px] text-slate-400 font-light">
              {isSignUp ? 'Start creating surveys' : 'Sign in to continue'}
            </p>
          </div>

          {isSignUp && (
            <div className="mb-6">
              <p className="text-[12px] font-medium text-slate-500 mb-2.5">I want to:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'participant' as const, icon: UserCheck, label: 'Participate', desc: 'Take surveys' },
                  { key: 'researcher' as const, icon: FlaskConical, label: 'Research', desc: 'Create surveys' }
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`p-3.5 rounded-xl border-2 transition-all text-center ${
                      role === r.key ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <r.icon size={20} className={`mx-auto mb-1.5 ${role === r.key ? 'text-indigo-500' : 'text-slate-300'}`} />
                    <p className="text-[13px] font-medium text-slate-900">{r.label}</p>
                    <p className="text-[11px] text-slate-400">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm shadow-slate-100">
            <div className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-[13px]">{error}</div>
              )}

              <button
                onClick={handleAuth}
                disabled={loading || !email || !password}
                className="w-full py-2.5 rounded-xl text-[14px] font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <p className="text-center mt-5">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-[13px] text-indigo-500 hover:text-indigo-600 font-medium">
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EasyResearchAuth;
