'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, AlertCircle, Loader2, Monitor } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

export default function VideoPlayer({ src, poster, autoPlay = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [levels, setLevels] = useState<{ id: number; label: string }[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 is Auto
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    // Check user preference for data saver
    async function checkPrefs() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('data_saver')
          .eq('id', session.user.id)
          .single();
        if (data?.data_saver) setDataSaver(true);
      } else {
        const local = localStorage.getItem('playtv_datasaver') === 'true';
        setDataSaver(local);
      }
    }
    checkPrefs();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;
    setIsLoading(true);
    setError(null);

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          const availableLevels = hls!.levels.map((level, index) => ({
            id: index,
            label: level.height ? `${level.height}p` : `Qualité ${index + 1}`
          }));
          setLevels(availableLevels);

          // Data Saver: Try to find ~360p level if active
          if (dataSaver) {
            const lowLevel = hls!.levels.findIndex(l => l.height <= 360);
            if (lowLevel !== -1) {
              hls!.currentLevel = lowLevel;
              setCurrentLevel(lowLevel);
            }
          }

          if (autoPlay) video.play().catch(() => setIsPlaying(false));
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          setCurrentLevel(hls!.currentLevel);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('HLS fatal error:', data);
            setError("Impossible de charger ce flux. Il est peut-être hors ligne.");
            setIsLoading(false);
          }
        });
        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
          if (autoPlay) video.play().catch(() => setIsPlaying(false));
        });
        video.addEventListener('error', () => {
          setError("Erreur de lecture native.");
          setIsLoading(false);
        });
      } else {
        setError("Votre navigateur ne supporte pas le streaming HLS.");
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Direct video fullscreen for iOS/Safari
    if ((video as any).webkitEnterFullscreen) {
      (video as any).webkitEnterFullscreen();
      return;
    }

    // Standard Fullscreen API for others
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const changeQuality = (levelId: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentLevel(levelId);
    }
    setShowSettings(false);
  };

  const toggleDataSaver = async () => {
    const newState = !dataSaver;
    setDataSaver(newState);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ data_saver: newState })
        .eq('id', session.user.id);
    } else {
      localStorage.setItem('playtv_datasaver', String(newState));
    }

    if (newState && hlsRef.current) {
      const lowLevel = hlsRef.current.levels.findIndex(l => l.height <= 360);
      if (lowLevel !== -1) {
        hlsRef.current.currentLevel = lowLevel;
        setCurrentLevel(lowLevel);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'f') {
      toggleFullscreen();
    } else if (e.key === 'm') {
      toggleMute();
    } else if (e.key === 'Escape' && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef} 
      className={styles.container}
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Lecteur vidéo"
    >
      <video
        ref={videoRef}
        className={styles.video}
        poster={poster}
        playsInline
        webkit-playsinline="true"
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* States Overlay */}
      {isLoading && (
        <div className={styles.overlay}>
          <Loader2 className={styles.spinner} size={48} strokeWidth={1.5} />
          <p>Chargement du flux...</p>
        </div>
      )}

      {error && (
        <div className={styles.overlay}>
          <AlertCircle className={styles.errorIcon} size={48} strokeWidth={1.5} />
          <p>{error}</p>
          <button className="btn-secondary" onClick={() => window.location.reload()} style={{ marginTop: '12px' }}>
            Réessayer
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`${styles.controls} ${!showControls && isPlaying ? styles.hidden : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.bottomBar}>
          <div className={styles.left}>
            <button onClick={togglePlay} className={styles.iconBtn}>
              {isPlaying ? <Pause size={24} fill="white" strokeWidth={1.5} /> : <Play size={24} fill="white" strokeWidth={1.5} />}
            </button>
            <button onClick={toggleMute} className={styles.iconBtn}>
              {isMuted ? <VolumeX size={24} strokeWidth={1.5} /> : <Volume2 size={24} strokeWidth={1.5} />}
            </button>
            <div className={styles.liveBadge}>LIVE</div>
          </div>

          <div className={styles.right}>
            <div className={styles.settingsWrapper}>
              <button 
                className={`${styles.iconBtn} ${showSettings ? styles.iconBtnActive : ''}`}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={20} strokeWidth={1.5} />
              </button>
              
              {showSettings && (
                <div className={styles.settingsMenu}>
                  <div className={styles.menuHeader}>Qualité Vidéo</div>
                  <button 
                    className={`${styles.menuItem} ${currentLevel === -1 ? styles.menuItemActive : ''}`}
                    onClick={() => changeQuality(-1)}
                  >
                    Auto {currentLevel === -1 ? '(Auto)' : ''}
                  </button>
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      className={`${styles.menuItem} ${currentLevel === level.id ? styles.menuItemActive : ''}`}
                      onClick={() => changeQuality(level.id)}
                    >
                      {level.label}
                    </button>
                  ))}
                  
                  <div className={styles.menuDivider} />
                  <button 
                    className={`${styles.menuItem} ${dataSaver ? styles.menuItemActive : ''}`}
                    onClick={toggleDataSaver}
                  >
                    <span>Mode Éco (Max 360p)</span>
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>{dataSaver ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              )}
            </div>
            {document.pictureInPictureEnabled && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (document.pictureInPictureElement) document.exitPictureInPicture();
                  else videoRef.current?.requestPictureInPicture();
                }} 
                className={styles.iconBtn}
                title="Picture-in-Picture"
              >
                <Monitor size={20} strokeWidth={1.5} />
              </button>
            )}
            <button onClick={toggleFullscreen} className={styles.iconBtn}><Maximize size={20} strokeWidth={1.5} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
