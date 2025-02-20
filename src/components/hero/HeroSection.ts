import React from 'react';
import { HeroButtons } from "@/components/hero/HeroButtons";

const HeroSection = () => {
  return (
    <div className="text-center mb-24">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 tracking-tight leading-tight max-w-5xl mx-auto">
        A Constitutional Analysis
        <br />
        of Corporate Personhood
      </h1>

      <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-16 leading-relaxed px-4">
        Explore the legal framework and implications of corporate personhood in constitutional law.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
        <HeroButtons />
      </div>
    </div>
  );
};

export default HeroSection;