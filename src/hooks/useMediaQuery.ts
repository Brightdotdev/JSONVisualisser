// hooks/use-media-query.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const media = window.matchMedia(query);
      
      if (!media) {
        return;
      }

      const updateMatches = () => {
        setMatches(media.matches);
      };

      // Set initial value
      updateMatches();

      // Add event listener
      if (media.addEventListener) {
        media.addEventListener('change', updateMatches);
        return () => media.removeEventListener('change', updateMatches);
      } else {
        // Fallback for older browsers
        media.addListener(updateMatches);
        return () => media.removeListener(updateMatches);
      }
    } catch (error) {

return
    }
  }, [query]);

  return matches;
}