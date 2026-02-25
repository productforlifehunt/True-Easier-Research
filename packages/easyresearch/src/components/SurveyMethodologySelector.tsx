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
      icon: <FileText size={32} />,
      features: [
        'One-time data collection',
        'Unlimited questions',
        'All question types',
        'Branching logic',
        'Immediate results'
      ],
      duration: '5-60 minutes',
      frequency: 'Once',
      bestFor: 'Customer feedback, market research, academic studies'
    },
    {
      id: 'esm',
      name: 'Experience Sampling Method (ESM)',
      description: 'Capture real-time experiences and behaviors in natural settings',
      icon: <Smartphone size={32} />,
      features: [
        'Multiple daily prompts',
        'Random or fixed schedules',
        'Short micro-surveys',
        'Timeline tracking',
        'Compliance monitoring',
        'Real-time notifications'
      ],
      duration: '3-7 days typical',
      frequency: '3-10 times per day',
      bestFor: 'Mood tracking, behavior patterns, in-the-moment experiences'
    },
    {
      id: 'ema',
      name: 'Ecological Momentary Assessment (EMA)',
      description: 'Clinical-grade repeated sampling for health and psychology research',
      icon: <Activity size={32} />,
      features: [
        'Scheduled assessments',
        'Event-based triggers',
        'Physiological data integration',
        'Compliance tracking',
        'Missing data handling',
        'Clinical reporting'
      ],
      duration: '1-4 weeks',
      frequency: '2-8 times per day',
      bestFor: 'Clinical research, health monitoring, symptom tracking'
    },
    {
      id: 'daily_diary',
      name: 'Daily Diary Study',
      description: 'End-of-day reflections and daily summaries',
      icon: <Calendar size={32} />,
      features: [
        'Once-daily entries',
        'Evening notifications',
        'Day reconstruction',
        'Progress tracking',
        'Weekly summaries',
        'Streak rewards'
      ],
      duration: '1-4 weeks',
      frequency: 'Once per day',
      bestFor: 'Sleep studies, daily activities, habit tracking'
    },
    {
      id: 'longitudinal',
      name: 'Longitudinal Study',
      description: 'Track changes over extended time periods',
      icon: <TrendingUp size={32} />,
      features: [
        'Periodic follow-ups',
        'Cohort tracking',
        'Change detection',
        'Dropout prevention',
        'Automated scheduling',
        'Long-term analytics'
      ],
      duration: 'Months to years',
      frequency: 'Weekly/Monthly',
      bestFor: 'Development studies, treatment outcomes, long-term research'
    },
    {
      id: 'mixed_methods',
      name: 'Mixed Methods',
      description: 'Combine multiple data collection approaches',
      icon: <Layers size={32} />,
      features: [
        'Multiple survey types',
        'Qualitative + Quantitative',
        'Flexible scheduling',
        'Integrated analytics',
        'Custom protocols',
        'Advanced branching'
      ],
      duration: 'Customizable',
      frequency: 'Variable',
      bestFor: 'Complex research designs, comprehensive studies'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {methodologies.map((methodology) => (
        <div
          key={methodology.id}
          onClick={() => onSelect(methodology.id)}
          className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
          style={{
            border: selected === methodology.id 
              ? '2px solid var(--color-green)' 
              : '1px solid var(--border-light)',
            backgroundColor: selected === methodology.id ? '#f0fdf4' : 'white'
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl" style={{ 
              backgroundColor: selected === methodology.id ? 'var(--color-green)' : '#f3f4f6',
              color: selected === methodology.id ? 'white' : 'var(--text-secondary)'
            }}>
              {methodology.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                {methodology.name}
              </h3>
              {methodology.id === 'esm' && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-100" 
                      style={{ color: 'var(--color-green)' }}>
                  Most Popular
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {methodology.description}
          </p>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>Duration:</strong> {methodology.duration}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>Frequency:</strong> {methodology.frequency}
              </span>
            </div>
          </div>
          
          <div className="border-t pt-4" style={{ borderColor: 'var(--border-light)' }}>
            <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
              Key Features
            </h4>
            <ul className="space-y-1">
              {methodology.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-xs flex items-center gap-1" 
                    style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--color-green)' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <strong>Best for:</strong> {methodology.bestFor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurveyMethodologySelector;
