export type GuidedExercise = {
  id: string;
  title: string;
  description: string;
  Icon: React.ElementType;
  imageId: string;
  steps: string[];
  videoId: string;
  backendLink?: string;
};

export type JournalAnalysis = {
  emotion: string;
  sentimentScore: number;
  response: string;
  isCrisis?: boolean;
  recommendations?: VideoRecommendation[];
};

export type VideoRecommendation = {
  id: string;
  title: string;
  description: string;
  link: string;
  reason: string;
  videoId?: string;
  tags: string[];
};

export type BlogPost = {
  id: string;
  category: string;
  title: string;
  description: string;
  imageId: string;
  link: string;
};
