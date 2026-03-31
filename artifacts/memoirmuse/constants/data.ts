export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  details: string;
  icon: string;
  color: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
}

export interface ARMarker {
  id: string;
  title: string;
  description: string;
  details: string;
  icon: string;
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "1",
    year: "1858",
    title: "Birth in Marikina",
    description: "Pedro Serrano Tolentino was born in Marikina, Rizal, Philippines.",
    details: "Born on August 25, 1858, in the town of Marikina (now Marikina City), Pedro Serrano Tolentino grew up in a family with deep roots in Philippine culture and tradition. His early life in Marikina would shape his passion for literature, music, and the Filipino identity.",
    icon: "heart",
    color: "#C4544A",
  },
  {
    id: "2",
    year: "1870s",
    title: "Early Education",
    description: "Tolentino received his early education in local schools and showed remarkable literary talent.",
    details: "As a youth, Pedro demonstrated exceptional aptitude for language and the arts. He studied in local schools in Marikina and Manila, immersing himself in classical literature, music, and the emerging nationalist ideas that would define his generation.",
    icon: "book",
    color: "#C8922A",
  },
  {
    id: "3",
    year: "1880s",
    title: "Literary Beginnings",
    description: "He began writing plays and zarzuelas that celebrated Filipino life and culture.",
    details: "During the 1880s, Tolentino began his prolific literary career writing theatrical works. He composed zarzuelas — musical plays combining spoken dialogue with songs — that depicted everyday Filipino life with humor, pathos, and cultural authenticity that resonated deeply with audiences.",
    icon: "pen-tool",
    color: "#4A8C5C",
  },
  {
    id: "4",
    year: "1900",
    title: "Kahapon, Ngayon at Bukas",
    description: "He wrote his masterpiece 'Kahapon, Ngayon at Bukas' (Yesterday, Today and Tomorrow).",
    details: "In 1900, during the Philippine-American War, Tolentino wrote his most celebrated work: 'Kahapon, Ngayon at Bukas' (Yesterday, Today and Tomorrow). This allegorical play used symbolism to critique American colonial rule without direct confrontation, showcasing Tolentino's genius for embedding political resistance within artistic expression.",
    icon: "star",
    color: "#8B2E2E",
  },
  {
    id: "5",
    year: "1903",
    title: "Imprisonment by Americans",
    description: "Tolentino was arrested by American colonial authorities for seditious writing.",
    details: "His outspoken nationalism through his theatrical works drew the attention of American colonial authorities. In 1903, Tolentino was arrested and imprisoned for sedition, as his plays were deemed threatening to American colonial rule. This persecution only strengthened his resolve and cemented his legacy as a patriot-artist.",
    icon: "shield",
    color: "#5C1A1A",
  },
  {
    id: "6",
    year: "1905–1910",
    title: "Golden Years of Zarzuela",
    description: "Released from prison, Tolentino continued creating influential theatrical works.",
    details: "After his release, Tolentino entered his most productive period. He wrote dozens of zarzuelas and plays performed across the Philippines. His works became vehicles for cultural preservation, teaching audiences about Philippine history, values, and the importance of maintaining Filipino identity under colonial rule.",
    icon: "music",
    color: "#C8922A",
  },
  {
    id: "7",
    year: "1913",
    title: "Legacy Endures",
    description: "Pedro S. Tolentino passed away on May 25, 1913, leaving a lasting cultural legacy.",
    details: "Pedro Serrano Tolentino died on May 25, 1913, in Marikina. Though his life was cut short, his contributions to Philippine theater, literature, and nationalism left an indelible mark. Today he is celebrated as the 'Father of Tagalog Zarzuela' and an enduring symbol of Filipino cultural resistance and artistic excellence.",
    icon: "award",
    color: "#6B4A35",
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    title: "Portrait of Pedro S. Tolentino",
    description: "A historical portrait of the celebrated playwright and nationalist.",
    category: "Portrait",
    year: "c. 1900",
  },
  {
    id: "2",
    title: "Kahapon, Ngayon at Bukas Manuscript",
    description: "Original manuscript pages from his masterpiece allegory.",
    category: "Manuscript",
    year: "1900",
  },
  {
    id: "3",
    title: "Marikina Theater Scene",
    description: "A depiction of early 20th century theatrical performance in Marikina.",
    category: "Theater",
    year: "c. 1905",
  },
  {
    id: "4",
    title: "Philippine Zarzuela Program",
    description: "Program booklet from a Tolentino zarzuela performance.",
    category: "Document",
    year: "c. 1908",
  },
  {
    id: "5",
    title: "Colonial Era Marikina",
    description: "Historical photograph of Marikina during the American colonial period.",
    category: "History",
    year: "c. 1903",
  },
  {
    id: "6",
    title: "Filipino Nationalist Movement",
    description: "A visual representation of the nationalist literary movement.",
    category: "Movement",
    year: "c. 1900",
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "1",
    question: "Where was Pedro S. Tolentino born?",
    options: ["Manila", "Marikina", "Cavite", "Pampanga"],
    correct: 1,
    explanation: "Pedro Serrano Tolentino was born in Marikina, Rizal, on August 25, 1858.",
  },
  {
    id: "2",
    question: "What is the title of Tolentino's most celebrated masterpiece?",
    options: [
      "Noli Me Tangere",
      "Florante at Laura",
      "Kahapon, Ngayon at Bukas",
      "Banaag at Sikat",
    ],
    correct: 2,
    explanation: "'Kahapon, Ngayon at Bukas' (Yesterday, Today and Tomorrow) is his most celebrated allegorical play written in 1900.",
  },
  {
    id: "3",
    question: "What theatrical form did Tolentino primarily write?",
    options: ["Corrido", "Zarzuela", "Komedya", "Moro-moro"],
    correct: 1,
    explanation: "Tolentino is celebrated as the 'Father of Tagalog Zarzuela', a musical play combining dialogue with songs.",
  },
  {
    id: "4",
    question: "Why was Tolentino imprisoned by American authorities?",
    options: [
      "Tax evasion",
      "Theft",
      "Seditious writing through his theatrical works",
      "Unauthorized assembly",
    ],
    correct: 2,
    explanation: "In 1903, Tolentino was arrested and imprisoned for sedition — his plays were deemed threatening to American colonial rule.",
  },
  {
    id: "5",
    question: "What year did Pedro S. Tolentino pass away?",
    options: ["1910", "1913", "1920", "1905"],
    correct: 1,
    explanation: "Pedro Serrano Tolentino died on May 25, 1913, in Marikina.",
  },
  {
    id: "6",
    question: "What does 'Kahapon, Ngayon at Bukas' translate to in English?",
    options: [
      "Yesterday, Today and Tomorrow",
      "Past, Present and Future",
      "Morning, Noon and Night",
      "Birth, Life and Death",
    ],
    correct: 0,
    explanation: "'Kahapon, Ngayon at Bukas' translates literally to 'Yesterday, Today and Tomorrow' in English.",
  },
  {
    id: "7",
    question: "During which conflict did Tolentino write 'Kahapon, Ngayon at Bukas'?",
    options: [
      "Spanish-American War",
      "Philippine Revolution",
      "Philippine-American War",
      "World War I",
    ],
    correct: 2,
    explanation: "The play was written in 1900 during the Philippine-American War, using allegory to critique American colonial rule.",
  },
  {
    id: "8",
    question: "What title is Tolentino often given?",
    options: [
      "Father of Filipino Poetry",
      "Father of Tagalog Zarzuela",
      "Father of Philippine Theater",
      "Father of Filipino Nationalism",
    ],
    correct: 1,
    explanation: "Pedro S. Tolentino is celebrated as the 'Father of Tagalog Zarzuela' for his pioneering contributions to the art form.",
  },
  {
    id: "9",
    question: "What is the significance of Marikina to Tolentino's legacy?",
    options: [
      "He was governor there",
      "His birthplace and hometown",
      "He built a famous theater there",
      "He was educated there exclusively",
    ],
    correct: 1,
    explanation: "Marikina (now Marikina City) is Tolentino's birthplace and hometown, and holds his cultural legacy.",
  },
  {
    id: "10",
    question: "How did Tolentino embed political resistance in his art?",
    options: [
      "Through direct speeches in plays",
      "Through newspaper articles",
      "Through allegory and symbolism",
      "Through secret underground meetings",
    ],
    correct: 2,
    explanation: "Tolentino used allegory and symbolism in his theatrical works to critique colonial rule without direct confrontation — a hallmark of his artistic genius.",
  },
];

export const MAP_LOCATIONS: MapLocation[] = [
  {
    id: "1",
    name: "Marikina City Museum",
    description: "The primary museum honoring Marikina's cultural heritage including exhibits on Pedro S. Tolentino.",
    address: "J.P. Rizal St., Marikina City, Metro Manila",
    latitude: 14.6507,
    longitude: 121.1029,
    type: "museum",
  },
  {
    id: "2",
    name: "Tolentino Birth Site",
    description: "Historical site marking the approximate area where Pedro S. Tolentino was born in 1858.",
    address: "Marikina City, Metro Manila, Philippines",
    latitude: 14.6510,
    longitude: 121.1045,
    type: "heritage",
  },
  {
    id: "3",
    name: "National Library of the Philippines",
    description: "Houses rare manuscripts and documents related to early Filipino literary figures including Tolentino.",
    address: "T.M. Kalaw Ave., Ermita, Manila",
    latitude: 14.5834,
    longitude: 120.9799,
    type: "library",
  },
  {
    id: "4",
    name: "National Museum of the Philippines",
    description: "Home to the cultural and artistic heritage of the Philippines, including works from Tolentino's era.",
    address: "P. Burgos Ave., Ermita, Manila",
    latitude: 14.5840,
    longitude: 120.9795,
    type: "museum",
  },
  {
    id: "5",
    name: "Marikina Heritage Zone",
    description: "Preserved colonial-era buildings and heritage sites in Marikina's historic district.",
    address: "Shoe Avenue, Marikina City, Metro Manila",
    latitude: 14.6521,
    longitude: 121.1062,
    type: "heritage",
  },
];

export const AR_MARKERS: ARMarker[] = [
  {
    id: "1",
    title: "Zarzuela Stage",
    description: "A traditional Filipino zarzuela stage from the early 20th century",
    details: "This is a recreated stage typical of the theaters where Tolentino's zarzuelas were performed. The Tagalog Zarzuela combined Spanish theatrical traditions with Filipino storytelling, music, and cultural elements.",
    icon: "film",
  },
  {
    id: "2",
    title: "Nationalist Proclamation",
    description: "Historical document representing the spirit of Philippine nationalism",
    details: "During the Philippine-American War, Filipino artists like Tolentino used their craft as weapons of resistance. Documents and proclamations circulated among nationalists helped maintain the spirit of independence.",
    icon: "file-text",
  },
  {
    id: "3",
    title: "Colonial Era Map",
    description: "A map of the Philippines during the American colonial period",
    details: "This map shows the Philippines as it appeared during Tolentino's lifetime, including Marikina and Manila where much of his artistic work took place. The colonial era shaped both the challenges and inspirations of his art.",
    icon: "map",
  },
];

export const BADGES = [
  { id: "1", name: "Historia Novice", minScore: 0, icon: "award" },
  { id: "2", name: "Heritage Seeker", minScore: 5, icon: "star" },
  { id: "3", name: "Historia Scholar", minScore: 8, icon: "bookmark" },
  { id: "4", name: "Tolentino Alagad", minScore: 10, icon: "award" },
];
