'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Phone, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

// This is a placeholder for a real-time subscription to crisis alerts
const useCrisisState = () => {
  const [isCrisis, setIsCrisis] = useState(false);

  useEffect(() => {
    const handleJournalAnalysis = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.analysis?.isCrisis) {
        setIsCrisis(true);
      } else {
        // Optional: auto-hide the banner after some time if not a crisis
        // setIsCrisis(false); 
      }
    };
    
    window.addEventListener('journalAnalyzed', handleJournalAnalysis);
    
    return () => {
      window.removeEventListener('journalAnalyzed', handleJournalAnalysis);
    };
  }, []);

  return { isCrisis };
};


export function CrisisSupport() {
  const { isCrisis } = useCrisisState();

  if (isCrisis) {
    return (
        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-red-700 dark:from-red-700 dark:to-red-800 dark:border-red-700 text-white shadow-xl animate-gentle-pulse transition-calm">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
            <TriangleAlert className="w-8 h-8 animate-pulse" />
            Immediate Support Required
            </CardTitle>
            <CardDescription className="text-red-50 text-base">
            It looks like you might be in distress. Please reach out for help immediately. You are not alone.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild className="w-full bg-white hover:bg-red-50 text-red-600 font-bold text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <a href="tel:988">
                <Phone className="mr-2 h-5 w-5" />
                Call 988 Crisis & Suicide Lifeline
            </a>
            </Button>
        </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
          <LifeBuoy />
          Need Immediate Support?
        </CardTitle>
        <CardDescription className="text-amber-800 dark:text-amber-200">
          If you are in a crisis or feel you are in danger, please reach out to a professional immediately. Help is always available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-amber-50">
          <a href="tel:988">
            <Phone className="mr-2 h-4 w-4" />
            Call 988 Crisis & Suicide Lifeline
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
