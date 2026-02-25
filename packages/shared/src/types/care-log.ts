export interface CareLogEntry {
  id: string;
  user_id: string;
  entry_timestamp: string;
  entry_type: 'care_activity' | 'care_need' | 'struggle';
  description: string;
  time_spent?: number;
  emotional_impact?: string;
  urgency_level?: string;
  people_with?: string;
  people_want_with?: string;
  help_reaching_challenges?: string;
  communication_challenges?: string;
  collaboration_challenges?: string;
  knowledge_gaps?: string;
  tools_currently_using?: string;
  tools_wanted?: string;
  support_needed?: string;
  created_at: string;
  updated_at?: string;
}
