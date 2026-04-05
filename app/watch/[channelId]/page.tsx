'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Info, Share2, Heart, List, Tv } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer';
import { supabase } from '@/lib/supabase';
import { fetchChannels, type Channel } from '@/lib/channels';
import { toggleFavorite as supabaseToggleFavorite, getFavorites as supabaseGetFavorites } from '@/lib/favorites';
import ChannelLogo from '@/components/ChannelLogo/ChannelLogo';
import styles from './ChannelDetail.module.css';

export default function ChannelDetailPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [recommendations, setRecommendations] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const allChannels = await fetchChannels();
        const found = allChannels.find(c => c.id === decodeURIComponent(channelId));
        
        if (found) {
          setChannel(found);
          // Get 6 recommendations from same category or same country with active stream
          const recs = allChannels
            .filter(
              (c) =>
                c.id !== found.id &&
                Boolean(c.streamUrl) &&
                (c.categories?.includes(found.categories?.[0] || '') || c.country === found.country),
            )
            .slice(0, 6);
          setRecommendations(recs);
        }
      } catch (e) {
        console.error('Failed to load channel', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [channelId]);

  useEffect(() => {
    if (!channel) return;
    
    const checkFavorite = async () => {
      // Check Supabase if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const favs = await supabaseGetFavorites(session.user.id);
        setIsFavorite(favs.includes(channel.id));
        return;
      }

      // Guest: localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('playtv_favorites') || '[]');
        if (Array.isArray(saved)) {
          setIsFavorite(saved.includes(channel.id));
        } else {
          setIsFavorite(false);
        }
      } catch {
        setIsFavorite(false);
      }
    };

    checkFavorite();
  }, [channel]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleToggleFavorite = async () => {
    if (!channel) return;
    const nextFavoriteState = !isFavorite;
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      try {
        await supabaseToggleFavorite(session.user.id, channel.id);
        setIsFavorite(nextFavoriteState);
        setFeedback(nextFavoriteState ? 'Ajoutée à votre compte' : 'Retirée de votre compte');
      } catch (err) {
        setFeedback('Erreur lors de la synchronisation');
      }
      return;
    }

    // Guest Fallback
    setIsFavorite(nextFavoriteState);
    try {
      const saved = JSON.parse(localStorage.getItem('playtv_favorites') || '[]');
      const favorites = Array.isArray(saved) ? saved : [];
      const nextFavorites = nextFavoriteState
        ? Array.from(new Set([...favorites, channel.id]))
        : favorites.filter((id: string) => id !== channel.id);

      localStorage.setItem('playtv_favorites', JSON.stringify(nextFavorites));
      setFeedback(nextFavoriteState ? 'Ajoutée aux favoris (local)' : 'Retirée des favoris');
    } catch {
      setFeedback('Impossible de sauvegarder vos favoris');
    }
  };

  const handleShare = async () => {
    if (!channel) return;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `PLAYTV • ${channel.name}`,
          text: `Regarde ${channel.name} en direct sur PLAYTV`,
          url,
        });
        setFeedback('Lien partagé');
        return;
      }

      await navigator.clipboard.writeText(url);
      setFeedback('Lien copié');
    } catch {
      setFeedback('Partage annulé');
    }
  };

  const handleInfo = () => {
    const details = document.getElementById('channel-description');
    details?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const hasStream = Boolean(channel?.streamUrl && channel.streamUrl.trim().length > 0);

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loadingState}>
          <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px' }} />
          <div className="skeleton" style={{ width: '300px', height: '32px', marginTop: '24px' }} />
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.errorState}>
          <Tv size={64} className={styles.errorIcon} />
          <h2>Chaîne introuvable</h2>
          <p>Désolé, nous ne parvenons pas à charger cette chaîne pour le moment.</p>
          <Link href="/watch" className="btn-primary">Retour à la grille</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className="page-container">
          {/* Breadcrumbs / Back */}
          <div className={styles.topActions}>
            <Link href="/watch" className={styles.backBtn}>
              <ChevronLeft size={20} /> Retour aux chaînes
            </Link>
            {feedback && <div className={styles.feedback}>{feedback}</div>}
          </div>

          <div className={styles.contentLayout}>
            {/* Player Column */}
            <div className={styles.playerColumn}>
              <div className={styles.playerWrapper}>
                {hasStream ? (
                  <VideoPlayer
                    key={`${channel.id}-${channel.streamUrl}`}
                    src={channel.streamUrl as string}
                    poster={channel.logo}
                  />
                ) : (
                  <div className={styles.unavailableState}>
                    <Tv size={44} />
                    <h2>Flux temporairement indisponible</h2>
                    <p>
                      Cette chaîne est référencée, mais aucun stream actif n’est disponible pour le moment.
                    </p>
                    <Link href="/watch" className="btn-primary">
                      Choisir une autre chaîne
                    </Link>
                  </div>
                )}
              </div>
              <div className={styles.channelMeta}>
                <div className={styles.metaLeft}>
                  <div className={styles.channelLogoWrap}>
                    <ChannelLogo
                      key={`${channel.id}-${channel.logo ?? ''}-${channel.website ?? ''}`}
                      channel={channel}
                      imageClassName={styles.channelLogo}
                      fallbackClassName={styles.channelLogoFallback}
                    />
                  </div>
                  <div>
                    <h1 className={styles.channelName}>{channel.name}</h1>
                    <div className={styles.badges}>
                      {hasStream ? <span className="live-badge">En Direct</span> : <span className={styles.countryBadge}>Indisponible</span>}
                      {channel.country ? <span className={styles.countryBadge}>{channel.country}</span> : null}
                    </div>
                  </div>
                </div>
                <div className={styles.metaRight}>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${isFavorite ? styles.actionBtnActive : ''}`}
                    onClick={handleToggleFavorite}
                    aria-label="Ajouter aux favoris"
                  >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={handleShare}
                    aria-label="Partager la chaîne"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={handleInfo}
                    aria-label="Voir les informations de la chaîne"
                  >
                    <Info size={20} />
                  </button>
                </div>
              </div>

              <div id="channel-description" className={`glass-card ${styles.descriptionBox}`}>
                <h3>À propos de cette chaîne</h3>
                <p>
                  {hasStream
                    ? `Regardez ${channel.name} en direct sur PLAYTV. Accès premium sans interruption.`
                    : `${channel.name} est bien listée sur PLAYTV, mais son flux n’est pas actif actuellement. Essayez une chaîne similaire ci‑dessous.`}
                </p>
              </div>
            </div>

            {/* Sidebar Column */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <List size={18} />
                <span>Chaînes Similaires</span>
              </div>
              <div className={styles.recommendationsList}>
                {recommendations.map(rec => (
                  <Link key={rec.id} href={`/watch/${encodeURIComponent(rec.id)}`} className={styles.recItem}>
                    <div className={styles.recLogo}>
                      <ChannelLogo
                        key={`${rec.id}-${rec.logo ?? ''}-${rec.website ?? ''}`}
                        channel={rec}
                        imageClassName={styles.recLogoImg}
                        fallbackClassName={styles.recLogoFallback}
                      />
                    </div>
                    <div className={styles.recInfo}>
                      <span className={styles.recName}>{rec.name}</span>
                      <span className={styles.recCat}>{rec.categories?.[0] || 'Général'}</span>
                    </div>
                    <div className={styles.recPlay}><Play size={12} fill="currentColor" /></div>
                  </Link>
                ))}
              </div>
              <Link href="/watch" className={styles.viewMoreBtn}>Voir tout</Link>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-component for small play icon
function Play({ size, fill }: { size: number, fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
