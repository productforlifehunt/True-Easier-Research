-- Comprehensive seed data for Humans for Hire platform
-- Covers all service categories with realistic helpers

-- Insert diverse helpers for Rent-a-Friend
INSERT INTO care_connector.hfh_helpers (name, email, phone, location, bio, hourly_rate, services, availability, verified, background_check_status, rating, total_reviews, years_experience, languages, response_time_hours, instant_book, profile_image_url)
VALUES
('Sarah Chen', 'sarah.chen@email.com', '555-0101', 'New York, NY', 'Hey! I love meeting new people and exploring the city. Whether you need a friend for events, activities, or just want to grab coffee and chat, I''m here! I''m into art, food tours, and outdoor adventures.', 35, '["rent-a-friend", "tour-guide"]', '{"weekdays": true, "weekends": true, "evenings": true}', true, 'approved', 4.9, 127, 3, '["English", "Mandarin"]', 1, true, 'https://i.pravatar.cc/300?img=1'),

('Marcus Thompson', 'marcus.t@email.com', '555-0102', 'Los Angeles, CA', 'Professional companion for all occasions! From weddings to concerts, sporting events to casual hangouts. I''m friendly, reliable, and always bring positive energy. Let''s make great memories!', 40, '["rent-a-friend"]', '{"weekdays": true, "weekends": true, "flexible": true}', true, 'approved', 4.8, 89, 5, '["English", "Spanish"]', 2, true, 'https://i.pravatar.cc/300?img=2'),

('Emma Rodriguez', 'emma.r@email.com', '555-0103', 'Chicago, IL', 'Your virtual friend and activity partner! I''m great at online gaming, video calls, and digital hangouts. Also love in-person activities like movies, dining, and exploring new places.', 30, '["rent-a-friend"]', '{"weekdays": true, "evenings": true, "flexible": true}', true, 'approved', 4.9, 156, 2, '["English", "Spanish"]', 1, true, 'https://i.pravatar.cc/300?img=3'),

-- Tour & Local Guides
('Jake Morrison', 'jake.m@email.com', '555-0104', 'San Francisco, CA', 'Born and raised in SF! I know every hidden gem, best viewpoint, and local secret. From tech tours to food adventures, I''ll show you the real San Francisco. 8+ years guiding experience.', 50, '["tour-guide"]', '{"weekdays": true, "weekends": true}', true, 'approved', 5.0, 203, 8, '["English", "French"]', 2, true, 'https://i.pravatar.cc/300?img=4'),

('Priya Patel', 'priya.p@email.com', '555-0105', 'New York, NY', 'Cultural tour specialist! Museums, art galleries, historic sites - I bring NYC''s culture to life. Former museum docent with a passion for storytelling and history.', 45, '["tour-guide"]', '{"weekdays": true, "weekends": true}', true, 'approved', 4.9, 178, 6, '["English", "Hindi", "Gujarati"]', 1, true, 'https://i.pravatar.cc/300?img=5'),

-- Errand Services
('David Kim', 'david.k@email.com', '555-0106', 'Los Angeles, CA', 'Your reliable errand runner! Groceries, prescriptions, packages - I handle it all efficiently. Former courier with 5 years experience. I treat your errands like they''re my own.', 25, '["errand-services"]', '{"weekdays": true, "weekends": true, "same-day": true}', true, 'approved', 4.8, 342, 5, '["English", "Korean"]', 1, true, 'https://i.pravatar.cc/300?img=6'),

('Lisa Martinez', 'lisa.m@email.com', '555-0107', 'Houston, TX', 'Professional errand service with a smile! Specializing in grocery shopping, pharmacy runs, and package handling. I''m detail-oriented, fast, and always on time.', 28, '["errand-services"]', '{"weekdays": true, "flexible": true}', true, 'approved', 4.9, 267, 4, '["English", "Spanish"]', 2, true, 'https://i.pravatar.cc/300?img=7'),

-- Pet Care
('Alex Cooper', 'alex.c@email.com', '555-0108', 'Seattle, WA', 'Certified dog walker and pet lover! 7 years experience with all breeds and sizes. Your furry friends will get all the love, exercise, and attention they deserve. CPR certified for pets.', 35, '["pet-care"]', '{"weekdays": true, "weekends": true, "flexible": true}', true, 'approved', 5.0, 412, 7, '["English"]', 1, true, 'https://i.pravatar.cc/300?img=8'),

('Maria Santos', 'maria.s@email.com', '555-0109', 'Miami, FL', 'Professional pet sitter and groomer. I offer overnight boarding, daily visits, and grooming services. Your pets will be safe, happy, and well-cared for in a loving environment.', 32, '["pet-care"]', '{"weekdays": true, "weekends": true, "overnight": true}', true, 'approved', 4.9, 298, 6, '["English", "Spanish", "Portuguese"]', 2, true, 'https://i.pravatar.cc/300?img=9'),

-- Virtual Assistant
('Jennifer Wu', 'jennifer.w@email.com', '555-0110', 'Austin, TX', 'Experienced virtual assistant specializing in admin support, scheduling, and research. I help busy professionals stay organized and productive. 5+ years in executive assistance.', 40, '["virtual-assistant"]', '{"weekdays": true, "flexible": true, "remote": true}', true, 'approved', 4.9, 187, 5, '["English", "Mandarin"]', 3, true, 'https://i.pravatar.cc/300?img=10'),

('Robert Johnson', 'robert.j@email.com', '555-0111', 'Boston, MA', 'Tech-savvy VA with expertise in social media management, data entry, and customer service. I''m reliable, efficient, and detail-oriented. Let me handle your tasks!', 38, '["virtual-assistant"]', '{"weekdays": true, "evenings": true, "remote": true}', true, 'approved', 4.8, 156, 4, '["English"]', 2, true, 'https://i.pravatar.cc/300?img=11'),

-- Childcare
('Amanda Brooks', 'amanda.b@email.com', '555-0112', 'Portland, OR', 'Certified childcare provider with 10+ years experience. I create fun, safe, educational experiences for children of all ages. CPR and First Aid certified. References available.', 45, '["childcare"]', '{"weekdays": true, "weekends": true, "evenings": true}', true, 'approved', 5.0, 324, 10, '["English"]', 2, true, 'https://i.pravatar.cc/300?img=12'),

-- Senior Care
('Grace Williams', 'grace.w@email.com', '555-0113', 'Philadelphia, PA', 'Compassionate senior care specialist. I provide companionship, meal prep, medication reminders, and light housekeeping. Certified caregiver with 8 years experience. I treat every client like family.', 42, '["senior-care"]', '{"weekdays": true, "weekends": true, "overnight": true}', true, 'approved', 5.0, 276, 8, '["English"]', 2, true, 'https://i.pravatar.cc/300?img=13'),

-- Housekeeping
('Carlos Mendez', 'carlos.m@email.com', '555-0114', 'Phoenix, AZ', 'Professional house cleaner with attention to detail. Deep cleaning, regular maintenance, organization - I do it all. Eco-friendly products available. 6 years experience, fully insured.', 35, '["housekeeping"]', '{"weekdays": true, "weekends": true}', true, 'approved', 4.9, 234, 6, '["English", "Spanish"]', 2, true, 'https://i.pravatar.cc/300?img=14'),

-- Handyman
('Mike Anderson', 'mike.a@email.com', '555-0115', 'Denver, CO', 'Licensed handyman for all your home repair needs. Furniture assembly, mounting, painting, minor repairs - I''ve got you covered. 12 years experience, fully licensed and insured.', 55, '["handyman"]', '{"weekdays": true, "weekends": true}', true, 'approved', 4.9, 412, 12, '["English"]', 3, true, 'https://i.pravatar.cc/300?img=15'),

-- Moving Help
('James Taylor', 'james.t@email.com', '555-0116', 'Atlanta, GA', 'Strong, reliable moving help. Packing, loading, unloading, furniture moving - no job too big or small. I''m careful with your belongings and work efficiently. 5 years moving experience.', 40, '["moving-help"]', '{"weekdays": true, "weekends": true, "same-day": true}', true, 'approved', 4.8, 198, 5, '["English"]', 2, true, 'https://i.pravatar.cc/300?img=16'),

-- Personal Training
('Olivia Harris', 'olivia.h@email.com', '555-0117', 'San Diego, CA', 'Certified personal trainer specializing in weight loss, strength training, and functional fitness. I create custom programs based on your goals. NASM certified, nutrition coaching included.', 60, '["personal-training"]', '{"weekdays": true, "weekends": true, "early-morning": true}', true, 'approved', 5.0, 167, 7, '["English", "Spanish"]', 2, true, 'https://i.pravatar.cc/300?img=17'),

-- Additional diverse helpers across multiple services
('Tyler Jackson', 'tyler.j@email.com', '555-0118', 'Nashville, TN', 'Multi-service helper! I do errands, pet care, and handyman work. Jack of all trades with a can-do attitude. Reliable, affordable, and always professional.', 32, '["errand-services", "pet-care", "handyman"]', '{"weekdays": true, "weekends": true}', true, 'approved', 4.7, 145, 4, '["English"]', 3, false, 'https://i.pravatar.cc/300?img=18'),

('Nina Kowalski', 'nina.k@email.com', '555-0119', 'Minneapolis, MN', 'Event companion and tour guide! I love making events more fun and showing visitors around our beautiful city. Friendly, outgoing, and always punctual.', 38, '["rent-a-friend", "tour-guide"]', '{"weekdays": false, "weekends": true, "evenings": true}', true, 'approved', 4.8, 92, 3, '["English", "Polish"]', 2, true, 'https://i.pravatar.cc/300?img=19'),

('Hassan Ahmed', 'hassan.a@email.com', '555-0120', 'Detroit, MI', 'Virtual assistant and tech support specialist. I help with computers, smartphones, smart home setup, and online tasks. Patient, knowledgeable, and great with seniors.', 42, '["virtual-assistant", "tech-support"]', '{"weekdays": true, "remote": true}', true, 'approved', 4.9, 178, 6, '["English", "Arabic"]', 2, true, 'https://i.pravatar.cc/300?img=20');

-- Add some stats data
INSERT INTO care_connector.hfh_clients (name, email, phone, location, created_at)
VALUES
('John Doe', 'john.doe@email.com', '555-1001', 'New York, NY', NOW() - INTERVAL '6 months'),
('Jane Smith', 'jane.smith@email.com', '555-1002', 'Los Angeles, CA', NOW() - INTERVAL '4 months'),
('Bob Wilson', 'bob.wilson@email.com', '555-1003', 'Chicago, IL', NOW() - INTERVAL '3 months')
ON CONFLICT (email) DO NOTHING;

-- Add some bookings
INSERT INTO care_connector.hfh_bookings (helper_id, client_id, service_type, booking_date, status, created_at)
SELECT 
  h.id,
  (SELECT id FROM care_connector.hfh_clients LIMIT 1),
  'rent-a-friend',
  NOW() - INTERVAL '2 weeks',
  'completed',
  NOW() - INTERVAL '2 weeks'
FROM care_connector.hfh_helpers h
WHERE h.name = 'Sarah Chen'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add some reviews
INSERT INTO care_connector.hfh_reviews (helper_id, client_id, booking_id, rating, comment, created_at)
SELECT 
  h.id,
  (SELECT id FROM care_connector.hfh_clients LIMIT 1),
  (SELECT id FROM care_connector.hfh_bookings LIMIT 1),
  5,
  'Amazing experience! Sarah was so friendly and made the event so much more enjoyable. Highly recommend!',
  NOW() - INTERVAL '1 week'
FROM care_connector.hfh_helpers h
WHERE h.name = 'Sarah Chen'
LIMIT 1
ON CONFLICT DO NOTHING;
