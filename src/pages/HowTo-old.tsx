import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Mic, BookOpen, Video, HelpCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';
import DesktopHeader from '../components/DesktopHeader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const HowTo: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const text = language === 'zh' ? {
    title: '如何参与',
    subtitle: '了解参与流程，AI助手随时为您解答疑问',
    chatPlaceholder: '在这里输入您的问题...',
    send: '发送',
    typing: '正在输入...',
    introMessage: '您好！我是您的研究助手。我可以帮助您了解如何参与我们的痴呆症照护者研究。请随时提问！',
    quickQuestions: '常见问题',
    q1: '研究需要多长时间？',
    q2: '如何使用语音输入？',
    q3: 'AI助手如何帮助我？',
    q4: '我的数据安全吗？',
    steps: {
      title: '参与步骤',
      step1: { title: '1. 注册', desc: '填写简单的报名表' },
      step2: { title: '2. 确认', desc: '接收我们的联系确认' },
      step3: { title: '3. 记录', desc: '每天10-15分钟记录体验' },
      step4: { title: '4. 完成', desc: '7天后完成研究' }
    }
  } : {
    title: 'How to Participate',
    subtitle: 'Learn the participation process, AI assistant ready to answer your questions',
    chatPlaceholder: 'Type your question here...',
    send: 'Send',
    typing: 'Typing...',
    introMessage: 'Hello! I am your research assistant. I can help you understand how to participate in our dementia caregiver study. Feel free to ask any questions!',
    quickQuestions: 'Quick Questions',
    q1: 'How long does the study take?',
    q2: 'How to use voice input?',
    q3: 'How does the AI assistant help me?',
    q4: 'Is my data secure?',
    steps: {
      title: 'Participation Steps',
      step1: { title: '1. Register', desc: 'Fill out a simple registration form' },
      step2: { title: '2. Confirm', desc: 'Receive confirmation from us' },
      step3: { title: '3. Record', desc: '10-15 minutes daily to record experiences' },
      step4: { title: '4. Complete', desc: 'Finish the study after 7 days' }
    }
  };

  useEffect(() => {
    // Add intro message
    setMessages([{ role: 'assistant', content: text.introMessage }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('how-to-chatbot', {
        body: {
          message: textToSend,
          language: language,
          conversation_history: messages.slice(1) // Exclude intro message
        }
      });

      if (error) throw error;

      if (data?.success && data?.message) {
        const assistantMessage: Message = { role: 'assistant', content: data.message };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: language === 'zh' 
          ? '抱歉，我现在无法回答。请稍后再试或直接访问"加入研究"页面了解更多信息。'
          : 'Sorry, I cannot respond right now. Please try again later or visit the "Join Study" page for more information.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      
      <div className="max-w-6xl mx-auto px-6 py-8 pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {text.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Steps */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl border sticky top-24" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BookOpen className="w-5 h-5" style={{ color: 'var(--color-green)' }} />
                {text.steps.title}
              </h2>
              <div className="space-y-4">
                {[text.steps.step1, text.steps.step2, text.steps.step3, text.steps.step4].map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-white" style={{ backgroundColor: 'var(--color-green)' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{step.title}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/join-survey')}
                className="w-full mt-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                {language === 'zh' ? '立即注册' : 'Register Now'}
              </button>
            </div>
          </div>

          {/* Right Side - Chat */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <MessageCircle className="w-6 h-6" style={{ color: 'var(--color-green)' }} />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {language === 'zh' ? 'AI 研究助手' : 'AI Research Assistant'}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {language === 'zh' ? '在线回答您的问题' : 'Online to answer your questions'}
                  </p>
                </div>
              </div>

              {/* Quick Questions */}
              <div className="p-4 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{text.quickQuestions}</p>
                <div className="flex flex-wrap gap-2">
                  {[text.q1, text.q2, text.q3, text.q4].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(q)}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                      }`}
                      style={{
                        backgroundColor: msg.role === 'user' ? 'var(--color-green)' : 'white',
                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                        border: msg.role === 'assistant' ? '1px solid var(--border-light)' : 'none'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm" style={{ backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{text.typing}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={text.chatPlaceholder}
                    className="flex-1 px-4 py-3 rounded-lg border"
                    style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-green)' }}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowTo;
