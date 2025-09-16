-- Add certificate_settings column to courses table
-- This column will store JSON data for certificate configuration

ALTER TABLE `courses` 
ADD COLUMN `certificate_settings` JSON NULL 
AFTER `created_by`;

-- Add comment to document the column purpose
ALTER TABLE `courses` 
MODIFY COLUMN `certificate_settings` JSON NULL 
COMMENT 'JSON data containing certificate configuration settings for this course';
