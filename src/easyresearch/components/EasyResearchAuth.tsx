import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authClient, supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { UserCheck, BarChart3, ChevronRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const EasyResearchAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'participant' | 'researcher'>('participant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect logged-in users away from auth page
  useEffect(() => {
    if (authLoading || !currentUser) return;
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get('redirectTo');
    if (redirectTo && redirectTo.startsWith('/easyresearch')) {
      navigate(redirectTo, { replace: true });
    } else {
      supabase.from('researcher').select('id').eq('user_id', currentUser.id).maybeSingle()
        .then(({ data }) => {
          navigate('/easyresearch/dashboard', { replace: true });
        });
    }
  }, [currentUser, authLoading, location.search, navigate]);

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
    if (!email.trim()) { setError(t('auth.enterEmail')); return; }
    if (!password) { setError(t('auth.enterPassword')); return; }
    if (isSignUp && password.length < 6) { setError(t('auth.passwordTooShort')); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await authClient.auth.signUp({ email, password, options: { data: { role } } });
        let userId = authData?.user?.id;
        if (signUpError) {
          const isAlreadyRegistered = signUpError.message?.toLowerCase().includes('already registered') || signUpError.message?.toLowerCase().includes('already been registered');
          if (!isAlreadyRegistered) throw signUpError;
          const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          userId = signInData?.user?.id;
        }
        if (userId && role === 'researcher') {
          try {
            const { data: existingProfile } = await supabase.from('profile').select('id').eq('id', userId).maybeSingle();
            if (!existingProfile) {
              await supabase.from('profile').insert({ id: userId, user_id: userId, email, user_type: 'researcher' });
            }
            let { data: org } = await supabase.from('organization').select('id').limit(1).maybeSingle();
            if (!org) { const { data: newOrg } = await supabase.from('organization').insert({ name: 'My Organization', slug: `org-${Date.now()}`, plan: 'free' }).select().single(); org = newOrg; }
            await supabase.from('researcher').upsert({ user_id: userId, organization_id: org?.id || null, role: 'researcher' }, { onConflict: 'user_id' });
          } catch (err) { console.error('Error setting up researcher:', err); }
        }
      } else {
        const { error: signInError } = await authClient.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        const redirectTarget = getRedirectTarget();
        navigate(redirectTarget ?? '/easyresearch/dashboard', { replace: true });
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (authLoading || currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9faf8' }}>
        <div className="text-stone-400 text-sm">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9faf8' }}>
      {/* Back link */}
      <div className="px-5 py-4">
        <Link to="/easyresearch" className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-600 transition-colors text-[13px] font-medium">
          <ArrowLeft size={16} />
          <span>{t('common.back')}</span>
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-800 mb-1.5">
              {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </h1>
            <p className="text-[14px] text-stone-400 font-light">
              {isSignUp ? t('auth.startCreating') : t('auth.signInToContinue')}
            </p>
          </div>

          {isSignUp && (
            <div className="mb-6">
              <p className="text-[12px] font-medium text-stone-500 mb-2.5">{t('auth.iWantTo')}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'participant' as const, icon: UserCheck, label: t('auth.participate'), desc: t('auth.takeSurveys') },
                  { key: 'researcher' as const, icon: BarChart3, label: t('auth.research'), desc: t('auth.createSurveys') }
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`p-3.5 rounded-xl border-2 transition-all text-center ${
                      role === r.key ? 'border-emerald-400 bg-emerald-50' : 'border-stone-100 hover:border-stone-200'
                    }`}
                  >
                    <r.icon size={20} className={`mx-auto mb-1.5 ${role === r.key ? 'text-emerald-500' : 'text-stone-300'}`} />
                    <p className="text-[13px] font-medium text-stone-800">{r.label}</p>
                    <p className="text-[11px] text-stone-400">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm shadow-stone-100">
            <div className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-medium text-stone-500 mb-1.5">{t('auth.email')}</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-stone-50/50 border border-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-stone-500 mb-1.5">{t('auth.password')}</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] bg-stone-50/50 border border-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-[13px]">{error}</div>
              )}

              <button
                onClick={handleAuth}
                disabled={loading || !email || !password}
                className="w-full py-2.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-1.5"
              >
                {loading ? t('common.loading') : (isSignUp ? t('auth.createAccountBtn') : t('common.signIn'))}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <p className="text-center mt-5">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-[13px] text-emerald-600 hover:text-emerald-700 font-medium">
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EasyResearchAuth;