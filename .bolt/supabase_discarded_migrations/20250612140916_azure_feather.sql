/*
  # Create Sample Data and User Registration Handler

  1. New Functions
    - `handle_new_user()` - Creates profile when user signs up
    - Sample data that doesn't depend on foreign keys
  
  2. Security
    - Trigger for automatic profile creation
    - Test user gets full profile with social accounts
*/

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
      
    -- Add some sample posts for the test user
    INSERT INTO posts (user_id, title, caption, media_url, media_type, created_at) VALUES
      (NEW.id, 'Sunset Coding Session', 'Nothing beats coding with a view! Working on my latest project while watching the sunset 🌅💻', 'https://picsum.photos/800/600?random=1', 'image', now() - interval '1 day'),
      (NEW.id, 'Mountain Hike Adventure', 'Reached the summit after a 6-hour hike! The view was absolutely worth it 🏔️', 'https://picsum.photos/800/600?random=2', 'image', now() - interval '2 days'),
      (NEW.id, 'New Camera Setup', 'Just got my new camera setup! Can''t wait to capture some amazing shots 📸', 'https://picsum.photos/800/600?random=3', 'image', now() - interval '3 days');
      
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

-- Create some demo profiles that can be used for discovery/radar
-- These are standalone profiles not tied to auth.users (for demo purposes)
DO $$
DECLARE
  demo_user_1 uuid := '550e8400-e29b-41d4-a716-446655440001';
  demo_user_2 uuid := '550e8400-e29b-41d4-a716-446655440002';
  demo_user_3 uuid := '550e8400-e29b-41d4-a716-446655440003';
  demo_user_4 uuid := '550e8400-e29b-41d4-a716-446655440004';
  demo_user_5 uuid := '550e8400-e29b-41d4-a716-446655440005';
  demo_user_6 uuid := '550e8400-e29b-41d4-a716-446655440006';
  demo_user_7 uuid := '550e8400-e29b-41d4-a716-446655440007';
  demo_user_8 uuid := '550e8400-e29b-41d4-a716-446655440008';
  demo_user_9 uuid := '550e8400-e29b-41d4-a716-446655440009';
  demo_user_10 uuid := '550e8400-e29b-41d4-a716-446655440010';
BEGIN
  -- Insert demo profiles (these won't have auth.users entries, just for discovery)
  INSERT INTO profiles (id, email, first_name, last_name, display_name, bio, avatar_url, date_of_birth, gender, location) VALUES
    (demo_user_1, 'sarah.wilson@demo.com', 'Sarah', 'Wilson', 'Sarah Wilson', 'Digital artist & illustrator 🎨 | Coffee lover ☕ | Always exploring new creative ideas ✨', 'https://i.pravatar.cc/300?img=2', '1993-03-22', 'female', 'New York, NY'),
    (demo_user_2, 'emily.chen@demo.com', 'Emily', 'Chen', 'Emily Chen', 'Yoga instructor & wellness coach 🧘‍♀️ | Plant-based lifestyle 🌱 | Spreading positive vibes', 'https://i.pravatar.cc/300?img=3', '1996-11-08', 'female', 'Los Angeles, CA'),
    (demo_user_3, 'jessica.martinez@demo.com', 'Jessica', 'Martinez', 'Jessica Martinez', 'Fashion blogger | Style consultant 👗 | Sustainable fashion advocate 🌍', 'https://i.pravatar.cc/300?img=4', '1994-09-12', 'female', 'Miami, FL'),
    (demo_user_4, 'olivia.taylor@demo.com', 'Olivia', 'Taylor', 'Olivia Taylor', 'Food photographer & recipe developer 📸 | Culinary school graduate 👩‍🍳 | Foodie at heart', 'https://i.pravatar.cc/300?img=5', '1997-01-30', 'female', 'Chicago, IL'),
    (demo_user_5, 'mike.davis@demo.com', 'Mike', 'Davis', 'Mike Davis', 'Adventure seeker | Mountain climber 🏔️ | Weekend warrior exploring the great outdoors', 'https://i.pravatar.cc/300?img=6', '1992-07-18', 'male', 'Denver, CO'),
    (demo_user_6, 'david.brown@demo.com', 'David', 'Brown', 'David Brown', 'Professional photographer 📸 | Capturing life''s beautiful moments | Available for shoots', 'https://i.pravatar.cc/300?img=7', '1990-04-25', 'male', 'Seattle, WA'),
    (demo_user_7, 'chris.anderson@demo.com', 'Chris', 'Anderson', 'Chris Anderson', 'Fitness trainer & nutrition expert 💪 | Helping people achieve their health goals', 'https://i.pravatar.cc/300?img=8', '1991-12-03', 'male', 'Austin, TX'),
    (demo_user_8, 'james.wilson@demo.com', 'James', 'Wilson', 'James Wilson', 'Music producer & DJ 🎵 | Electronic music enthusiast | Always looking for new sounds', 'https://i.pravatar.cc/300?img=9', '1989-08-14', 'male', 'Nashville, TN'),
    (demo_user_9, 'ryan.garcia@demo.com', 'Ryan', 'Garcia', 'Ryan Garcia', 'Startup founder | Tech entrepreneur 🚀 | Building the future one app at a time', 'https://i.pravatar.cc/300?img=10', '1993-05-07', 'male', 'San Jose, CA'),
    (demo_user_10, 'maya.patel@demo.com', 'Maya', 'Patel', 'Maya Patel', 'UX Designer & creative thinker 🎨 | Making digital experiences more human ✨', 'https://i.pravatar.cc/300?img=11', '1995-12-18', 'female', 'Portland, OR')
  ON CONFLICT (id) DO NOTHING;

  -- Add social accounts for some demo users
  INSERT INTO social_accounts (user_id, provider, provider_url, is_verified, verified_at) VALUES
    (demo_user_1, 'instagram', 'https://instagram.com/sarahwilson_art', true, now()),
    (demo_user_1, 'twitter', 'https://twitter.com/sarahwilson_art', false, null),
    (demo_user_2, 'instagram', 'https://instagram.com/emilychen_yoga', true, now()),
    (demo_user_2, 'linkedin', 'https://linkedin.com/in/emilychen-wellness', true, now()),
    (demo_user_5, 'instagram', 'https://instagram.com/mikedavis_adventure', true, now()),
    (demo_user_5, 'twitter', 'https://twitter.com/mikedavis_climb', true, now()),
    (demo_user_6, 'instagram', 'https://instagram.com/davidbrown_photo', true, now()),
    (demo_user_9, 'linkedin', 'https://linkedin.com/in/ryangarcia-startup', true, now()),
    (demo_user_10, 'linkedin', 'https://linkedin.com/in/mayapatel-ux', true, now())
  ON CONFLICT (user_id, provider) DO NOTHING;

  -- Add interests for demo users
  INSERT INTO user_interests (user_id, interest) VALUES
    (demo_user_1, 'Art'), (demo_user_1, 'Design'), (demo_user_1, 'Coffee'),
    (demo_user_2, 'Yoga'), (demo_user_2, 'Wellness'), (demo_user_2, 'Nature'),
    (demo_user_3, 'Fashion'), (demo_user_3, 'Style'), (demo_user_3, 'Sustainability'),
    (demo_user_4, 'Food'), (demo_user_4, 'Photography'), (demo_user_4, 'Cooking'),
    (demo_user_5, 'Adventure'), (demo_user_5, 'Hiking'), (demo_user_5, 'Rock Climbing'),
    (demo_user_6, 'Photography'), (demo_user_6, 'Art'), (demo_user_6, 'Travel'),
    (demo_user_7, 'Fitness'), (demo_user_7, 'Nutrition'), (demo_user_7, 'Health'),
    (demo_user_8, 'Music'), (demo_user_8, 'Technology'), (demo_user_8, 'Electronic Music'),
    (demo_user_9, 'Technology'), (demo_user_9, 'Entrepreneurship'), (demo_user_9, 'Innovation'),
    (demo_user_10, 'Design'), (demo_user_10, 'Technology'), (demo_user_10, 'UX')
  ON CONFLICT (user_id, interest) DO NOTHING;

  -- Add sample posts for demo users
  INSERT INTO posts (user_id, title, caption, media_url, media_type, created_at) VALUES
    (demo_user_1, 'Digital Art Creation', 'Working on a new digital illustration. Love how the colors are coming together! 🎨✨', 'https://picsum.photos/800/600?random=4', 'image', now() - interval '3 days'),
    (demo_user_1, 'Coffee Shop Vibes', 'My favorite corner at the local coffee shop. Perfect spot for creative inspiration ☕', 'https://picsum.photos/800/600?random=5', 'image', now() - interval '13 days'),
    
    (demo_user_2, 'Morning Yoga Session', 'Starting the day with some peaceful yoga by the beach 🧘‍♀️🌊', 'https://picsum.photos/800/600?random=6', 'image', now() - interval '4 days'),
    (demo_user_2, 'Plant-Based Breakfast', 'Delicious and nutritious plant-based breakfast to fuel the day! 🌱', 'https://picsum.photos/800/600?random=7', 'image', now() - interval '14 days'),
    
    (demo_user_3, 'Sustainable Fashion Look', 'Today''s outfit featuring sustainable fashion brands. Style with a conscience! 👗🌍', 'https://picsum.photos/800/600?random=8', 'image', now() - interval '5 days'),
    (demo_user_3, 'Fashion Week Inspiration', 'So inspired by the latest fashion week trends! Already planning my next blog post ✨', 'https://picsum.photos/800/600?random=9', 'image', now() - interval '15 days'),
    
    (demo_user_4, 'Homemade Pasta', 'Made fresh pasta from scratch today! The process is so therapeutic 🍝', 'https://picsum.photos/800/600?random=10', 'image', now() - interval '6 days'),
    (demo_user_4, 'Food Photography Setup', 'Behind the scenes of my latest food photography session 📸🍽️', 'https://picsum.photos/800/600?random=11', 'image', now() - interval '16 days'),
    
    (demo_user_5, 'Rock Climbing Adventure', 'Conquered this challenging route today! Nothing beats the adrenaline rush 🧗‍♂️', 'https://picsum.photos/800/600?random=12', 'image', now() - interval '7 days'),
    (demo_user_5, 'Mountain Peak View', 'The view from 14,000 feet never gets old. Nature is incredible! 🏔️', 'https://picsum.photos/800/600?random=13', 'image', now() - interval '17 days'),
    
    (demo_user_6, 'Portrait Session', 'Had an amazing portrait session today. Love capturing people''s authentic moments 📸', 'https://picsum.photos/800/600?random=14', 'image', now() - interval '8 days'),
    (demo_user_6, 'Golden Hour Magic', 'Golden hour never disappoints! The lighting was absolutely perfect ✨', 'https://picsum.photos/800/600?random=15', 'image', now() - interval '18 days'),
    
    (demo_user_7, 'Gym Session Complete', 'Finished an intense workout session! Feeling stronger every day 💪', 'https://picsum.photos/800/600?random=16', 'image', now() - interval '9 days'),
    (demo_user_7, 'Healthy Meal Prep', 'Sunday meal prep done! Nutrition is key to reaching your fitness goals 🥗', 'https://picsum.photos/800/600?random=17', 'image', now() - interval '19 days'),
    
    (demo_user_8, 'Studio Session', 'Working on some new tracks in the studio. The creative energy is flowing! 🎵', 'https://picsum.photos/800/600?random=18', 'image', now() - interval '10 days'),
    (demo_user_8, 'DJ Set Tonight', 'Getting ready for tonight''s set! Can''t wait to share these new beats 🎧', 'https://picsum.photos/800/600?random=19', 'image', now() - interval '20 days'),
    
    (demo_user_9, 'Startup Life', 'Another late night at the office, but loving every moment of building something new! 🚀', 'https://picsum.photos/800/600?random=20', 'image', now() - interval '11 days'),
    (demo_user_9, 'Team Meeting', 'Great brainstorming session with the team today. Innovation never stops! 💡', 'https://picsum.photos/800/600?random=21', 'image', now() - interval '21 days'),
    
    (demo_user_10, 'UX Design Process', 'Working on user flows for a new mobile app. Love solving complex design problems! 🎨', 'https://picsum.photos/800/600?random=22', 'image', now() - interval '12 days'),
    (demo_user_10, 'Design Inspiration', 'Found some amazing design inspiration today. Can''t wait to incorporate these ideas! ✨', 'https://picsum.photos/800/600?random=23', 'image', now() - interval '22 days')
  ON CONFLICT DO NOTHING;

END $$;