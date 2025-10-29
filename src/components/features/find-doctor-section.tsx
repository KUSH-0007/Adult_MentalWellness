'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

export function FindDoctorSection() {
  const { toast } = useToast();
  const doctorImage = PlaceHolderImages.find(p => p.id === 'doctor-photo');

  const handleFindDoctor = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation.',
      });
      window.open(`https://www.google.com/maps/search/mental+health+doctor/`, '_blank');
      return;
    }

    toast({
      title: 'Finding Your Location',
      description: 'Please allow location access to find doctors near you.',
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        window.open(
          `https://www.google.com/maps/search/mental+health+doctor/@${latitude},${longitude},14z`,
          '_blank'
        );
      },
      () => {
        toast({
          variant: 'destructive',
          title: 'Location Access Denied',
          description: 'Searching for doctors without your precise location.',
        });
        window.open(`https://www.google.com/maps/search/mental+health+doctor/`, '_blank');
      }
    );
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
              Professional Support
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Find a Doctor
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform connects you with a network of licensed therapists and psychiatrists. Find the right professional to support your mental health journey.
            </p>
            <Button size="lg" onClick={handleFindDoctor}>
              <MapPin className="mr-2" />
              Find a Doctor Near You
            </Button>
          </div>
          <div className="flex justify-center">
            {doctorImage && (
              <Image
                src={doctorImage.imageUrl}
                alt={doctorImage.description}
                width={600}
                height={400}
                data-ai-hint={doctorImage.imageHint}
                className="overflow-hidden rounded-xl object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
