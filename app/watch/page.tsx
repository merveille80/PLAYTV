'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SearchX, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import ChannelCard from '@/components/ChannelCard/ChannelCard';
import { fetchChannels, CATEGORY_LABELS, type Channel } from '@/lib/channels';
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
        liveChannels
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
  }, [liveChannels, countryNameFormatter]);

  const filteredChannels = useMemo(() => {
    return liveChannels.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || (c.categories && c.categories.includes(activeCategory));
      const matchesCountry =
        activeCountry === 'all' || (c.country && c.country.toUpperCase() === activeCountry);
      return matchesSearch && matchesCategory && matchesCountry;
    });
  }, [liveChannels, search, activeCategory, activeCountry]);

  const displayedChannels = useMemo(
    () => filteredChannels.slice(0, visibleCount),
    [filteredChannels, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, activeCategory, activeCountry]);

  // Sync search with URL param changes (e.g. from Navbar)
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

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className="page-container">
          
          {/* Header & Search */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1>Découvrir <span className="gradient-text">les Chaînes</span></h1>
              <p>
                {channels.length.toLocaleString('fr-FR')} chaînes référencées
              </p>
              <p className={styles.liveCount}>
                {liveChannels.length.toLocaleString('fr-FR')} chaînes en direct disponibles
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
            <div className={styles.grid}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`skeleton ${styles.cardSkeleton}`} />
              ))}
            </div>
          ) : (
            <>
              {filteredChannels.length > 0 ? (
                <>
                  <div className={styles.grid}>
                    {displayedChannels.map(channel => (
                      <ChannelCard key={channel.id} channel={channel} />
                    ))}
                  </div>

                  <div className={styles.resultsFooter}>
                    <span className={styles.resultsMeta}>
                      Affichage {displayedChannels.length.toLocaleString('fr-FR')} / {filteredChannels.length.toLocaleString('fr-FR')}
                    </span>

                    {displayedChannels.length < filteredChannels.length && (
                      <button
                        type="button"
                        className={styles.loadMoreBtn}
                        onClick={() =>
                          setVisibleCount((current) =>
                            Math.min(current + PAGE_SIZE, filteredChannels.length),
                          )
                        }
                      >
                        Charger plus de chaînes
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <SearchX size={48} className={styles.emptyIcon} />
                  <h3>Aucune chaîne trouvée</h3>
                  <p>Essayez de modifier votre recherche ou de changer de catégorie.</p>
                  <button
                    className="btn-secondary"
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
            </>
          )}
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
