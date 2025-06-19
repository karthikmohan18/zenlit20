/*
  # Add cover photo URL column to profiles table

  1. Changes
    - Add `cover_photo_url` column to profiles table
    - Column is optional (nullable) to allow existing users without cover photos

  2. Security
    - No changes to RLS policies needed
    - Existing policies will cover the new column
*/

-- Add cover_photo_url column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url text;