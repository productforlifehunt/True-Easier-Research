// Comprehensive service categories for Humans for Hire platform
// Matching top platforms: care.com, rover.com, papa pal, urbansitter, taskrabbit, etc.

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: ServiceSubcategory[];
  searchKeywords: string[];
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  priceRange: { min: number; max: number };
  commonTasks: string[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'childcare',
    name: 'Childcare',
    icon: 'Baby',
    description: 'Babysitters, nannies, tutors, and childcare specialists',
    searchKeywords: ['babysitter', 'nanny', 'childcare', 'kids', 'children', 'tutor', 'homework help'],
    subcategories: [
      {
        id: 'babysitting',
        name: 'Babysitting',
        description: 'Occasional childcare for date nights, events, or emergencies',
        priceRange: { min: 15, max: 30 },
        commonTasks: ['Date night care', 'Event babysitting', 'Emergency care', 'Weekend care']
      },
      {
        id: 'nanny',
        name: 'Full-time/Part-time Nanny',
        description: 'Regular childcare with consistent schedule',
        priceRange: { min: 20, max: 40 },
        commonTasks: ['Daily care', 'School pickup', 'Meal prep', 'Light housework', 'Homework help']
      },
      {
        id: 'infant-care',
        name: 'Infant Care Specialist',
        description: 'Specialized care for newborns and infants',
        priceRange: { min: 25, max: 45 },
        commonTasks: ['Newborn care', 'Sleep training', 'Feeding support', 'Development activities']
      },
      {
        id: 'special-needs',
        name: 'Special Needs Care',
        description: 'Experienced care for children with special needs',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Behavioral support', 'Therapy assistance', 'Medical care', 'Educational support']
      }
    ]
  },
  {
    id: 'senior-care',
    name: 'Senior Care',
    icon: 'Heart',
    description: 'Elderly companions, caregivers, and senior assistance',
    searchKeywords: ['elderly', 'senior', 'companion', 'caregiver', 'aging', 'retirement'],
    subcategories: [
      {
        id: 'companion-care',
        name: 'Companion Care',
        description: 'Social visits, activities, and emotional support',
        priceRange: { min: 20, max: 35 },
        commonTasks: ['Conversation', 'Games & activities', 'Walks', 'Reading', 'Meal companionship']
      },
      {
        id: 'personal-care',
        name: 'Personal Care Assistant',
        description: 'Help with daily living activities',
        priceRange: { min: 25, max: 40 },
        commonTasks: ['Bathing assistance', 'Dressing', 'Grooming', 'Mobility support', 'Medication reminders']
      },
      {
        id: 'dementia-care',
        name: 'Dementia/Alzheimer\'s Care',
        description: 'Specialized care for memory conditions',
        priceRange: { min: 30, max: 50 },
        commonTasks: ['Memory exercises', 'Safety monitoring', 'Routine maintenance', 'Family support']
      },
      {
        id: 'respite-care',
        name: 'Respite Care',
        description: 'Temporary relief for family caregivers',
        priceRange: { min: 25, max: 40 },
        commonTasks: ['Short-term care', 'Overnight care', 'Weekend relief', 'Vacation coverage']
      }
    ]
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    icon: 'Dog',
    description: 'Dog walkers, pet sitters, groomers, and pet services',
    searchKeywords: ['dog', 'cat', 'pet', 'animal', 'walker', 'sitter', 'grooming'],
    subcategories: [
      {
        id: 'dog-walking',
        name: 'Dog Walking',
        description: 'Regular or occasional dog walking services',
        priceRange: { min: 15, max: 30 },
        commonTasks: ['30-min walks', '1-hour walks', 'Group walks', 'Solo walks', 'Puppy walks']
      },
      {
        id: 'pet-sitting',
        name: 'Pet Sitting',
        description: 'In-home pet care while you\'re away',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Drop-in visits', 'Overnight stays', 'Feeding', 'Playtime', 'Medicine administration']
      },
      {
        id: 'pet-boarding',
        name: 'Pet Boarding',
        description: 'Care for pets at the sitter\'s home',
        priceRange: { min: 30, max: 70 },
        commonTasks: ['Day boarding', 'Overnight boarding', 'Extended stays', 'Holiday care']
      },
      {
        id: 'pet-grooming',
        name: 'Mobile Pet Grooming',
        description: 'Professional grooming at your home',
        priceRange: { min: 40, max: 100 },
        commonTasks: ['Bathing', 'Hair cutting', 'Nail trimming', 'Ear cleaning', 'Teeth cleaning']
      }
    ]
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    icon: 'Home',
    description: 'Cleaners, organizers, laundry services',
    searchKeywords: ['cleaning', 'housekeeping', 'maid', 'organizer', 'laundry', 'declutter'],
    subcategories: [
      {
        id: 'regular-cleaning',
        name: 'Regular House Cleaning',
        description: 'Weekly or bi-weekly cleaning service',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Dusting', 'Vacuuming', 'Mopping', 'Bathroom cleaning', 'Kitchen cleaning']
      },
      {
        id: 'deep-cleaning',
        name: 'Deep Cleaning',
        description: 'Thorough one-time or seasonal cleaning',
        priceRange: { min: 35, max: 70 },
        commonTasks: ['Move-in/out cleaning', 'Spring cleaning', 'Post-construction', 'Appliance cleaning']
      },
      {
        id: 'organizing',
        name: 'Professional Organizing',
        description: 'Decluttering and organization services',
        priceRange: { min: 40, max: 80 },
        commonTasks: ['Closet organizing', 'Room organizing', 'Paper management', 'Decluttering']
      },
      {
        id: 'laundry-service',
        name: 'Laundry & Ironing',
        description: 'Wash, dry, fold, and iron services',
        priceRange: { min: 20, max: 40 },
        commonTasks: ['Wash & fold', 'Ironing', 'Dry cleaning pickup', 'Linen service']
      }
    ]
  },
  {
    id: 'errands-shopping',
    name: 'Errands & Shopping',
    icon: 'Users',
    description: 'Personal shoppers, errand runners, delivery services',
    searchKeywords: ['errands', 'shopping', 'groceries', 'delivery', 'pickup', 'personal shopper'],
    subcategories: [
      {
        id: 'grocery-shopping',
        name: 'Grocery Shopping',
        description: 'Personal grocery shopping and delivery',
        priceRange: { min: 20, max: 35 },
        commonTasks: ['Weekly shopping', 'Meal planning', 'Specialty stores', 'Farmers market']
      },
      {
        id: 'general-errands',
        name: 'General Errands',
        description: 'Various errand running services',
        priceRange: { min: 20, max: 40 },
        commonTasks: ['Post office', 'Bank runs', 'Pharmacy pickup', 'Returns', 'DMV services']
      },
      {
        id: 'personal-shopping',
        name: 'Personal Shopping',
        description: 'Clothing, gifts, and specialty shopping',
        priceRange: { min: 30, max: 60 },
        commonTasks: ['Wardrobe shopping', 'Gift shopping', 'Holiday shopping', 'Special occasions']
      },
      {
        id: 'waiting-services',
        name: 'Waiting Services',
        description: 'Wait for deliveries and service appointments',
        priceRange: { min: 20, max: 30 },
        commonTasks: ['Cable/internet', 'Appliance delivery', 'Home repairs', 'Package waiting']
      }
    ]
  },
  {
    id: 'tutoring',
    name: 'Tutoring & Education',
    icon: 'BookOpen',
    description: 'Academic tutors, music lessons, language teachers',
    searchKeywords: ['tutor', 'teacher', 'education', 'homework', 'lessons', 'learning'],
    subcategories: [
      {
        id: 'academic-tutoring',
        name: 'Academic Tutoring',
        description: 'Subject-specific tutoring for all levels',
        priceRange: { min: 30, max: 80 },
        commonTasks: ['Math', 'Science', 'English', 'Test prep', 'Homework help']
      },
      {
        id: 'language-lessons',
        name: 'Language Lessons',
        description: 'Foreign language instruction',
        priceRange: { min: 35, max: 70 },
        commonTasks: ['Spanish', 'Mandarin', 'French', 'ESL', 'Conversation practice']
      },
      {
        id: 'music-lessons',
        name: 'Music Lessons',
        description: 'Instrument and voice instruction',
        priceRange: { min: 40, max: 80 },
        commonTasks: ['Piano', 'Guitar', 'Voice', 'Violin', 'Music theory']
      },
      {
        id: 'special-education',
        name: 'Special Education Support',
        description: 'Support for learning differences',
        priceRange: { min: 40, max: 90 },
        commonTasks: ['Reading support', 'ADHD strategies', 'IEP assistance', 'Study skills']
      }
    ]
  },
  {
    id: 'companionship',
    name: 'Companionship',
    icon: '🤝',
    description: 'Friends, conversation partners, social companions',
    searchKeywords: ['friend', 'companion', 'social', 'lonely', 'conversation', 'activity partner'],
    subcategories: [
      {
        id: 'social-companion',
        name: 'Social Companion',
        description: 'Friendly visits and conversation',
        priceRange: { min: 20, max: 40 },
        commonTasks: ['Coffee dates', 'Walks', 'Games', 'Conversation', 'Hobbies']
      },
      {
        id: 'activity-partner',
        name: 'Activity Partner',
        description: 'Join you for activities and events',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Movies', 'Concerts', 'Sports events', 'Museums', 'Shopping']
      },
      {
        id: 'virtual-companion',
        name: 'Virtual Companion',
        description: 'Online friendship and support',
        priceRange: { min: 15, max: 30 },
        commonTasks: ['Video calls', 'Online games', 'Virtual meals', 'Chat support']
      },
      {
        id: 'travel-companion',
        name: 'Travel Companion',
        description: 'Accompany on trips and outings',
        priceRange: { min: 40, max: 100 },
        commonTasks: ['Day trips', 'Vacations', 'Medical appointments', 'Family visits']
      }
    ]
  },
  {
    id: 'local-guides',
    name: 'Local Guides',
    icon: 'Map',
    description: 'Tour guides, city explorers, local experts',
    searchKeywords: ['tour', 'guide', 'tourist', 'local', 'explore', 'city', 'sightseeing'],
    subcategories: [
      {
        id: 'city-tours',
        name: 'City Tours',
        description: 'Guided tours of local attractions',
        priceRange: { min: 30, max: 80 },
        commonTasks: ['Walking tours', 'Historical tours', 'Food tours', 'Architecture tours']
      },
      {
        id: 'adventure-guides',
        name: 'Adventure Guides',
        description: 'Outdoor and adventure activities',
        priceRange: { min: 50, max: 150 },
        commonTasks: ['Hiking', 'Biking', 'Rock climbing', 'Water sports', 'Camping']
      },
      {
        id: 'cultural-guides',
        name: 'Cultural Guides',
        description: 'Cultural experiences and immersion',
        priceRange: { min: 40, max: 90 },
        commonTasks: ['Museums', 'Art galleries', 'Cultural sites', 'Local customs']
      },
      {
        id: 'photography-tours',
        name: 'Photography Tours',
        description: 'Photo walks and location scouting',
        priceRange: { min: 45, max: 100 },
        commonTasks: ['Sunrise shoots', 'Instagram spots', 'Nature photography', 'Street photography']
      }
    ]
  },
  {
    id: 'personal-assistant',
    name: 'Personal Assistant',
    icon: 'Briefcase',
    description: 'Admin help, scheduling, virtual assistance',
    searchKeywords: ['assistant', 'secretary', 'admin', 'scheduling', 'organizing', 'virtual'],
    subcategories: [
      {
        id: 'admin-support',
        name: 'Administrative Support',
        description: 'Office and administrative tasks',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Email management', 'Calendar scheduling', 'Data entry', 'Filing']
      },
      {
        id: 'virtual-assistant',
        name: 'Virtual Assistant',
        description: 'Remote administrative support',
        priceRange: { min: 20, max: 45 },
        commonTasks: ['Online research', 'Travel planning', 'Appointment booking', 'Phone calls']
      },
      {
        id: 'event-planning',
        name: 'Event Planning Assistant',
        description: 'Help with party and event planning',
        priceRange: { min: 30, max: 60 },
        commonTasks: ['Vendor coordination', 'Guest lists', 'Decorating', 'Setup/cleanup']
      },
      {
        id: 'moving-assistant',
        name: 'Moving Assistant',
        description: 'Help with packing and moving',
        priceRange: { min: 25, max: 45 },
        commonTasks: ['Packing', 'Unpacking', 'Organizing', 'Donation runs']
      }
    ]
  },
  {
    id: 'event-help',
    name: 'Event Help',
    icon: 'Calendar',
    description: 'Party helpers, event staff, bartenders',
    searchKeywords: ['party', 'event', 'wedding', 'birthday', 'celebration', 'staff'],
    subcategories: [
      {
        id: 'party-staff',
        name: 'Party Staff',
        description: 'Servers, bartenders, and event helpers',
        priceRange: { min: 20, max: 40 },
        commonTasks: ['Serving', 'Bartending', 'Setup', 'Cleanup', 'Guest assistance']
      },
      {
        id: 'event-setup',
        name: 'Event Setup & Decoration',
        description: 'Decorating and event preparation',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Decorating', 'Table setup', 'Flower arranging', 'Lighting']
      },
      {
        id: 'entertainment',
        name: 'Entertainment Services',
        description: 'DJs, musicians, performers',
        priceRange: { min: 50, max: 200 },
        commonTasks: ['DJ services', 'Live music', 'Face painting', 'Magic shows']
      },
      {
        id: 'photography',
        name: 'Event Photography',
        description: 'Professional event photography',
        priceRange: { min: 75, max: 300 },
        commonTasks: ['Wedding photography', 'Birthday parties', 'Corporate events', 'Family portraits']
      }
    ]
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: 'Car',
    description: 'Drivers, ride companions, delivery drivers',
    searchKeywords: ['driver', 'ride', 'transportation', 'delivery', 'chauffeur', 'car'],
    subcategories: [
      {
        id: 'personal-driver',
        name: 'Personal Driver',
        description: 'Private driving services',
        priceRange: { min: 30, max: 60 },
        commonTasks: ['Airport runs', 'Appointments', 'Shopping trips', 'Night out driver']
      },
      {
        id: 'medical-transport',
        name: 'Medical Transportation',
        description: 'Non-emergency medical transport',
        priceRange: { min: 35, max: 70 },
        commonTasks: ['Doctor visits', 'Therapy appointments', 'Dialysis', 'Pharmacy runs']
      },
      {
        id: 'delivery-driver',
        name: 'Delivery Services',
        description: 'Package and item delivery',
        priceRange: { min: 20, max: 40 },
        commonTasks: ['Package delivery', 'Furniture delivery', 'Store pickups', 'Moving items']
      },
      {
        id: 'school-transport',
        name: 'School Transportation',
        description: 'Safe rides for children',
        priceRange: { min: 25, max: 45 },
        commonTasks: ['School pickup/drop-off', 'After-school activities', 'Weekend sports']
      }
    ]
  },
  {
    id: 'handyman',
    name: 'Handyman Services',
    icon: 'Wrench',
    description: 'Minor repairs, assembly, maintenance',
    searchKeywords: ['handyman', 'repair', 'fix', 'maintenance', 'assembly', 'installation'],
    subcategories: [
      {
        id: 'general-repairs',
        name: 'General Repairs',
        description: 'Basic home repairs and fixes',
        priceRange: { min: 35, max: 75 },
        commonTasks: ['Leaky faucets', 'Door repairs', 'Drywall patches', 'Painting touch-ups']
      },
      {
        id: 'furniture-assembly',
        name: 'Furniture Assembly',
        description: 'IKEA and furniture assembly',
        priceRange: { min: 30, max: 60 },
        commonTasks: ['IKEA furniture', 'Office furniture', 'Outdoor furniture', 'Baby furniture']
      },
      {
        id: 'tech-setup',
        name: 'Tech Setup & Support',
        description: 'Technology installation and help',
        priceRange: { min: 40, max: 80 },
        commonTasks: ['TV mounting', 'Smart home setup', 'Computer help', 'WiFi setup']
      },
      {
        id: 'yard-work',
        name: 'Yard Work',
        description: 'Basic lawn and garden care',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Lawn mowing', 'Leaf raking', 'Weeding', 'Planting', 'Snow removal']
      }
    ]
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    icon: 'Activity',
    description: 'Personal trainers, wellness coaches, therapy companions',
    searchKeywords: ['fitness', 'trainer', 'wellness', 'health', 'yoga', 'meditation'],
    subcategories: [
      {
        id: 'personal-training',
        name: 'Personal Training',
        description: 'One-on-one fitness training',
        priceRange: { min: 40, max: 100 },
        commonTasks: ['Workout plans', 'Form correction', 'Motivation', 'Goal setting']
      },
      {
        id: 'yoga-instruction',
        name: 'Yoga & Pilates',
        description: 'Private yoga and pilates sessions',
        priceRange: { min: 50, max: 90 },
        commonTasks: ['Vinyasa', 'Hatha', 'Prenatal yoga', 'Chair yoga', 'Pilates']
      },
      {
        id: 'nutrition-coaching',
        name: 'Nutrition Coaching',
        description: 'Meal planning and nutrition guidance',
        priceRange: { min: 45, max: 85 },
        commonTasks: ['Meal planning', 'Grocery guidance', 'Recipe creation', 'Diet support']
      },
      {
        id: 'wellness-companion',
        name: 'Wellness Companion',
        description: 'Support for mental and physical wellness',
        priceRange: { min: 30, max: 60 },
        commonTasks: ['Walking buddy', 'Gym companion', 'Meditation partner', 'Accountability']
      }
    ]
  },
  {
    id: 'business-services',
    name: 'Business Services',
    icon: 'Briefcase',
    description: 'Freelance professionals, consultants, business support',
    searchKeywords: ['business', 'consultant', 'freelance', 'professional', 'marketing', 'design'],
    subcategories: [
      {
        id: 'marketing-help',
        name: 'Marketing Support',
        description: 'Social media and marketing assistance',
        priceRange: { min: 35, max: 80 },
        commonTasks: ['Social media', 'Content creation', 'Email marketing', 'SEO help']
      },
      {
        id: 'bookkeeping',
        name: 'Bookkeeping',
        description: 'Basic accounting and bookkeeping',
        priceRange: { min: 40, max: 75 },
        commonTasks: ['QuickBooks', 'Expense tracking', 'Invoice management', 'Receipt organizing']
      },
      {
        id: 'graphic-design',
        name: 'Graphic Design',
        description: 'Basic design and creative services',
        priceRange: { min: 45, max: 90 },
        commonTasks: ['Logo design', 'Business cards', 'Flyers', 'Social media graphics']
      },
      {
        id: 'writing-services',
        name: 'Writing Services',
        description: 'Content writing and editing',
        priceRange: { min: 35, max: 70 },
        commonTasks: ['Blog posts', 'Resumes', 'Cover letters', 'Proofreading']
      }
    ]
  },
  {
    id: 'special-occasions',
    name: 'Special Occasions',
    icon: 'Calendar',
    description: 'Holiday help, wedding assistance, celebration support',
    searchKeywords: ['holiday', 'wedding', 'birthday', 'anniversary', 'celebration', 'special'],
    subcategories: [
      {
        id: 'holiday-help',
        name: 'Holiday Help',
        description: 'Seasonal and holiday assistance',
        priceRange: { min: 25, max: 50 },
        commonTasks: ['Decorating', 'Gift wrapping', 'Card writing', 'Cookie baking']
      },
      {
        id: 'wedding-assistance',
        name: 'Wedding Assistance',
        description: 'Day-of wedding coordination',
        priceRange: { min: 50, max: 150 },
        commonTasks: ['Ceremony setup', 'Guest coordination', 'Vendor management', 'Emergency help']
      },
      {
        id: 'birthday-planning',
        name: 'Birthday Planning',
        description: 'Birthday party planning and execution',
        priceRange: { min: 30, max: 70 },
        commonTasks: ['Party planning', 'Cake ordering', 'Entertainment booking', 'Gift shopping']
      },
      {
        id: 'surprise-planning',
        name: 'Surprise Planning',
        description: 'Coordinate surprise events',
        priceRange: { min: 35, max: 75 },
        commonTasks: ['Surprise parties', 'Proposals', 'Anniversary surprises', 'Homecomings']
      }
    ]
  }
];

// Helper function to search services
export const searchServices = (query: string): ServiceCategory[] => {
  const lowercaseQuery = query.toLowerCase();
  
  return serviceCategories.filter(category => 
    category.name.toLowerCase().includes(lowercaseQuery) ||
    category.description.toLowerCase().includes(lowercaseQuery) ||
    category.searchKeywords.some(keyword => keyword.includes(lowercaseQuery)) ||
    category.subcategories.some(sub => 
      sub.name.toLowerCase().includes(lowercaseQuery) ||
      sub.description.toLowerCase().includes(lowercaseQuery) ||
      sub.commonTasks.some(task => task.toLowerCase().includes(lowercaseQuery))
    )
  );
};

// Get all unique service types for filters
export const getAllServiceTypes = (): string[] => {
  const types = new Set<string>();
  
  serviceCategories.forEach(category => {
    types.add(category.name);
    category.subcategories.forEach(sub => {
      types.add(sub.name);
    });
  });
  
  return Array.from(types).sort();
};

// Get price range for a service
export const getServicePriceRange = (serviceName: string): { min: number; max: number } | null => {
  for (const category of serviceCategories) {
    const subcategory = category.subcategories.find(
      sub => sub.name.toLowerCase() === serviceName.toLowerCase()
    );
    if (subcategory) {
      return subcategory.priceRange;
    }
  }
  return null;
};
