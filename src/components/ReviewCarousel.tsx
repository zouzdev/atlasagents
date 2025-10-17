import React, { useRef, useEffect, useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  name: string;
  company: string;
  rating: number;
  text: string;
}

interface ReviewCarouselProps {
  reviews: Review[];
  isDark: boolean;
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews, isDark }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [clonedReviews, setClonedReviews] = useState<Review[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Number of cards to clone for seamless looping
  const cloneCount = 3;

  useEffect(() => {
    // Create cloned reviews for infinite scrolling
    const firstReviews = reviews.slice(0, cloneCount);
    const lastReviews = reviews.slice(-cloneCount);
    const newClonedReviews = [...lastReviews, ...reviews, ...firstReviews];
    setClonedReviews(newClonedReviews);
  }, [reviews]);

  useEffect(() => {
    // Set initial scroll position to start of original content (after prepended clones)
    if (scrollContainerRef.current && clonedReviews.length > 0) {
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 32; // space-x-8
      const initialScrollPosition = cloneCount * (cardWidth + gap);
      
      scrollContainerRef.current.scrollTo({
        left: initialScrollPosition,
        behavior: 'auto'
      });
    }
  }, [clonedReviews]);

  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrolling || clonedReviews.length === 0) return;

    const container = scrollContainerRef.current;
    const cardWidth = container.children[0]?.clientWidth || 0;
    const gap = 32;
    const cardWithGap = cardWidth + gap;
    
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    // Calculate boundaries
    const startBoundary = cloneCount * cardWithGap;
    const endBoundary = (cloneCount + reviews.length) * cardWithGap;

    setIsScrolling(true);

    // If scrolled past the end (viewing cloned first cards)
    if (scrollLeft >= endBoundary - cardWithGap) {
      container.scrollTo({
        left: startBoundary,
        behavior: 'auto'
      });
    }
    // If scrolled before the beginning (viewing cloned last cards)
    else if (scrollLeft <= startBoundary - cardWithGap) {
      container.scrollTo({
        left: endBoundary - cardWithGap,
        behavior: 'auto'
      });
    }

    // Reset scrolling flag after a short delay
    setTimeout(() => setIsScrolling(false), 50);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 32;
      scrollContainerRef.current.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 32;
      scrollContainerRef.current.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <button
        onClick={scrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center ${
          isDark 
            ? 'bg-cream/10 hover:bg-cream/20 text-cream backdrop-blur-sm' 
            : 'bg-white/90 hover:bg-white text-dark backdrop-blur-sm'
        }`}
        aria-label="Previous reviews"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={scrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hidden md:flex items-center justify-center ${
          isDark 
            ? 'bg-cream/10 hover:bg-cream/20 text-cream backdrop-blur-sm' 
            : 'bg-white/90 hover:bg-white text-dark backdrop-blur-sm'
        }`}
        aria-label="Next reviews"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory space-x-8 pb-4 scrollbar-hide"
      >
        {clonedReviews.map((review, index) => (
          <div
            key={`${review.name}-${index}`}
            className={`flex-none w-full md:w-1/2 lg:w-1/3 snap-center rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDark ? 'bg-cream/5 hover:bg-cream/10' : 'bg-white'
            }`}
          >
            <div className="flex mb-4">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent fill-current" />
              ))}
            </div>
            <p className={`mb-6 leading-relaxed italic ${isDark ? 'text-cream/80' : 'text-dark/80'}`}>
              "{review.text}"
            </p>
            <div>
              <p className={`font-semibold ${isDark ? 'text-cream' : 'text-dark'}`}>
                {review.name}
              </p>
              <p className="text-accent text-sm">{review.company}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};