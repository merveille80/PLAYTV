'use client';

import { motion } from 'framer-motion';
import { Tv, Shield, Zap, Smartphone, Check, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import styles from './page.module.css';

export default function Home() {
  const featuredCategories = [
    {
      title: 'Sports Premium',
      description: 'Foot, NBA, Formule 1 et grands championnats en direct.',
      category: 'sports',
      icon: Tv,
    },
    {
      title: 'Actualités 24/7',
      description: 'Restez connecté à l’info locale et internationale en continu.',
      category: 'news',
      icon: Shield,
    },
    {
      title: 'Films & Séries',
      description: 'Des chaînes cinéma et divertissement pour toute la famille.',
      category: 'movies',
      icon: Smartphone,
    },
  ];

  return (
    <div className={styles.container}>
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.heroContent}
          >
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Alternative Premium à Canal+
            </div>
            <h1 className={styles.title}>
              Votre TV, sans limites. <br />
              <span className="gradient-text">Partout avec vous.</span>
            </h1>
            <p className={styles.description}>
              Accédez à des centaines de chaînes africaines et internationales en haute définition.
              Compatible avec votre téléphone, tablette, ordinateur et Smart TV.
            </p>
            <div className={styles.heroActions}>
              <Link href="/subscribe" className="btn-primary">
                Essayer Gratuitement <ChevronRight size={18} />
              </Link>
              <Link href="/watch" className="btn-secondary">
                <Play size={18} fill="currentColor" /> Explorer les chaînes
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Logo Cloud Section */}
      <section className={styles.stats}>
        <div className="page-container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Chaînes Live</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>4K</span>
              <span className={styles.statLabel}>Qualité Ultra HD</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>99.9%</span>
              <span className={styles.statLabel}>Uptime Garanti</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Support Client</span>
            </div>
          </div>
        </div>
      </section>

      {/* Channel Preview */}
      <section id="channels" className={styles.channels}>
        <div className="page-container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explorez vos <span className="gradient-text">chaînes préférées</span></h2>
            <p className={styles.sectionSubtitle}>Naviguez par catégorie et démarrez en un clic.</p>
          </div>

          <div className={styles.channelsGrid}>
            {featuredCategories.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.category}
                  href={`/watch?category=${item.category}`}
                  className={`glass-card ${styles.channelCard}`}
                >
                  <div className={styles.channelIcon}>
                    <Icon size={20} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className={styles.channelCta}>
                    Voir les chaînes <ChevronRight size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why" className={styles.features}>
        <div className="page-container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Pourquoi choisir <span className="gradient-text">PLAYTV</span> ?</h2>
            <p className={styles.sectionSubtitle}>La meilleure expérience IPTV conçue pour le Congo.</p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}><Zap size={24} /></div>
              <h3>Vitesse Éclair</h3>
              <p>Zappez entre vos chaînes préférées instantanément sans mise en mémoire tampon.</p>
            </div>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}><Smartphone size={24} /></div>
              <h3>Multi-écrans</h3>
              <p>Commencez sur votre TV et continuez sur votre smartphone lors de vos déplacements.</p>
            </div>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}><Shield size={24} /></div>
              <h3>Sécurisé & Stable</h3>
              <p>Nos liens sont mis à jour quotidiennement pour garantir un accès ininterrompu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.pricing}>
        <div className="page-container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Abordable pour <span className="gradient-text">tous</span></h2>
            <p className={styles.sectionSubtitle}>Oubliez les factures Canal+ exorbitantes. Passez à PLAYTV.</p>
          </div>

          <div className={styles.pricingGrid}>
            {/* Trial Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className={`glass-card ${styles.pricingCard}`}
            >
              <div className={styles.pricingHeader}>
                <span className={styles.planName}>Essai Gratuit</span>
                <div className={styles.planPrice}>0 FC<span>/ 3 jours</span></div>
              </div>
              <ul className={styles.planFeatures}>
                <li><Check size={16} /> Accès à 100 chaînes</li>
                <li><Check size={16} /> Qualité HD</li>
                <li><Check size={16} /> 1 appareil simultané</li>
                <li className={styles.disabled}>Pas de chaînes Premium</li>
              </ul>
              <Link href="/subscribe?plan=trial" className="btn-secondary" style={{ width: '100%' }}>Tester maintenant</Link>
            </motion.div>

            {/* Complete Plan */}
            <motion.div
              whileHover={{ y: -10 }}
              className={`glass-card ${styles.pricingCard} ${styles.featuredCard}`}
            >
              <div className={styles.featuredBadge}>MIEUX VENDU</div>
              <div className={styles.pricingHeader}>
                <span className={styles.planName}>Accès Complet</span>
                <div className={styles.planPrice}>20 000 FC<span>/ 2 mois</span></div>
              </div>
              <ul className={styles.planFeatures}>
                <li><Check size={16} /> Toutes les 500+ chaînes</li>
                <li><Check size={16} /> Qualité 4K / Ultra HD</li>
                <li><Check size={16} /> 3 appareils simultanés</li>
                <li><Check size={16} /> Chaînes Sports & Cinéma</li>
                <li><Check size={16} /> Support Prioritaire 24/7</li>
              </ul>
              <Link href="/subscribe?plan=full" className="btn-primary" style={{ width: '100%' }}>Devenir Membre</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="page-container">
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <div className={styles.logoIcon}><Tv size={18} /></div>
              <span>PLAY<span className={styles.logoAccentText}>TV</span></span>
            </div>
              <p className={styles.footerTagline}>
                Développé par cyberspace-sarl
              </p>
            <div className={styles.footerLinks}>
              <Link href="/terms">CGU</Link>
              <Link href="/privacy">Confidentialité</Link>
              <Link href="/admin">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
