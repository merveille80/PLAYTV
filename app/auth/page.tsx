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
