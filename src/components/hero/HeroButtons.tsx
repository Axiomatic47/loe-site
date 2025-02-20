// src/components/hero/HeroButtons.tsx

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HeroButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-6">
      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/composition/memorandum")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Memorandum and Manifestation</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/composition/corrective")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Corrective Measures</span>
      </Button>
    </div>
  );
};