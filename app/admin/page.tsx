'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import { CATEGORY_LABELS } from '@/lib/channels';
import { supabase } from '@/lib/supabase';
import styles from './admin.module.css';

interface CustomChannel {
  id: string;
  name: string;
  streamUrl: string;
  logo: string;
  categories: string[];
}

export default function AdminPage() {
  const [channels, setChannels] = useState<CustomChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<CustomChannel | null>(null);
  const [formData, setFormData] = useState({ name: '', streamUrl: '', logo: '', categories: ['general'] });
  const [message, setMessage] = useState({ text: '', type: '' }); // success, error

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/';
        return;
      }

      const res = await fetch('/api/admin/channels');
      if (res.status === 401) {
        window.location.href = '/';
        return;
      }
      const data = await res.json();
      setChannels(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/admin/channels';
    const method = editingChannel ? 'PUT' : 'POST';
    const body = editingChannel ? { ...formData, id: editingChannel.id } : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage({ text: `Chaîne ${editingChannel ? 'modifiée' : 'ajoutée'} avec succès !`, type: 'success' });
        setShowModal(false);
        setEditingChannel(null);
        setFormData({ name: '', streamUrl: '', logo: '', categories: ['general'] });
        loadChannels();
      } else {
        setMessage({ text: "Erreur lors de l'enregistrement.", type: 'error' });
      }
    } catch (e) {
      setMessage({ text: "Erreur de connexion au serveur.", type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette chaîne ?')) return;

    try {
      const res = await fetch('/api/admin/channels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMessage({ text: 'Chaîne supprimée.', type: 'success' });
        loadChannels();
      }
    } catch (e) {
      setMessage({ text: 'Erreur lors de la suppression.', type: 'error' });
    }
  };

  const handleEdit = (channel: CustomChannel) => {
    setEditingChannel(channel);
    setFormData({ 
      name: channel.name, 
      streamUrl: channel.streamUrl, 
      logo: channel.logo || '', 
      categories: channel.categories || ['general'] 
    });
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <div className="page-container">
          
          <div className={styles.header}>
            <div>
              <h1>Espace <span className="gradient-text">Admin</span></h1>
              <p>Gérez vos propres liens de streaming et mettez à jour les chaînes.</p>
            </div>
            <button className="btn-primary" onClick={() => { setEditingChannel(null); setShowModal(true); }}>
              <Plus size={18} /> Ajouter une chaîne
            </button>
          </div>

          {message.text && (
            <div className={`${styles.alert} ${message.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
              {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              {message.text}
              <button onClick={() => setMessage({ text: '', type: '' })} className={styles.alertClose}><X size={16} /></button>
            </div>
          )}

          <div className={`glass-card ${styles.tableCard}`}>
            {loading ? (
              <div className={styles.loading}>Chargement des chaînes...</div>
            ) : channels.length === 0 ? (
              <div className={styles.empty}>
                <RefreshCw size={48} />
                <p>Aucune chaîne personnalisée pour le moment.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Chaîne</th>
                      <th>URL du Flux</th>
                      <th>Catégorie</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((channel) => (
                      <tr key={channel.id}>
                        <td>
                          <div className={styles.channelCol}>
                            <div className={styles.logoMini}>
                              {channel.logo ? <img src={channel.logo} alt="" /> : channel.name.slice(0,2)}
                            </div>
                            <span>{channel.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.urlCol}>
                            <code>{channel.streamUrl.slice(0, 40)}...</code>
                            <a href={channel.streamUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /></a>
                          </div>
                        </td>
                        <td>
                          <span className={styles.catBadge}>{CATEGORY_LABELS[channel.categories?.[0] || 'general']}</span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.editBtn} onClick={() => handleEdit(channel)}><Edit2 size={16} /></button>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(channel.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`glass-card ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingChannel ? 'Modifier' : 'Ajouter'} une chaîne</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Nom de la chaîne</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="ex: Canal+ Sport 1"
                />
              </div>
              <div className={styles.field}>
                <label>Lien du flux (M3U8 / HLS)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.streamUrl}
                  onChange={e => setFormData({...formData, streamUrl: e.target.value})}
                  placeholder="https://.../playlist.m3u8"
                />
              </div>
              <div className={styles.field}>
                <label>Lien du logo (Optionnel)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.logo}
                  onChange={e => setFormData({...formData, logo: e.target.value})}
                  placeholder="https://.../logo.png"
                />
              </div>
              <div className={styles.field}>
                <label>Catégorie</label>
                <select 
                  className="input-field"
                  value={formData.categories[0]}
                  onChange={e => setFormData({...formData, categories: [e.target.value]})}
                  style={{ appearance: 'none' }}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key} style={{ background: '#0f0f1a' }}>{label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                <Save size={18} /> {editingChannel ? 'Mettre à jour' : 'Enregistrer la chaîne'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
