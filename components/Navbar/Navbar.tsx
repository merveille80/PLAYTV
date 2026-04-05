'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, Menu, X, ChevronRight, LogOut, Search } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; plan: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        setUser({ 
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0], 
          plan: 'Premium' 
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setUser({ 
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0], 
          plan: 'Premium' 
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/watch?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Tv size={18} strokeWidth={1.5} icon-hd="" />
          </div>
          <span className={styles.logoText}>PLAY<span className={styles.logoAccent}>TV</span></span>
        </Link>

        {/* Desktop Search */}
        <form className={styles.search} onSubmit={handleSearch}>
          <Search className={styles.searchIcon} size={16} />
          <input 
            type="text" 
            placeholder="Rechercher une chaîne..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Desktop Nav */}
        <div className={styles.navLinks}>
          <Link href="/watch" className={`${styles.navLink} ${pathname === '/watch' ? styles.activeLink : ''}`}>Chaînes</Link>
          <Link href="/#pricing" className={styles.navLink}>Tarifs</Link>
        </div>

        {/* CTA */}
        <div className={styles.navActions}>
          {user ? (
            <>
              <Link href="/watch/favorites" className={styles.navLink}>Favoris</Link>
              <Link href="/watch" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                <Tv size={16} strokeWidth={1.5} /> Regarder
              </Link>
              <button type="button" onClick={handleLogout} className={styles.logoutBtn} title="Se déconnecter">
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Connexion
              </Link>
              <Link href="/subscribe" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Commencer <ChevronRight size={16} strokeWidth={1.5} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/#pricing" className={styles.mobileLink} onClick={closeMenu}>Tarifs</Link>
          <Link href="/#channels" className={styles.mobileLink} onClick={closeMenu}>Chaînes</Link>
          <Link href="/#why" className={styles.mobileLink} onClick={closeMenu}>Pourquoi PLAYTV</Link>
          <div className={styles.mobileDivider} />
          {user ? (
            <>
              <Link href="/watch" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeMenu}>
                <Tv size={16} /> Regarder
              </Link>
              <button type="button" onClick={handleLogout} className={styles.mobileLogout}>Se déconnecter</button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeMenu}>Connexion</Link>
              <Link href="/subscribe" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeMenu}>Commencer</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
