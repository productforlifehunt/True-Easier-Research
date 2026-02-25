import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { authClient } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const text = language === 'zh' ? {
    signin: '登录',
    signup: '注册',
    email: '邮箱',
    password: '密码',
    confirmPassword: '确认密码',
    signinButton: '登录',
    signupButton: '注册',
    switchToSignup: '没有账户？注册',
    switchToSignin: '已有账户？登录',
    emailPlaceholder: '输入邮箱',
    passwordPlaceholder: '输入密码',
    confirmPasswordPlaceholder: '确认密码',
    passwordMismatch: '密码不匹配',
    signupSuccess: '注册成功！请检查邮箱验证链接。',
    signinSuccess: '登录成功！'
  } : {
    signin: 'Sign In',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signinButton: 'Sign In',
    signupButton: 'Sign Up',
    switchToSignup: 'No account? Sign up',
    switchToSignin: 'Have an account? Sign in',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    confirmPasswordPlaceholder: 'Confirm your password',
    passwordMismatch: 'Passwords do not match',
    signupSuccess: 'Sign up successful! Please check your email for verification.',
    signinSuccess: 'Sign in successful!'
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await authClient.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      setSuccessMessage(text.signinSuccess);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError(text.passwordMismatch);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: signUpError } = await authClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      setSuccessMessage(text.signupSuccess);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{ 
          position: 'fixed',
          top: '80px',
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 80px)',
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
        onClick={onClose}
      />
      <div 
        className="rounded-2xl shadow-2xl"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          width: '440px',
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {mode === 'signin' ? text.signin : text.signup}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:bg-gray-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={() => {
              setMode('signin');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              mode === 'signin' ? 'border-b-2' : ''
            }`}
            style={{
              color: mode === 'signin' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderColor: mode === 'signin' ? 'var(--color-green)' : 'transparent'
            }}
          >
            {text.signin}
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              mode === 'signup' ? 'border-b-2' : ''
            }`}
            style={{
              color: mode === 'signup' ? 'var(--color-green)' : 'var(--text-secondary)',
              borderColor: mode === 'signup' ? 'var(--color-green)' : 'transparent'
            }}
          >
            {text.signup}
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#fee', color: '#c00' }}>
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#efe', color: 'var(--color-green)' }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {text.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={text.emailPlaceholder}
                required
                className="w-full px-4 py-3 rounded-lg border"
                style={{ 
                  borderColor: 'var(--border-light)', 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {text.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={text.passwordPlaceholder}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border"
                style={{ 
                  borderColor: 'var(--border-light)', 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {text.confirmPassword}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={text.confirmPasswordPlaceholder}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border"
                  style={{ 
                    borderColor: 'var(--border-light)', 
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--color-green)', 
                color: 'white'
              }}
            >
              {isLoading ? (language === 'zh' ? '处理中...' : 'Processing...') : (mode === 'signin' ? text.signinButton : text.signupButton)}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
