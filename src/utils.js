/**
 * Normalize a URL to ensure it has a protocol.
 * Defaults to https:// if no protocol is provided.
 */
export function normalizeUrl(url) {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return `https://${trimmed}`;
}

/**
 * Truncate a URL for display, stripping protocol and trailing slashes.
 */
export function truncateUrl(url, maxLength = 35) {
  if (!url) return '';
  const display = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
  if (display.length <= maxLength) return display;
  return display.substring(0, maxLength) + '…';
}

/**
 * Generate a unique ID.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Extract a clean domain from a URL string.
 * Handles inputs like "github.com", "https://www.github.com/path", etc.
 */
export function extractDomain(url) {
  if (!url) return '';
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // Fallback: strip protocol and path manually
    return url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0];
  }
}

/**
 * Get a high-quality favicon URL for a given link URL.
 * Uses Google's S2 Favicon API at 128px for crisp icons.
 * Returns an object with primary and fallback sources.
 */
export function getFaviconUrl(url, size = 128) {
  const domain = extractDomain(url);
  if (!domain) return null;
  return {
    primary: `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`,
    fallback: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    domain,
  };
}

/**
 * Extract YouTube video ID from a URL if it's a valid YouTube video.
 * Handles youtube.com and youtu.be links.
 */
export function getYouTubeVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
  return (match && match[1].length === 11) ? match[1] : null;
}

