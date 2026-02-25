-- Create and seed filter option tables for Care Connector app
-- Using care_connector schema only

-- Create care_types table if not exists
CREATE TABLE IF NOT EXISTS care_connector.care_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create languages table if not exists
CREATE TABLE IF NOT EXISTS care_connector.languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create insurance_providers table if not exists  
CREATE TABLE IF NOT EXISTS care_connector.insurance_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create certifications table if not exists
CREATE TABLE IF NOT EXISTS care_connector.certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Clear existing data
DELETE FROM care_connector.care_types;
DELETE FROM care_connector.languages;
DELETE FROM care_connector.insurance_providers;
DELETE FROM care_connector.certifications;

-- Seed care_types
INSERT INTO care_connector.care_types (name, description, display_order, is_active) VALUES
('Senior Care', 'Specialized care for elderly individuals', 1, true),
('Child Care', 'Professional childcare and babysitting services', 2, true),
('Disability Support', 'Support for individuals with disabilities', 3, true),
('Post-Surgery Care', 'Recovery assistance after medical procedures', 4, true),
('Dementia Care', 'Specialized care for dementia and Alzheimer''s patients', 5, true),
('Palliative Care', 'Comfort care for serious illnesses', 6, true),
('Respite Care', 'Temporary relief for primary caregivers', 7, true),
('Home Health', 'Medical care provided at home', 8, true),
('Physical Therapy', 'Rehabilitation and physical therapy services', 9, true),
('Mental Health Support', 'Emotional and psychological support', 10, true);

-- Seed languages
INSERT INTO care_connector.languages (name, code, is_active) VALUES
('English', 'en', true),
('Spanish', 'es', true),
('Mandarin Chinese', 'zh', true),
('French', 'fr', true),
('Arabic', 'ar', true),
('Russian', 'ru', true),
('Portuguese', 'pt', true),
('German', 'de', true),
('Japanese', 'ja', true),
('Hindi', 'hi', true),
('Korean', 'ko', true),
('Vietnamese', 'vi', true),
('Italian', 'it', true),
('Tagalog', 'tl', true),
('Polish', 'pl', true);

-- Seed insurance_providers
INSERT INTO care_connector.insurance_providers (name, type, is_active) VALUES
('Medicare', 'Government', true),
('Medicaid', 'Government', true),
('Blue Cross Blue Shield', 'Private', true),
('Aetna', 'Private', true),
('UnitedHealth', 'Private', true),
('Humana', 'Private', true),
('Cigna', 'Private', true),
('Kaiser Permanente', 'Private', true),
('Anthem', 'Private', true),
('Centene', 'Private', true),
('Molina Healthcare', 'Private', true),
('WellCare', 'Private', true),
('Private Pay', 'Self-Pay', true),
('Veterans Affairs', 'Government', true),
('Workers Compensation', 'Other', true);

-- Seed certifications
INSERT INTO care_connector.certifications (name, category, is_active) VALUES
('Certified Nursing Assistant (CNA)', 'Medical', true),
('Registered Nurse (RN)', 'Medical', true),
('Licensed Practical Nurse (LPN)', 'Medical', true),
('Home Health Aide (HHA)', 'Medical', true),
('Physical Therapist (PT)', 'Therapy', true),
('Occupational Therapist (OT)', 'Therapy', true),
('Speech Therapist (SLP)', 'Therapy', true),
('CPR Certified', 'Safety', true),
('First Aid Certified', 'Safety', true),
('Dementia Care Certified', 'Specialized', true),
('Pediatric Care Certified', 'Specialized', true),
('Hospice Care Certified', 'Specialized', true),
('Medication Management', 'Medical', true),
('Wound Care Certified', 'Medical', true),
('IV Therapy Certified', 'Medical', true);
