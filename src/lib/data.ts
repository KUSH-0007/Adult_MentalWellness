import type { GuidedExercise, VideoRecommendation, BlogPost } from '@/lib/definitions';
import { BrainCircuit, Wind, Fingerprint, Youtube, UserCheck, MapPin, HeartPulse } from 'lucide-react';

export const guidedExercises: GuidedExercise[] = [
  {
    id: 'breathing',
    title: 'Box Breathing',
    description: 'A simple technique to calm your nervous system and reduce stress.',
    Icon: Wind,
    imageId: 'breathing-exercise',
    videoId: 'tEmt1Znux58',
    backendLink: '/api/exercises/box-breathing/start',
    steps: [
      'Find a comfortable seated position.',
      'Inhale slowly through your nose for a count of 4.',
      'Hold your breath for a count of 4.',
      'Exhale slowly through your mouth for a count of 4.',
      'Hold your breath again for a count of 4.',
      'Repeat the cycle for 2-3 minutes.'
    ]
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Engage your senses to ground yourself in the present moment.',
    Icon: Fingerprint,
    imageId: 'grounding-exercise',
    videoId: '30VMIEmA114',
    backendLink: '/api/exercises/grounding/start',
    steps: [
      'Acknowledge 5 things you can see around you.',
      'Acknowledge 4 things you can touch around you.',
      'Acknowledge 3 things you can hear.',
      'Acknowledge 2 things you can smell.',
      'Acknowledge 1 thing you can taste.',
      'End with a deep breath.'
    ]
  },
  {
    id: 'mindfulness',
    title: 'Mindful Observation',
    description: 'Practice observing your thoughts and feelings without judgment.',
    Icon: BrainCircuit,
    imageId: 'mindfulness-exercise',
    videoId: 'bLpChrgS0AY',
    backendLink: '/api/exercises/mindful-observation/start',
    steps: [
      'Sit comfortably and close your eyes.',
      'Focus on your breath, noticing the sensation of each inhale and exhale.',
      'As thoughts arise, simply acknowledge them without judgment.',
      'Gently guide your focus back to your breath.',
      'Continue for 5 minutes, allowing thoughts to come and go like clouds in the sky.'
    ]
  },
];

export const mockWeeklySentiment = [
  { day: 'Mon', sentiment: 0.3 },
  { day: 'Tue', sentiment: -0.5 },
  { day: 'Wed', sentiment: 0.8 },
  { day: 'Thu', sentiment: 0.1 },
  { day: 'Fri', sentiment: -0.2 },
  { day: 'Sat', sentiment: 0.6 },
  { day: 'Sun', sentiment: 0.7 },
];

export const mockPastWeekEntries = `
Day 1: Feeling really overwhelmed with work. The deadlines are piling up and I don't know where to start. It's causing a lot of anxiety.
Day 2: Had a slightly better day. Managed to complete one major task, which felt like a small victory. Still feeling the pressure though.
Day 3: Today was tough. A meeting didn't go as planned and I felt criticized. It brought my mood down and I've been feeling sad since.
Day 4: I tried one of the breathing exercises today. It helped me calm down during a moment of panic. I'm feeling a bit more in control.
Day 5: TGIF. I'm exhausted but glad the week is almost over. I feel a sense of relief, but also drained.
Day 6: Spent the day resting and watching movies. It was good to disconnect. Feeling peaceful.
Day 7: Feeling optimistic about the week ahead. Ready to tackle my challenges with a clearer mind. I feel hopeful.
`;

export const allRecommendations: VideoRecommendation[] = [
  {
    id: 'video-1',
    title: 'A 10-Minute Meditation for Stress',
    description: 'A guided meditation to help you find calm and clarity.',
    link: 'https://www.youtube.com/watch?v=z6X5oEig1wA',
    reason: 'Since you mentioned feeling overwhelmed, this short meditation could help.',
    videoId: 'z6X5oEig1wA',
    tags: ['stress', 'anxiety', 'overwhelmed', 'meditation'],
  },
  {
    id: 'video-2',
    title: 'How to Handle "Constructive" Criticism',
    description: 'Learn how to process feedback without letting it get you down.',
    link: 'https://www.youtube.com/watch?v=DqOK52CiO-w',
    reason: 'To help you navigate tough feedback in a more resilient way.',
    videoId: 'DqOK52CiO-w',
    tags: ['sadness', 'criticism', 'resilience'],
  },
   {
    id: 'video-3',
    title: 'The Power of a Growth Mindset',
    description: 'Discover how changing your mindset can help you face challenges with optimism.',
    link: 'https://www.youtube.com/watch?v=75GFzikmRY0',
    reason: 'To build on your recent feelings of hope and optimism for the future.',
    videoId: '75GFzikmRY0',
    tags: ['optimism', 'hope', 'growth mindset', 'motivation'],
  },
  {
    id: 'video-4',
    title: 'Why You Should Practice Emotional First Aid',
    description: 'Psychologist Guy Winch on the importance of emotional hygiene.',
    link: 'https://www.youtube.com/watch?v=gIOf3MZuL0U',
    reason: 'To learn how to manage and treat psychological injuries.',
    videoId: 'gIOf3MZuL0U',
    tags: ['resilience', 'mental health', 'psychology'],
  },
  {
    id: 'video-5',
    title: 'A Guided Meditation on Self-Love',
    description: 'A short, guided meditation to cultivate self-love and acceptance.',
    link: 'https://www.youtube.com/watch?v=Te8DnpcA4-A',
    reason: 'To help you cultivate a sense of self-worth and inner peace.',
    videoId: 'Te8DnpcA4-A',
    tags: ['self-love', 'sadness', 'anxiety', 'meditation'],
  },
  {
    id: 'video-6',
    title: 'How to Overcome Overthinking',
    description: 'A video explaining the cycle of overthinking and how to break it.',
    link: 'https://www.youtube.com/watch?v=-GXfLY4-d8w',
    reason: 'To help you break free from rumination and find mental clarity.',
    videoId: '-GXfLY4-d8w',
    tags: ['anxiety', 'overwhelmed', 'stress', 'overthinking'],
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    category: 'Mindfulness',
    title: 'The Art of Mindful Living: A Beginner’s Guide',
    description: 'Discover how to bring mindfulness into your daily life, reducing stress and increasing your sense of presence.',
    imageId: 'blog-mindfulness',
    link: '#',
  },
  {
    id: 'blog-2',
    category: 'Sleep',
    title: 'Unlocking Better Sleep: Tips for a Restful Night',
    description: 'Struggling with sleep? Explore proven techniques to improve your sleep hygiene and wake up refreshed.',
    imageId: 'blog-sleep',
    link: '#',
  },
  {
    id: 'blog-3',
    category: 'Stress',
    title: 'Navigating Stress: How to Find Calm in Chaos',
    description: 'Learn practical strategies to manage stress, build resilience, and maintain balance in a fast-paced world.',
    imageId: 'blog-stress',
    link: '#',
  },
];
