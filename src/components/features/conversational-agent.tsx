'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, Mic, Send, Square, User, Zap } from 'lucide-react';
import { getDialogflowResponse, transcribeAudio, textToSpeech } from '@/app/actions';
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: any;
  suggestedExercise?: {
    id: string;
    title: string;
    description: string;
  };
}

export function ConversationalAgent() {
  const [input, setInput] = useState('');
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();

  const messagesRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'conversations');
  }, [firestore, user]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesRef) return null;
    return query(messagesRef, orderBy('timestamp', 'asc'));
  }, [messagesRef]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = (audioDataUri: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioDataUri;
      audioRef.current.play();
    }
  };

  const processAndRespond = async (messageText: string) => {
    if (!messageText.trim() || !messagesRef) return;
    
    // Save user message to Firestore
    addDocumentNonBlocking(messagesRef, {
      text: messageText,
      sender: 'user',
      timestamp: serverTimestamp(),
    });

    setIsBotResponding(true);

    try {
      const { response, suggestedExercise } = await getDialogflowResponse({ message: messageText });
      
      // Save bot response to Firestore
      addDocumentNonBlocking(messagesRef, {
        text: response,
        sender: 'bot',
        timestamp: serverTimestamp(),
        ...(suggestedExercise && { suggestedExercise }),
      });
      
      // Generate and play audio for the bot's response
      const { audioDataUri } = await textToSpeech({ text: response });
      playAudio(audioDataUri);

    } catch (error) {
      console.error('Dialogflow or TTS error:', error);
      const errorMessage = "I'm having a little trouble connecting right now. Please try again in a moment.";
      // Save error message to Firestore
      addDocumentNonBlocking(messagesRef, {
        text: errorMessage,
        sender: 'bot',
        timestamp: serverTimestamp(),
      });
      const { audioDataUri } = await textToSpeech({ text: errorMessage });
      playAudio(audioDataUri);

    } finally {
      setIsBotResponding(false);
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const userMessageText = input;
    setInput('');
    await processAndRespond(userMessageText);
  };

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
            await processAndRespond(transcription);
          } catch (error) {
            console.error('Transcription failed:', error);
          } finally {
            setIsTranscribing(false);
          }
        };
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };


  const isLoading = areMessagesLoading || isBotResponding || isTranscribing;

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200/60 shadow-lg transition-calm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Bot className="w-5 h-5 text-indigo-500" />
          Conversational Companion
        </CardTitle>
        <CardDescription className="text-slate-600">
          Talk through your feelings with an empathetic AI companion, powered by the Gemini API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {areMessagesLoading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {messages && messages.map(message => (
              <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'bot' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><Bot size={16} /></AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col gap-2">
                  <div className={`rounded-xl px-4 py-3 max-w-sm shadow-sm transition-calm ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' 
                      : 'bg-white border border-slate-200 text-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  {message.suggestedExercise && (
                    <Card className="max-w-sm bg-accent/20">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-accent-foreground" /> Suggestion</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                          <h4 className="font-semibold">{message.suggestedExercise.title}</h4>
                          <p className="text-xs text-muted-foreground">{message.suggestedExercise.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                {message.sender === 'user' && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User size={16} /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isBotResponding && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                  <AvatarFallback><Bot size={16} /></AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 max-w-sm bg-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <audio ref={audioRef} className="hidden" />
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Type or record your message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isBotResponding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant={isRecording ? 'destructive' : 'outline'}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isBotResponding || isTranscribing}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            className="transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isTranscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRecording ? <Square /> : <Mic />)}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
