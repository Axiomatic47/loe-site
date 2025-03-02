// src/components/AdminLink.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AdminLink: React.FC = () => {
  const [showAdminLink, setShowAdminLink] = useState(false);
  const location = useLocation();

  // Show admin link only in development environment or with specific query parameter
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV === true;
    const urlParams = new URLSearchParams(window.location.search);
    const showAdmin = urlParams.get('admin') === 'true';

    setShowAdminLink(isDevelopment || showAdmin);
  }, [location]);

  if (!showAdminLink) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        className="bg-black/60 text-white border border-white/20 rounded-full h-12 w-12 backdrop-blur-sm hover:bg-black/80"
        onClick={() => window.location.href = '/admin'}
        title="Admin Panel"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default AdminLink;