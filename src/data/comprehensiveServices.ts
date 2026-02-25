import { LucideIcon, Users, Map, ShoppingBag, Baby, UserCheck, Dog, Home, Wrench, Monitor, Package, Dumbbell, PartyPopper, Laptop, Sparkles, GraduationCap, TrendingUp, Briefcase } from 'lucide-react';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  featured?: boolean;
  subcategories: {
    id: string;
    name: string;
    keywords?: string[];
    price?: string;
  }[];
}

export const comprehensiveServices: ServiceCategory[] = [
  {
    id: 'friends-for-hire',
    name: 'Friends for Hire',
    icon: Users,
    description: 'Find companions for activities, events, and social connections',
    featured: true,
    subcategories: [
      { id: 'activity-partner', name: 'Activity Partners', price: '35-60' },
      { id: 'event-companion', name: 'Event Companions', price: '45-80' },
      { id: 'travel-buddy', name: 'Travel Buddies', price: '50-100' },
      { id: 'social-companion', name: 'Social Companions', price: '40-70' },
      { id: 'virtual-friend', name: 'Virtual Friends', price: '25-45' },
      { id: 'workout-partner', name: 'Workout Partners', price: '30-50' },
      { id: 'study-buddy', name: 'Study Buddies', price: '25-45' },
      { id: 'gaming-companion', name: 'Gaming Companions', price: '20-40' }
    ]
  },
  {
    id: 'pals-for-hire',
    name: 'Pals for Hire',
    icon: UserCheck,
    description: 'Trusted companions for seniors and those needing extra support',
    featured: true,
    subcategories: [
      { id: 'senior-companion', name: 'Senior Companion', price: '$25-45/hr' },
      { id: 'medical-appointments', name: 'Medical Appointment Companion', price: '$30-50/hr' },
      { id: 'grocery-shopping', name: 'Grocery Shopping Helper', price: '$25-40/hr' },
      { id: 'technology-help', name: 'Technology Assistant', price: '$30-50/hr' },
      { id: 'social-visits', name: 'Social Visits', price: '$20-35/hr' },
      { id: 'medication-reminders', name: 'Medication Reminders', price: '$25-40/hr' },
      { id: 'light-housework', name: 'Light Housework Helper', price: '$25-45/hr' },
      { id: 'transportation', name: 'Transportation Companion', price: '$30-50/hr' }
    ]
  },
  {
    id: 'tour-guide',
    name: 'Tour & Local Guide',
    icon: Map,
    description: 'Discover your city or travel destination with local experts',
    featured: true,
    subcategories: [
      { id: 'city-tours', name: 'City Tours', keywords: ['sightseeing', 'landmarks', 'downtown', 'tourist'] },
      { id: 'food-tours', name: 'Food & Drink Tours', keywords: ['restaurants', 'bars', 'cuisine', 'tasting'] },
      { id: 'cultural-tours', name: 'Cultural Tours', keywords: ['museums', 'art', 'history', 'heritage'] },
      { id: 'adventure-guides', name: 'Adventure Guides', keywords: ['outdoor', 'extreme', 'nature', 'wilderness'] },
      { id: 'nightlife-guides', name: 'Nightlife Guides', keywords: ['clubs', 'bars', 'parties', 'entertainment'] }
    ]
  },
  {
    id: 'errand-services',
    name: 'Errand Services',
    icon: ShoppingBag,
    description: 'Professional errand runners for all your daily needs',
    featured: true,
    subcategories: [
      { id: 'grocery-shopping', name: 'Grocery Shopping', price: '$25-40/hr', keywords: ['food', 'supermarket', 'delivery', 'pickup'] },
      { id: 'package-services', name: 'Package & Mail Services', price: '$20-35/hr', keywords: ['post', 'ups', 'fedex', 'shipping'] },
      { id: 'prescription-pickup', name: 'Pharmacy & Prescription Pickup', price: '$20-30/hr', keywords: ['pharmacy', 'medication', 'medicine'] },
      { id: 'dry-cleaning', name: 'Dry Cleaning & Laundry', price: '$20-30/hr', keywords: ['laundry', 'clothes', 'wash', 'iron'] },
      { id: 'waiting-services', name: 'Waiting Services (DMV, etc)', price: '$25-40/hr', keywords: ['queue', 'line', 'dmv', 'appointment'] },
      { id: 'returns-exchanges', name: 'Returns & Exchanges', price: '$25-35/hr', keywords: ['return', 'exchange', 'refund'] },
      { id: 'banking-errands', name: 'Banking & Financial Errands', price: '$25-40/hr', keywords: ['bank', 'deposit', 'atm'] },
      { id: 'gift-shopping', name: 'Gift Shopping & Wrapping', price: '$30-50/hr', keywords: ['gift', 'present', 'birthday'] },
      { id: 'document-delivery', name: 'Document Delivery', price: '$20-35/hr', keywords: ['documents', 'papers', 'notary'] },
      { id: 'pet-supplies', name: 'Pet Supply Runs', price: '$20-35/hr', keywords: ['pet', 'food', 'supplies'] }
    ]
  },
  {
    id: 'childcare',
    name: 'Childcare & Babysitting',
    icon: Baby,
    description: 'Trusted caregivers for your children',
    subcategories: [
      { id: 'babysitting', name: 'Babysitting', keywords: ['sitter', 'evening', 'date night', 'occasional'] },
      { id: 'nanny', name: 'Nanny Services', keywords: ['full-time', 'part-time', 'regular', 'daily'] },
      { id: 'tutoring', name: 'Tutoring', keywords: ['homework', 'education', 'learning', 'study'] },
      { id: 'special-needs', name: 'Special Needs Care', keywords: ['disability', 'therapy', 'support', 'specialized'] },
      { id: 'summer-care', name: 'Summer Care', keywords: ['camp', 'vacation', 'holiday', 'break'] }
    ]
  },
  {
    id: 'senior-care',
    name: 'Senior Care',
    icon: UserCheck,
    description: 'Compassionate care for elderly loved ones',
    subcategories: [
      { id: 'companionship', name: 'Companionship', keywords: ['visit', 'social', 'friend', 'company'] },
      { id: 'personal-care', name: 'Personal Care', keywords: ['bathing', 'dressing', 'grooming', 'hygiene'] },
      { id: 'memory-care', name: 'Memory Care', keywords: ['dementia', 'alzheimer', 'cognitive', 'memory'] },
      { id: 'transportation', name: 'Transportation', keywords: ['driving', 'appointments', 'errands', 'mobility'] },
      { id: 'respite-care', name: 'Respite Care', keywords: ['relief', 'break', 'temporary', 'support'] }
    ]
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    icon: Dog,
    description: 'Loving care for your furry friends',
    subcategories: [
      { id: 'dog-walking', name: 'Dog Walking', keywords: ['walk', 'exercise', 'outdoor', 'daily'] },
      { id: 'pet-sitting', name: 'Pet Sitting', keywords: ['boarding', 'overnight', 'vacation', 'home'] },
      { id: 'pet-grooming', name: 'Pet Grooming', keywords: ['bath', 'trim', 'nails', 'fur'] },
      { id: 'pet-training', name: 'Pet Training', keywords: ['obedience', 'behavior', 'puppy', 'tricks'] },
      { id: 'pet-transport', name: 'Pet Transport', keywords: ['vet', 'travel', 'pickup', 'delivery'] }
    ]
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping & Cleaning',
    icon: Home,
    description: 'Professional home cleaning services',
    subcategories: [
      { id: 'regular-cleaning', name: 'Regular Cleaning', keywords: ['weekly', 'biweekly', 'monthly', 'routine'] },
      { id: 'deep-cleaning', name: 'Deep Cleaning', keywords: ['thorough', 'spring', 'move', 'intensive'] },
      { id: 'organization', name: 'Home Organization', keywords: ['declutter', 'arrange', 'sort', 'tidy'] },
      { id: 'laundry', name: 'Laundry Services', keywords: ['wash', 'fold', 'iron', 'clothes'] },
      { id: 'specialty-cleaning', name: 'Specialty Cleaning', keywords: ['carpet', 'window', 'oven', 'garage'] }
    ]
  },
  {
    id: 'handyman',
    name: 'Handyman & Repairs',
    icon: Wrench,
    description: 'Home repairs and maintenance',
    subcategories: [
      { id: 'general-repairs', name: 'General Repairs', keywords: ['fix', 'broken', 'maintenance', 'household'] },
      { id: 'furniture-assembly', name: 'Furniture Assembly', keywords: ['ikea', 'build', 'install', 'setup'] },
      { id: 'painting', name: 'Painting', keywords: ['walls', 'rooms', 'touch-up', 'interior'] },
      { id: 'mounting', name: 'Mounting & Installation', keywords: ['tv', 'shelves', 'pictures', 'fixtures'] },
      { id: 'yard-work', name: 'Yard Work', keywords: ['lawn', 'garden', 'landscaping', 'outdoor'] }
    ]
  },
  {
    id: 'virtual-assistant',
    name: 'Virtual Assistant',
    icon: Monitor,
    description: 'Remote help with tasks and administration',
    featured: true,
    subcategories: [
      { id: 'admin-support', name: 'Admin Support', keywords: ['email', 'calendar', 'scheduling', 'office'] },
      { id: 'research', name: 'Research', keywords: ['data', 'information', 'analysis', 'reports'] },
      { id: 'social-media', name: 'Social Media Management', keywords: ['posts', 'content', 'engagement', 'marketing'] },
      { id: 'customer-service', name: 'Customer Service', keywords: ['support', 'chat', 'calls', 'help'] },
      { id: 'data-entry', name: 'Data Entry', keywords: ['typing', 'spreadsheet', 'database', 'input'] }
    ]
  },
  {
    id: 'moving-help',
    name: 'Moving & Delivery',
    icon: Package,
    description: 'Help with moving and heavy lifting',
    subcategories: [
      { id: 'packing', name: 'Packing Services', keywords: ['boxes', 'wrap', 'organize', 'prepare'] },
      { id: 'loading-unloading', name: 'Loading/Unloading', keywords: ['truck', 'van', 'heavy', 'lift'] },
      { id: 'furniture-moving', name: 'Furniture Moving', keywords: ['couch', 'bed', 'table', 'rearrange'] },
      { id: 'delivery-service', name: 'Delivery Service', keywords: ['pickup', 'drop-off', 'transport', 'courier'] },
      { id: 'junk-removal', name: 'Junk Removal', keywords: ['disposal', 'trash', 'haul', 'clean-out'] }
    ]
  },
  {
    id: 'personal-training',
    name: 'Personal Training & Fitness',
    icon: Dumbbell,
    description: 'Get fit with personal trainers and fitness coaches',
    subcategories: [
      { id: 'gym-training', name: 'Gym Training', keywords: ['weights', 'strength', 'cardio', 'equipment'] },
      { id: 'home-training', name: 'Home Training', keywords: ['in-home', 'virtual', 'online', 'remote'] },
      { id: 'yoga-pilates', name: 'Yoga & Pilates', keywords: ['flexibility', 'mindfulness', 'core', 'balance'] },
      { id: 'sports-coaching', name: 'Sports Coaching', keywords: ['tennis', 'golf', 'basketball', 'technique'] },
      { id: 'nutrition-coaching', name: 'Nutrition Coaching', keywords: ['diet', 'meal', 'health', 'wellness'] }
    ]
  },
  {
    id: 'event-help',
    name: 'Event & Party Help',
    icon: PartyPopper,
    description: 'Make your events memorable with professional help',
    subcategories: [
      { id: 'event-planning', name: 'Event Planning', keywords: ['organize', 'coordinate', 'manage', 'design'] },
      { id: 'catering-help', name: 'Catering Help', keywords: ['serve', 'bartend', 'waitstaff', 'food'] },
      { id: 'setup-cleanup', name: 'Setup & Cleanup', keywords: ['decorate', 'arrange', 'tear-down', 'clean'] },
      { id: 'entertainment', name: 'Entertainment', keywords: ['dj', 'music', 'games', 'activities'] },
      { id: 'photography', name: 'Photography', keywords: ['photos', 'video', 'memories', 'capture'] }
    ]
  },
  {
    id: 'tech-support',
    name: 'Tech Support',
    icon: Laptop,
    description: 'Help with technology and devices',
    subcategories: [
      { id: 'computer-help', name: 'Computer Help', keywords: ['pc', 'mac', 'laptop', 'desktop'] },
      { id: 'phone-tablet', name: 'Phone & Tablet', keywords: ['iphone', 'android', 'ipad', 'apps'] },
      { id: 'smart-home', name: 'Smart Home Setup', keywords: ['alexa', 'google', 'nest', 'automation'] },
      { id: 'tv-audio', name: 'TV & Audio', keywords: ['setup', 'streaming', 'speakers', 'sound'] },
      { id: 'internet-wifi', name: 'Internet & WiFi', keywords: ['router', 'network', 'connection', 'troubleshoot'] }
    ]
  },
  {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    icon: Sparkles,
    description: 'Personal beauty and wellness services',
    subcategories: [
      { id: 'hair-styling', name: 'Hair Styling', keywords: ['cut', 'color', 'style', 'salon'] },
      { id: 'makeup', name: 'Makeup Services', keywords: ['cosmetics', 'beauty', 'wedding', 'event'] },
      { id: 'massage', name: 'Massage Therapy', keywords: ['relaxation', 'therapeutic', 'spa', 'wellness'] },
      { id: 'nails', name: 'Nail Services', keywords: ['manicure', 'pedicure', 'polish', 'art'] },
      { id: 'skincare', name: 'Skincare', keywords: ['facial', 'treatment', 'beauty', 'spa'] }
    ]
  },
  {
    id: 'lessons-tutoring',
    name: 'Lessons & Tutoring',
    icon: GraduationCap,
    description: 'Learn new skills from experienced instructors',
    subcategories: [
      { id: 'academic', name: 'Academic Tutoring', keywords: ['math', 'science', 'english', 'school'] },
      { id: 'language', name: 'Language Lessons', keywords: ['english', 'spanish', 'french', 'conversation'] },
      { id: 'music', name: 'Music Lessons', keywords: ['piano', 'guitar', 'voice', 'instrument'] },
      { id: 'art-craft', name: 'Art & Craft', keywords: ['painting', 'drawing', 'pottery', 'creative'] },
      { id: 'cooking', name: 'Cooking Lessons', keywords: ['cuisine', 'baking', 'chef', 'kitchen'] }
    ]
  },
  {
    id: 'walking-companion',
    name: 'Walking Companion',
    icon: Users,
    description: 'City walks, neighborhood tours, and walking companions',
    featured: true,
    subcategories: [
      { id: 'city-walk', name: 'City Walking Tours', price: '$30-60/hr', keywords: ['walk', 'tour', 'explore', 'neighborhood'] },
      { id: 'exercise-walk', name: 'Exercise Walking Partner', price: '$25-45/hr', keywords: ['fitness', 'health', 'outdoor', 'exercise'] },
      { id: 'safety-walk', name: 'Safety Walking Companion', price: '$30-50/hr', keywords: ['safety', 'night', 'escort', 'security'] },
      { id: 'nature-walk', name: 'Nature & Park Walks', price: '$25-50/hr', keywords: ['nature', 'park', 'trails', 'hiking'] },
      { id: 'dog-walk-companion', name: 'Dog Walking Companion', price: '$30-55/hr', keywords: ['pet', 'dog', 'walk', 'companion'] }
    ]
  },
  {
    id: 'odd-jobs-gig-work',
    name: 'Odd Jobs & Gig Work',
    icon: Briefcase,
    description: 'Flexible gig workers for various tasks and projects',
    featured: true,
    subcategories: [
      { id: 'general-labor', name: 'General Labor', price: '$20-40/hr', keywords: ['work', 'manual', 'labor', 'help'] },
      { id: 'assembly-work', name: 'Assembly & Installation', price: '$25-50/hr', keywords: ['assemble', 'install', 'build', 'setup'] },
      { id: 'warehouse-help', name: 'Warehouse Help', price: '$20-35/hr', keywords: ['warehouse', 'stock', 'inventory', 'loading'] },
      { id: 'retail-temp', name: 'Retail Temp Work', price: '$18-30/hr', keywords: ['retail', 'sales', 'temporary', 'store'] },
      { id: 'event-staff', name: 'Event Staffing', price: '$20-40/hr', keywords: ['event', 'staff', 'temporary', 'help'] },
      { id: 'administrative', name: 'Administrative Tasks', price: '$25-45/hr', keywords: ['admin', 'office', 'clerical', 'paperwork'] },
      { id: 'flex-jobs', name: 'Flexible Jobs', price: '$20-50/hr', keywords: ['flexible', 'temp', 'gig', 'freelance'] }
    ]
  }
];

export const getServiceById = (id: string): ServiceCategory | undefined => {
  return comprehensiveServices.find(service => service.id === id);
};

export const searchServices = (query: string): ServiceCategory[] => {
  const lowercaseQuery = query.toLowerCase();
  return comprehensiveServices.filter(service => 
    service.name.toLowerCase().includes(lowercaseQuery) ||
    service.description.toLowerCase().includes(lowercaseQuery) ||
    service.subcategories.some(sub => 
      sub.name.toLowerCase().includes(lowercaseQuery) ||
      (sub.keywords && sub.keywords.some(keyword => keyword.includes(lowercaseQuery)))
    )
  );
};

export const getFeaturedServices = (): ServiceCategory[] => {
  return comprehensiveServices.filter(service => service.featured);
};
