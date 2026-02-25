import { comprehensiveServices } from '../data/comprehensiveServices';

export interface Helper {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  hourly_rate: number;
  service_type?: string; // Legacy field
  services?: string[]; // New jsonb array field
  availability: string | any;
  location: string;
  experience_years?: number;
  years_experience?: number; // Database field name
  skills?: string[];
  languages?: string[] | any;
  gender?: string;
  age?: number;
  rating: number;
  total_reviews: number;
  response_time?: string;
  response_time_hours?: number; // Database field
  verified: boolean;
  background_checked?: boolean;
  background_check_status?: string; // Database field
  profile_image?: string;
  profile_image_url?: string; // Database field
  video_intro?: string;
  portfolio_images?: string[];
  instant_book: boolean;
  subscription_available?: boolean;
  favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

const locations = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA'];

const names = {
  male: ['James Wilson', 'Michael Chen', 'David Martinez', 'Robert Johnson', 'William Brown', 'Richard Davis', 'Joseph Miller', 'Thomas Garcia', 'Christopher Lee', 'Daniel Anderson'],
  female: ['Emma Thompson', 'Sophia Rodriguez', 'Isabella Williams', 'Olivia Jones', 'Ava Smith', 'Mia Davis', 'Charlotte Brown', 'Amelia Garcia', 'Harper Martinez', 'Evelyn Wilson'],
  nonbinary: ['Alex Taylor', 'Jordan Blake', 'Casey Morgan', 'Riley Parker', 'Jamie Quinn', 'Avery Stone', 'Quinn Rivers', 'Sage Winter', 'River Phoenix', 'Sky Autumn']
};

const languages = ['English', 'Spanish', 'Mandarin', 'French', 'German', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Portuguese', 'Italian', 'Russian'];
const skills = ['First Aid Certified', 'CPR Certified', 'Pet Friendly', 'Non-Smoker', 'Own Transportation', 'Flexible Schedule', 'Weekend Available', 'Emergency Available', 'Overnight Available', 'Holiday Available'];

const generateBio = (serviceType: string, name: string): string => {
  const bios = {
    'Rent a Friend': `Hi! I'm ${name}. I love meeting new people and creating memorable experiences. Whether you need a companion for events, someone to explore the city with, or just want to grab coffee and chat, I'm here to make your day brighter!`,
    'Tour & Local Guide': `Welcome! I'm ${name}, your local expert. I've lived here for years and know all the hidden gems. From tourist hotspots to secret local favorites, I'll show you the best our city has to offer!`,
    'Errand Services': `Hello! I'm ${name}, your reliable errand runner. I understand life gets busy, so I'm here to help with shopping, deliveries, and all those tasks you never have time for. Quick, efficient, and always with a smile!`,
    'Childcare & Babysitting': `Hi there! I'm ${name}, an experienced childcare provider. I love working with children and creating fun, safe, educational experiences. Your kids will be in caring, capable hands!`,
    'Senior Care': `Hello, I'm ${name}. I specialize in compassionate senior care, providing companionship and assistance with daily activities. I treat every client like family and ensure they feel valued and cared for.`,
    'Pet Care': `Hey! I'm ${name}, a passionate pet lover. Your furry friends will get all the love, attention, and exercise they need. I treat every pet as if they were my own!`,
    'Virtual Assistant': `Hi! I'm ${name}, your dedicated virtual assistant. I specialize in helping busy professionals stay organized and productive. From scheduling to research, I'll handle the details so you can focus on what matters!`,
    'Personal Training & Fitness': `Hey there! I'm ${name}, a certified personal trainer. I'm passionate about helping people reach their fitness goals. Whether you're just starting or looking to level up, I'll create a custom program just for you!`,
    default: `Hi! I'm ${name}. I'm passionate about helping others and providing excellent service. I'm reliable, friendly, and always go the extra mile to ensure you're completely satisfied!`
  };
  
  const serviceKey = Object.keys(bios).find(key => serviceType.includes(key)) || 'default';
  return bios[serviceKey as keyof typeof bios];
};

export const generateSampleHelpers = (): Helper[] => {
  const services = comprehensiveServices;
  const sampleHelpers: Helper[] = [];
  let id = 1;

  services.forEach(service => {
    const helperCount = Math.floor(Math.random() * 6) + 5;
    
    for (let i = 0; i < helperCount; i++) {
      const genderOptions = ['male', 'female', 'non-binary'];
      const gender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
      const nameList = gender === 'non-binary' ? names.nonbinary : gender === 'male' ? names.male : names.female;
      const name = nameList[Math.floor(Math.random() * nameList.length)];
      
      const helper: Helper = {
        id: `helper_${id}`,
        user_id: `user_${id}`,
        name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
        phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        bio: generateBio(service.name, name),
        hourly_rate: Math.floor(Math.random() * 100) + 25,
        service_type: service.id,
        availability: ['Weekdays', 'Weekends', 'Evenings', 'Flexible'][Math.floor(Math.random() * 4)],
        location: locations[Math.floor(Math.random() * locations.length)],
        experience_years: Math.floor(Math.random() * 15) + 1,
        skills: skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3),
        languages: languages.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
        gender: gender,
        age: Math.floor(Math.random() * 40) + 20,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        total_reviews: Math.floor(Math.random() * 200) + 10,
        response_time: ['< 1 hour', '< 2 hours', '< 4 hours', 'Same day'][Math.floor(Math.random() * 4)],
        verified: Math.random() > 0.3,
        background_checked: Math.random() > 0.4,
        profile_image: `https://i.pravatar.cc/300?img=${id}`,
        video_intro: Math.random() > 0.5 ? 'https://example.com/video' : undefined,
        portfolio_images: Math.random() > 0.6 ? ['image1.jpg', 'image2.jpg'] : [],
        instant_book: Math.random() > 0.5,
        subscription_available: Math.random() > 0.7,
        favorite: false
      };
      
      sampleHelpers.push(helper);
      id++;
    }
  });

  return sampleHelpers;
};
