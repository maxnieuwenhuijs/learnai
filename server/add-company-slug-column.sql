-- Add slug column to companies table for existing databases
-- This script adds the new slug column for subdomain functionality

USE db;

-- Add slug column to companies table
ALTER TABLE companies 
ADD COLUMN slug VARCHAR(100) NULL AFTER name;

-- Add unique index on slug column
ALTER TABLE companies 
ADD CONSTRAINT unique_company_slug UNIQUE (slug);

-- Update existing companies with generated slugs
-- This will generate slugs for any existing companies
UPDATE companies 
SET slug = LOWER(
    TRIM(BOTH '-' FROM 
        REGEXP_REPLACE(
            REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s-]', ''), 
            '\\s+', 
            '-'
        )
    )
)
WHERE slug IS NULL;

-- Make slug column NOT NULL after updating existing records
ALTER TABLE companies 
MODIFY COLUMN slug VARCHAR(100) NOT NULL;

-- Verify the update
SELECT id, name, slug FROM companies;