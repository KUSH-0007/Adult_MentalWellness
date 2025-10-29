
'use client';

import { AppHeader } from "@/components/layout/app-header";
import { FeaturesSection } from "@/components/features/features-section";
import { Hero } from "@/components/features/hero";
import { FindDoctorSection } from "@/components/features/find-doctor-section";
import { Footer } from "@/components/layout/footer";
import { AboutSection } from "@/components/features/about-section";
import { BlogSection } from "@/components/features/blog-section";
import { SymptomChecker } from '@/components/symptom-checker';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <FeaturesSection />
        <SymptomChecker />
        <BlogSection />
        <FindDoctorSection />
      </main>
      <Footer />
    </div>
  );
}
