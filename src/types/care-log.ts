export interface CareLogEntry {
  id: string;
  timestamp: string;
  entry_timestamp: string;
  type: 'medication' | 'activity' | 'mood' | 'symptom' | 'note';
  entry_type: 'care_activity' | 'care_need' | 'struggle';
  title: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
  tags?: string[];
  metadata?: Record<string, any>;
  time_spent?: number;
}
