import React, { useState } from 'react';
import { 
  FileText, Calendar, Clock, Smartphone, 
  TrendingUp, Users, Layers, Activity
} from 'lucide-react';

interface SurveyMethodology {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  duration: string;
  frequency: string;
  bestFor: string;
}

interface SurveyMethodologySelectorProps {
  onSelect: (methodology: string) => void;
  selected?: string;
}

const SurveyMethodologySelector: React.FC<SurveyMethodologySelectorProps> = ({ 
  onSelect, 
  selected 
}) => {
  const methodologies: SurveyMethodology[] = [
    {
      id: 'single_survey',
      name: 'Single Survey',
      description: 'Traditional one-time questionnaire for cross-sectional data collection',
      icon: <FileText size={24} />,
      features: ['One-time data collection', 'Unlimited questions', 'All question types', 'Branching logic', 'Immediate results'],
      duration: '5-60 minutes',
      frequency: 'One-time',
      bestFor: 'Quick feedback, evaluations, assessments'
    },
    {
      id: 'esm',
      name: 'Experience Sampling (ESM)',
      description: 'Capture real-time experiences with prompted surveys throughout the day',
      icon: <Smartphone size={24} />,
      features: ['Multiple daily prompts', 'Real-time data capture', 'Random or fixed schedules', 'Mobile-optimized', 'DND support', 'Momentary analysis'],
      duration: '1-14 days',
      frequency: '3-10x daily',
      bestFor: 'Mood research, behavioral studies, ecological momentary assessment'
    },
    {
      id: 'daily_diary',
      name: 'Daily Diary',
      description: 'End-of-day reflections to track patterns over time',
      icon: <Calendar size={24} />,
      features: ['Daily check-ins', 'Pattern detection', 'Habit tracking', 'Mood trends', 'Sleep analysis'],
      duration: '7-30 days',
      frequency: 'Once daily',
      bestFor: 'Health tracking, habit research, wellness studies'
    },
    {
      id: 'ema',
      name: 'Ecological Momentary',
      description: 'Event-triggered and time-based assessments in natural settings',
      icon: <Activity size={24} />,
      features: ['Event-triggered surveys', 'Context-aware prompts', 'Location-based triggers', 'Compliance tracking', 'Real-time interventions'],
      duration: '1-30 days',
      frequency: 'Event-based + scheduled',
      bestFor: 'Clinical research, substance use studies, pain management'
    },
    {
      id: 'longitudinal',
      name: 'Longitudinal Study',
      description: 'Track changes and development across extended time periods',
      icon: <TrendingUp size={24} />,
      features: ['Periodic follow-ups', 'Cohort tracking', 'Change detection', 'Dropout prevention', 'Automated scheduling', 'Long-term analytics'],
      duration: 'Months to years',
      frequency: 'Weekly/Monthly',
      bestFor: 'Development studies, treatment outcomes, long-term research'
    },
    {
      id: 'mixed_methods',
      name: 'Mixed Methods',
      description: 'Combine multiple data collection approaches',
      icon: <Layers size={24} />,
      features: ['Multiple survey types', 'Qualitative + Quantitative', 'Flexible scheduling', 'Integrated analytics', 'Custom protocols', 'Advanced branching'],
      duration: 'Customizable',
      frequency: 'Variable',
      bestFor: 'Complex research designs, comprehensive studies'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {methodologies.map((methodology) => {
        const isSelected = selected === methodology.id;
        return (
          <div
            key={methodology.id}
            onClick={() => onSelect(methodology.id)}
            className={`rounded-2xl p-5 cursor-pointer transition-all border-2 ${
              isSelected
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-100'
                : 'border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${
                isSelected ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'
              }`}>
                {methodology.icon}
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-stone-800">
                  {methodology.name}
                </h3>
                {methodology.id === 'esm' && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                    Popular
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-[12px] text-stone-400 mb-3 leading-relaxed font-light">
              {methodology.description}
            </p>
            
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <Clock size={11} />
                <span>{methodology.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <Calendar size={11} />
                <span>{methodology.frequency}</span>
              </div>
            </div>
            
            <div className="border-t border-stone-100 pt-3">
              <div className="flex flex-wrap gap-1">
                {methodology.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-50 text-stone-400 border border-stone-100">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SurveyMethodologySelector;
