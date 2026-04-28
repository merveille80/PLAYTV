'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Mail, Lock, User, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import { supabase } from '@/lib/supabase';
import styles from './auth.module.css';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        router.push('/watch');
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name },
          },
        });
        if (error) throw error;
        
        // Create initial profile
        if (signUpData.user) {
          await supabase.from('profiles').insert([{
            id: signUpData.user.id,
            plan: 'trial',
            subscription_expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          }]);
        }

        setMessage({ text: 'Compte créé ! Vous pouvez maintenant vous connecter.', type: 'success' });
        setIsLogin(true); // Switch to login view
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  // Add message state for success
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/watch`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue avec Google.');
    }
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className="page-container">
          <div className={styles.wrapper}>
            <div className={`glass-card ${styles.card}`}>
              <div className={styles.header}>
                <div className={styles.icon}><Tv size={24} /></div>
                <h1>{isLogin ? 'Bon retour !' : 'Créer un compte'}</h1>
                <p>{isLogin ? 'Connectez-vous pour voir vos chaînes' : 'Commencez vos 3 jours d\'essai gratuit'}</p>
              </div>

              {error && (
                <div className={styles.error}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                {!isLogin && (
                  <div className={styles.field}>
                    <label>Nom complet</label>
                    <div className={styles.inputWrap}>
                      <User size={18} />
                      <input 
                        type="text" 
                        placeholder="Jean Dupont" 
                        className="input-field" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.field}>
                  <label>Email</label>
                  <div className={styles.inputWrap}>
                    <Mail size={18} />
                    <input 
                      type="email" 
                      placeholder="exemple@mail.com" 
                      className="input-field" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Mot de passe</label>
                  <div className={styles.inputWrap}>
                    <Lock size={18} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-field" 
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {loading ? <Loader2 className="spin" size={20} /> : (
                    <>{isLogin ? 'Se connecter' : 'Créer mon compte'} <ChevronRight size={18} /></>
                  )}
                </button>
              </form>

              <div className={styles.divider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>Ou continuer avec</span>
                <div className={styles.dividerLine} />
              </div>

              <button 
                type="button" 
                className={styles.googleBtn}
                onClick={handleGoogleLogin}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>


              <div className={styles.toggle}>
                {isLogin ? "Pas encore de compte ?" : "Déjà membre ?"}
                <button onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
