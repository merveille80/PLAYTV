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
      if (s.status !== 'error' && s.status !== 'offline' && s.url && !map.has(s.channel)) {
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
        return setChannelsCache([...adminChannels]);
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

      // Filter out channels without a valid streamUrl
      const result = Array.from(merged.values()).filter(c => Boolean(c.streamUrl) && c.streamUrl!.trim().length > 0);
      return setChannelsCache(result);
    } catch {
      return setChannelsCache([]);
    } finally {
      inFlightChannelsPromise = null;
    }
  })();

  return inFlightChannelsPromise;
}


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
