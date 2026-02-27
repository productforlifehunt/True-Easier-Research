import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useStateManagement';
import { useLanguage } from '../hooks/useLanguage';
import { MessageSquare, ChevronDown, ChevronUp, Calendar, Video, CheckCircle, Clock, Users, BookOpen, Network, Info } from 'lucide-react';
import DesktopHeader from '../components/DesktopHeader';
import MobileHeader from '../components/MobileHeader';
import AuthModal from '../components/AuthModal';
import IOSToggle from '../components/ui/IOSToggle';
import Ecogram from '../components/Ecogram';
import MyCaringWeek from '../components/MyCaringWeek';

const Interview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isPrimary, setIsPrimary] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [ecogramData, setEcogramData] = useState<any>(null);
  const [primaryCaregiverId, setPrimaryCaregiverId] = useState<string | null>(null);
  const [primaryCaregiverName, setPrimaryCaregiverName] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<{
    interview_url: string | null;
    interview_datetime_start: string | null;
    interview_datetime_end: string | null;
    interview_accepted: boolean;
  }>({
    interview_url: null,
    interview_datetime_start: null,
    interview_datetime_end: null,
    interview_accepted: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_primary_caregiver, interview_url, interview_datetime_start, interview_datetime_end, interview_accepted, ecogram_data, primary_caregiver_id')
          .eq('id', user.id)
          .single();
        
        if (data) {
          const userIsPrimary = data.is_primary_caregiver ?? true;
          setIsPrimary(userIsPrimary);
          setEcogramData(data.ecogram_data || null);
          
          // For network caregivers: fetch primary caregiver's name
          if (!userIsPrimary && data.primary_caregiver_id) {
            setPrimaryCaregiverId(data.primary_caregiver_id);
            const { data: pcData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', data.primary_caregiver_id)
              .single();
            if (pcData?.full_name) {
              setPrimaryCaregiverName(pcData.full_name);
            }
          }
          setInterviewData({
            interview_url: data.interview_url || null,
            interview_datetime_start: data.interview_datetime_start || null,
            interview_datetime_end: data.interview_datetime_end || null,
            interview_accepted: data.interview_accepted || false,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();

    // Listen for real-time changes to profile
    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` },
        (payload) => {
          if (payload.new && typeof payload.new.is_primary_caregiver === 'boolean') {
            setIsPrimary(payload.new.is_primary_caregiver);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <DesktopHeader />
        <MobileHeader />
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 text-center">
          <MessageSquare size={48} style={{ color: 'var(--color-green)', margin: '0 auto 16px' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {language === 'zh' ? '请先登录' : 'Please Sign In'}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {language === 'zh' ? '登录后查看您的访谈信息' : 'Sign in to view your interview information'}
          </p>
          <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 rounded-xl text-white font-semibold" style={{ backgroundColor: 'var(--color-green)' }}>
            {language === 'zh' ? '登录' : 'Sign In'}
          </button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3" style={{ borderColor: 'var(--color-green)' }}></div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{language === 'zh' ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const zh = language === 'zh';

  // Primary caregiver: 22 questions (Section 5)
  const primaryQuestions = [
    { id: '5.1', en: 'What is your relationship to the patient, and how long have you been providing care?', zh: '您与患者是什么关系？您提供照护多长时间了？' },
    { id: '5.2', en: "What is the patient's current condition and main care needs?", zh: '患者目前的状况和主要照护需求是什么？' },
    { id: '5.3', en: 'What does a typical day of caregiving look like for you?', zh: '您典型的一天照护是什么样的？', probe: { en: '"Let\'s look at your recorded activities in My Caring Week together..."', zh: '"让我们一起看看您在「我的照护周」中记录的活动..."' } },
    { id: '5.4', en: 'What difficulties do you face in your daily caregiving?', zh: '您在日常照护中遇到什么困难？', probe: { en: '"You\'ve noted some challenges. Could you tell me more?"', zh: '"您记录了一些挑战。能具体说说吗？"' } },
    { id: '5.5', en: 'What support do you need from others to help care for the patient?', zh: '您需要他人提供什么支持来帮助照护患者？' },
    { id: '5.6', en: 'Who else helps care for the patient? How close are you to these people, and what does each person do?', zh: '还有谁帮助照护患者？您与这些人的关系有多亲近？每个人做什么？', probe: { en: '"Let\'s look at the care network you\'ve mapped out. Could you walk me through who these people are?"', zh: '"让我们看看您绘制的照护网络图。您能介绍一下这些人吗？"' } },
    { id: '5.7', en: 'Under what circumstances do you ask others for support?', zh: '在什么情况下您会向他人寻求支持？' },
    { id: '5.8', en: 'Do you experience difficulties asking for support? What are the difficulties?', zh: '您在寻求支持时遇到困难吗？有什么困难？' },
    { id: '5.9', en: "Is there anyone you could ask for help but haven't? What's stopping you?", zh: '有没有您可以请求帮助但还没有请求的人？是什么阻止了您？' },
    { id: '5.10', en: 'Has your care network changed over time?', zh: '您的照护网络随时间有变化吗？' },
    { id: '5.11', en: 'What would your ideal care network look like?', zh: '您理想的照护网络会是什么样的？' },
    { id: '5.12', en: 'Looking at your network, how satisfied are you overall, from 0 to 100?', zh: '看看您的网络，您对整体的满意度是多少（0-100分）？' },
    { id: '5.13', en: 'When someone else helps care for the patient, what information do they ask for? What do you think they need to know?', zh: '当其他人帮助照护患者时，他们会问什么信息？您认为他们需要知道什么？' },
    { id: '5.14', en: 'How do you communicate with other caregivers? What methods or technology do you use?', zh: '您如何与其他照护者沟通？使用什么方法或技术？', probe: { en: '"You mentioned using certain tools. How well do these communication methods work for you?"', zh: '"您提到使用了一些工具。这些沟通方式效果如何？"' } },
    { id: '5.15', en: 'Are there barriers you face when sharing information about the patient with others?', zh: '您在与他人分享患者信息时是否遇到障碍？' },
    { id: '5.16', en: "When the patient's condition changes, how do you keep others informed? Are there barriers?", zh: '当患者状况变化时，您如何让其他人知道？是否有障碍？' },
    { id: '5.17', en: 'Has the patient ever wandered, been difficult to find, or refused to return home? Do you ask other caregivers for help when this happens? How do you coordinate, and what barriers do you face?', zh: '患者是否曾经走失、难以找到或拒绝回家？发生这种情况时您会向其他照护者求助吗？您如何协调，遇到什么障碍？' },
    { id: '5.18', en: 'How familiar are you with using a smartphone or computer?', zh: '您对使用智能手机或电脑的熟悉程度如何？' },
    { id: '5.19', en: 'What current tools do you use to learn more about dementia and caregiving? When you face uncertain situations, where do you seek information or support? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to better help with learning about dementia and caregiving? What features would be helpful?', zh: '您目前使用什么工具来了解更多关于失智症和照护的知识？当您面临不确定的情况时，您从哪里寻求信息或支持？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具能更好地帮助您了解失智症和照护知识？什么功能会有帮助？' },
    { id: '5.20', en: 'What current tools do you use to communicate or coordinate with other caregivers? What has worked well, what has not? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to help coordinate? What features would be helpful?', zh: '您目前使用什么工具与其他照护者沟通或协调？什么有效，什么无效？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具来帮助协调？什么功能会有帮助？' },
    { id: '5.21', en: 'If you could design an ideal digital service to help with caregiving, what features would you want it to have? What features would you find useful? What concerns do you have about using digital tools?', zh: '如果您可以设计一个理想的数字服务来帮助照护工作，您希望它具备哪些功能？您会觉得哪些功能有用？您对使用数字工具有什么顾虑？' },
    { id: '5.22', en: "Is there anything else you'd like to share about your experience?", zh: '关于您的经历，还有什么想分享的吗？' },
  ];

  // Network (other) caregiver: 16 questions (Section 6)
  const networkQuestions = [
    { id: '6.1', en: 'What is your relationship to the patient and the primary caregiver?', zh: '您与患者和主要照护者是什么关系？' },
    { id: '6.2', en: 'How did you become involved in providing care?', zh: '您是如何开始参与照护的？' },
    { id: '6.3', en: 'What kind of support do you provide? How often?', zh: '您提供什么样的支持？多久一次？', probe: { en: '"Let\'s look at the activities you\'ve logged..."', zh: '"让我们看看您记录的活动..."' } },
    { id: '6.4', en: 'Is the support you provide accepted, needed, and appreciated?', zh: '您提供的支持是否被接受、被需要、被感激？' },
    { id: '6.5', en: "What information do you need to know about the patient before you can help? How is this information communicated to you? Are there any barriers in how you currently receive this information?", zh: '在您能够帮助之前，您需要了解患者的哪些信息？这些信息是如何传达给您的？当前的沟通方式是否存在障碍？' },
    { id: '6.6', en: 'Do you experience difficulties when providing support? What makes it difficult?', zh: '您在提供支持时遇到困难吗？是什么让它变得困难？', probe: { en: '"You\'ve noted some challenges. Could you tell me more?"', zh: '"您记录了一些挑战。能具体说说吗？"' } },
    { id: '6.7', en: "Are there times you wanted to help but couldn't? If so, what stopped you?", zh: '有没有您想帮忙但无法帮忙的时候？如果有，是什么阻止了您？' },
    { id: '6.8', en: "How do you communicate with the primary caregiver and other caregivers during caring for the patient? When the patient's condition changes, how do you find out? Are there barriers?", zh: '在照护患者期间，您如何与主要照护者和其他照护者沟通？当患者状况变化时，您是如何得知的？是否存在障碍？' },
    { id: '6.9', en: 'Would you like to provide more or less support? If you would like to provide more, what is preventing you from doing so?', zh: '您想提供更多还是更少的支持？如果您想提供更多，是什么阻止了您？' },
    { id: '6.10', en: 'Has the patient ever wandered, been difficult to find, or refused to return home? Have you ever helped in such a situation? How did you help? Were there any barriers?', zh: '患者是否曾经走失、难以找到或拒绝回家？您是否曾在这种情况下帮忙？您是如何帮助的？是否遇到了障碍？' },
    { id: '6.11', en: 'What would help you provide better support to the patient and the primary caregiver?', zh: '什么能帮助您为患者和主要照护者提供更好的支持？' },
    { id: '6.12', en: 'How familiar are you with using a smartphone or computer?', zh: '您对使用智能手机或电脑的熟悉程度如何？' },
    { id: '6.13', en: 'What current tools do you use to learn more about dementia and caregiving? When you face uncertain situations, where do you seek information or support? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to better help with learning about dementia and caregiving? What features would be helpful?', zh: '您目前使用什么工具来了解更多关于失智症和照护的知识？当您面临不确定的情况时，您从哪里寻求信息或支持？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具能更好地帮助您了解失智症和照护知识？什么功能会有帮助？' },
    { id: '6.14', en: 'What current tools do you use to communicate or coordinate with other caregivers? What has worked well, what has not? What barriers or concerns do you have with the current tools you use? What tools do you wish existed to help coordinate? What features would be helpful?', zh: '您目前使用什么工具与其他照护者沟通或协调？什么有效，什么无效？您对目前使用的工具有什么障碍或顾虑？您希望有什么工具来帮助协调？什么功能会有帮助？' },
    { id: '6.15', en: 'If you could design an ideal digital service to help with caregiving, what features would you want it to have? What features would you find useful? What concerns do you have about using digital tools?', zh: '如果您可以设计一个理想的数字服务来帮助照护工作，您希望它具备哪些功能？您会觉得哪些功能有用？您对使用数字工具有什么顾虑？' },
    { id: '6.16', en: "Is there anything else you'd like to share about your experience?", zh: '关于您的经历，还有什么想分享的吗？' },
  ];

  const questions = isPrimary ? primaryQuestions : networkQuestions;
  const totalQuestions = questions.length;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const hasScheduledInterview = interviewData.interview_datetime_start !== null;
  const interviewDate = interviewData.interview_datetime_start 
    ? new Date(interviewData.interview_datetime_start).toLocaleDateString(zh ? 'zh-CN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const interviewTime = interviewData.interview_datetime_start
    ? new Date(interviewData.interview_datetime_start).toLocaleTimeString(zh ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <DesktopHeader />
      <MobileHeader />
      
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">
        {/* Brief Interview Status at Top */}
        <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ 
          backgroundColor: hasScheduledInterview ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)', 
          border: `1px solid ${hasScheduledInterview ? 'var(--color-green)' : 'var(--border-light)'}` 
        }}>
          {hasScheduledInterview ? (
            <CheckCircle size={18} style={{ color: 'var(--color-green)' }} />
          ) : (
            <Clock size={18} style={{ color: 'var(--text-secondary)' }} />
          )}
          <div className="flex-1">
            {hasScheduledInterview ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {interviewDate} · {interviewTime}
                </span>
                {interviewData.interview_url && (
                  <a href={interviewData.interview_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: 'var(--color-green)' }}>
                    <Video size={12} />{zh ? '加入' : 'Join'}
                  </a>
                )}
              </div>
            ) : (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {zh ? '访谈时间：待安排' : 'Interview: Pending'}
              </span>
            )}
          </div>
        </div>

        {/* Header Card with IOSToggle */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare size={28} />
            <div>
              <h1 className="text-lg font-bold">
                {isPrimary 
                  ? (zh ? '主要照护者访谈' : 'Primary Caregiver Interview')
                  : (zh ? '网络照护者访谈' : 'Network Caregiver Interview')}
              </h1>
              <p className="text-sm opacity-90">
                {zh ? `共 ${totalQuestions} 题 · 约60分钟` : `${totalQuestions} questions · ~60 minutes`}
              </p>
            </div>
          </div>
          {/* Caregiver type toggle - synced with Settings */}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <span className="text-sm font-medium">
              {isPrimary 
                ? (zh ? '我是主要照护者' : 'I am the primary caregiver')
                : (zh ? '我是网络照护者' : "I'm a network caregiver")}
            </span>
            <IOSToggle
              checked={isPrimary}
              onChange={async (checked) => {
                try {
                  await supabase
                    .from('profiles')
                    .update({ is_primary_caregiver: checked })
                    .eq('id', user?.id);
                  setIsPrimary(checked);
                } catch (error) {
                  console.error('Error updating caregiver type:', error);
                }
              }}
            />
          </div>
        </div>

        {/* Live Care Network (Ecogram) */}
        <div className="rounded-xl border mb-4 overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
          <button 
            onClick={() => toggleSection('network')} 
            className="w-full flex items-center justify-between p-4"
            style={{ backgroundColor: expandedSection === 'network' ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <Network size={18} style={{ color: 'var(--color-green)' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {zh ? '照护网络图' : 'Care Network Graph'}
              </span>
            </div>
            {expandedSection === 'network' ? <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />}
          </button>
          {expandedSection === 'network' && (
            <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <Ecogram
                userId={user?.id}
                language={language}
                initialData={ecogramData}
                isPrimaryCaregiver={isPrimary}
                primaryCaregiverId={primaryCaregiverId}
                primaryCaregiverName={primaryCaregiverName}
              />
            </div>
          )}
        </div>

        {/* Live Logged Entries (MyCaringWeek) */}
        <div className="rounded-xl border mb-4 overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
          <button 
            onClick={() => toggleSection('entries')} 
            className="w-full flex items-center justify-between p-4"
            style={{ backgroundColor: expandedSection === 'entries' ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} style={{ color: 'var(--color-green)' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {zh ? '照护周记录' : 'Caring Week Records'}
              </span>
            </div>
            {expandedSection === 'entries' ? <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />}
          </button>
          {expandedSection === 'entries' && (
            <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <MyCaringWeek language={language} />
            </div>
          )}
        </div>

        {/* Interview Questions Section */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
          <button 
            onClick={() => toggleSection('questions')} 
            className="w-full flex items-center justify-between p-4"
            style={{ backgroundColor: expandedSection === 'questions' ? 'rgba(16,185,129,0.05)' : 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={18} style={{ color: 'var(--color-green)' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {isPrimary 
                  ? (zh ? `访谈问题（共${totalQuestions}题）` : `Interview Questions (${totalQuestions} total)`)
                  : (zh ? `访谈问题（共${totalQuestions}题）` : `Interview Questions (${totalQuestions} total)`)}
              </span>
            </div>
            {expandedSection === 'questions' ? <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />}
          </button>
          {expandedSection === 'questions' && (
            <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {zh 
                  ? '以下是访谈中将讨论的问题。您可以提前浏览，但无需准备书面答案 — 访谈是自然对话的形式。'
                  : 'Below are the questions that will be discussed during the interview. You may review them in advance, but there\'s no need to prepare written answers — the interview is conducted as a natural conversation.'}
              </p>
              <ol className="space-y-3">
                {questions.map((q, idx) => (
                  <li key={q.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="flex gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-green)' }}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {zh ? q.zh : q.en}
                        </p>
                        {q.probe && (
                          <p className="mt-2 text-xs px-3 py-1.5 rounded italic leading-relaxed" style={{ backgroundColor: 'rgba(16,185,129,0.08)', color: 'var(--color-green)' }}>
                            {zh ? q.probe.zh : q.probe.en}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Tips Card */}
        <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-green)' }}>
            {zh ? '温馨提示' : 'Tips'}
          </h3>
          <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <li>• {zh ? '访谈全程录音（经您同意），数据仅用于学术研究。' : 'The interview is audio-recorded (with your consent), and data is used solely for academic research.'}</li>
            <li>• {zh ? '没有标准答案，请根据您的真实经历自由分享。' : 'There are no right or wrong answers — please share freely based on your real experiences.'}</li>
            <li>• {zh ? '如果任何问题让您感到不适，您可以随时跳过或终止访谈。' : 'If any question makes you uncomfortable, you can skip it or end the interview at any time.'}</li>
            <li>• {zh ? '参与访谈将获得额外的感谢礼品。' : 'You will receive an additional thank-you gift for participating in the interview.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Interview;
