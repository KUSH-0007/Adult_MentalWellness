'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { UserCheck, Youtube } from 'lucide-react';
import { allRecommendations } from '@/lib/data';
import Image from 'next/image';
import type { VideoRecommendation } from '@/lib/definitions';

interface PersonalizedRecommendationsProps {
  recommendations: VideoRecommendation[] | null;
}

export function PersonalizedRecommendations({ recommendations }: PersonalizedRecommendationsProps) {
  const recommendationsToDisplay = recommendations ?? allRecommendations.slice(0, 3);

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-pink-50/30 border-slate-200/60 shadow-lg transition-calm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <UserCheck className="w-5 h-5 text-pink-500" />
          Personalized For You
        </CardTitle>
        <CardDescription className="text-slate-600">
          {recommendations 
            ? "AI-powered recommendations based on your recent entry."
            : "Some of our top recommendations to get you started."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendationsToDisplay.map((rec) => (
          <a
            key={rec.id}
            href={rec.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-300 hover:scale-[1.02] cursor-pointer bg-white/80">
              <div className="grid grid-cols-3">
                <div className="relative col-span-1">
                  <Image
                    src={`https://img.youtube.com/vi/${rec.videoId}/mqdefault.jpg`}
                    alt={rec.title}
                    width={168}
                    height={94}
                    className="object-cover w-full h-full"
                  />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Youtube className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="col-span-2 p-3">
                   <h4 className="font-semibold text-sm leading-tight">{rec.title}</h4>
                   <p className="text-xs text-muted-foreground mt-1 italic">"{rec.reason}"</p>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
