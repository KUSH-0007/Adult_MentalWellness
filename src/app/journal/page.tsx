'use client';

import { useState } from 'react';
import { ConversationalAgent } from "@/components/features/conversational-agent";
import { CrisisSupport } from "@/components/features/crisis-support";
import { FacialEmotionRecognition } from "@/components/features/facial-emotion-recognition";
import { GuidedExercises } from "@/components/features/guided-exercises";
import { JournalSection } from "@/components/features/journal-section";
import { PersonalizedRecommendations } from "@/components/features/personalized-recommendations";
import { ProgressOverview } from "@/components/features/progress-overview";
import { type JournalFormState } from '@/app/actions';
import type { VideoRecommendation } from '@/lib/definitions';

export default function JournalPage() {
    const [recommendations, setRecommendations] = useState<VideoRecommendation[] | null>(null);

    const handleAnalysisComplete = (state: JournalFormState) => {
        if (state.analysis?.recommendations) {
            setRecommendations(state.analysis.recommendations);
        }
    };

    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 min-h-screen">
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="lg:col-span-2 xl:col-span-2 space-y-8">
              <JournalSection onAnalysisComplete={handleAnalysisComplete} />
              <ConversationalAgent />
              <ProgressOverview />
            </div>
            <div className="space-y-8">
              <CrisisSupport />
              <GuidedExercises />
              <PersonalizedRecommendations recommendations={recommendations} />
              <FacialEmotionRecognition />
            </div>
          </div>
        </main>
    );
}
