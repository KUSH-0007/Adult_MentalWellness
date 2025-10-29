'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { blogPosts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

export function BlogSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Wellness Reads</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Explore our articles for insights on mindfulness, stress, and mental well-being.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
          {blogPosts.map((post) => {
            const placeholder = PlaceHolderImages.find(p => p.id === post.imageId);
            return (
              <Card key={post.id} className="overflow-hidden h-full flex flex-col">
                <Link href={post.link} className="block group">
                  {placeholder && (
                    <Image
                      src={placeholder.imageUrl}
                      alt={placeholder.description}
                      width={600}
                      height={400}
                      data-ai-hint={placeholder.imageHint}
                      className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </Link>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <span className="text-primary font-semibold text-sm">{post.category}</span>
                  <h3 className="text-xl font-bold mt-2">{post.title}</h3>
                  <p className="text-muted-foreground mt-2 flex-1">{post.description}</p>
                   <Button asChild variant="link" className="p-0 h-auto mt-4 self-start">
                      <Link href={post.link} className="flex items-center gap-2">
                        Read More <ArrowRight className="w-4 h-4" />
                      </Link>
                   </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
