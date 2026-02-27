import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    wechat: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const text = language === 'zh' ? {
    title: '联系我们',
    subtitle: '有任何问题？通过以下方式联系我们',
    description: '如有问题，请填写下方表单。',
    formTitle: '发送消息',
    name: '姓名',
    namePlaceholder: '您的姓名',
    email: '电子邮件',
    emailPlaceholder: '您的邮箱地址',
    phone: '电话号码',
    phonePlaceholder: '您的电话号码（可选）',
    wechat: '微信号',
    wechatPlaceholder: '您的微信号（可选）',
    message: '留言',
    messagePlaceholder: '请告诉我们您的问题或需要帮助的地方...',
    submit: '发送消息',
    submitting: '发送中...',
    successTitle: '消息已发送！',
    successMessage: '感谢您的联系。我们会在24-48小时内回复您。',
    backToHome: '返回首页',
    required: '必填'
  } : {
    title: 'Contact Us',
    subtitle: 'Have questions? Get in touch with us',
    description: 'If you have questions, please fill out the form below.',
    formTitle: 'Send us a Message',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'Your email address',
    phone: 'Phone Number',
    phonePlaceholder: 'Your phone number (optional)',
    wechat: 'WeChat ID',
    wechatPlaceholder: 'Your WeChat ID (optional)',
    message: 'Message',
    messagePlaceholder: 'Tell us your question or how we can help...',
    submit: 'Send Message',
    submitting: 'Sending...',
    successTitle: 'Message Sent!',
    successMessage: 'Thank you for contacting us. We will respond within 24-48 hours.',
    backToHome: 'Back to Home',
    required: 'Required'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Contact form submitted:', formData);
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <DesktopHeader />
        
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-green)' }}>
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
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
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {text.subtitle}
          </p>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {text.description}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <div>
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {text.formTitle}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {text.name} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={text.namePlaceholder}
                    required
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {text.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={text.emailPlaceholder}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {text.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={text.phonePlaceholder}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {text.wechat}
                    </label>
                    <input
                      type="text"
                      name="wechat"
                      value={formData.wechat}
                      onChange={handleChange}
                      placeholder={text.wechatPlaceholder}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {text.message} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={text.messagePlaceholder}
                    required
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border resize-none text-sm"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-green)' }}
                >
                  {isSubmitting ? (
                    text.submitting
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {text.submit}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
