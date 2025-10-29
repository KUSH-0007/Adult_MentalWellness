'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useState, type FC } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateWeeklySummary, getMoodForecast, type SummaryFormState } from '@/app/actions';
import { TrendingUp, Sparkles, Info, Loader2, BrainCircuit } from 'lucide-react';
import { mockWeeklySentiment } from '@/lib/data';
import type { MoodForecastOutput } from '@/ai/flows/get-mood-forecast';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const chartConfig = {
  sentiment: {
    label: 'Sentiment',
    color: 'hsl(var(--accent))',
  },
};

const initialSummaryState: SummaryFormState = {
  message: null,
  summary: null,
  timestamp: Date.now(),
};

function SummaryButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      variant="secondary" 
      size="sm" 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-indigo-300 text-indigo-700 hover:text-indigo-900 transition-all duration-300"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
      Generate Weekly Summary
    </Button>
  );
}

export function ProgressOverview() {
  const [summaryState, formAction] = useActionState(generateWeeklySummary, initialSummaryState);
  const [displayedSummaryState, setDisplayedSummaryState] = useState(initialSummaryState);
  const [forecast, setForecast] = useState<MoodForecastOutput | null>(null);
  const [isForecastLoading, setIsForecastLoading] = useState(true);

  useEffect(() => {
    if (summaryState.timestamp !== displayedSummaryState.timestamp) {
      setDisplayedSummaryState(summaryState);
    }
  }, [summaryState, displayedSummaryState.timestamp]);

  useEffect(() => {
    async function fetchForecast() {
      try {
        setIsForecastLoading(true);
        const forecastData = await getMoodForecast();
        setForecast(forecastData);
      } catch (error) {
        console.error('Failed to fetch mood forecast:', error);
      } finally {
        setIsForecastLoading(false);
      }
    }
    fetchForecast();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-indigo-50/30 border-slate-200/60 shadow-lg transition-calm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Emotional Trend Analysis
        </CardTitle>
        <CardDescription className="text-slate-600">
          Visualize your emotional journey and get AI-powered insights, including predictive mood forecasts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChartContainer config={chartConfig} className="w-full h-48">
          <ResponsiveContainer>
            <LineChart
              data={mockWeeklySentiment}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis domain={[-1, 1]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Line dataKey="sentiment" type="monotone" stroke="var(--color-sentiment)" strokeWidth={3} dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <Separator />

        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <BrainCircuit className="w-4 h-4 text-primary" />
            Predictive Mood Forecast
          </h4>
          {isForecastLoading ? (
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Forecasting your mood for tomorrow...</span>
            </div>
          ) : forecast ? (
            <Alert variant="default" className="bg-background">
               <div className="flex items-center justify-between">
                <AlertTitle className="capitalize text-primary-foreground/90">
                  Tomorrow's Outlook: {forecast.predictedMood}
                </AlertTitle>
                <Badge variant="outline">Confidence: {(forecast.confidence * 100).toFixed(0)}%</Badge>
              </div>
              <AlertDescription className="mt-2 text-muted-foreground">{forecast.reasoning}</AlertDescription>
            </Alert>
          ) : (
             <p className="text-xs text-muted-foreground">Could not retrieve mood forecast at this time.</p>
          )}
        </div>

      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        {displayedSummaryState.summary ? (
           <Alert className="bg-accent/10 border-accent/50">
             <Info className="h-4 w-4 text-accent-foreground" />
             <AlertTitle className="text-accent-foreground">Your AI-Generated Summary</AlertTitle>
             <AlertDescription className="text-muted-foreground">{displayedSummaryState.summary}</AlertDescription>
           </Alert>
        ) : (
          <p className="text-xs text-muted-foreground">You can also generate an AI summary of your week based on your entries.</p>
        )}
        <form action={formAction}>
          <SummaryButton />
        </form>
      </CardFooter>
    </Card>
  );
}
