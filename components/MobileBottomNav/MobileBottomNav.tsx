'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Tv, Heart, User, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then((res: any) => {
      setIsLogged(!!res.data?.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setIsLogged(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Ne pas afficher sur certaines pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return null;
  }

  const tabs = [
    { name: 'Accueil', path: '/', icon: Home },
    { name: 'Chaînes', path: '/watch', icon: Tv },
    { name: 'Favoris', path: '/watch/favorites', icon: Heart },
    { name: isLogged ? 'Abonnement' : 'S\'abonner', path: '/subscribe', icon: Sparkles },
  ];

  return (
    <nav className={styles.bottomNav}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || (tab.path === '/watch' && pathname.startsWith('/watch') && pathname !== '/watch/favorites');
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.path}
            href={tab.path}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={24} className={styles.icon} />
            <span className={styles.label}>{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
