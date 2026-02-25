import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Mic, CheckCircle, ClipboardList, Mail, FileText, Calendar, FileCheck, User, Users } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';

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
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const text = language === 'zh' ? {
    title: '如何参与',
    subtitle: '了解参与流程，AI助手随时为您解答疑问',
    chatTitle: 'AI研究助手',
    chatSubtitle: '在线回答您的问题',
    chatPlaceholder: '在这里输入您的问题...',
    send: '发送',
    typing: '正在输入...',
    voiceHint: '点击麦克风开始语音输入',
    recording: '正在录音...',
    introMessage: '您好！我是您的研究助手。我可以帮助您了解如何参与我们的痴呆症照护者研究。请随时提问！',
    steps: [
      {
        id: 1,
        title: '注册',
        icon: ClipboardList,
        shortDesc: '填写简单的报名表',
        fullContent: '第一步是完成我们的在线注册表。整个过程只需要5分钟。您需要提供：\n\n• 您的姓名或昵称（可以使用化名保护隐私）\n• 电子邮件地址\n• 电话号码\n• 微信号（可选，如果与电话相同可留空）\n• 您与患者的关系（如配偶、子女等）\n• 是否为主要照护者\n• 是否愿意在研究后参加访谈（可选）\n\n所有信息都将严格保密，仅用于研究团队联系您。'
      },
      {
        id: 2,
        title: '确认',
        icon: Mail,
        shortDesc: '接收我们的联系确认',
        fullContent: '提交注册后，我们的研究团队将在24-48小时内通过您提供的联系方式与您取得联系：\n\n• 通过电子邮件发送研究详情和参与须知\n• 通过微信或电话确认您的参与意愿\n• 解答您可能有的任何问题\n• 为您安排开始记录的时间\n• 发送登录信息和使用指南\n\n在收到确认之前，您可以随时通过联系我们的团队了解更多信息。'
      },
      {
        id: 3,
        title: '记录',
        icon: FileText,
        shortDesc: '每天10-15分钟记录体验',
        fullContent: '这是研究的核心部分，为期7天。每天您需要：\n\n日常记录（10-15分钟）：\n• 记录您当天的照护活动和体验\n• 描述遇到的挑战或特殊时刻\n• 记录您的感受和需求\n\n使用我们的智能工具：\n• 语音输入：点击麦克风图标，用说话的方式填写表单，系统会自动转换为文字\n• AI写作助手：点击AI图标获取写作建议和改进意见\n• 自动纠错：系统会自动纠正拼写和语法错误\n\n您可以在一天中的任何时间完成记录，系统会保存您的进度。'
      },
      {
        id: 4,
        title: '完成',
        icon: CheckCircle,
        shortDesc: '7天后完成研究',
        fullContent: '完成7天的记录后：\n\n• 您将收到一份参与证书感谢您的贡献\n• 研究团队会发送感谢邮件\n• 如果您选择了参加访谈，我们会另行安排时间\n• 您可以选择接收研究成果摘要（发布后）\n• 您的数据将被匿名化并用于改善照护者支持服务\n\n研究结果将帮助：\n• 改善痴呆症照护者的支持政策\n• 开发更有效的干预措施\n• 提高公众对照护者需求的认识\n\n感谢您为改善照护者生活质量做出的宝贵贡献！'
      }
    ],
    quickQuestions: '常见问题',
    q1: '研究需要多长时间？',
    q2: '如何使用语音输入？',
    q3: 'AI助手如何帮助我？',
    q4: '我的数据安全吗？',
    registerNow: '立即注册'
  } : {
    title: 'How to Participate',
    subtitle: 'Learn the participation process, AI assistant ready to answer your questions',
    chatTitle: 'AI Research Assistant',
    chatSubtitle: 'Online to answer your questions',
    chatPlaceholder: 'Type your question here...',
    send: 'Send',
    typing: 'Typing...',
    voiceHint: 'Click microphone to start voice input',
    recording: 'Recording...',
    introMessage: 'Hello! I am your research assistant. I can help you understand how to participate in our dementia caregiver study. Feel free to ask any questions!',
    steps: [
      {
        id: 1,
        title: 'Register',
        icon: ClipboardList,
        shortDesc: 'Fill out a simple registration form',
        fullContent: 'The first step is to complete our online registration form. The entire process takes just 5 minutes. You will need to provide:\n\n• Your name or preferred name (you can use a pseudonym for privacy)\n• Email address\n• Phone number\n• WeChat ID (optional, leave empty if same as phone)\n• Your relationship to the patient (e.g., spouse, child)\n• Whether you are the primary caregiver\n• Whether you are willing to participate in an interview after the study (optional)\n\nAll information will be kept strictly confidential and used only for the research team to contact you.'
      },
      {
        id: 2,
        title: 'Confirm',
        icon: Mail,
        shortDesc: 'Receive confirmation from us',
        fullContent: 'After submitting your registration, our research team will contact you within 24-48 hours using your provided contact information:\n\n• Send research details and participation guidelines via email\n• Confirm your participation through WeChat or phone\n• Answer any questions you may have\n• Schedule your start date for recording\n• Send login information and user guide\n\nBefore receiving confirmation, you can always contact our team to learn more.'
      },
      {
        id: 3,
        title: 'Record',
        icon: FileText,
        shortDesc: '10-15 minutes daily to record experiences',
        fullContent: 'This is the core part of the study, lasting 7 days. Each day you will:\n\nDaily Recording (10-15 minutes):\n• Record your caregiving activities and experiences\n• Describe challenges or special moments\n• Record your feelings and needs\n\nUse our smart tools:\n• Voice Input: Click the microphone icon, fill forms by speaking, system automatically converts to text\n• AI Writing Assistant: Click AI icon for writing suggestions and improvements\n• Auto-correction: System automatically corrects spelling and grammar\n\nYou can complete your recording at any time during the day, and the system will save your progress.'
      },
      {
        id: 4,
        title: 'Complete',
        icon: CheckCircle,
        shortDesc: 'Finish the study after 7 days',
        fullContent: 'After completing 7 days of recording:\n\n• You will receive a participation certificate thanking you for your contribution\n• Research team will send a thank you email\n• If you opted for an interview, we will schedule it separately\n• You can choose to receive a research summary (when published)\n• Your data will be anonymized and used to improve caregiver support services\n\nStudy results will help:\n• Improve dementia caregiver support policies\n• Develop more effective interventions\n• Raise public awareness of caregiver needs\n\nThank you for your valuable contribution to improving caregiver quality of life!'
      }
    ],
    quickQuestions: 'Quick Questions',
    q1: 'How long does the study take?',
    q2: 'How to use voice input?',
    q3: 'How does the AI assistant help me?',
    q4: 'Is my data secure?',
    registerNow: 'Register Now'
  };

  useEffect(() => {
    setMessages([{ role: 'assistant', content: text.introMessage }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'zh' ? 'zh-CN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(language === 'zh' ? '您的浏览器不支持语音输入' : 'Your browser does not support voice input');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://yekarqanirdkdckimpna.supabase.co/functions/v1/how-to-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla2FycWFuaXJka2Rja2ltcG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzUwOTQsImV4cCI6MjA1OTg1MTA5NH0.WQlbyilIuH_Vz_Oit-M5MZ9II9oqO7tg-ThkZ5GCtfc'
        },
        body: JSON.stringify({
          message: textToSend,
          language: language,
          conversation_history: messages.slice(1)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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

  const currentStep = text.steps.find(s => s.id === activeStep) || text.steps[0];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {text.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {text.steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(step.id)}
                      className={`flex-1 min-w-[140px] p-4 rounded-xl border-2 transition-all ${
                        activeStep === step.id ? 'shadow-md' : 'hover:shadow-sm'
                      }`}
                      style={{
                        backgroundColor: activeStep === step.id ? 'var(--color-green)' : 'var(--bg-secondary)',
                        borderColor: activeStep === step.id ? 'var(--color-green)' : 'var(--border-light)',
                        color: activeStep === step.id ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className="w-6 h-6" />
                        <span className="font-semibold text-sm">{step.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="min-h-[300px]">
                <div className="flex items-center gap-3 mb-4">
                  <StepIcon className="w-8 h-8" style={{ color: 'var(--color-green)' }} />
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {currentStep.title}
                  </h2>
                </div>
                <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {currentStep.fullContent}
                </p>
              </div>

              <button
                onClick={() => navigate('/join-survey')}
                className="w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-green)' }}
              >
                {text.registerNow}
              </button>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
              <div className="p-4 border-b flex items-center gap-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)' }}>
                <MessageCircle className="w-6 h-6" style={{ color: 'var(--color-green)' }} />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {text.chatTitle}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {text.chatSubtitle}
                  </p>
                </div>
              </div>

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

              <div className="p-4 border-t" style={{ backgroundColor: 'white', borderColor: 'var(--border-light)' }}>
                {isRecording && (
                  <div className="mb-2 text-sm flex items-center gap-2" style={{ color: 'var(--color-green)' }}>
                    <span className="animate-pulse">●</span> {text.recording}
                  </div>
                )}
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
                    onClick={handleVoiceInput}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      isRecording ? 'animate-pulse' : 'hover:opacity-90'
                    }`}
                    style={{ 
                      backgroundColor: isRecording ? '#ef4444' : 'var(--color-green)',
                      color: 'white'
                    }}
                    title={text.voiceHint}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
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
