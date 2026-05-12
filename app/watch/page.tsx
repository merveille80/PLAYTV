'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, SearchX, Loader2, Play, Info } from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import ChannelCard from '@/components/ChannelCard/ChannelCard';
import ChannelRow from '@/components/ChannelRow/ChannelRow';
import { fetchChannels, CATEGORY_LABELS, type Channel } from '@/lib/channels';
import { getFavorites } from '@/lib/favorites';
import { supabase } from '@/lib/supabase';
import styles from './watch.module.css';

const PAGE_SIZE = 120;

const PRIORITY_COUNTRIES = ['CD', 'CG', 'FR', 'BE', 'CH', 'CA', 'SN', 'CI', 'CM', 'GA'];

const COUNTRY_FLAGS: Record<string, string> = {
  CD: '🇨🇩', CG: '🇨🇬', FR: '🇫🇷', BE: '🇧🇪', CH: '🇨🇭', CA: '🇨🇦', SN: '🇸🇳', CI: '🇨🇮', CM: '🇨🇲', GA: '🇬🇦',
  DZ: '🇩🇿', MA: '🇲🇦', TN: '🇹🇳', ML: '🇲🇱', BF: '🇧🇫', GN: '🇬🇳', TG: '🇹🇬', BJ: '🇧🇯', NE: '🇳🇪', MG: '🇲🇬',
  TD: '🇹🇩', CF: '🇨🇫', GQ: '🇬🇶', BI: '🇧🇮', RW: '🇷🇼', DJ: '🇩🇯', KM: '🇰🇲', MU: '🇲🇺', SC: '🇸🇨', CV: '🇨🇻',
  ST: '🇸🇹', NG: '🇳🇬', GH: '🇬🇭', KE: '🇰🇪', ZA: '🇿🇦', ET: '🇪🇹', TZ: '🇹🇿', UG: '🇺🇬', LY: '🇱🇾', EG: '🇪🇬',
  MR: '🇲🇷', SO: '🇸🇴',
};

function WatchContent() {
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get('category');
  const countryFromQuery = searchParams.get('country');
  const searchFromQuery = searchParams.get('search');
  
  const initialCategory =
    categoryFromQuery && CATEGORY_LABELS[categoryFromQuery] ? categoryFromQuery : 'all';
  const initialCountry = countryFromQuery ? countryFromQuery.toUpperCase() : 'all';

  const [channels, setChannels] = useState<Channel[]>([]);
  const [favoriteChannels, setFavoriteChannels] = useState<Channel[]>([]);
  const [featuredChannel, setFeaturedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchFromQuery || '');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeCountry, setActiveCountry] = useState(initialCountry);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchChannels();
        setChannels(data);

        // Pick a featured channel
        const live = data.filter(c => Boolean(c.streamUrl));
        if (live.length > 0) {
          setFeaturedChannel(live[Math.floor(Math.random() * Math.min(live.length, 10))]);
        }

        // Load favorites
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const favIds = await getFavorites(session.user.id);
          const favs = data.filter(c => favIds.includes(c.id));
          setFavoriteChannels(favs);
        } else {
          const saved = JSON.parse(localStorage.getItem('playtv_favorites') || '[]');
          const favs = data.filter(c => saved.includes(c.id));
          setFavoriteChannels(favs);
        }
      } catch (e) {
        console.error('Failed to load channels', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const liveChannels = useMemo(
    () => channels.filter((c) => Boolean(c.streamUrl && c.streamUrl.trim().length > 0)),
    [channels],
  );

  const sportChannels = useMemo(
    () => liveChannels.filter(c => c.categories?.some(cat => cat.toLowerCase().includes('sport'))),
    [liveChannels]
  );

  const newsChannels = useMemo(
    () => liveChannels.filter(c => c.categories?.some(cat => cat.toLowerCase().includes('news'))),
    [liveChannels]
  );

  const musicChannels = useMemo(
    () => liveChannels.filter(c => c.categories?.some(cat => cat.toLowerCase().includes('music'))),
    [liveChannels]
  );

  const countryNameFormatter = useMemo(() => {
    try {
      return new Intl.DisplayNames(['fr'], { type: 'region' });
    } catch {
      return null;
    }
  }, []);

  const availableCountries = useMemo(() => {
    const codes = Array.from(
      new Set(
        channels
          .map((channel) => channel.country?.toUpperCase())
          .filter((code): code is string => Boolean(code)),
      ),
    );

    return codes.sort((a, b) => {
      const aPrio = PRIORITY_COUNTRIES.indexOf(a);
      const bPrio = PRIORITY_COUNTRIES.indexOf(b);

      if (aPrio !== -1 && bPrio !== -1) return aPrio - bPrio;
      if (aPrio !== -1) return -1;
      if (bPrio !== -1) return 1;

      const countryA = countryNameFormatter?.of(a) ?? a;
      const countryB = countryNameFormatter?.of(b) ?? b;
      return countryA.localeCompare(countryB, 'fr', { sensitivity: 'base' });
    });
  }, [channels, countryNameFormatter]);

  const filteredChannels = useMemo(() => {
    return channels
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'all' || (c.categories && c.categories.includes(activeCategory));
        const matchesCountry =
          activeCountry === 'all' || (c.country && c.country.toUpperCase() === activeCountry);
        return matchesSearch && matchesCategory && matchesCountry;
      })
      .sort((a, b) => {
        const aLive = Boolean(a.streamUrl && a.streamUrl.trim().length > 0);
        const bLive = Boolean(b.streamUrl && b.streamUrl.trim().length > 0);
        if (aLive && !bLive) return -1;
        if (!aLive && bLive) return 1;
        return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
      });
  }, [channels, search, activeCategory, activeCountry]);

  const displayedChannels = useMemo(
    () => filteredChannels.slice(0, visibleCount),
    [filteredChannels, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, activeCategory, activeCountry]);

  useEffect(() => {
    if (searchFromQuery !== null) {
      setSearch(searchFromQuery);
    }
  }, [searchFromQuery]);

  const formatCountryLabel = (countryCode: string) => {
    const flag = COUNTRY_FLAGS[countryCode] || '🌍';
    const name = countryNameFormatter?.of(countryCode) ?? countryCode;
    return `${flag} ${name}`;
  };

  const isBrowsing = search || activeCategory !== 'all' || activeCountry !== 'all';

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        {!isBrowsing && featuredChannel && (
          <section className={styles.hero}>
            <div className={styles.heroOverlay} />
            <div className={styles.heroBg} style={{ backgroundImage: `url(${featuredChannel.logo})` }} />
            <div className={styles.heroContent}>
              <div className={styles.featuredBadge}>À L'AFFICHE</div>
              <h1 className={styles.heroTitle}>{featuredChannel.name}</h1>
              <p className={styles.heroDesc}>
                Regardez {featuredChannel.name} en direct sur PLAYTV. Découvrez le meilleur de la télévision africaine et internationale.
              </p>
              <div className={styles.heroActions}>
                <Link href={`/watch/${featuredChannel.id}`} className={styles.playBtn}>
                  <Play size={24} fill="currentColor" />
                  <span>Regarder Direct</span>
                </Link>
                <button className={styles.infoBtn}>
                  <Info size={24} />
                  <span>Plus d'infos</span>
                </button>
              </div>
            </div>
          </section>
        )}

        <div className={isBrowsing ? styles.browsingLayout : styles.dashboardLayout}>
          
          {/* Dashboard Rows (Hidden when searching/filtering) */}
          {!isBrowsing && !loading && (
            <div className={styles.rows}>
              <ChannelRow title="Vos Favoris" channels={favoriteChannels} />
              <ChannelRow title="Sports en Direct" channels={sportChannels} />
              <ChannelRow title="Actualités & Info" channels={newsChannels} />
              <ChannelRow title="Musique & Divertissement" channels={musicChannels} />
            </div>
          )}

          <div className="page-container">
            {/* Header & Search */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h1>{isBrowsing ? 'Résultats de recherche' : 'Explorer toutes les chaînes'}</h1>
                <p>
                  {channels.length.toLocaleString('fr-FR')} chaînes référencées
                </p>
              </div>
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher une chaîne..." 
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.filtersWrapper}>
              {/* Categories */}
              <div className={styles.filterSection}>
                <div className={styles.categories}>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      className={`${styles.categoryBtn} ${activeCategory === key ? styles.active : ''}`}
                      onClick={() => setActiveCategory(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country Chips */}
              <div className={styles.countrySection}>
                <div className={styles.countryChips}>
                  <button
                    className={`${styles.countryChip} ${activeCountry === 'all' ? styles.chipActive : ''}`}
                    onClick={() => setActiveCountry('all')}
                  >
                    🌍 Tous les pays
                  </button>
                  {availableCountries.map((code) => (
                    <button
                      key={code}
                      className={`${styles.countryChip} ${activeCountry === code ? styles.chipActive : ''}`}
                      onClick={() => setActiveCountry(code)}
                    >
                      {formatCountryLabel(code)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className={styles.loading}>
                <Loader2 className="spinner" size={48} />
                <p>Initialisation du catalogue...</p>
              </div>
            ) : displayedChannels.length > 0 ? (
              <div className={styles.grid}>
                {displayedChannels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <SearchX size={64} />
                <h3>Aucune chaîne trouvée</h3>
                <p>Essayez de modifier votre recherche ou de changer de catégorie.</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('all');
                    setActiveCountry('all');
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {displayedChannels.length < filteredChannels.length && (
              <div className={styles.loadMore}>
                <button 
                  className="btn-secondary"
                  onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                >
                  Afficher plus de chaînes ({filteredChannels.length - displayedChannels.length} restantes)
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className={styles.loadingState}><Loader2 className="spin" size={48} /></div>}>
      <WatchContent />
    </Suspense>
  );
}
