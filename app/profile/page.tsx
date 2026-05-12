'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CreditCard, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  Tv,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import { supabase } from '@/lib/supabase';
import styles from './profile.module.css';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  plan: string;
  subscription_expiry: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata.full_name,
          plan: data.plan || 'Gratuit',
          subscription_expiry: data.subscription_expiry,
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className="spinner" size={48} />
      </div>
    );
  }

  const isSubscribed = profile?.subscription_expiry 
    ? new Date(profile.subscription_expiry) > new Date() 
    : false;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className="page-container">
          <div className={styles.profileGrid}>
            
            {/* Sidebar / User Info */}
            <div className={styles.sidebar}>
              <div className={styles.userCard}>
                <div className={styles.avatar}>
                  {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase()}
                </div>
                <div className={styles.userInfo}>
                  <h2>{profile?.full_name || 'Utilisateur'}</h2>
                  <p>{profile?.email}</p>
                </div>
              </div>
              
              <nav className={styles.sideNav}>
                <button className={styles.navItemActive}>
                  <User size={20} />
                  <span>Mon Profil</span>
                </button>
                <button className={styles.navItem} onClick={() => router.push('/watch/favorites')}>
                  <CreditCard size={20} />
                  <span>Mes Favoris</span>
                </button>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  <LogOut size={20} />
                  <span>Se déconnecter</span>
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className={styles.content}>
              <h1 className={styles.pageTitle}>Paramètres du Compte</h1>
              
              {/* Subscription Status Card */}
              <div className={`${styles.card} ${isSubscribed ? styles.cardActive : styles.cardExpired}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    {isSubscribed ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <h3>Statut de l'abonnement</h3>
                    <p className={styles.planBadge}>{profile?.plan}</p>
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  {isSubscribed ? (
                    <div className={styles.infoRow}>
                      <Calendar size={18} />
                      <span>Expire le : <strong>{profile?.subscription_expiry ? formatDate(profile.subscription_expiry) : '-'}</strong></span>
                    </div>
                  ) : (
                    <div className={styles.expiredMessage}>
                      <p>Votre abonnement est expiré ou inactif. Passez au Premium pour débloquer toutes les chaînes.</p>
                      <button className="btn-primary" onClick={() => router.push('/#pricing')}>
                        M'abonner maintenant <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Details */}
              <div className={styles.card}>
                <h3>Détails du compte</h3>
                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{profile?.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>ID Utilisateur</span>
                    <span className={styles.value}>{profile?.id.substring(0, 8)}...</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Méthode d'accès</span>
                    <span className={styles.value}>Email & Mot de passe</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={styles.actions}>
                <button className="btn-secondary" onClick={() => router.push('/watch')}>
                  <Tv size={18} /> Retour au Dashboard
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
