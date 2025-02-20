// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import PageViewRecorder from "./components/PageViewRecorder";
import Index from "./pages/Index";
import CompositionsPage from "./pages/CompositionsPage";
import SectionPage from "./pages/SectionPage";
import Contact from "./pages/Contact";
import Partners from "./pages/Partners";
import Donate from "./pages/Donate";

const queryClient = new QueryClient();

const AdminPage = () => {
  useEffect(() => {
    window.location.href = '/admin/index.html';
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageViewRecorder />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/composition/:compositionId" element={<CompositionsPage />} />
          <Route path="/composition/:compositionId/composition/:compositionIndex/section/:sectionId" element={<SectionPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;