'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Loader2, Lock, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import { supabase } from '@/lib/supabase';
import styles from './subscribe.module.css';

function SubscribeContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'full';

  const [step, setStep] = useState(1); // 1: Plan, 2: Account, 3: Payment, 4: Success
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', provider: 'mpesa' });
  const [loading, setLoading] = useState(false);

  const handleNext = () => setStep(step + 1);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Sign up if needed (Step 2)
      if (step === 2) {
        const { error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { full_name: formData.name } }
        });
        if (authError) throw authError;
      }

      // Simulate payment delay for "Mobile Money" feel
      await new Promise(resolve => setTimeout(resolve, 2500));

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const expiry = selectedPlan === 'full' 
          ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() 
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

        const { error: profileError } = await supabase.from('profiles').update({
          plan: selectedPlan === 'full' ? 'full' : 'trial',
          subscription_expiry: expiry
        }).eq('id', user.id);
        
        if (profileError) throw profileError;
      }

      setStep(4);
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
            
            {/* Progress Stepper */}
            <div className={styles.stepper}>
              {[1, 2, 3].map((s) => (
                <div key={s} className={`${styles.step} ${step >= s ? styles.stepActive : ''}`}>
                  <div className={styles.stepNum}>{s}</div>
                  <span className={styles.stepLabel}>{s === 1 ? 'Plan' : s === 2 ? 'Compte' : 'Paiement'}</span>
                </div>
              ))}
            </div>

            <div className={`glass-card ${styles.card}`}>
              
              {/* Step 1: Select Plan */}
              {step === 1 && (
                <div className={styles.stepContent}>
                  <h2>Choisissez votre <span className="gradient-text">Plan</span></h2>
                  <div className={styles.plans}>
                    <div 
                      className={`${styles.planOption} ${selectedPlan === 'trial' ? styles.planSelected : ''}`}
                      onClick={() => setSelectedPlan('trial')}
                    >
                      <div className={styles.planInfo}>
                        <span className={styles.planTitle}>Essai Gratuit</span>
                        <span className={styles.planPrice}>0 FC <span>/ 3 jours</span></span>
                      </div>
                      <div className={styles.planRadio} />
                    </div>
                    <div 
                      className={`${styles.planOption} ${selectedPlan === 'full' ? styles.planSelected : ''}`}
                      onClick={() => setSelectedPlan('full')}
                    >
                      <div className={styles.planInfo}>
                        <span className={styles.planTitle}>Accès Complet <span className={styles.popular}>POPULAIRE</span></span>
                        <span className={styles.planPrice}>20 000 FC <span>/ 2 mois</span></span>
                      </div>
                      <div className={styles.planRadio} />
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%' }} onClick={handleNext}>
                    Continuer <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Step 2: Account Creation */}
              {step === 2 && (
                <div className={styles.stepContent}>
                  <h2>Créez un <span className="gradient-text">Compte</span></h2>
                  <p className={styles.subtitle}>Pour accéder à vos chaînes sur tous vos appareils.</p>
                  
                  <div className={styles.form}>
                    <div className={styles.field}>
                      <label>Nom complet</label>
                      <input 
                        type="text" 
                        placeholder="Jean Dupont" 
                        className="input-field" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Email</label>
                      <input 
                        type="email" 
                        placeholder="jean@exemple.com" 
                        className="input-field"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Mot de passe</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="input-field"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={handleNext}>
                    Étape suivante <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Step 3: Payment Simulation */}
              {step === 3 && (
                <div className={styles.stepContent}>
                  {selectedPlan === 'trial' ? (
                    <div className={styles.trialReady}>
                      <CheckCircle2 size={64} color="var(--accent)" />
                      <h2>C&apos;est parti !</h2>
                      <p>Votre essai gratuit est prêt. Aucune information de paiement n&apos;est requise.</p>
                      <button className="btn-primary" onClick={handlePayment} disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : 'Activer mon essai'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2>Paiement <span className="gradient-text">Mobile Money</span></h2>
                      <p className={styles.subtitle}>Sécurisé et instantané au Congo.</p>
                      
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
                        <label>Numéro de téléphone</label>
                        <input 
                          type="tel" 
                          placeholder="+243 ••• ••• •••" 
                          className="input-field"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>

                      <div className={styles.secureBadge}>
                        <Lock size={14} /> Paiement 100% sécurisé
                      </div>

                      <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handlePayment} disabled={loading}>
                        {loading ? (
                          <><Loader2 className="spin" size={20} /> Traitement...</>
                        ) : (
                          `Payer 20 000 FC`
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Success! */}
              {step === 4 && (
                <div className={styles.success}>
                  <div className={styles.successIcon}><ShieldCheck size={48} /></div>
                  <h2>Paiement Réussi !</h2>
                  <p>Votre abonnement <strong>{selectedPlan === 'full' ? 'Accès Complet' : 'Essai'}</strong> est désormais actif.</p>
                  <div className={styles.summary}>
                    <div className={styles.sumRow}><span>Utilisateur:</span> <strong>{formData.name}</strong></div>
                    <div className={styles.sumRow}><span>Email:</span> <strong>{formData.email}</strong></div>
                    <div className={styles.sumRow}><span>Validité:</span> <strong>{selectedPlan === 'full' ? '60 Jours' : '3 Jours'}</strong></div>
                  </div>
                  <Link href="/watch" className="btn-primary" style={{ width: '100%' }}>
                    Commencer à regarder
                  </Link>
                </div>
              )}
            </div>

            {/* Support Info */}
            <div className={styles.support}>
              <p>Besoin d&apos;aide ?</p>
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
