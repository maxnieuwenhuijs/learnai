-- Migration: Add is_company_prompt field to prompts table
-- Date: 2025-01-18

ALTER TABLE `prompts` 
ADD COLUMN `is_company_prompt` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Indicates if this is a company-wide prompt that requires approval' 
AFTER `is_template`;

-- Add index for better query performance
CREATE INDEX `idx_prompts_is_company_prompt` ON `prompts` (`is_company_prompt`);

-- Add index for company prompts with status
CREATE INDEX `idx_prompts_company_status` ON `prompts` (`is_company_prompt`, `status`);
