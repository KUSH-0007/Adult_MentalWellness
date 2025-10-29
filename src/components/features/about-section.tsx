'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export function AboutSection() {
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-sentiheal');

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50/30 to-white" id="about">
      <div className="container mx-auto px-6 text-center md:text-left md:flex md:items-center md:space-x-12">
        {/* Image */}
        <div className="md:w-1/2 mb-10 md:mb-0">
          {aboutImage && (
            <Image
              src={aboutImage.imageUrl}
              alt={aboutImage.description}
              width={600}
              height={400}
              data-ai-hint={aboutImage.imageHint}
              className="rounded-2xl shadow-xl w-full transition-transform duration-700 hover:scale-[1.02]"
            />
          )}
        </div>

        {/* Content */}
        <div className="md:w-1/2 space-y-6 animate-soft-fade-in">
          <h2 className="text-4xl md:text-5xl font-light text-slate-700">
            About <span className="font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SentiHeal</span>
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            SentiHeal is an AI-driven mental health companion that blends empathy and technology.
            It listens, understands, and responds — offering personalized insights, emotional tracking,
            and support to help you stay mentally balanced and resilient.
          </p>
          <p className="text-slate-600 leading-relaxed text-lg">
            Our mission is to make mental wellness accessible, stigma-free, and guided by the latest in
            artificial intelligence and human psychology.
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 mt-4"
          >
            <Link href="/journal">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
