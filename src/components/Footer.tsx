// src/components/Footer.tsx

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FooterProps {
  pullDistance?: number;
  maxPullDistance?: number;
}

export const Footer = ({ pullDistance = 0, maxPullDistance = 800 }: FooterProps) => {
  const navigate = useNavigate();

  // Calculate opacity and blur based on pull distance
  const opacity = Math.max(0.02, 0.8 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)));
  const blurAmount = Math.max(2, 12 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)) * 10);

  return (
    <footer
      className={cn(
        "w-full z-50 border-t transition-all duration-200",
        "hover:bg-black/40 hover:backdrop-blur-md"
      )}
      style={{
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        backdropFilter: `blur(${blurAmount}px)`,
        borderColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
      }}
    >
      <div className="container mx-auto flex justify-center py-4 px-8">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate("/contact")}
          >
            Contact
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate("/partners")}
          >
            Partners
          </Button>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate("/donate")}
          >
            Donate
          </Button>
        </div>
      </div>
    </footer>
  );
};