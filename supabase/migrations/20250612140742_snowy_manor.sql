/*
  # Create Dummy Data for Sonar App

  1. New Data
    - Sample profiles with realistic user information
    - Social media accounts with verification status
    - User interests for better matching
    - Sample posts with engaging content
    - Message conversations between users

  2. Important Notes
    - This creates profiles that will be linked when users sign up
    - The test user profile will be created when someone signs up with test@sonar.app
    - All other profiles are standalone for demonstration purposes
*/

-- First, let's create some sample profiles that don't depend on auth.users
-- These will be used for the radar/discovery feature

-- Create sample user profiles (using email as the primary identifier for now)
-- These profiles will be linked to auth.users when users actually sign up

-- Insert sample posts first (these can exist independently)
INSERT INTO posts (id, user_id, title, caption, media_url, media_type, created_at) VALUES
  -- Sample posts with generated UUIDs
  (gen_random_uuid(), gen_random_uuid(), 'Sunset Coding Session', 'Nothing beats coding with a view! Working on my latest project while watching the sunset 🌅💻', 'https://picsum.photos/800/600?random=1', 'image', now() - interval '1 day'),
  (gen_random_uuid(), gen_random_uuid(), 'Mountain Hike Adventure', 'Reached the summit after a 6-hour hike! The view was absolutely worth it 🏔️', 'https://picsum.photos/800/600?random=2', 'image', now() - interval '2 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Digital Art Creation', 'Working on a new digital illustration. Love how the colors are coming together! 🎨✨', 'https://picsum.photos/800/600?random=4', 'image', now() - interval '3 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Morning Yoga Session', 'Starting the day with some peaceful yoga by the beach 🧘‍♀️🌊', 'https://picsum.photos/800/600?random=6', 'image', now() - interval '4 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Sustainable Fashion Look', 'Today''s outfit featuring sustainable fashion brands. Style with a conscience! 👗🌍', 'https://picsum.photos/800/600?random=8', 'image', now() - interval '5 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Homemade Pasta', 'Made fresh pasta from scratch today! The process is so therapeutic 🍝', 'https://picsum.photos/800/600?random=10', 'image', now() - interval '6 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Rock Climbing Adventure', 'Conquered this challenging route today! Nothing beats the adrenaline rush 🧗‍♂️', 'https://picsum.photos/800/600?random=12', 'image', now() - interval '7 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Portrait Session', 'Had an amazing portrait session today. Love capturing people''s authentic moments 📸', 'https://picsum.photos/800/600?random=14', 'image', now() - interval '8 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Gym Session Complete', 'Finished an intense workout session! Feeling stronger every day 💪', 'https://picsum.photos/800/600?random=16', 'image', now() - interval '9 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Studio Session', 'Working on some new tracks in the studio. The creative energy is flowing! 🎵', 'https://picsum.photos/800/600?random=18', 'image', now() - interval '10 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Startup Life', 'Another late night at the office, but loving every moment of building something new! 🚀', 'https://picsum.photos/800/600?random=20', 'image', now() - interval '11 days'),
  (gen_random_uuid(), gen_random_uuid(), 'New Camera Setup', 'Just got my new camera setup! Can''t wait to capture some amazing shots 📸', 'https://picsum.photos/800/600?random=3', 'image', now() - interval '12 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Coffee Shop Vibes', 'My favorite corner at the local coffee shop. Perfect spot for creative inspiration ☕', 'https://picsum.photos/800/600?random=5', 'image', now() - interval '13 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Plant-Based Breakfast', 'Delicious and nutritious plant-based breakfast to fuel the day! 🌱', 'https://picsum.photos/800/600?random=7', 'image', now() - interval '14 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Fashion Week Inspiration', 'So inspired by the latest fashion week trends! Already planning my next blog post ✨', 'https://picsum.photos/800/600?random=9', 'image', now() - interval '15 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Food Photography Setup', 'Behind the scenes of my latest food photography session 📸🍽️', 'https://picsum.photos/800/600?random=11', 'image', now() - interval '16 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Mountain Peak View', 'The view from 14,000 feet never gets old. Nature is incredible! 🏔️', 'https://picsum.photos/800/600?random=13', 'image', now() - interval '17 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Golden Hour Magic', 'Golden hour never disappoints! The lighting was absolutely perfect ✨', 'https://picsum.photos/800/600?random=15', 'image', now() - interval '18 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Healthy Meal Prep', 'Sunday meal prep done! Nutrition is key to reaching your fitness goals 🥗', 'https://picsum.photos/800/600?random=17', 'image', now() - interval '19 days'),
  (gen_random_uuid(), gen_random_uuid(), 'DJ Set Tonight', 'Getting ready for tonight''s set! Can''t wait to share these new beats 🎧', 'https://picsum.photos/800/600?random=19', 'image', now() - interval '20 days'),
  (gen_random_uuid(), gen_random_uuid(), 'Team Meeting', 'Great brainstorming session with the team today. Innovation never stops! 💡', 'https://picsum.photos/800/600?random=21', 'image', now() - interval '21 days')
ON CONFLICT DO NOTHING;

-- Create a function to handle new user registration and profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is our test user
  IF NEW.email = 'test@sonar.app' THEN
    INSERT INTO profiles (
      id, 
      email, 
      first_name, 
      last_name, 
      display_name, 
      bio, 
      avatar_url, 
      date_of_birth, 
      gender, 
      location
    ) VALUES (
      NEW.id,
      NEW.email,
      'Alex',
      'Johnson',
      'Alex Johnson',
      'Tech enthusiast & software developer 💻 | Love hiking and photography 📸',
      'https://i.pravatar.cc/300?img=1',
      '1995-06-15',
      'male',
      'San Francisco, CA'
    );
    
    -- Add social accounts for test user
    INSERT INTO social_accounts (user_id, provider, provider_url, is_verified, verified_at) VALUES
      (NEW.id, 'instagram', 'https://instagram.com/alexjohnson_dev', true, now()),
      (NEW.id, 'twitter', 'https://twitter.com/alexjohnson_dev', true, now()),
      (NEW.id, 'linkedin', 'https://linkedin.com/in/alexjohnson-dev', true, now());
    
    -- Add interests for test user
    INSERT INTO user_interests (user_id, interest) VALUES
      (NEW.id, 'Technology'),
      (NEW.id, 'Photography'),
      (NEW.id, 'Hiking'),
      (NEW.id, 'Coffee');
      
  ELSE
    -- For other users, create a basic profile
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      display_name,
      bio,
      avatar_url,
      date_of_birth,
      gender,
      location
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'bio', 'New to Sonar! 👋'),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/300?u=' || NEW.id),
      COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, '1990-01-01'),
      COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
      COALESCE(NEW.raw_user_meta_data->>'location', 'Unknown')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert some sample messages between random user IDs (these will be cleaned up when real users join)
-- For now, we'll create some sample conversations that can be used for testing
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  user4_id uuid := gen_random_uuid();
  user5_id uuid := gen_random_uuid();
BEGIN
  -- Insert sample messages for demonstration
  INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
    (user2_id, test_user_id, 'Hey! I saw your photography work, it''s amazing! 📸', false, now() - interval '2 hours'),
    (test_user_id, user2_id, 'Thank you so much! I love your digital art too, very inspiring! 🎨', true, now() - interval '1 hour 45 minutes'),
    (user2_id, test_user_id, 'Would you be interested in collaborating on a creative project sometime?', false, now() - interval '1 hour 30 minutes'),
    
    (user3_id, test_user_id, 'Hi! I noticed we both love hiking. Any favorite trails in the Bay Area?', false, now() - interval '3 hours'),
    (test_user_id, user3_id, 'Yes, I love the trails at Mount Tamalpais. The views are incredible!', true, now() - interval '2 hours 30 minutes'),
    
    (user4_id, test_user_id, 'Dude, your mountain photos are sick! What camera do you use?', false, now() - interval '4 hours'),
    (test_user_id, user4_id, 'Thanks! I use a Canon R5 with a 24-70mm lens. Perfect for outdoor adventures!', true, now() - interval '3 hours 45 minutes'),
    
    (user5_id, test_user_id, 'Fellow photographer here. Love your work! Would you be interested in a photo walk?', false, now() - interval '5 hours'),
    (test_user_id, user5_id, 'Thanks! I''d love to do a photo walk. Always great to learn from other photographers', true, now() - interval '4 hours 30 minutes');
END $$;