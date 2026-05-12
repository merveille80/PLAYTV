'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Loader2, Lock, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import { supabase } from '@/lib/supabase';
import styles from './subscribe.module.css';

function SubscribeContent() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Loading, 2: Payment, 3: Success
  const [formData, setFormData] = useState({ phone: '', provider: 'mpesa' });
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        // Rediriger vers auth s'il n'est pas connecté
        router.push('/auth');
      } else {
        setUserEmail(session.user.email || '');
        setUserName(session.user.user_metadata?.full_name || 'Abonné');
        setStep(2); // Passe directement à l'étape du paiement
      }
    };
    checkAuth();
  }, [router]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Simulate payment delay for "Mobile Money" feel
      // Ici sera intégrée l'API FlexPay / Maxicash
      await new Promise(resolve => setTimeout(resolve, 2500));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 1 mois (30 jours)

        const { error: profileError } = await supabase.from('profiles').update({
          plan: 'premium',
          subscription_expiry: expiry
        }).eq('id', user.id);
        
        if (profileError) throw profileError;
      }

      setStep(3);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du traitement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className="page-container">
          <div className={styles.wrapper}>
            
            <div className={`glass-card ${styles.card}`}>
              
              {/* Step 1: Loading Auth State */}
              {step === 1 && (
                <div className={styles.stepContent} style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 className="spin" size={48} style={{ margin: '0 auto', color: 'var(--accent)' }} />
                  <p style={{ marginTop: '20px' }}>Vérification de votre compte...</p>
                </div>
              )}

              {/* Step 2: Payment Form */}
              {step === 2 && (
                <div className={styles.stepContent}>
                  <h2>Paiement <span className="gradient-text">Mobile Money</span></h2>
                  <p className={styles.subtitle}>Abonnement Mensuel (30 Jours) - Sécurisé et instantané au Congo.</p>
                  
                  <div className={styles.providers}>
                    <button 
                      className={`${styles.provider} ${formData.provider === 'mpesa' ? styles.providerActive : ''}`}
                      onClick={() => setFormData({...formData, provider: 'mpesa'})}
                    >
                      M-Pesa
                    </button>
                    <button 
                      className={`${styles.provider} ${formData.provider === 'airtel' ? styles.providerActive : ''}`}
                      onClick={() => setFormData({...formData, provider: 'airtel'})}
                    >
                      Airtel Money
                    </button>
                  </div>

                  <div className={styles.field}>
                    <label>Numéro de téléphone ({formData.provider === 'mpesa' ? 'Vodacom' : 'Airtel'})</label>
                    <input 
                      type="tel" 
                      placeholder="+243 ••• ••• •••" 
                      className="input-field"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className={styles.secureBadge}>
                    <Lock size={14} /> Paiement 100% sécurisé via Mobile Money
                  </div>

                  <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handlePayment} disabled={loading || !formData.phone}>
                    {loading ? (
                      <><Loader2 className="spin" size={20} /> Traitement en cours...</>
                    ) : (
                      `Payer 20 000 FC`
                    )}
                  </button>
                </div>
              )}

              {/* Step 3: Success! */}
              {step === 3 && (
                <div className={styles.success}>
                  <div className={styles.successIcon}><ShieldCheck size={48} /></div>
                  <h2>Paiement Réussi !</h2>
                  <p>Votre abonnement <strong>Premium 1 Mois</strong> est désormais actif.</p>
                  <div className={styles.summary}>
                    <div className={styles.sumRow}><span>Utilisateur:</span> <strong>{userName}</strong></div>
                    <div className={styles.sumRow}><span>Email:</span> <strong>{userEmail}</strong></div>
                    <div className={styles.sumRow}><span>Validité:</span> <strong>30 Jours</strong></div>
                  </div>
                  <Link href="/watch" className="btn-primary" style={{ width: '100%' }}>
                    Commencer à regarder
                  </Link>
                </div>
              )}
            </div>

            {/* Support Info */}
            <div className={styles.support}>
              <p>Besoin d'aide ?</p>
              <a href="https://wa.me/243802007413" target="_blank" rel="noreferrer" className={styles.supportLink}>
                Contactez-nous sur WhatsApp : <strong>+243 802 007 413</strong>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className={styles.loadingState}><Loader2 className="spin" size={48} /></div>}>
      <SubscribeContent />
    </Suspense>
  );
}
