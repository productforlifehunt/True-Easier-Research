import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { BarChart3, Mail, Lock, Building } from 'lucide-react';

const ResearcherAuth: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    fullName: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up new researcher
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: 'researcher'
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Create organization
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: formData.organizationName,
              slug: formData.organizationName.toLowerCase().replace(/\s+/g, '-'),
              plan: 'free'
            })
            .select()
            .single();

          if (orgError) throw orgError;

          // Create researcher profile
          await supabase
            .from('researchers')
            .insert({
              user_id: authData.user.id,
              organization_id: org.id,
              role: 'admin'
            });

          // Update user profile
          await supabase
            .from('profiles')
            .update({
              current_organization_id: org.id,
              user_type: 'researcher'
            })
            .eq('id', authData.user.id);

          navigate('/easyresearch/dashboard');
        }
      } else {
        // Sign in existing researcher
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) throw signInError;
        navigate('/easyresearch/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <BarChart3 className="mx-auto mb-4" style={{ color: 'var(--color-green)' }} size={48} />
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            Welcome to EasierResearch
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            The most advanced AI-powered survey platform for medical research
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border-light)' }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
            {isSignUp ? 'Create Researcher Account' : 'Sign In to Your Research'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)' }}
                    placeholder="Dr. Jane Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Organization Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'var(--text-secondary)' }} size={18} />
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border"
                      style={{ borderColor: 'var(--border-light)' }}
                      placeholder="Research Institute Name"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: 'var(--text-secondary)' }} size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                  placeholder="researcher@institute.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: 'var(--text-secondary)' }} size={18} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium hover:underline"
                style={{ color: 'var(--color-green)' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearcherAuth;
