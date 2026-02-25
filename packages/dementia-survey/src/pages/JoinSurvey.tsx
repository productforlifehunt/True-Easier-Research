import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Users, Mail, Phone, User, Heart, MessageCircle, Share2, Copy, Home, BarChart3, Info, UserCheck } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useStateManagement';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';

const JoinSurvey: React.FC = () => {
  const navigate = useNavigate();
  const { language, changeLanguage } = useLanguage();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    wechat: '',
    relationship: '',
    is_primary_caregiver: false,
    willing_interview: false
  });
  const [copied, setCopied] = useState(false);

  const text = language === 'zh' ? {
    title: '加入研究',
    description: '本研究通过7天的问卷调查，了解痴呆症照护者的日常照护活动、面临的挑战和支持需求。',
    whyJoin: '为什么参与？',
    reason1: '记录的资料将用于分析痴呆症照护的日常活动和挑战。',
    reason2: '参与简单，每天10-15分钟，为期7天',
    reason3: '可以使用语音输入和AI写作辅助',
    commitment: '参与方式',
    commitmentText: '参与是自愿的，您可以随时退出。研究为期7天，每天约10-15分钟。提供语音输入和AI写作辅助。',
    inviteTitle: '邀请其他参与者',
    inviteDescription: '您认识其他可能对本研究感兴趣的痴呆症照护者吗？他们可以是您熟悉的其他照护者、共同照护同一患者的次要照护者、家庭成员、朋友或邻居。分享下方链接邀请他们参与我们的研究。',
    shareLink: '分享链接',
    copyLink: '复制链接',
    linkCopied: '已复制！',
    formTitle: '报名表',
    name: '姓名或昵称',
    namePlaceholder: '请输入您的真实姓名或您喜欢的称呼',
    email: '电子邮件',
    emailPlaceholder: '请输入您的电子邮件',
    phone: '电话',
    phonePlaceholder: '请输入您的电话号码',
    wechat: '微信',
    wechatPlaceholder: '请输入您的微信号（如与电话号相同可留空）',
    relationship: '与患者的关系',
    relationshipPlaceholder: '例如：配偶、子女、朋友',
    primaryCaregiver: '我是主要照护者',
    willingInterview: '我愿意在研究结束后参加访谈',
    submit: '提交申请',
    submitting: '提交中...',
    successTitle: '申请已提交！',
    successMessage: '感谢您报名参与我们的研究。我们的团队将尽快与您联系。',
    backToHome: '返回首页'
  } : {
    title: 'Join Our Study',
    description: 'This study uses a 7-day survey to describe daily caregiving activities, challenges, and support needs among dementia caregivers.',
    whyJoin: 'Why Participate?',
    reason1: 'The data collected will be used to analyze daily activities and challenges in dementia caregiving.',
    reason2: 'Simple participation: 10-15 minutes per day for 7 days',
    reason3: 'Voice input and AI writing assistance available',
    commitment: 'Participation',
    commitmentText: 'Participation is voluntary and you can withdraw at any time. The study takes approximately 10-15 minutes per day for 7 days. Voice input and AI writing assistance are available.',
    inviteTitle: 'Invite Other Participants',
    inviteDescription: 'Know other dementia caregivers who might be interested in this study? They can be other caregivers you know, secondary caregivers caring for the same patient, family members, friends, or neighbors. Share the link below to invite them to participate in our research.',
    shareLink: 'Share Link',
    copyLink: 'Copy Link',
    linkCopied: 'Copied!',
    formTitle: 'Registration Form',
    name: 'Name or Preferred Name',
    namePlaceholder: 'Enter your real name or the name you prefer',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    phone: 'Phone',
    phonePlaceholder: 'Enter your phone number',
    wechat: 'WeChat',
    wechatPlaceholder: 'Enter your WeChat ID (leave empty if same as phone)',
    relationship: 'Relationship to Patient',
    relationshipPlaceholder: 'e.g., Spouse, Child, Friend',
    primaryCaregiver: 'I am the primary caregiver',
    willingInterview: 'I am willing to participate in an interview after the survey',
    submit: 'Submit Application',
    submitting: 'Submitting...',
    successTitle: 'Application Submitted!',
    successMessage: 'Thank you for signing up for our study. Our team will be in touch with you soon.',
    backToHome: 'Back to Home',
    alreadyEnrolledTitle: 'You Have Already Joined!',
    alreadyEnrolledMessage: 'You are currently enrolled in this study. You can invite other caregivers who are also caring for the same patient to join.',
    scrollToInvite: 'Learn How to Invite Others'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('survey_registrations')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          wechat: formData.wechat,
          relationship: formData.relationship,
          is_primary_caregiver: formData.is_primary_caregiver,
          willing_interview: formData.willing_interview,
          registered_at: new Date().toISOString()
        }]);

      if (error) throw error;
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="w-20 h-20" style={{ color: 'var(--color-green)' }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {text.successTitle}
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            {text.successMessage}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            {text.backToHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* Already Enrolled Banner for Logged-in Users */}
        {user && (
          <div className="mb-8 p-6 rounded-2xl border-2" style={{ backgroundColor: 'white', borderColor: 'var(--color-green)' }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <UserCheck className="w-6 h-6" style={{ color: 'var(--color-green)' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {text.alreadyEnrolledTitle}
                </h2>
                <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {text.alreadyEnrolledMessage}
                </p>
                <button
                  onClick={() => {
                    const inviteSection = document.getElementById('invite-section');
                    inviteSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
                >
                  <Share2 className="w-4 h-4" />
                  {text.scrollToInvite}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {text.description}
          </p>
        </div>


        {/* Invite Other Participants Section */}
        <div id="invite-section" className="mb-8 p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Share2 className="w-6 h-6" style={{ color: 'var(--color-green)' }} />
            {text.inviteTitle}
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            {text.inviteDescription}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/join-survey`}
              className="flex-1 px-4 py-3 rounded-lg border font-mono text-sm"
              style={{ borderColor: 'var(--border-light)', backgroundColor: 'white', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join-survey`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-4 py-3 rounded-lg font-medium transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: 'var(--color-green)', color: 'white' }}
            >
              <Copy className="w-4 h-4" />
              {copied ? text.linkCopied : text.copyLink}
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div className="p-6 md:p-8 rounded-2xl border" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            {text.formTitle}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {text.name} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  placeholder={text.namePlaceholder}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {text.email} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  placeholder={text.emailPlaceholder}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {text.phone}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  placeholder={text.phonePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {text.wechat}
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={formData.wechat}
                  onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  placeholder={text.wechatPlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {text.relationship}
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border"
                  style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  placeholder={text.relationshipPlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border transition-all hover:shadow-sm" 
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.is_primary_caregiver}
                  onChange={(e) => setFormData({ ...formData, is_primary_caregiver: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--color-green)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {text.primaryCaregiver}
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border transition-all hover:shadow-sm" 
                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                <input
                  type="checkbox"
                  checked={formData.willing_interview}
                  onChange={(e) => setFormData({ ...formData, willing_interview: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--color-green)' }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {text.willingInterview}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {isSubmitting ? text.submitting : text.submit}
            </button>

            <div className="mt-6 p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                {language === 'zh' ? '有任何问题？' : 'Have questions?'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--color-green)' }}
              >
                {language === 'zh' ? '联系我们' : 'Contact Us'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinSurvey;
