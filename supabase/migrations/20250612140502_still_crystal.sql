/*
  # Create Dummy Data for Testing

  1. Test Users
    - Creates sample user profiles with different genders, ages, and bios
    - Includes social account verifications
    - Adds user interests

  2. Sample Posts
    - Creates posts from different users
    - Uses placeholder images from Picsum

  3. Sample Messages
    - Creates conversation threads between users

  4. Test Login Credentials
    - Email: test@sonar.app
    - Password: password123
    - This user will have a complete profile with posts and social accounts
*/

-- Insert dummy profiles (these will be created when users sign up)
INSERT INTO profiles (id, email, first_name, last_name, display_name, bio, avatar_url, date_of_birth, gender, location) VALUES
  -- Test user for login
  ('550e8400-e29b-41d4-a716-446655440000', 'test@sonar.app', 'Alex', 'Johnson', 'Alex Johnson', 'Tech enthusiast & software developer 💻 | Love hiking and photography 📸', 'https://i.pravatar.cc/300?img=1', '1995-06-15', 'male', 'San Francisco, CA'),
  
  -- Female users
  ('550e8400-e29b-41d4-a716-446655440001', 'sarah.wilson@example.com', 'Sarah', 'Wilson', 'Sarah Wilson', 'Digital artist & illustrator 🎨 | Coffee lover ☕ | Always exploring new creative ideas ✨', 'https://i.pravatar.cc/300?img=2', '1993-03-22', 'female', 'New York, NY'),
  ('550e8400-e29b-41d4-a716-446655440002', 'emily.chen@example.com', 'Emily', 'Chen', 'Emily Chen', 'Yoga instructor & wellness coach 🧘‍♀️ | Plant-based lifestyle 🌱 | Spreading positive vibes', 'https://i.pravatar.cc/300?img=3', '1996-11-08', 'female', 'Los Angeles, CA'),
  ('550e8400-e29b-41d4-a716-446655440003', 'jessica.martinez@example.com', 'Jessica', 'Martinez', 'Jessica Martinez', 'Fashion blogger | Style consultant 👗 | Sustainable fashion advocate 🌍', 'https://i.pravatar.cc/300?img=4', '1994-09-12', 'female', 'Miami, FL'),
  ('550e8400-e29b-41d4-a716-446655440004', 'olivia.taylor@example.com', 'Olivia', 'Taylor', 'Olivia Taylor', 'Food photographer & recipe developer 📸 | Culinary school graduate 👩‍🍳 | Foodie at heart', 'https://i.pravatar.cc/300?img=5', '1997-01-30', 'female', 'Chicago, IL'),
  
  -- Male users
  ('550e8400-e29b-41d4-a716-446655440005', 'mike.davis@example.com', 'Mike', 'Davis', 'Mike Davis', 'Adventure seeker | Mountain climber 🏔️ | Weekend warrior exploring the great outdoors', 'https://i.pravatar.cc/300?img=6', '1992-07-18', 'male', 'Denver, CO'),
  ('550e8400-e29b-41d4-a716-446655440006', 'david.brown@example.com', 'David', 'Brown', 'David Brown', 'Professional photographer 📸 | Capturing life''s beautiful moments | Available for shoots', 'https://i.pravatar.cc/300?img=7', '1990-04-25', 'male', 'Seattle, WA'),
  ('550e8400-e29b-41d4-a716-446655440007', 'chris.anderson@example.com', 'Chris', 'Anderson', 'Chris Anderson', 'Fitness trainer & nutrition expert 💪 | Helping people achieve their health goals', 'https://i.pravatar.cc/300?img=8', '1991-12-03', 'male', 'Austin, TX'),
  ('550e8400-e29b-41d4-a716-446655440008', 'james.wilson@example.com', 'James', 'Wilson', 'James Wilson', 'Music producer & DJ 🎵 | Electronic music enthusiast | Always looking for new sounds', 'https://i.pravatar.cc/300?img=9', '1989-08-14', 'male', 'Nashville, TN'),
  ('550e8400-e29b-41d4-a716-446655440009', 'ryan.garcia@example.com', 'Ryan', 'Garcia', 'Ryan Garcia', 'Startup founder | Tech entrepreneur 🚀 | Building the future one app at a time', 'https://i.pravatar.cc/300?img=10', '1993-05-07', 'male', 'San Jose, CA')
ON CONFLICT (id) DO NOTHING;

-- Insert social accounts for test user and some others
INSERT INTO social_accounts (user_id, provider, provider_url, is_verified, verified_at) VALUES
  -- Test user social accounts (verified)
  ('550e8400-e29b-41d4-a716-446655440000', 'instagram', 'https://instagram.com/alexjohnson_dev', true, now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'twitter', 'https://twitter.com/alexjohnson_dev', true, now()),
  ('550e8400-e29b-41d4-a716-446655440000', 'linkedin', 'https://linkedin.com/in/alexjohnson-dev', true, now()),
  
  -- Sarah's social accounts
  ('550e8400-e29b-41d4-a716-446655440001', 'instagram', 'https://instagram.com/sarahwilson_art', true, now()),
  ('550e8400-e29b-41d4-a716-446655440001', 'twitter', 'https://twitter.com/sarahwilson_art', false, null),
  
  -- Emily's social accounts
  ('550e8400-e29b-41d4-a716-446655440002', 'instagram', 'https://instagram.com/emilychen_yoga', true, now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'linkedin', 'https://linkedin.com/in/emilychen-wellness', true, now()),
  
  -- Mike's social accounts
  ('550e8400-e29b-41d4-a716-446655440005', 'instagram', 'https://instagram.com/mikedavis_adventure', true, now()),
  ('550e8400-e29b-41d4-a716-446655440005', 'twitter', 'https://twitter.com/mikedavis_climb', true, now())
ON CONFLICT (user_id, provider) DO NOTHING;

-- Insert user interests
INSERT INTO user_interests (user_id, interest) VALUES
  -- Test user interests
  ('550e8400-e29b-41d4-a716-446655440000', 'Technology'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Photography'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Hiking'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Coffee'),
  
  -- Sarah's interests
  ('550e8400-e29b-41d4-a716-446655440001', 'Art'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Design'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Coffee'),
  
  -- Emily's interests
  ('550e8400-e29b-41d4-a716-446655440002', 'Yoga'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Wellness'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Nature'),
  
  -- Jessica's interests
  ('550e8400-e29b-41d4-a716-446655440003', 'Fashion'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Style'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Sustainability'),
  
  -- Olivia's interests
  ('550e8400-e29b-41d4-a716-446655440004', 'Food'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Photography'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Cooking'),
  
  -- Mike's interests
  ('550e8400-e29b-41d4-a716-446655440005', 'Adventure'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Hiking'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Rock Climbing'),
  
  -- David's interests
  ('550e8400-e29b-41d4-a716-446655440006', 'Photography'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Art'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Travel'),
  
  -- Chris's interests
  ('550e8400-e29b-41d4-a716-446655440007', 'Fitness'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Nutrition'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Health'),
  
  -- James's interests
  ('550e8400-e29b-41d4-a716-446655440008', 'Music'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Technology'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Electronic Music'),
  
  -- Ryan's interests
  ('550e8400-e29b-41d4-a716-446655440009', 'Technology'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Entrepreneurship'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Innovation')
ON CONFLICT (user_id, interest) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (user_id, title, caption, media_url, media_type) VALUES
  -- Test user posts
  ('550e8400-e29b-41d4-a716-446655440000', 'Sunset Coding Session', 'Nothing beats coding with a view! Working on my latest project while watching the sunset 🌅💻', 'https://picsum.photos/800/600?random=1', 'image'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Mountain Hike Adventure', 'Reached the summit after a 6-hour hike! The view was absolutely worth it 🏔️', 'https://picsum.photos/800/600?random=2', 'image'),
  ('550e8400-e29b-41d4-a716-446655440000', 'New Camera Setup', 'Just got my new camera setup! Can''t wait to capture some amazing shots 📸', 'https://picsum.photos/800/600?random=3', 'image'),
  
  -- Sarah's posts
  ('550e8400-e29b-41d4-a716-446655440001', 'Digital Art Creation', 'Working on a new digital illustration. Love how the colors are coming together! 🎨✨', 'https://picsum.photos/800/600?random=4', 'image'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Coffee Shop Vibes', 'My favorite corner at the local coffee shop. Perfect spot for creative inspiration ☕', 'https://picsum.photos/800/600?random=5', 'image'),
  
  -- Emily's posts
  ('550e8400-e29b-41d4-a716-446655440002', 'Morning Yoga Session', 'Starting the day with some peaceful yoga by the beach 🧘‍♀️🌊', 'https://picsum.photos/800/600?random=6', 'image'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Plant-Based Breakfast', 'Delicious and nutritious plant-based breakfast to fuel the day! 🌱', 'https://picsum.photos/800/600?random=7', 'image'),
  
  -- Jessica's posts
  ('550e8400-e29b-41d4-a716-446655440003', 'Sustainable Fashion Look', 'Today''s outfit featuring sustainable fashion brands. Style with a conscience! 👗🌍', 'https://picsum.photos/800/600?random=8', 'image'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Fashion Week Inspiration', 'So inspired by the latest fashion week trends! Already planning my next blog post ✨', 'https://picsum.photos/800/600?random=9', 'image'),
  
  -- Olivia's posts
  ('550e8400-e29b-41d4-a716-446655440004', 'Homemade Pasta', 'Made fresh pasta from scratch today! The process is so therapeutic 🍝', 'https://picsum.photos/800/600?random=10', 'image'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Food Photography Setup', 'Behind the scenes of my latest food photography session 📸🍽️', 'https://picsum.photos/800/600?random=11', 'image'),
  
  -- Mike's posts
  ('550e8400-e29b-41d4-a716-446655440005', 'Rock Climbing Adventure', 'Conquered this challenging route today! Nothing beats the adrenaline rush 🧗‍♂️', 'https://picsum.photos/800/600?random=12', 'image'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Mountain Peak View', 'The view from 14,000 feet never gets old. Nature is incredible! 🏔️', 'https://picsum.photos/800/600?random=13', 'image'),
  
  -- David's posts
  ('550e8400-e29b-41d4-a716-446655440006', 'Portrait Session', 'Had an amazing portrait session today. Love capturing people''s authentic moments 📸', 'https://picsum.photos/800/600?random=14', 'image'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Golden Hour Magic', 'Golden hour never disappoints! The lighting was absolutely perfect ✨', 'https://picsum.photos/800/600?random=15', 'image'),
  
  -- Chris's posts
  ('550e8400-e29b-41d4-a716-446655440007', 'Gym Session Complete', 'Finished an intense workout session! Feeling stronger every day 💪', 'https://picsum.photos/800/600?random=16', 'image'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Healthy Meal Prep', 'Sunday meal prep done! Nutrition is key to reaching your fitness goals 🥗', 'https://picsum.photos/800/600?random=17', 'image'),
  
  -- James's posts
  ('550e8400-e29b-41d4-a716-446655440008', 'Studio Session', 'Working on some new tracks in the studio. The creative energy is flowing! 🎵', 'https://picsum.photos/800/600?random=18', 'image'),
  ('550e8400-e29b-41d4-a716-446655440008', 'DJ Set Tonight', 'Getting ready for tonight''s set! Can''t wait to share these new beats 🎧', 'https://picsum.photos/800/600?random=19', 'image'),
  
  -- Ryan's posts
  ('550e8400-e29b-41d4-a716-446655440009', 'Startup Life', 'Another late night at the office, but loving every moment of building something new! 🚀', 'https://picsum.photos/800/600?random=20', 'image'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Team Meeting', 'Great brainstorming session with the team today. Innovation never stops! 💡', 'https://picsum.photos/800/600?random=21', 'image')
ON CONFLICT DO NOTHING;

-- Insert sample messages (conversations between users)
INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
  -- Conversation between test user and Sarah
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Hey Alex! I saw your photography work, it''s amazing! 📸', false, now() - interval '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Thank you so much Sarah! I love your digital art too, very inspiring! 🎨', true, now() - interval '1 hour 45 minutes'),
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Would you be interested in collaborating on a creative project sometime?', false, now() - interval '1 hour 30 minutes'),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Absolutely! I''d love to combine photography with your digital art style', true, now() - interval '1 hour 15 minutes'),
  
  -- Conversation between test user and Emily
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Hi Alex! I noticed we both love hiking. Any favorite trails in the Bay Area?', false, now() - interval '3 hours'),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Hey Emily! Yes, I love the trails at Mount Tamalpais. The views are incredible!', true, now() - interval '2 hours 30 minutes'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'That sounds amazing! I''ve been wanting to check that out. Maybe we could hike together sometime?', false, now() - interval '2 hours'),
  
  -- Conversation between test user and Mike
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Dude, your mountain photos are sick! What camera do you use?', false, now() - interval '4 hours'),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Thanks man! I use a Canon R5 with a 24-70mm lens. Perfect for outdoor adventures!', true, now() - interval '3 hours 45 minutes'),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Nice setup! I''ve been thinking about upgrading my gear. Any other lens recommendations?', false, now() - interval '3 hours 30 minutes'),
  
  -- Conversation between test user and David
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Hey Alex! Fellow photographer here. Love your work! Would you be interested in a photo walk sometime?', false, now() - interval '5 hours'),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', 'Hey David! Thanks! I''d love to do a photo walk. Always great to learn from other photographers', true, now() - interval '4 hours 30 minutes'),
  
  -- Conversation between test user and Ryan
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'Alex! I see you''re into tech. What kind of projects are you working on?', false, now() - interval '6 hours'),
  ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440009', 'Hey Ryan! I''m working on a social app actually. Always interested in the startup world!', true, now() - interval '5 hours 45 minutes'),
  ('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'That''s awesome! I''d love to hear more about it. Maybe we could grab coffee and chat?', false, now() - interval '5 hours 30 minutes')
ON CONFLICT DO NOTHING;