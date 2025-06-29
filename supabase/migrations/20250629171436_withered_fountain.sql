/*
  # Add missing view_count column to public_cv_links table
  
  This migration adds the view_count column that may be missing from the public_cv_links table.
  This is a safe operation that checks if the column exists before adding it.
  
  1. Changes
    - Add view_count column to public_cv_links table if it doesn't exist
    - Set default value to 0
    - Update any existing records to have view_count = 0
*/

-- Add view_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'public_cv_links' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE public_cv_links ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;

-- Ensure all existing records have view_count = 0 if they were null
UPDATE public_cv_links SET view_count = 0 WHERE view_count IS NULL;