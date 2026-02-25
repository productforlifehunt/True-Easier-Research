import React, { useState } from 'react';
import { Calendar, Clock, Info } from 'lucide-react';

interface SurveyEnrollmentModalProps {
  language: 'en' | 'zh';
  onEnroll: (startDate: Date) => Promise<void>;
  onClose: () => void;
}

const SurveyEnrollmentModal: React.FC<SurveyEnrollmentModalProps> = ({ language, onEnroll, onClose }) => {
  const [startOption, setStartOption] = useState<'today' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const text = language === 'zh' ? {
    title: '开始7天调查',
    subtitle: '选择您的调查开始日期',
    description: '这项为期7天的调查用于记录您的日常照护活动、遇到的挑战和投入的时间。每天只需几分钟即可完成。',
    startToday: '今天开始',
    startCustom: '选择其他日期',
    selectDate: '选择日期',
    whatToExpect: '您将需要：',
    expectation1: '每天记录护理活动',
    expectation2: '分享挑战和需求',
    expectation3: '追踪情绪和时间投入',
    commitment: '您可以随时暂停并稍后继续',
    startButton: '开始调查',
    cancelButton: '取消',
    enrolling: '正在注册...'
  } : {
    title: 'Start 7-Day Survey',
    subtitle: 'Choose your survey start date',
    description: 'This 7-day survey records your daily caregiving activities, challenges, and time spent. It usually takes only a few minutes each day.',
    startToday: 'Start Today',
    startCustom: 'Choose Another Date',
    selectDate: 'Select Date',
    whatToExpect: 'What to Expect:',
    expectation1: 'Log care activities daily',
    expectation2: 'Share challenges and needs',
    expectation3: 'Track emotions and time spent',
    commitment: 'You can pause and resume anytime',
    startButton: 'Start Survey',
    cancelButton: 'Cancel',
    enrolling: 'Enrolling...'
  };

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const startDate = startOption === 'today' ? new Date() : new Date(customDate);
      await onEnroll(startDate);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="w-full max-w-lg rounded-3xl p-6 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {text.title}
          </h2>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            {text.subtitle}
          </p>
        </div>

        {/* Description */}
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex gap-3">
            <Info className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-green)', width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
            <p className="text-sm md:text-base" style={{ color: 'var(--text-primary)' }}>
              {text.description}
            </p>
          </div>
        </div>

        {/* Start Date Options */}
        <div className="mb-6 space-y-3">
          <button
            onClick={() => setStartOption('today')}
            className="w-full p-4 rounded-xl text-left transition-all"
            style={{
              backgroundColor: startOption === 'today' ? 'var(--color-green)' : 'var(--bg-secondary)',
              border: `2px solid ${startOption === 'today' ? 'var(--color-green)' : 'var(--border-light)'}`,
              color: startOption === 'today' ? 'white' : 'var(--text-primary)'
            }}
          >
            <div className="flex items-center gap-3">
              <Calendar style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              <span className="font-medium">{text.startToday}</span>
            </div>
          </button>

          <button
            onClick={() => setStartOption('custom')}
            className="w-full p-4 rounded-xl text-left transition-all"
            style={{
              backgroundColor: startOption === 'custom' ? 'var(--color-green)' : 'var(--bg-secondary)',
              border: `2px solid ${startOption === 'custom' ? 'var(--color-green)' : 'var(--border-light)'}`,
              color: startOption === 'custom' ? 'white' : 'var(--text-primary)'
            }}
          >
            <div className="flex items-center gap-3">
              <Clock style={{ width: 'clamp(1.25rem, 3vw, 1.5rem)', height: 'clamp(1.25rem, 3vw, 1.5rem)' }} />
              <span className="font-medium">{text.startCustom}</span>
            </div>
          </button>

          {startOption === 'custom' && (
            <div className="ml-8 mt-2">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                {text.selectDate}
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-xl border-2 transition-all"
                style={{
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          )}
        </div>

        {/* What to Expect */}
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            {text.whatToExpect}
          </h3>
          <ul className="space-y-2">
            {[text.expectation1, text.expectation2, text.expectation3].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--color-green)' }} />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm italic" style={{ color: 'var(--text-secondary)' }}>
            {text.commitment}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isEnrolling}
            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all min-h-[48px]"
            style={{
              border: '2px solid var(--border-light)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-secondary)'
            }}
          >
            {text.cancelButton}
          </button>
          <button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all min-h-[48px] disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            {isEnrolling ? text.enrolling : text.startButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyEnrollmentModal;
