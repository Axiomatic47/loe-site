// src/pages/Donate.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";

const BlurPanel = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg p-8 sm:p-12",
        "backdrop-blur-md bg-black/80",
        "border border-white/10",
        "shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

const DonationButton = ({ amount }: { amount: string }) => (
  <Button
    variant="outline"
    className="h-32 text-xl bg-black/50 text-white border-2 border-white/20
             hover:bg-black/60 hover:border-white/30 transition-all duration-300"
    onClick={() => console.log(`${amount} donation`)}
  >
    {amount}
    <span className="block text-sm text-gray-400">One-time</span>
  </Button>
);

const Donate = () => {
  const navigate = useNavigate();

  return (
    <PageLayout maxPullDistance={400}>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-white mb-8 hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>

          <h1 className="text-4xl font-serif mb-8 text-white drop-shadow-lg">Support Our Work</h1>

          <div className="max-w-3xl mx-auto space-y-8">
            <p className="text-xl text-gray-300">
              Your donation helps us continue our mission of making corporate law and constitutional rights accessible to everyone.
            </p>

            <div className="grid md:grid-cols-3 gap-4 justify-center">
              <DonationButton amount="$10" />
              <DonationButton amount="$25" />
              <DonationButton amount="$50" />
            </div>

            <div className="bg-black/50 p-6 rounded-lg mt-8 border border-white/20">
              <h2 className="text-2xl mb-4 text-white drop-shadow">Other Ways to Support</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Become a monthly donor</li>
                <li>Corporate matching programs</li>
                <li>Legacy giving</li>
                <li>In-kind donations</li>
              </ul>
            </div>
          </div>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default Donate;