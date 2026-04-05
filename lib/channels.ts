import { supabase } from './supabase';

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  categories?: string[];
  country?: string;
  streamUrl?: string;
  website?: string;
}

interface IPTVOrgChannel {
  id: string;
  name: string;
  categories?: string[];
  country?: string;
  website?: string;
}

interface StreamRow {
  channel: string;
  url: string;
  status: string;
}

interface AdminChannelRow {
  id: string;
  name: string;
  logo: string | null;
  categories: string[] | null;
  country: string | null;
  stream_url: string | null;
  website?: string | null;
}

const CHANNELS_CACHE_TTL_MS = 5 * 60 * 1000;
let channelsCache: Channel[] | null = null;
let channelsCacheTimestamp = 0;
let inFlightChannelsPromise: Promise<Channel[]> | null = null;

function isCacheFresh() {
  return Boolean(channelsCache && Date.now() - channelsCacheTimestamp < CHANNELS_CACHE_TTL_MS);
}

function setChannelsCache(channels: Channel[]) {
  channelsCache = channels;
  channelsCacheTimestamp = Date.now();
  return channels;
}

function buildLogoUrl(channelId: string) {
  return `https://iptv-org.github.io/iptv/logos/${encodeURIComponent(channelId)}.png`;
}

// Streams from iptv-org API
export async function fetchStreams(): Promise<Map<string, string>> {
  try {
    const res = await fetch('https://iptv-org.github.io/api/streams.json', {
      next: { revalidate: 3600 }, // Cache 1 hour
    });
    if (!res.ok) return new Map();
    const data: StreamRow[] = await res.json();
    const map = new Map<string, string>();
    for (const s of data) {
      if (s.status !== 'offline' && s.url && !map.has(s.channel)) {
        map.set(s.channel, s.url);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

// Fetch channel metadata
export async function fetchChannels(): Promise<Channel[]> {
  if (isCacheFresh() && channelsCache) {
    return channelsCache;
  }

  if (inFlightChannelsPromise) {
    return inFlightChannelsPromise;
  }

  inFlightChannelsPromise = (async () => {
    try {
      const [channelsRes, streamsMap, adminChannels] = await Promise.all([
        fetch('https://iptv-org.github.io/api/channels.json', {
          next: { revalidate: 3600 },
        }),
        fetchStreams(),
        getAdminChannels(),
      ]);

      if (!channelsRes.ok) {
        return setChannelsCache([...adminChannels, ...getFallbackChannels()]);
      }

      const allChannels: IPTVOrgChannel[] = await channelsRes.json();
      const merged = new Map<string, Channel>();

      // Keep admin-added channels first and authoritative when IDs collide.
      for (const adminChannel of adminChannels) {
        merged.set(adminChannel.id, adminChannel);
      }

      for (const channel of allChannels) {
        if (merged.has(channel.id)) continue;

        merged.set(channel.id, {
          id: channel.id,
          name: channel.name,
          logo: buildLogoUrl(channel.id),
          categories: Array.isArray(channel.categories) ? channel.categories : [],
          country: channel.country,
          streamUrl: streamsMap.get(channel.id),
          website: channel.website,
        });
      }

      const result = Array.from(merged.values());
      return setChannelsCache(result.length > 0 ? result : getFallbackChannels());
    } catch {
      return setChannelsCache(getFallbackChannels());
    } finally {
      inFlightChannelsPromise = null;
    }
  })();

  return inFlightChannelsPromise;
}

// Fallback curated channels for when API is slow
export function getFallbackChannels(): Channel[] {
  return [
    { id: 'RTNC.cd', name: 'RTNC', country: 'CD', categories: ['general'], logo: 'https://iptv-org.github.io/iptv/logos/RTNC.cd.png', streamUrl: 'https://iptv-org.github.io/iptv/countries/cd.m3u' },
    { id: 'BongoTV.cd', name: 'Bongo TV', country: 'CD', categories: ['entertainment'], logo: '' },
    { id: 'Canal5.cd', name: 'Canal 5 RDC', country: 'CD', categories: ['general'], logo: '' },
    { id: '2STV.sn', name: '2STV', country: 'SN', categories: ['entertainment'], logo: 'https://iptv-org.github.io/iptv/logos/2STV.sn.png' },
    { id: 'TFM.sn', name: 'TFM', country: 'SN', categories: ['entertainment'], logo: '' },
    { id: 'LCI.fr', name: 'LCI', country: 'FR', categories: ['news'], logo: '' },
    { id: 'BFMTVParis.fr', name: 'BFMTV', country: 'FR', categories: ['news'], logo: '' },
    { id: 'CRTV.cm', name: 'CRTV', country: 'CM', categories: ['general'], logo: '' },
    { id: 'NTA.ng', name: 'NTA', country: 'NG', categories: ['general'], logo: '' },
    { id: 'GhanaTV.gh', name: 'GhanaTV', country: 'GH', categories: ['general'], logo: '' },
    { id: 'Aljazeera.qa', name: 'Al Jazeera', country: 'QA', categories: ['news'], logo: '' },
    { id: 'CGTN.cn', name: 'CGTN', country: 'CN', categories: ['news'], logo: '' },
  ];
}

// Get custom channels stored by admin (from Supabase)
export async function getAdminChannels(): Promise<Channel[]> {
  try {
    const { data, error } = await supabase
      .from('admin_channels')
      .select('id, name, logo, categories, country, stream_url, website');

    if (error) return [];

    const rows = (data ?? []) as AdminChannelRow[];

    return rows
      .map((item) => ({
        id: String(item.id),
        name: item.name,
        logo: item.logo || undefined,
        categories: Array.isArray(item.categories) ? item.categories : [],
        country: item.country || undefined,
        streamUrl: item.stream_url || undefined,
        website: item.website || undefined,
      }))
      .filter((item) => item.id.length > 0 && item.name.length > 0);
  } catch {
    return [];
  }
}

// Category labels in French
export const CATEGORY_LABELS: Record<string, string> = {
  all: 'Tout',
  general: 'Général',
  sports: 'Sport',
  news: 'Info',
  entertainment: 'Divertissement',
  movies: 'Films',
  music: 'Musique',
  kids: 'Enfants',
  documentary: 'Documentaire',
  religious: 'Religion',
  series: 'Séries',
  comedy: 'Comédie',
  education: 'Éducation',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);
