export interface CarouselSlideData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export interface ProductData {
  id: string;
  title: string;
  category: "Sticks & Pucks" | "Helmets & Pads" | "Skates" | "Apparel" | "Accessories";
  price: number;
  rating: number;
  reviewsCount: number;
  views: number;
  likes: number;
  inStock: boolean;
  image: string;
  description: string;
  features: string[];
  delivery: string;
}

export interface ProgramData {
  id: string;
  title: string;
  category: "Junior" | "Teen" | "Professional" | "Private";
  ageGroup: string;
  duration: string;
  price: number;
  schedule: string;
  image: string;
  coach: string;
  spotsLeft: number;
  description: string;
  features: string[];
}

export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
}

export interface MatchTicketData {
  id: string;
  matchTitle: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  date: string;
  time: string;
  priceTiers: {
    name: string;
    price: number;
    description: string;
    availableSeats: number;
  }[];
  image: string;
}

export const INITIAL_CAROUSEL_SLIDES: CarouselSlideData[] = [
  {
    id: "slide-1",
    title: "Meet All The Heroes From The Field",
    subtitle: "Apex Hockey Championship 2026",
    description: "Join the most prestigious ice hockey league. Elevate your shooting power, agile skating, and elite tactical teamwork with Olympic-grade coaching.",
    badge: "Official League Season",
    image: "/images/1.png",
    ctaText: "Book Match Tickets",
    ctaLink: "/get-ticket",
    secondaryCtaText: "Explore Programs",
    secondaryCtaLink: "/programs",
  },
  {
    id: "slide-2",
    title: "Next-Gen Carbon Fiber Performance Sticks",
    subtitle: "Precision Engineering & Ultra Lightweight",
    description: "Unleash explosive slap shots and surgical puck control with the all-new ProSeries carbon fiber series.",
    badge: "New Gear Release",
    image: "/images/2.png",
    ctaText: "Shop Equipment",
    ctaLink: "/products",
    secondaryCtaText: "View Pricing",
    secondaryCtaLink: "/pricing",
  },
  {
    id: "slide-3",
    title: "Elite Winter Training Camp & Academy",
    subtitle: "Coached by International NHL Veterans",
    description: "From grassroots junior skill camps to high-performance masterclasses, take your game to national competitive levels.",
    badge: "Registration Open",
    image: "/images/4.png",
    ctaText: "Join Academy",
    ctaLink: "/programs",
    secondaryCtaText: "Meet Coaches",
    secondaryCtaLink: "/about",
  },
];

export const INITIAL_PRODUCTS: ProductData[] = [
  {
    id: "prod-1",
    title: "World Cup Flags Match Football & Puck",
    category: "Sticks & Pucks",
    price: 22.0,
    rating: 5.0,
    reviewsCount: 48,
    views: 1420,
    likes: 380,
    inStock: true,
    image: "/images/5.png",
    description: "Official match-grade compound ball and puck engineered for hyper-consistent glide, aerodynamic trajectory, and superior durability across icy rinks.",
    features: ["Thermal bonded shell", "Zero air-loss inner core", "Extreme cold weather resistant", "Official tournament certified"],
    delivery: "Free Delivery",
  },
  {
    id: "prod-2",
    title: "Pro-Guard Impact Shield Helmet",
    category: "Helmets & Pads",
    price: 49.0,
    rating: 4.9,
    reviewsCount: 36,
    views: 980,
    likes: 215,
    inStock: true,
    image: "/images/6.png",
    description: "High-density dual foam padding with stainless steel cage visor ensuring maximum peripheral vision and concussion reduction.",
    features: ["Toolless size adjustment", "Dual-density EPP foam", "Anti-fog optic clear visor", "Ultra-breathable airflow vents"],
    delivery: "Free Delivery",
  },
  {
    id: "prod-3",
    title: "Apex CarbonFlex Pro Hockey Stick",
    category: "Sticks & Pucks",
    price: 89.0,
    rating: 5.0,
    reviewsCount: 72,
    views: 2100,
    likes: 640,
    inStock: true,
    image: "/images/7.png",
    description: "Monocomp 100% carbon-flex shaft delivering explosive energy transfer, rapid puck release, and textured tactile grip.",
    features: ["Mid-kick flex profile", "Micro-feel tactile grip", "Reinforced blade core", "Sub-380g weight"],
    delivery: "Free Delivery",
  },
  {
    id: "prod-4",
    title: "Vapor Speed Edge Ice Skates",
    category: "Skates",
    price: 129.0,
    rating: 4.8,
    reviewsCount: 54,
    views: 1650,
    likes: 420,
    inStock: true,
    image: "/images/8.png",
    description: "Curv composite quarter package with quick-release stainless steel runner system for razor-sharp tight turns and blistering acceleration.",
    features: ["Thermoformable fit", "Tuuk Lightspeed edge runner", "Hydrophobic microfiber liner", "Form-fit memory tongue"],
    delivery: "Free Delivery",
  },
  {
    id: "prod-5",
    title: "Defender Armored Chest & Shoulder Pad",
    category: "Helmets & Pads",
    price: 65.0,
    rating: 4.9,
    reviewsCount: 29,
    views: 890,
    likes: 190,
    inStock: true,
    image: "/images/9.png",
    description: "Molded HD foam caps offering full anatomical mobility while absorbing heavy checking and high-velocity puck impacts.",
    features: ["Sternum shield protection", "Removable belly pad", "Moisture wicking thermo-max lining", "Adjustable bicep guard"],
    delivery: "Free Delivery",
  },
  {
    id: "prod-6",
    title: "Pro Match Goalie Catching Glove",
    category: "Accessories",
    price: 75.0,
    rating: 5.0,
    reviewsCount: 41,
    views: 1250,
    likes: 310,
    inStock: true,
    image: "/images/10.png",
    description: "Deep pocket T-trap webbing with reinforced cuff giving goaltenders effortless puck retention and elite wrist protection.",
    features: ["Deep T-pocket design", "Poron XRD impact palm", "Quick cinch wrist strap", "Game-ready pre-broken feel"],
    delivery: "Free Delivery",
  },
];

export const INITIAL_PROGRAMS: ProgramData[] = [
  {
    id: "prog-junior",
    title: "Junior Development Program",
    category: "Junior",
    ageGroup: "Ages 6 - 12",
    duration: "12 Weeks",
    price: 180,
    schedule: "Mon, Wed & Sat (4:00 PM)",
    image: "/images/2.png",
    coach: "Coach Dave Miller (Ex-Olympic Coach)",
    spotsLeft: 8,
    description: "Designed for young aspiring athletes to master fundamental skating agility, stick-handling, safe edge work, and joyful teamwork.",
    features: [
      "Fundamental forward & backward skating mechanics",
      "Puck control, passing drills & basic shooting",
      "Safe body positioning and non-contact game play",
      "Official Junior Jersey & Completion Medal",
    ],
  },
  {
    id: "prog-teen",
    title: "Teenager Competitive Academy",
    category: "Teen",
    ageGroup: "Ages 13 - 17",
    duration: "16 Weeks",
    price: 260,
    schedule: "Tue, Thu & Sun (5:30 PM)",
    image: "/images/3.png",
    coach: "Coach Sarah Jenkins (National Champions Coach)",
    spotsLeft: 5,
    description: "Intensive training combining off-ice athletic conditioning, video tactical analysis, high-speed puck battles, and power play strategies.",
    features: [
      "Advanced edge work, quick crossovers & transition skating",
      "Slap shot, wrist shot & one-timer mastery",
      "Offensive breakout & defensive zone coverage",
      "Tournament match play & scout showcase inclusion",
    ],
  },
  {
    id: "prog-pro",
    title: "Professional & League Masterclass",
    category: "Professional",
    ageGroup: "Ages 18+",
    duration: "20 Weeks",
    price: 380,
    schedule: "Wed & Sat (7:30 PM)",
    image: "/images/4.png",
    coach: "Coach Alexander Petrov (NHL Veteran)",
    spotsLeft: 3,
    description: "High-octane training for competitive league players focused on high-pressure decision making, physical endurance, and tactical execution.",
    features: [
      "Elite velocity shooting and rebound recovery",
      "Special teams execution (Powerplay / Penalty Kill)",
      "Dedicated off-ice strength, mobility & VO2 max conditioning",
      "Full league game season registration included",
    ],
  },
];

export const INITIAL_BLOG_POSTS: BlogPostData[] = [
  {
    id: "blog-1",
    slug: "mastering-the-wrist-shot",
    title: "5 Secrets to Double Your Wrist Shot Velocity and Accuracy",
    excerpt: "Learn the biomechanics, weight transfer secrets, and blade flex techniques that NHL snipers use to beat elite goaltenders clean.",
    content: `The wrist shot is the most versatile weapon in any hockey player's arsenal. Unlike a winding slap shot, a crisp wrist shot can be released in milliseconds with minimal warning to the goaltender.

### 1. The Weight Transfer Foundation
Power starts from your back leg, coils through your hips and core, and explodes through your bottom hand. If your weight is leaning back, you lose up to 40% of potential kinetic energy.

### 2. Loading the Stick Flex
Modern composite sticks are designed like high-tech catapults. Push your bottom hand downward into the ice before pushing forward to bend the carbon shaft.

### 3. Blade Roll and Follow-Through
Point the toe of your stick exactly where you want the puck to go. A high follow-through sends the puck top shelf; a low follow-through keeps it grounded.`,
    category: "Skills & Drills",
    author: {
      name: "Dave Miller",
      role: "Head Skills Coach",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    image: "/images/1.png",
    readTime: "4 min read",
    publishedAt: "Aug 20, 2026",
    tags: ["Shooting", "Drills", "Training"],
  },
  {
    id: "blog-2",
    slug: "hockey-skate-maintenance-guide",
    title: "The Ultimate Guide to Edge Sharpening, Radius & Skate Care",
    excerpt: "How choosing the right hollow depth (1/2 inch vs 5/8 inch) directly impacts your glide speed, turning grip, and fatigue levels on ice.",
    content: `Your skate edges are the only contact point between your power and the ice surface. Keeping them maintained is critical to speed and safety.

### Radius of Hollow (ROH)
- **1/2 Inch**: Great for lighter players and tight cornering.
- **5/8 Inch**: Excellent for heavier skaters looking for effortless glide and less muscle fatigue.

### Post-Game Care
Always wipe blades dry immediately after skating with a microfiber towel to avoid oxidation, and use breathable cloth soakers.`,
    category: "Equipment & Gear",
    author: {
      name: "Sarah Jenkins",
      role: "Equipment Specialist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    image: "/images/8.png",
    readTime: "5 min read",
    publishedAt: "Aug 18, 2026",
    tags: ["Skates", "Maintenance", "Gear"],
  },
  {
    id: "blog-3",
    slug: "game-day-nutrition-for-hockey-players",
    title: "High-Energy Game Day Nutrition Plan for Ice Athletes",
    excerpt: "What to eat 4 hours, 2 hours, and 30 minutes before stepping onto the ice to maintain explosive anaerobic stamina through all 3 periods.",
    content: `Hockey is an intense intermittent sprint sport requiring rapid glycogen replenishment and optimal hydration.

### 4 Hours Pre-Game: Complex Carbohydrates + Lean Protein
Brown rice or whole-wheat pasta paired with grilled chicken breast and steamed vegetables.

### 60 Minutes Pre-Game: Fast Digestion Hydration
Electrolyte drink, a banana, or a bowl of oatmeal with honey.

### Post-Game Recovery Window
Consume 20-30g of whey protein and easily digestible carbs within 30 minutes to jumpstart muscle protein synthesis.`,
    category: "Nutrition & Health",
    author: {
      name: "Dr. Marcus Vance",
      role: "Club Sports Nutritionist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
    image: "/images/3.png",
    readTime: "6 min read",
    publishedAt: "Aug 12, 2026",
    tags: ["Nutrition", "Fitness", "Recovery"],
  },
];

export const INITIAL_MATCH_TICKETS: MatchTicketData[] = [
  {
    id: "match-1",
    matchTitle: "Apex Predators vs Northern Blades",
    tournament: "National Premier Winter Cup 2026",
    homeTeam: "Apex Predators",
    awayTeam: "Northern Blades",
    venue: "Mohakhali Olympic Ice Arena, Main Rink",
    date: "Sep 15, 2026",
    time: "07:30 PM",
    image: "/images/1.png",
    priceTiers: [
      { name: "General Admission", price: 15, description: "Standard grandstand upper tiers with full stadium sightlines", availableSeats: 120 },
      { name: "Club Lower Bowl", price: 35, description: "Close-up seats right near the action and penalty boxes", availableSeats: 45 },
      { name: "VIP Glass & Lounge", price: 85, description: "Front row glass seating + access to VIP lounge with complimentary refreshments", availableSeats: 12 },
    ],
  },
  {
    id: "match-2",
    matchTitle: "Ice Tigers vs Frostbite Rangers",
    tournament: "Championship Derby Match",
    homeTeam: "Ice Tigers",
    awayTeam: "Frostbite Rangers",
    venue: "Mohakhali Olympic Ice Arena, Center Court",
    date: "Sep 22, 2026",
    time: "08:00 PM",
    image: "/images/4.png",
    priceTiers: [
      { name: "General Admission", price: 18, description: "Grandstand seating with giant video board visibility", availableSeats: 90 },
      { name: "Club Lower Bowl", price: 40, description: "Prime center ice viewing rows 5-15", availableSeats: 30 },
      { name: "VIP Glass & Lounge", price: 95, description: "Glass row seating + Meet & Greet with players post-match", availableSeats: 8 },
    ],
  },
];
