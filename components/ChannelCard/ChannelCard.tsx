'use client';
import styles from './ChannelCard.module.css';
import { Play, TvOff } from 'lucide-react';
import Link from 'next/link';
import type { Channel } from '@/lib/channels';
import ChannelLogo from '@/components/ChannelLogo/ChannelLogo';

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const categoryColor = getCategoryColor(channel.categories?.[0] || '');
  const countryFlag = getCountryFlag(channel.country);
  const isLive = Boolean(channel.streamUrl && channel.streamUrl.trim().length > 0);

  return (
    <Link href={`/watch/${encodeURIComponent(channel.id)}`} className={`${styles.card} ${!isLive ? styles.cardOffline : ''}`}>
      <div className={styles.logoWrap}>
        <ChannelLogo
          key={`${channel.id}-${channel.logo ?? ''}-${channel.website ?? ''}`}
          channel={channel}
          imageClassName={styles.logo}
          fallbackClassName={styles.logoFallback}
          fallbackStyle={{
            background: `linear-gradient(135deg, ${categoryColor}33, ${categoryColor}11)`,
            color: categoryColor,
          }}
        />
        {isLive ? (
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            LIVE
          </div>
        ) : (
          <div className={styles.offlineIndicator}>
            OFFLINE
          </div>
        )}
        {countryFlag && <div className={styles.countryFlag}>{countryFlag}</div>}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{channel.name}</p>
        {channel.categories?.[0] && (
          <span className={styles.category} style={{ color: categoryColor, background: `${categoryColor}15` }}>
            {formatCategory(channel.categories[0])}
          </span>
        )}
      </div>
      <div className={styles.playBtn} style={!isLive ? { background: 'rgba(100, 116, 139, 0.9)' } : {}}>
        {isLive ? <Play size={14} fill="white" strokeWidth={1.5} /> : <TvOff size={14} strokeWidth={1.5} color="white" />}
      </div>
    </Link>
  );
}

function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    sports: '#22c55e', news: '#3b82f6', entertainment: '#a855f7',
    movies: '#f59e0b', kids: '#ec4899', music: '#06b6d4',
    general: '#7c3aed', documentary: '#f97316', religious: '#eab308',
    series: '#8b5cf6', comedy: '#10b981',
  };
  return map[cat] || '#7c3aed';
}

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    sports: '⚽ Sport', news: '📰 Info', entertainment: '🎭 Divertissement',
    movies: '🎬 Films', kids: '🧒 Enfants', music: '🎵 Musique',
    general: '📺 Général', documentary: '🎥 Documentaire', religious: '⛪ Religion',
    series: '📺 Séries', comedy: '😂 Comédie',
  };
  return map[cat] || cat;
}

function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const code = countryCode.toUpperCase();
  const first = code.charCodeAt(0);
  const second = code.charCodeAt(1);
  if (first < 65 || first > 90 || second < 65 || second > 90) return '';

  return String.fromCodePoint(first + 127397) + String.fromCodePoint(second + 127397);
}
