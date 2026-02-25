import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
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
        title: '同意书',
        icon: FileCheck,
        shortDesc: '阅读并签署研究同意书',
        fullContent: '在开始研究前，您需要阅读并签署知情同意书：\n\n• 详细了解研究目的和流程\n• 了解您的权利和责任\n• 了解数据如何被使用和保护\n• 确认自愿参与\n\n您可以随时：\n• 在签署前充分阅读和提问\n• 查看已签署的同意书\n• 如有疑问联系研究团队\n\n同意书确保您充分了解研究，保护您的权益。'
      },
      {
        id: 4,
        title: '个人信息',
        icon: User,
        shortDesc: '完善您的基本信息',
        fullContent: '请完善您的个人信息：\n\n需要填写：\n• 姓名\n• 自我介绍\n• 与患者的关系\n• 是否为主要照护者\n• 参与者编号\n\n这些信息用于研究分析。\n\n您可以随时在设置中编辑这些信息。'
      },
      {
        id: 5,
        title: '开始日期',
        icon: Calendar,
        shortDesc: '选择您的研究开始日期',
        fullContent: '选择一个适合您的日期开始7天研究。\n\n开始后：\n• 研究将持续7天\n• 每天记录您的照护活动\n• 您可以随时查看当前进度\n\n如需调整开始日期，可在设置中修改。'
      },
      {
        id: 6,
        title: '每日问卷',
        icon: FileText,
        shortDesc: '7天研究期',
        fullContent: '研究为期7天。我们会发送提醒通知帮助您记录照护活动、遇到的挑战、您的感受和需求。\n\n主要照护者在白天每小时会收到一次提醒，晚上10点还会收到一条提醒用于回顾当天或记录想法和需求。其他照护者每晚10点会收到一条提醒。\n\n您不需要在活动发生的当下立即记录，可以在方便的时候填写，也可以晚上回顾一天后一起记录。想到什么随时都可以记录。\n\n我们提供语音输入功能，您可以直接说话来填写表单。AI写作助手可以帮您改进回答并自动纠正拼写错误。系统会自动保存您的进度。'
      },
      {
        id: 7,
        title: '深度访谈',
        icon: Users,
        shortDesc: '可选的后续访谈',
        fullContent: '完成7天问卷后，您可以选择参加深度访谈：\n\n访谈内容：\n• 更详细地分享您的照护经历\n• 探讨您在问卷中提到的情况\n\n访谈安排：\n• 完全自愿参与\n• 时间和形式可以协商\n• 通常30-60分钟\n• 可以选择语音或视频\n\n您可以在设置中随时更改访谈意愿。'
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
        title: 'Consent',
        icon: FileCheck,
        shortDesc: 'Read and sign research consent',
        fullContent: 'Before starting the study, you need to read and sign the informed consent form:\n\n• Understand the research purpose and process in detail\n• Know your rights and responsibilities\n• Learn how data will be used and protected\n• Confirm voluntary participation\n\nYou can always:\n• Read thoroughly and ask questions before signing\n• Review your signed consent\n• Contact the research team if you have concerns\n\nThe consent ensures you fully understand the study and protects your rights.'
      },
      {
        id: 4,
        title: 'Profile',
        icon: User,
        shortDesc: 'Complete your basic information',
        fullContent: 'Please complete your profile information:\n\nRequired information:\n• Full name\n• Introduction\n• Relationship to patient\n• Whether you are the primary caregiver\n• Participant number\n\nThis information is used for research analysis.\n\nYou can edit this information anytime in settings.'
      },
      {
        id: 5,
        title: 'Start Date',
        icon: Calendar,
        shortDesc: 'Choose your study start date',
        fullContent: 'Select a date that works for you to begin the 7-day study.\n\nAfter starting:\n• Study lasts 7 days\n• Record your caregiving activities daily\n• Track your progress anytime\n\nYou can adjust the start date in settings if needed.'
      },
      {
        id: 6,
        title: 'Daily Survey',
        icon: FileText,
        shortDesc: '7-day study period',
        fullContent: 'The study lasts 7 days. We will send reminder notifications to help you record your caregiving activities, challenges you encounter, your feelings, and your needs.\n\nPrimary caregivers will receive a reminder every hour during the day, plus one at 10 PM for reviewing the day or recording any thoughts and needs. Other caregivers will receive one reminder at 10 PM each evening.\n\nYou do not need to record at the exact moment something happens. Fill in whenever convenient, or review your day in the evening and record everything together. Record any thoughts whenever they come to you.\n\nWe provide voice input so you can fill forms by speaking. The AI writing assistant helps improve your responses and corrects spelling errors. The system automatically saves your progress.'
      },
      {
        id: 7,
        title: 'Interview',
        icon: Users,
        shortDesc: 'Optional follow-up interview',
        fullContent: 'After completing the 7-day survey, you can choose to participate in a follow-up interview:\n\nInterview content:\n• Share your caregiving experience in more detail\n• Discuss specific situations mentioned in surveys\n\nInterview arrangement:\n• Completely voluntary\n• Time and format can be negotiated\n• Usually 30-60 minutes\n• Audio or video call options\n\nYou can change your interview preference anytime in settings.'
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
    const step = searchParams.get('step');
    if (step) {
      const stepNum = parseInt(step);
      if (stepNum >= 1 && stepNum <= 7) {
        setActiveStep(stepNum);
      }
    }
  }, [searchParams]);

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
      const { data, error } = await supabase.functions.invoke('how-to-chatbot', {
        body: {
          message: textToSend,
          language: language,
          conversation_history: messages.slice(1)
        }
      });

      if (error) {
        throw error;
      }

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
                      className={`flex-1 min-w-[120px] p-3 rounded-xl border-2 transition-all ${
                        activeStep === step.id ? 'shadow-md' : 'hover:shadow-sm'
                      }`}
                      style={{
                        backgroundColor: activeStep === step.id ? 'var(--color-green)' : 'var(--bg-secondary)',
                        borderColor: activeStep === step.id ? 'var(--color-green)' : 'var(--border-light)',
                        color: activeStep === step.id ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold text-xs">{step.title}</span>
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
