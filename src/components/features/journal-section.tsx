'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { analyzeJournalEntry, type JournalFormState, transcribeAudio } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Smile, Frown, Meh, Sparkles, Loader2, Mic, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const initialState: JournalFormState = {
  message: null,
  analysis: null,
  timestamp: Date.now(),
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
      Analyze My Feelings
    </Button>
  );
}

const EmotionIcon = ({ emotion }: { emotion: string }) => {
  const lowerEmotion = emotion.toLowerCase();
  if (lowerEmotion.includes('joy') || lowerEmotion.includes('hopeful') || lowerEmotion.includes('happy') || lowerEmotion.includes('optimism')) {
    return <Smile className="text-green-500" />;
  }
  if (lowerEmotion.includes('sadness') || lowerEmotion.includes('anxiety') || lowerEmotion.includes('fear') || lowerEmotion.includes('overwhelmed')) {
    return <Frown className="text-blue-500" />;
  }
  return <Meh className="text-yellow-500" />;
};

export function JournalSection({ onAnalysisComplete }: { onAnalysisComplete: (state: JournalFormState) => void }) {
  const [state, formAction] = useActionState(analyzeJournalEntry, initialState);
  const [displayedState, setDisplayedState] = useState(initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const { transcription } = await transcribeAudio({ audioDataUri: base64Audio });
            if (textareaRef.current) {
              textareaRef.current.value = transcription;
            }
          } catch (error) {
            console.error('Transcription failed:', error);
            // Optionally, show an error to the user
          } finally {
            setIsTranscribing(false);
          }
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      // Optionally, show an error to the user that mic access was denied
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks on the stream to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (state.timestamp !== displayedState.timestamp) {
      setDisplayedState(state);
      onAnalysisComplete(state);
      
      // Dispatch a custom event with the analysis results
      window.dispatchEvent(new CustomEvent('journalAnalyzed', { detail: state }));

      if (state.analysis && !state.analysis.isCrisis) {
        formRef.current?.reset();
      }
    }
  }, [state, displayedState.timestamp, onAnalysisComplete]);
  
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-purple-50/30 border-slate-200/60 shadow-lg transition-calm">
      <form action={formAction} ref={formRef}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Bot className="w-5 h-5 text-indigo-500" />
            How are you feeling today?
          </CardTitle>
          <CardDescription className="text-slate-600">
            Write down your thoughts and feelings, or use the microphone to record your entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={textareaRef}
            name="entry"
            placeholder="I've been feeling a bit overwhelmed lately..."
            rows={5}
            required
            minLength={10}
            maxLength={1000}
            disabled={isRecording || isTranscribing}
            className="resize-none border-slate-300 focus:border-indigo-400 focus:ring-indigo-400 transition-calm bg-white/80"
          />
          {displayedState.message && !displayedState.analysis && (
            <p className="text-sm font-medium text-destructive mt-2">{displayedState.message}</p>
          )}
        </CardContent>
        <CardFooter className="justify-between items-center">
           <div className="flex items-center gap-4">
             <Button
                type="button"
                variant={isRecording ? 'destructive' : 'outline'}
                size="icon"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isTranscribing}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isTranscribing ? (
                  <Loader2 className="animate-spin" />
                ) : isRecording ? (
                  <Square />
                ) : (
                  <Mic />
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                {isTranscribing ? 'Transcribing...' : (isRecording ? 'Recording...' : 'Your entries are private.')}
              </p>
           </div>
          <SubmitButton />
        </CardFooter>
      </form>

      {displayedState.analysis && !displayedState.analysis.isCrisis && (
        <div className="p-6 pt-0">
          <Alert className="bg-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EmotionIcon emotion={displayedState.analysis.emotion} />
                <AlertTitle className="capitalize">Detected Emotion: {displayedState.analysis.emotion}</AlertTitle>
              </div>
              <Badge variant="outline">Sentiment: {displayedState.analysis.sentimentScore.toFixed(2)}</Badge>
            </div>
            <AlertDescription className="mt-4 text-foreground">
              {displayedState.analysis.response}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
