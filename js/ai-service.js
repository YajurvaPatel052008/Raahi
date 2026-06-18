/* ============================================
   RAAHI — AI Service Layer (Mock Data for Phase 1)
   Future: Replace with Gemini API calls
   ============================================ */

// Mock user profiles for demo
const MOCK_USERS = [
  {
    id: 'user-001',
    fullName: 'Priya Sharma',
    college: 'AITR Indore',
    year: '3rd Year',
    avatar: 'https://i.pravatar.cc/150?img=1&u=priya',
    trustScore: 4.8,
    travelDNA: ['Mountain Trekker', 'Budget Traveler', 'Adventure Seeker', 'Photography Lover'],
    travelSummary: 'Loves off-the-beaten-path mountain adventures with a tight budget. Always carries a camera.',
    interests: ['Trekking', 'Photography', 'Camping', 'Local Culture'],
    travelStyle: 'Adventure',
    budget: 'Budget (₹5-10k)',
    destinations: ['Himalayas', 'Western Ghats', 'Northeast India']
  },
  {
    id: 'user-002',
    fullName: 'Rahul Verma',
    college: 'AITR Indore',
    year: '2nd Year',
    avatar: 'https://i.pravatar.cc/150?img=2&u=rahul',
    trustScore: 4.6,
    travelDNA: ['Beach Bum', 'Party Enthusiast', 'Social Butterfly', 'Foodie'],
    travelSummary: 'Life\'s a party! Beach destinations, group trips, and exploring local cuisines.',
    interests: ['Beach trips', 'Nightlife', 'Food', 'Group activities'],
    travelStyle: 'Social',
    budget: 'Mid-range (₹10-20k)',
    destinations: ['Goa', 'Kerala', 'Coastal areas']
  },
  {
    id: 'user-003',
    fullName: 'Aisha Khan',
    college: 'Acropolis Indore',
    year: '4th Year',
    avatar: 'https://i.pravatar.cc/150?img=3&u=aisha',
    trustScore: 4.9,
    travelDNA: ['Cultural Explorer', 'History Buff', 'Solo Traveler', 'Minimalist'],
    travelSummary: 'Exploring India\'s rich heritage one historical site at a time. Prefers meaningful travel.',
    interests: ['Heritage sites', 'History', 'Architecture', 'Solo exploration'],
    travelStyle: 'Cultural',
    budget: 'Budget (₹5-10k)',
    destinations: ['Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh']
  },
  {
    id: 'user-004',
    fullName: 'Vikram Singh',
    college: 'AITR Indore',
    year: '2nd Year',
    avatar: 'https://i.pravatar.cc/150?img=4&u=vikram',
    trustScore: 4.7,
    travelDNA: ['Water Sports Enthusiast', 'Adrenaline Junkie', 'Nature Lover', 'Startup Mindset'],
    travelSummary: 'Thrives on adventure sports and extreme experiences. Always up for something new.',
    interests: ['Water sports', 'Rock climbing', 'Paragliding', 'Adventure'],
    travelStyle: 'Adventure',
    budget: 'Premium (₹15-30k)',
    destinations: ['Kerala backwaters', 'Himalayas', 'Goa']
  },
  {
    id: 'user-005',
    fullName: 'Neha Patel',
    college: 'Acropolis Indore',
    year: '3rd Year',
    avatar: 'https://i.pravatar.cc/150?img=5&u=neha',
    trustScore: 4.5,
    travelDNA: ['Luxury Seeker', 'Instagram Influencer', 'Spa Enthusiast', 'Comfort Lover'],
    travelSummary: 'Believes travel should be comfortable and Instagram-worthy. Luxury resorts and fine dining.',
    interests: ['Luxury resorts', 'Wellness', 'Shopping', 'Photography'],
    travelStyle: 'Luxury',
    budget: 'Premium (₹20-40k)',
    destinations: ['Maldives', 'Bali', 'Hill stations']
  },
  {
    id: 'user-006',
    fullName: 'Arjun Kumar',
    college: 'AITR Indore',
    year: '1st Year',
    avatar: 'https://i.pravatar.cc/150?img=6&u=arjun',
    trustScore: 4.3,
    travelDNA: ['Backpacker', 'Hostel Hopper', 'Budget Hacker', 'Community Builder'],
    travelSummary: 'Travels on a shoestring budget and loves meeting fellow travelers. Hostels are home.',
    interests: ['Backpacking', 'Hostels', 'Budget food', 'Meeting people'],
    travelStyle: 'Budget',
    budget: 'Budget (₹3-7k)',
    destinations: ['Kasol', 'Rishikesh', 'Varanasi']
  },
  {
    id: 'user-007',
    fullName: 'Sana Desai',
    college: 'AITR Indore',
    year: '3rd Year',
    avatar: 'https://i.pravatar.cc/150?img=7&u=sana',
    trustScore: 4.8,
    travelDNA: ['Yoga Retreat Lover', 'Wellness Seeker', 'Peaceful Explorer', 'Spiritual'],
    travelSummary: 'Seeks inner peace through travel. Yoga, meditation, and spiritual exploration.',
    interests: ['Yoga', 'Meditation', 'Wellness', 'Ashrams'],
    travelStyle: 'Wellness',
    budget: 'Mid-range (₹8-15k)',
    destinations: ['Rishikesh', 'Kerala', 'Himalayas']
  },
  {
    id: 'user-008',
    fullName: 'Dev Kapoor',
    college: 'Acropolis Indore',
    year: '2nd Year',
    avatar: 'https://i.pravatar.cc/150?img=8&u=dev',
    trustScore: 4.4,
    travelDNA: ['Tech Nomad', 'Startup Enthusiast', 'Digital Explorer', 'Co-working Hub Frequenter'],
    travelSummary: 'Works while traveling. Loves places with good internet and startup ecosystem.',
    interests: ['Co-working', 'Startups', 'Tech communities', 'Digital nomad lifestyle'],
    travelStyle: 'Tech',
    budget: 'Mid-range (₹10-18k)',
    destinations: ['Bangalore', 'Delhi', 'Gurgaon']
  }
];

// Travel DNA tags pool
const TRAVEL_DNA_POOL = [
  'Mountain Trekker', 'Beach Bum', 'Cultural Explorer', 'Water Sports Enthusiast',
  'Luxury Seeker', 'Backpacker', 'Yoga Retreat Lover', 'Tech Nomad',
  'Adventure Seeker', 'Foodie', 'Photography Lover', 'Solo Traveler',
  'Family Trip Organizer', 'Party Enthusiast', 'History Buff', 'Nature Lover',
  'Budget Hacker', 'Adrenaline Junkie', 'Spiritual Explorer', 'City Explorer',
  'Wildlife Enthusiast', 'Art Lover', 'Minimalist Traveler', 'Comfort Seeker'
];

// Match explanation templates
const MATCH_EXPLANATIONS = {
  high: [
    'You both love trekking mountains and exploring off-the-beaten-path destinations with a budget in mind.',
    'Perfect alignment on travel style! Both of you prefer adventure-filled trips with a social group.',
    'Shared passion for cultural exploration and historical sites. You\'ll have amazing conversations about travel.',
    'Both budget-conscious travelers who don\'t compromise on experiences. Great match for cost-effective trips!',
    'You share the same travel DNA: adventure seekers who love photography and stunning nature.',
    'Ideal companions! Both love wellness-focused travel with yoga, meditation, and spiritual exploration.'
  ],
  medium: [
    'You both enjoy adventure but approach budgeting differently. Could work well with careful planning.',
    'Similar interests in travel photography and scenic destinations. Travel style complements each other.',
    'Decent match! Different travel styles but willing to compromise and explore together.',
    'You\'re from the same college and share adventure as a common interest. Great potential match!',
    'Both open to new experiences and flexible with travel plans. Should get along well.'
  ],
  low: [
    'Different travel styles but could learn from each other\'s perspectives.',
    'You have some overlapping interests. Worth connecting to see if there\'s chemistry.',
    'Budget ranges differ but you might find common ground on specific trips.'
  ]
};

/**
 * Get Travel DNA for current user
 * Phase 1: Returns mock data based on hardcoded profile
 * Phase 2: Will call Gemini to analyze user bio
 */
async function getTravelDNA(userId) {
  // Mock: Return hardcoded profile for demo
  // In Phase 2: Call `analyzeProfile()` with user's travel bio

  const user = MOCK_USERS[0]; // Current user (Yajurva - replace with actual)

  return {
    tags: ['Nature Explorer', 'Trekking Enthusiast', 'Budget Traveler', 'Photography Lover'],
    summary: 'You\'re an adventurous traveler who loves mountains, small groups, and capturing moments. Budget-conscious but never compromises on authentic experiences.',
    travelStyle: 'Adventure',
    budgetRange: 'Budget (₹5-10k)',
    preferredDestinations: ['Himalayas', 'Western Ghats', 'Northeast India'],
    interests: ['Trekking', 'Photography', 'Camping', 'Local Culture']
  };
}

/**
 * Get AI-matched travel buddies for the current user
 * Phase 1: Returns mock matches
 * Phase 2: Will call Gemini for intelligent matching
 */
async function getAIMatches(currentUserId, limit = 5) {
  // Mock: Return pre-calculated matches
  // In Phase 2: Call `findMatches()` which uses Gemini

  // Filter out current user and return top matches
  const matches = MOCK_USERS
    .filter(u => u.id !== currentUserId)
    .slice(0, limit)
    .map((user, index) => {
      const scores = [92, 88, 85, 78, 75];
      const explanations = MATCH_EXPLANATIONS.high;

      return {
        userId: user.id,
        name: user.fullName,
        college: user.college,
        year: user.year,
        avatar: user.avatar,
        trustScore: user.trustScore,
        matchScore: scores[index] || 70,
        travelDNA: user.travelDNA,
        travelStyle: user.travelStyle,
        budget: user.budget,
        explanation: explanations[index % explanations.length],
        compatibilityBreakdown: {
          travelStyleMatch: 90 - (index * 2),
          budgetMatch: 85 - (index * 3),
          interestMatch: 88 - (index * 2),
          personalityMatch: 92 - (index * 2)
        }
      };
    });

  return matches;
}

/**
 * Get detailed match information
 * Phase 1: Returns mock details
 * Phase 2: Will retrieve from Supabase or regenerate with Gemini
 */
async function getMatchDetails(matchId) {
  const user = MOCK_USERS.find(u => u.id === matchId);

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    name: user.fullName,
    college: user.college,
    year: user.year,
    avatar: user.avatar,
    trustScore: user.trustScore,
    bio: `${user.fullName} is a ${user.travelStyle.toLowerCase()} traveler who ${user.travelSummary.toLowerCase()}`,
    travelDNA: user.travelDNA,
    interests: user.interests,
    travelStyle: user.travelStyle,
    budget: user.budget,
    destinations: user.destinations,
    matchScore: 92,
    compatibilityBreakdown: {
      travelStyleMatch: 92,
      budgetMatch: 90,
      interestMatch: 88,
      personalityMatch: 94
    },
    aiSummary: `You and ${user.fullName} are highly compatible travel buddies! Both of you share a passion for ${user.travelStyle.toLowerCase()} travel and appreciate budget-friendly options. ${user.fullName} brings ${user.travelDNA[0]} perspective which perfectly complements your travel preferences.`
  };
}

/**
 * Mock: Analyze travel profile bio with Gemini
 * Phase 2: Will actually call Gemini API
 */
async function analyzeProfile(userBio, profileData) {
  // Mock implementation
  console.log('[MOCK] Analyzing travel bio:', userBio);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    tags: ['Adventure Seeker', 'Budget Conscious', 'Nature Lover', 'Photography Enthusiast'],
    summary: 'Based on your travel description, you\'re an adventurous traveler who values authentic experiences and meaningful connections with fellow travelers.',
    travelStyle: 'Adventure',
    confidence: 0.92
  };
}

/**
 * Mock: Find matches for a user using Gemini
 * Phase 2: Will call Gemini for AI matching
 */
async function findMatches(userId, tripId = null) {
  console.log('[MOCK] Finding AI matches for user:', userId);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return getAIMatches(userId);
}

/**
 * Fallback: Rule-based matching (similar to existing matches.js)
 * Used if AI service is unavailable
 */
function calculateRuleBasedScore(userProfile, candidateProfile) {
  let score = 0;

  // Travel style match (30%)
  if (userProfile.travelStyle === candidateProfile.travelStyle) {
    score += 30;
  } else {
    score += 10;
  }

  // Budget match (30%)
  if (userProfile.budget === candidateProfile.budget) {
    score += 30;
  } else {
    score += 15;
  }

  // Interest overlap (20%)
  const commonInterests = userProfile.interests.filter(i =>
    candidateProfile.interests.includes(i)
  ).length;
  score += Math.min((commonInterests / userProfile.interests.length) * 20, 20);

  // Destination overlap (20%)
  const commonDestinations = userProfile.destinations.filter(d =>
    candidateProfile.destinations.includes(d)
  ).length;
  score += Math.min((commonDestinations / userProfile.destinations.length) * 20, 20);

  return Math.min(Math.round(score), 100);
}

// Export for use in other scripts
window.aiService = {
  getTravelDNA,
  getAIMatches,
  getMatchDetails,
  analyzeProfile,
  findMatches,
  calculateRuleBasedScore,
  MOCK_USERS
};
