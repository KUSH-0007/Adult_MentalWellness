'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background-calm');

  return (
    <section className="relative w-full h-[700px] flex items-center justify-center text-center overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover scale-105 transition-transform duration-1000"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-purple-50/30 to-blue-50/40 backdrop-blur-[1px]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent"></div>
      <div className="relative z-10 space-y-8 max-w-3xl px-4 animate-soft-fade-in">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-700 leading-tight tracking-tight">
          Empower Your Mind with{' '}
          <span className="font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            SentiHeal
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
          Your AI-powered companion for emotional wellness — track moods, talk with empathy, and find peace through smart mental health insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/30 px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            <Link href="/journal">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105">
            <Link href="/mediscan">MediScan</Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline" 
            className="bg-white/80 backdrop-blur-sm border-2 border-slate-300/60 text-slate-700 hover:bg-white hover:border-indigo-400 px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            <Link href="#about">Learn More</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
}
