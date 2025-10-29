import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { guidedExercises } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Zap, PlayCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function GuidedExercises() {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-emerald-50/30 border-slate-200/60 shadow-lg transition-calm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Zap className="w-5 h-5 text-emerald-500" />
          Quick Exercises
        </CardTitle>
        <CardDescription className="text-slate-600">
          Take a short break to calm your mind. Click on an exercise for a guided session.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guidedExercises.map((exercise) => {
          const placeholder = PlaceHolderImages.find(p => p.id === exercise.imageId);
          return (
            <Dialog key={exercise.id}>
              <DialogTrigger asChild>
                <div className="group relative overflow-hidden rounded-lg cursor-pointer">
                  {placeholder && (
                    <Image
                      src={placeholder.imageUrl}
                      alt={placeholder.description}
                      width={400}
                      height={250}
                      data-ai-hint={placeholder.imageHint}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center">
                     <PlayCircle className="w-14 h-14 text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 shadow-lg" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <Badge variant="secondary" className="mb-1 bg-background/80">
                      <exercise.Icon className="w-3 h-3 mr-1.5" />
                      {exercise.title}
                    </Badge>
                    <p className="text-xs text-primary-foreground/80 font-light">{exercise.description}</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2"> <exercise.Icon className="w-6 h-6 text-primary" /> {exercise.title}</DialogTitle>
                  <DialogDescription>
                    {exercise.description} Follow the steps and video below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 mt-4">
                   <div className="aspect-video w-full">
                     <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${exercise.videoId}`}
                        title={`YouTube video player for ${exercise.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                   </div>
                  <div>
                    <h3 className="font-semibold mb-2">How to do it:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      {exercise.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  {exercise.backendLink && (
                    <div className="flex justify-end">
                      <Button
                        onClick={async () => {
                          try {
                            await fetch(exercise.backendLink, { method: 'POST' })
                          } catch (e) {
                            // swallow
                          }
                        }}
                        variant="secondary"
                      >
                        <LinkIcon className="w-4 h-4 mr-2" /> Start via Backend
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </CardContent>
    </Card>
  );
}
