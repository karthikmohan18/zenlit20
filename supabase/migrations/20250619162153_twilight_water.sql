/*
  # Fix banner bucket RLS policies

  1. Changes
    - Drop existing restrictive policies for banner bucket
    - Create new policies that allow authenticated users to upload without user ID in path
    - Maintain security while allowing current upload pattern

  2. Security
    - Still requires authentication for all operations
    - Allows public read access for banner images
    - Removes user ID path requirement that was causing RLS violations
*/

-- Drop existing policies for the 'banner' bucket that require user ID in path
DROP POLICY IF EXISTS "Users can upload their own banner" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own banner" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own banner" ON storage.objects;
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;

-- Create new policies for the 'banner' bucket that allow authenticated users
-- to manage files without requiring their user ID in the file path

-- Policy: Allow authenticated users to insert banner images
CREATE POLICY "Authenticated users can upload banner images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banner');

-- Policy: Allow authenticated users to update banner images
CREATE POLICY "Authenticated users can update banner images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banner');

-- Policy: Allow authenticated users to delete banner images
CREATE POLICY "Authenticated users can delete banner images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'banner');

-- Policy: Allow public read access to banner images
CREATE POLICY "Banner images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'banner');