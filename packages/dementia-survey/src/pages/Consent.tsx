import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useStateManagement';
import { useLanguage } from '../hooks/useLanguage';
import { ArrowLeft, CheckCircle, FileText, Shield, Clock, AlertCircle } from 'lucide-react';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import AuthModal from '../components/AuthModal';

const Consent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [consentData, setConsentData] = useState<{
    consent_signed_at: string | null;
    participant_email: string | null;
  } | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const zh = language === 'zh';

  const text = zh ? {
    title: '研究知情同意书',
    subtitle: '痴呆症照护者日常生活研究',
    backToHome: '返回首页',
    alreadySigned: '您已签署同意书',
    signedOn: '签署时间',
    thankYou: '感谢您参与本研究！',
    studyPurpose: '研究目的',
    studyPurposeText: '本研究旨在了解痴呆症照护者的日常生活经历、挑战和支持需求。通过为期7天的日记式调查，我们希望收集关于照护活动、情绪状态和社会支持的详细信息。',
    whatInvolved: '参与内容',
    whatInvolvedItems: [
      '每天记录照护活动和经历（约5-10分钟）',
      '完成每日简短问卷',
      '参与一次约60分钟的访谈（可选）'
    ],
    dataProtection: '数据保护',
    dataProtectionText: '您的所有数据将被严格保密，仅用于研究目的。我们使用加密技术保护您的信息，您的身份将在任何发表的研究中被匿名化。',
    voluntaryParticipation: '自愿参与',
    voluntaryParticipationText: '您的参与完全自愿。您可以随时退出研究，无需提供任何理由，这不会影响您获得的任何服务。',
    consentStatement: '我已阅读并理解以上信息，同意参与本研究。',
    signConsent: '签署同意书',
    signing: '签署中...',
    reviewConsent: '查看同意书',
    continueToSurvey: '继续填写问卷',
    loginRequired: '请先登录以签署同意书'
  } : {
    title: 'Research Consent Form',
    subtitle: 'A Week in the Life of Dementia Caregivers Study',
    backToHome: 'Back to Home',
    alreadySigned: 'You have signed the consent form',
    signedOn: 'Signed on',
    thankYou: 'Thank you for participating in this research!',
    studyPurpose: 'Study Purpose',
    studyPurposeText: 'This study aims to understand the daily experiences, challenges, and support needs of dementia caregivers. Through a 7-day diary-style survey, we hope to collect detailed information about caregiving activities, emotional states, and social support.',
    whatInvolved: 'What\'s Involved',
    whatInvolvedItems: [
      'Daily logging of caregiving activities and experiences (~5-10 minutes)',
      'Completing brief daily questionnaires',
      'Participating in a ~60-minute interview (optional)'
    ],
    dataProtection: 'Data Protection',
    dataProtectionText: 'All your data will be kept strictly confidential and used only for research purposes. We use encryption to protect your information, and your identity will be anonymized in any published research.',
    voluntaryParticipation: 'Voluntary Participation',
    voluntaryParticipationText: 'Your participation is entirely voluntary. You may withdraw from the study at any time without giving any reason, and this will not affect any services you receive.',
    consentStatement: 'I have read and understood the above information and agree to participate in this research.',
    signConsent: 'Sign Consent Form',
    signing: 'Signing...',
    reviewConsent: 'Review Consent',
    continueToSurvey: 'Continue to Survey',
    loginRequired: 'Please log in to sign the consent form'
  };

  useEffect(() => {
    const fetchConsentStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from enrollments table first
        const { data, error } = await supabase
          .from('enrollment')
          .select('consent_signed_at, participant_email')
          .eq('participant_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error fetching consent status:', error);
        } else if (data && data.length > 0) {
          setConsentData(data[0]);
        } else {
          // No enrollment found, create one
          const { data: newEnrollment, error: createError } = await supabase
            .from('enrollment')
            .insert({
              participant_id: user.id,
              participant_email: user.email,
              status: 'active'
            })
            .select('consent_signed_at, participant_email')
            .single();

          if (createError) {
            console.error('Error creating enrollment:', createError);
          } else {
            setConsentData(newEnrollment);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsentStatus();
  }, [user]);

  const handleSignConsent = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSigning(true);
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('enrollment')
        .update({ consent_signed_at: now })
        .eq('participant_id', user.id);

      if (error) throw error;

      setConsentData(prev => prev ? { ...prev, consent_signed_at: now } : { consent_signed_at: now, participant_email: user.email || null });
    } catch (error) {
      console.error('Error signing consent:', error);
    } finally {
      setSigning(false);
    }
  };

  if (!user) {
    return (
      <>
        <DesktopHeader />
        <MobileHeader />
        <AuthModal isOpen={true} onClose={() => navigate('/')} />
      </>
    );
  }

  const isSigned = !!consentData?.consent_signed_at;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-4 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          {text.backToHome}
        </button>

        {/* Header */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
          <div className="flex items-center gap-3">
            <FileText size={28} />
            <div>
              <h1 className="text-lg font-bold">{text.title}</h1>
              <p className="text-sm opacity-90">{text.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Signed Status Banner */}
        {isSigned && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-6" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid var(--color-green)' }}>
            <CheckCircle size={24} style={{ color: 'var(--color-green)' }} />
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-green)' }}>{text.alreadySigned}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {text.signedOn}: {new Date(consentData.consent_signed_at!).toLocaleDateString(zh ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}

        {/* Consent Content */}
        <div className="space-y-6">
          {/* Study Purpose */}
          <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} style={{ color: 'var(--color-green)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{text.studyPurpose}</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {text.studyPurposeText}
            </p>
          </div>

          {/* What's Involved */}
          <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} style={{ color: 'var(--color-green)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{text.whatInvolved}</h2>
            </div>
            <ul className="space-y-2">
              {text.whatInvolvedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--color-green)' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Data Protection */}
          <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} style={{ color: 'var(--color-green)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{text.dataProtection}</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {text.dataProtectionText}
            </p>
          </div>

          {/* Voluntary Participation */}
          <div className="rounded-xl p-5" style={{ backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} style={{ color: '#f59e0b' }} />
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{text.voluntaryParticipation}</h2>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {text.voluntaryParticipationText}
            </p>
          </div>
        </div>

        {/* Consent Action */}
        <div className="mt-8 p-5 rounded-xl" style={{ backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
          {!isSigned ? (
            <>
              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded"
                  style={{ accentColor: 'var(--color-green)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {text.consentStatement}
                </span>
              </label>
              <button
                onClick={handleSignConsent}
                disabled={!agreed || signing}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                style={{ 
                  backgroundColor: agreed ? 'var(--color-green)' : 'var(--text-muted)',
                  opacity: signing ? 0.7 : 1
                }}
              >
                {signing ? text.signing : text.signConsent}
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{text.thankYou}</p>
              <button
                onClick={() => navigate('/survey')}
                className="w-full py-3 rounded-xl font-semibold text-white"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                {text.continueToSurvey}
              </button>
            </div>
          )}
        </div>
      </div>

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Consent;
