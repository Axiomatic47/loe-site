// src/components/PageViewRecorder.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '@/services/analyticsService';

const PageViewRecorder = () => {
  const location = useLocation();

  useEffect(() => {
    const recordPageView = async () => {
      try {
        await analyticsService.recordPageView(location.pathname);
        console.log('Page view recorded:', location.pathname);
      } catch (error) {
        console.error('Failed to record page view:', error);
      }
    };

    recordPageView();
  }, [location.pathname]);

  return null;
};

export default PageViewRecorder;