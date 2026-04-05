import type { Channel } from './channels';

function getHostnameFromWebsite(website?: string): string | null {
  if (!website) return null;

  try {
    const normalized = website.startsWith('http') ? website : `https://${website}`;
    return new URL(normalized).hostname;
  } catch {
    return null;
  }
}

export function getChannelLogoCandidates(channel: Pick<Channel, 'id' | 'logo' | 'website'>): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const pushCandidate = (value?: string) => {
    if (!value) return;
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    candidates.push(trimmed);
  };

  // 1) Preferred source from data
  pushCandidate(channel.logo);

  // 2) Try both PNG and SVG variants from iptv-org
  pushCandidate(`https://iptv-org.github.io/iptv/logos/${encodeURIComponent(channel.id)}.png`);
  pushCandidate(`https://iptv-org.github.io/iptv/logos/${encodeURIComponent(channel.id)}.svg`);

  // 3) Website fallback icons when logo is missing/broken
  const hostname = getHostnameFromWebsite(channel.website);
  if (hostname) {
    pushCandidate(`https://icons.duckduckgo.com/ip3/${hostname}.ico`);
    pushCandidate(`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`);
  }

  return candidates;
}
