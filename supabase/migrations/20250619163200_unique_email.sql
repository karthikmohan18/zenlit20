/*
  # Add unique constraint on profiles.email

  1. Changes
    - Ensure email addresses are unique
    - Update trigger function to handle email conflicts

  2. Security
    - Maintains existing RLS policies
*/

-- Add unique constraint on email
ALTER TABLE profiles
  ADD CONSTRAINT IF NOT EXISTS profiles_email_unique UNIQUE (email);

-- Update handle_new_user to gracefully ignore duplicate emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  RAISE LOG 'Creating profile for user: % with email: %', NEW.id, NEW.email;

  base_username := 'user_' || LOWER(SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8));
  final_username := public.generate_unique_username(base_username);

  INSERT INTO public.profiles (
    id,
    name,
    username,
    email,
    bio,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'first_name',
      split_part(NEW.email, '@', 1),
      'New User'
    ),
    final_username,
    NEW.email,
    'New to Zenlit! \ud83d\udc4b',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = CASE
      WHEN profiles.name IS NULL OR profiles.name = '' THEN EXCLUDED.name
      ELSE profiles.name
    END,
    username = CASE
      WHEN profiles.username IS NULL OR profiles.username = '' THEN EXCLUDED.username
      ELSE profiles.username
    END,
    email = CASE
      WHEN profiles.email IS NULL OR profiles.email = '' THEN EXCLUDED.email
      ELSE profiles.email
    END,
    bio = CASE
      WHEN profiles.bio IS NULL OR profiles.bio = '' THEN EXCLUDED.bio
      ELSE profiles.bio
    END,
    updated_at = now();

  RAISE LOG 'Profile created/updated successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE LOG 'Unique constraint violation for user %: %', NEW.id, SQLERRM;
    BEGIN
      INSERT INTO public.profiles (id, email, created_at)
      VALUES (NEW.id, NEW.email, now())
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    BEGIN
      INSERT INTO public.profiles (id, email, created_at)
      VALUES (NEW.id, NEW.email, now())
      ON CONFLICT DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Failed to create minimal profile for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reattach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
