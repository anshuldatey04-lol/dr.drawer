import { useState, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { getFaviconUrl, getYouTubeVideoId } from '../utils';

/**
 * Renders a favicon/logo for a URL with automatic extraction and graceful fallback.
 *
 * Priority chain: Google S2 favicon → DuckDuckGo icon → emoji → Globe icon
 */
export default function FaviconImage({ url, emoji, size = 128, className = '' }) {
  const [stage, setStage] = useState('primary'); // 'primary' | 'fallback' | 'emoji'
  const [loaded, setLoaded] = useState(false);
  const favicon = getFaviconUrl(url, size);
  const ytVideoId = getYouTubeVideoId(url);

  const handlePrimaryError = useCallback(() => {
    setStage('fallback');
    setLoaded(false);
  }, []);

  const handleFallbackError = useCallback(() => {
    setStage('emoji');
  }, []);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  if (ytVideoId) {
    return (
      <div className={`flex items-center justify-center relative overflow-hidden ${className}`}>
        {!loaded && (
          <div className="absolute inset-0 rounded-lg bg-white/[0.04] animate-pulse" />
        )}
        <img
          src={`https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`}
          alt="YouTube Thumbnail"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={() => setLoaded(true)} // Silently fail and just show what's there if error
        />
      </div>
    );
  }

  // No URL or fully failed → show emoji or globe
  if (!favicon || stage === 'emoji') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {emoji ? (
          <span className="text-2xl select-none">{emoji}</span>
        ) : (
          <Globe size={22} className="text-slate-500" />
        )}
      </div>
    );
  }

  const imgSize = size > 64 ? 32 : 20;
  const imgSrc = stage === 'primary' ? favicon.primary : favicon.fallback;

  return (
    <div className={`flex items-center justify-center relative ${className}`}>
      {/* Loading shimmer — only visible before first load */}
      {!loaded && (
        <div className="absolute inset-0 rounded-lg bg-white/[0.04] animate-pulse" />
      )}

      <img
        key={stage} // Force remount when switching sources
        src={imgSrc}
        alt=""
        width={imgSize}
        height={imgSize}
        className={`object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={stage === 'primary' ? handlePrimaryError : handleFallbackError}
        referrerPolicy="no-referrer"
        draggable={false}
      />
    </div>
  );
}
