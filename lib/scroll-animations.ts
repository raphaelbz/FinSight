"use client"

export function initScrollAnimations() {
  if (typeof window === 'undefined') return;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Check for stagger classes and apply appropriate delay
        if (entry.target.classList.contains('scroll-stagger-1')) {
          setTimeout(() => entry.target.classList.add('visible'), 100);
        } else if (entry.target.classList.contains('scroll-stagger-2')) {
          setTimeout(() => entry.target.classList.add('visible'), 200);
        } else if (entry.target.classList.contains('scroll-stagger-3')) {
          setTimeout(() => entry.target.classList.add('visible'), 300);
        } else {
          // Add visible class immediately for elements without stagger
          entry.target.classList.add('visible');
        }
      }
    });
  }, observerOptions);

  // Wait for DOM to be ready, then observe elements
  const initializeElements = () => {
    const animatedElements = document.querySelectorAll(
      '.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale, .scroll-stagger-1, .scroll-stagger-2, .scroll-stagger-3'
    );
    
    // Make elements immediately visible if they're already in viewport on load
    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isInViewport = rect.top >= 0 && rect.top <= window.innerHeight;
      
      if (isInViewport) {
        // Add visible class immediately for elements already in viewport
        el.classList.add('visible');
      }
      
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  };

  // Initialize immediately if DOM is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeElements);
    return () => document.removeEventListener('DOMContentLoaded', initializeElements);
  } else {
    return initializeElements();
  }
} 