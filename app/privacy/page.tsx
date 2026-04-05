import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import styles from '../legal.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className="page-container">
          <div className={styles.wrapper}>
            <article className={`glass-card ${styles.card}`}>
              <h1 className={styles.title}>Politique de Confidentialité</h1>
              <p className={styles.intro}>
                Cette politique explique quelles données nous traitons et comment elles sont utilisées
                pour faire fonctionner PLAYTV.
              </p>

              <section className={styles.section}>
                <h2>1. Données collectées</h2>
                <ul>
                  <li>Informations de compte: nom, email.</li>
                  <li>Données d’abonnement: type de plan, date d’expiration.</li>
                  <li>Données techniques minimales nécessaires au fonctionnement du service.</li>
                </ul>
              </section>

              <section className={styles.section}>
                <h2>2. Utilisation des données</h2>
                <p>
                  Les données sont utilisées pour authentifier votre compte, activer votre abonnement,
                  améliorer la stabilité du service et vous assister en cas de support.
                </p>
              </section>

              <section className={styles.section}>
                <h2>3. Conservation</h2>
                <p>
                  Les données sont conservées uniquement pendant la durée nécessaire à la gestion du service
                  et aux obligations légales applicables.
                </p>
              </section>

              <section className={styles.section}>
                <h2>4. Sécurité</h2>
                <p>
                  Nous appliquons des mesures de sécurité raisonnables pour protéger les données contre
                  l’accès non autorisé, la perte ou l’altération.
                </p>
              </section>

              <section className={styles.section}>
                <h2>5. Vos droits</h2>
                <p>
                  Vous pouvez demander la consultation, la correction ou la suppression de vos informations
                  selon les règles en vigueur.
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
