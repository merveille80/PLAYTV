import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import styles from '../legal.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className="page-container">
          <div className={styles.wrapper}>
            <article className={`glass-card ${styles.card}`}>
              <h1 className={styles.title}>Conditions Générales d’Utilisation</h1>
              <p className={styles.intro}>
                En utilisant PLAYTV, vous acceptez les présentes conditions. Elles définissent les règles
                d’accès au service, les responsabilités des utilisateurs et les limites de la plateforme.
              </p>

              <section className={styles.section}>
                <h2>1. Accès au service</h2>
                <p>
                  PLAYTV fournit un accès à des chaînes de télévision en streaming. L’accès peut varier selon
                  votre abonnement (essai ou accès complet) et la disponibilité des sources.
                </p>
              </section>

              <section className={styles.section}>
                <h2>2. Compte utilisateur</h2>
                <p>
                  Vous êtes responsable des informations saisies et de la confidentialité de votre compte.
                  Toute activité réalisée avec vos identifiants est réputée effectuée par vous.
                </p>
              </section>

              <section className={styles.section}>
                <h2>3. Règles d’utilisation</h2>
                <ul>
                  <li>Ne pas revendre ou redistribuer l’accès au service sans autorisation.</li>
                  <li>Ne pas tenter de contourner les limitations techniques ou de sécurité.</li>
                  <li>Respecter les lois locales en matière de contenus et d’usage internet.</li>
                </ul>
              </section>

              <section className={styles.section}>
                <h2>4. Disponibilité</h2>
                <p>
                  PLAYTV vise une disponibilité élevée, mais ne garantit pas un fonctionnement sans interruption.
                  Certains flux peuvent être temporairement indisponibles pour maintenance ou indisponibilité de la source.
                </p>
              </section>

              <section className={styles.section}>
                <h2>5. Contact</h2>
                <p>
                  Pour toute question, contactez le support via WhatsApp au +243 802 007 413.
                </p>
              </section>

              <Link href="/" className={styles.backLink}>
                <ChevronLeft size={18} /> Retour à l’accueil
              </Link>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
