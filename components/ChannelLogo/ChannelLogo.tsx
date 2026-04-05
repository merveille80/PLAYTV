'use client';

import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Channel } from '@/lib/channels';
import { getChannelLogoCandidates } from '@/lib/channelLogo';

interface ChannelLogoProps {
  channel: Pick<Channel, 'id' | 'name' | 'logo' | 'website'>;
  imageClassName: string;
  fallbackClassName: string;
  fallbackStyle?: CSSProperties;
}

export default function ChannelLogo({
  channel,
  imageClassName,
  fallbackClassName,
  fallbackStyle,
}: ChannelLogoProps) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const logoCandidates = useMemo(() => getChannelLogoCandidates(channel), [channel]);

  const initials = channel.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (logoCandidates[candidateIndex]) {
    return (
      <img
        src={logoCandidates[candidateIndex]}
        alt={channel.name}
        className={imageClassName}
        loading="lazy"
        onError={() => setCandidateIndex((current) => current + 1)}
      />
    );
  }

  return (
    <div className={fallbackClassName} style={fallbackStyle}>
      {initials}
    </div>
  );
}
