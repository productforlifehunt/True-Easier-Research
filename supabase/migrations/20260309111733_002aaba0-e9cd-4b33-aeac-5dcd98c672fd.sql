
-- Add quota management and target participant columns to research_project
-- 添加配额管理和目标参与者列到研究项目表
ALTER TABLE care_connector.research_project
  ADD COLUMN IF NOT EXISTS quota_config jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_participants integer DEFAULT 100;
