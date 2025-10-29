'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { BandageIcon, MoonZzzIcon } from "../icons/misc";

const features = [
    {
        icon: <BandageIcon className="w-8 h-8 mb-4 text-primary" />,
        title: 'Stress less',
        description: 'Learn to manage stress with guided meditations and breathing exercises.',
        link: 'https://www.webmd.com/balance/stress-management/stress-management-breathing-exercises-for-relaxation',
    },
    {
        icon: <MoonZzzIcon className="w-8 h-8 mb-4 text-primary" />,
        title: 'Sleep more',
        description: 'Discover techniques to calm your mind and improve your sleep quality.',
        link: 'https://www.sleepfoundation.org/sleep-hygiene/relaxation-exercises-for-falling-asleep',
    },
    {
        icon: <Leaf className="w-8 h-8 mb-4 text-primary" />,
        title: 'Live mindfully',
        description: 'Practice mindfulness to stay present and appreciate every moment.',
        link: 'https://www.mindful.org/how-to-practice-mindfulness/',
    },
];

export function FeaturesSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">We're here to help you feel better</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Explore our features designed to support your mental wellness journey.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
                    {features.map((feature) => (
                            <Card key={feature.title} className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-white to-slate-50/50 border-slate-200/60 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                             {feature.icon}
                            <CardHeader className="p-0">
                                <CardTitle className="text-slate-700">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-2">
                                <p className="text-slate-600">{feature.description}</p>
                            </CardContent>
                             <Link
                                href={feature.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-6 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50"
                                >
                                Learn More
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
