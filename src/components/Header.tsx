// src/components/Header.tsx

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface HeaderProps {
  pullDistance?: number;
  maxPullDistance?: number;
}

export const Header = ({ pullDistance = 0, maxPullDistance = 800 }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Calculate opacity based on pull distance
  const opacity = Math.max(0.02, 0.8 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)));
  const blurAmount = Math.max(2, 12 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)) * 10);

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      toast({
        variant: "default",
        className: cn(
          "bg-black/50 backdrop-blur-md border border-white/20",
          "text-white"
        ),
        description: "You're at home"
      });
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 w-full z-50 border-b transition-all duration-200",
        "hover:bg-black/40 hover:backdrop-blur-md"
      )}
      style={{
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        backdropFilter: `blur(${blurAmount}px)`,
        borderColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4 px-8">
          <button
            onClick={() => navigate("/")}
            className={cn(
              "text-2xl font-serif transition-all duration-200",
              "text-white hover:text-gray-300 drop-shadow-lg"
            )}
          >
            Corporate Veil
          </button>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={handleHomeClick}
          >
            <Home className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};