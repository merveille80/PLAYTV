'use client';

import { useState, useEffect, Suspense } from 'react';
import { Heart, Loader2, Tv, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import ChannelCard from '@/components/ChannelCard/ChannelCard';
import { fetchChannels, type Channel } from '@/lib/channels';
import { getFavorites as supabaseGetFavorites } from '@/lib/favorites';
import { supabase } from '@/lib/supabase';
import styles from './favorites.module.css';

function FavoritesContent() {
  const [favorites, setFavorites] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const allChannels = await fetchChannels();
        let favoriteIds: string[] = [];

        // Try Supabase first
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          favoriteIds = await supabaseGetFavorites(session.user.id);
        } else {
          // Fallback to LocalStorage for guests
          const saved = JSON.parse(localStorage.getItem('playtv_favorites') || '[]');
          favoriteIds = Array.isArray(saved) ? saved : [];
        }

        const favChannels = allChannels.filter(c => favoriteIds.includes(c.id));
        setFavorites(favChannels);
      } catch (e) {
        console.error('Failed to load favorites', e);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className="page-container">
          <div className={styles.header}>
            <Link href="/watch" className={styles.backLink}>
              <ArrowLeft size={18} /> Retour aux chaînes
            </Link>
            <h1>Mes <span className="gradient-text">Favoris</span></h1>
            <p>{favorites.length} chaîne{favorites.length > 1 ? 's' : ''} enregistrée{favorites.length > 1 ? 's' : ''}</p>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <Loader2 className="spin" size={48} />
              <p>Chargement de vos favoris...</p>
            </div>
          ) : favorites.length > 0 ? (
            <div className={styles.grid}>
              {favorites.map(channel => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Heart size={48} /></div>
              <h2>Aucun favori pour le moment</h2>
              <p>Parcourez nos chaînes et cliquez sur le coeur pour les ajouter à votre liste.</p>
              <Link href="/watch" className="btn-primary">
                Découvrir les chaînes
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className={styles.loadingState}><Loader2 className="spin" size={48} /></div>}>
      <FavoritesContent />
    </Suspense>
  );
}
