// src/pages/Contact.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if the URL contains a success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('success') === 'true') {
      setIsSuccess(true);

      // Clear the success parameter after 5 seconds
      const timer = setTimeout(() => {
        // Remove success from URL without refreshing the page
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        setIsSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get the form element
    const form = e.target as HTMLFormElement;

    // Validate the form
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const messageInput = form.elements.namedItem('message') as HTMLTextAreaElement;

    if (!nameInput.value.trim()) {
      setFormError("Please enter your name");
      setIsSubmitting(false);
      return;
    }

    if (!emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
      setFormError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (!messageInput.value.trim()) {
      setFormError("Please enter a message");
      setIsSubmitting(false);
      return;
    }

    // Clear previous errors
    setFormError("");

    // Submit the form to FormSubmit.co
    form.action = "https://formsubmit.co/contact@lawofsupremacism.com";
    form.method = "POST";
    form.submit();
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

          {/* Success message */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-400 rounded-lg text-white">
              <p className="font-medium text-lg mb-1">Message Sent Successfully!</p>
              <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
            </div>
          )}

          {/* Error message */}
          {formError && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-400 rounded-lg text-white">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {/* FormSubmit configuration */}
            <input type="hidden" name="_subject" value="New message from Law of Supremacism website" />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value="https://lawofsupremacism.com/contact?success=true" />

            {/* Prevent spam using honeypot */}
            <input type="text" name="_honey" style={{ display: 'none' }} />

            {/* Auto-response to sender */}
            <input type="hidden" name="_autoresponse" value="Thank you for contacting the Law of Supremacism project. We've received your message and will respond soon." />

            <div>
              <label htmlFor="name" className="block mb-2 text-white">Name</label>
              <Input
                id="name"
                name="name"
                className="bg-black/50 border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-white">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                className="bg-black/50 border-white/20 text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block mb-2 text-white">Message</label>
              <Textarea
                id="message"
                name="message"
                className="bg-black/50 border-white/20 text-white"
                rows={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-black/50 text-white border-2 border-white/20 hover:bg-black/60 hover:border-white/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default Contact;