// src/pages/Contact.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useLocation } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MailIcon, PhoneIcon, GlobeIcon, Send } from "lucide-react";

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

const InfoCard = ({
  icon,
  title,
  content
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) => (
  <div className="flex flex-col items-center p-6 bg-black/40 rounded-lg backdrop-blur-sm border border-white/10 text-center">
    <div className="mb-4 p-3 bg-white/10 rounded-full">{icon}</div>
    <h3 className="text-lg font-medium mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{content}</p>
  </div>
);

const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "general",
    message: "",
    consent: false,
    newsletter: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for success parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll be in touch soon.",
      });

      // Remove success parameter from URL after toast
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location.search, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, inquiryType: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to our privacy policy to submit the form.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Instead of simulated submission, we'll use FormSubmit.co
    const form = e.target as HTMLFormElement;
    form.action = "https://formsubmit.co/contact@lawofsupremacism.com";
    form.method = "POST";
    form.submit();

    // Form will redirect to the URL specified in _next hidden field
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

          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif mb-3 text-white drop-shadow-lg">Get in Touch</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Have questions about our research, want to contribute, or interested in collaboration?
              We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <InfoCard
              icon={<MailIcon className="w-6 h-6 text-blue-400" />}
              title="Email"
              content="contact@lawofsupremacism.com"
            />
            <InfoCard
              icon={<PhoneIcon className="w-6 h-6 text-blue-400" />}
              title="Phone"
              content="+1 (555) 123-4567"
            />
            <InfoCard
              icon={<GlobeIcon className="w-6 h-6 text-blue-400" />}
              title="Location"
              content="Berkeley, California, USA"
            />
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2 bg-black/40 p-6 rounded-lg backdrop-blur-sm border border-white/10">
              <h2 className="text-2xl font-serif mb-4 text-white">How We Can Help</h2>

              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Research Inquiries</h3>
                  <p>Questions about our research methodology, data sources, or findings.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Collaboration</h3>
                  <p>Interested in partnering on projects, contributing content, or participating in our studies.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Media Requests</h3>
                  <p>Journalists seeking interviews, commentary, or background information.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">General Inquiries</h3>
                  <p>Any other questions or comments about our work.</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-medium mb-3 text-white">Connect With Us</h3>
                <div className="flex space-x-4">
                  {/* Social media links would go here */}
                  <Button variant="outline" size="icon" className="bg-black/30 border-white/20 text-white hover:bg-black/50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="bg-black/30 border-white/20 text-white hover:bg-black/50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="bg-black/30 border-white/20 text-white hover:bg-black/50">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.21c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-serif mb-6 text-white">Contact Form</h2>

                {/* FormSubmit.co Configuration - Hidden Fields */}
                <input type="hidden" name="_subject" value="New contact form submission from Law of Supremacism" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://lawofsupremacism.com/contact?success=true" />

                {/* Honeypot field to prevent spam */}
                <input type="text" name="_honey" style={{ display: 'none' }} />

                {/* Auto-response */}
                <input type="hidden" name="_autoresponse" value="Thank you for contacting the Law of Supremacism project. We've received your message and will respond soon." />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white mb-2 block">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-2 block">Inquiry Type</Label>
                  <RadioGroup
                    value={formData.inquiryType}
                    onValueChange={handleRadioChange}
                    className="flex flex-wrap gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="research" id="research" />
                      <Label htmlFor="research" className="text-gray-300 cursor-pointer">Research</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="collaboration" id="collaboration" />
                      <Label htmlFor="collaboration" className="text-gray-300 cursor-pointer">Collaboration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="media" id="media" />
                      <Label htmlFor="media" className="text-gray-300 cursor-pointer">Media</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="text-gray-300 cursor-pointer">General</Label>
                    </div>
                  </RadioGroup>

                  {/* Hidden field to pass the inquiry type to email */}
                  <input type="hidden" name="inquiryType" value={formData.inquiryType} />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white mb-2 block">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="bg-black/50 border-white/20 text-white h-40 placeholder:text-gray-500"
                    placeholder="How can we help you?"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("consent", checked as boolean)
                      }
                      name="consent"
                    />
                    <Label htmlFor="consent" className="text-gray-300 text-sm cursor-pointer">
                      I agree to the processing of my personal data in accordance with the <span className="text-blue-400 underline cursor-pointer">Privacy Policy</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("newsletter", checked as boolean)
                      }
                      name="newsletter"
                    />
                    <Label htmlFor="newsletter" className="text-gray-300 text-sm cursor-pointer">
                      Subscribe to our newsletter to receive updates on our research and events
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-black/50 text-white border-2 border-white/20
                           hover:bg-black/60 hover:border-white/30 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default Contact;