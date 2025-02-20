// src/components/PageLayout.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const animationFrame = useRef<number>();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const MAX_PULL_DISTANCE = 800;

  useEffect(() => {
const handleWheel = (e: WheelEvent) => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const element = contentRef.current;
      const isAtTop = window.scrollY === 0;
      // Adjust bottom detection to account for viewport height
      const isAtBottom = element &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10; // Add small buffer

      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
        isScrolling.current = true;
        setPullDistance(prev => Math.min(Math.max(prev - e.deltaY * 2, -MAX_PULL_DISTANCE), MAX_PULL_DISTANCE));

        scrollTimeout.current = setTimeout(() => {
          isScrolling.current = false;
          startReturnAnimation();
        }, 150);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastScrollY.current = e.touches[0].clientY;
      isScrolling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const element = contentRef.current;
      const isAtTop = window.scrollY === 0;
      const isAtBottom = element &&
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight;

      if (isAtTop || isAtBottom) {
        const deltaY = e.touches[0].clientY - lastScrollY.current;
        const direction = isAtTop ? 1 : -1;

        if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
          e.preventDefault();
          setPullDistance(prev => Math.min(Math.max(prev + deltaY * direction * 1.5, -MAX_PULL_DISTANCE), MAX_PULL_DISTANCE));
        }
        lastScrollY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      isScrolling.current = false;
      startReturnAnimation();
    };

    const startReturnAnimation = () => {
      if (!isScrolling.current) {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }

        const animate = () => {
          if (isScrolling.current) {
            cancelAnimationFrame(animationFrame.current!);
            return;
          }

          setPullDistance(prev => {
            if (Math.abs(prev) < 0.1) return 0;
            const newDistance = prev * 0.92;
            animationFrame.current = requestAnimationFrame(animate);
            return newDistance;
          });
        };

        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <>
      {/* Fixed background */}
      <div
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: 'url("/balance-scales.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -2,
        }}
      />

      {/* Fixed overlay */}
      <div
        className="fixed inset-0 w-full h-full bg-black/75 transition-opacity duration-300"
        style={{
          opacity: Math.max(0.3, 0.85 - (Math.abs(pullDistance) / MAX_PULL_DISTANCE)),
          zIndex: -1,
        }}
      />

      {/* Fixed header with pull distance prop */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header pullDistance={pullDistance} maxPullDistance={MAX_PULL_DISTANCE} />
      </div>

      {/* Elastic content */}
      <div
        ref={contentRef}
        className="min-h-screen flex flex-col pt-16 pb-16"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 && !isScrolling.current ? 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
        }}
      >
        <main className={`${className} flex-grow relative z-10 pt-8`}>
          {children}
        </main>
      </div>

      {/* Fixed footer with pull distance prop */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <Footer pullDistance={pullDistance} maxPullDistance={MAX_PULL_DISTANCE} />
      </div>
    </>
  );
};

export default PageLayout;