const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Converts relative media URLs to absolute URLs by prepending API_URL
 * Already absolute URLs (starting with http/https) are returned as-is
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url}`;
}
