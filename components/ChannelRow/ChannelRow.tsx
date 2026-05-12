'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ChannelCard from '../ChannelCard/ChannelCard';
import { type Channel } from '@/lib/channels';
import styles from './ChannelRow.module.css';

interface ChannelRowProps {
  title: string;
  channels: Channel[];
}

export default function ChannelRow({ title, channels }: ChannelRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (channels.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.row}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.container}>
        <button className={`${styles.arrow} ${styles.left}`} onClick={() => scroll('left')}>
          <ChevronLeft size={32} />
        </button>
        <div className={styles.scroll} ref={rowRef}>
          {channels.map((channel) => (
            <div key={channel.id} className={styles.item}>
              <ChannelCard channel={channel} />
            </div>
          ))}
        </div>
        <button className={`${styles.arrow} ${styles.right}`} onClick={() => scroll('right')}>
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}
