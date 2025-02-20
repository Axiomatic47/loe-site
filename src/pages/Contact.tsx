// src/pages/Contact.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const Contact = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-white mb-8 hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>

          <h1 className="text-4xl font-serif mb-8 text-white drop-shadow-lg">Contact Us</h1>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-white">Name</label>
              <Input
                id="name"
                className="bg-black/50 border-white/20 text-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-white">Email</label>
              <Input
                id="email"
                type="email"
                className="bg-black/50 border-white/20 text-white"
              />
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 text-white">Message</label>
              <Textarea
                id="message"
                className="bg-black/50 border-white/20 text-white"
                rows={6}
              />
            </div>

            <Button
              type="submit"
              className="bg-black/50 text-white border-2 border-white/20 hover:bg-black/60 hover:border-white/30"
            >
              Send Message
            </Button>
          </form>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default Contact;