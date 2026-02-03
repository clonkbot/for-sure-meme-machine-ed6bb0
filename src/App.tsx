import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

interface MemeClip {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  frequency: number;
  color: string;
}

const memeLibrary: MemeClip[] = [
  { id: '1', title: 'FOR SURE', subtitle: 'The Original', duration: '0:02', frequency: 440, color: '#0055A4' },
  { id: '2', title: 'POUR SÛR', subtitle: 'French Edition', duration: '0:03', frequency: 523, color: '#EF4135' },
  { id: '3', title: 'Certainement', subtitle: 'Formal Mode', duration: '0:02', frequency: 349, color: '#0055A4' },
  { id: '4', title: 'ABSOLUMENT', subtitle: 'Extra Confident', duration: '0:04', frequency: 392, color: '#EF4135' },
  { id: '5', title: 'Bien Sûr', subtitle: 'Casual Macron', duration: '0:02', frequency: 587, color: '#0055A4' },
  { id: '6', title: 'ÉVIDEMMENT', subtitle: 'The Obvious', duration: '0:03', frequency: 659, color: '#EF4135' },
  { id: '7', title: 'Sans Doute', subtitle: 'No Doubt', duration: '0:02', frequency: 698, color: '#0055A4' },
  { id: '8', title: 'NATURELLEMENT', subtitle: 'Naturally', duration: '0:03', frequency: 784, color: '#EF4135' },
  { id: '9', title: 'C\'est Clair', subtitle: 'It\'s Clear', duration: '0:02', frequency: 880, color: '#0055A4' },
  { id: '10', title: 'TOTALEMENT', subtitle: 'Totally', duration: '0:03', frequency: 494, color: '#EF4135' },
  { id: '11', title: 'Exactement', subtitle: 'Precisely', duration: '0:02', frequency: 554, color: '#0055A4' },
  { id: '12', title: 'DÉFINITIVEMENT', subtitle: 'Definitively', duration: '0:04', frequency: 622, color: '#EF4135' },
];

interface ComposerNote {
  id: string;
  clipId: string;
  position: number;
  title: string;
}

function App() {
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [composerNotes, setComposerNotes] = useState<ComposerNote[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playIntervalRef = useRef<number | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number = 0.3) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  const handleClipClick = useCallback((clip: MemeClip) => {
    setActiveClip(clip.id);
    playTone(clip.frequency);
    setTimeout(() => setActiveClip(null), 300);

    const newNote: ComposerNote = {
      id: `${Date.now()}-${Math.random()}`,
      clipId: clip.id,
      position: composerNotes.length % 16,
      title: clip.title,
    };
    setComposerNotes(prev => [...prev.slice(-15), newNote]);
  }, [playTone, composerNotes.length]);

  const playComposition = useCallback(() => {
    if (composerNotes.length === 0) return;

    setIsPlaying(true);
    setPlayhead(0);
    let currentIndex = 0;

    playIntervalRef.current = window.setInterval(() => {
      if (currentIndex >= composerNotes.length) {
        setIsPlaying(false);
        setPlayhead(0);
        if (playIntervalRef.current) clearInterval(playIntervalRef.current);
        return;
      }

      const note = composerNotes[currentIndex];
      const clip = memeLibrary.find(c => c.id === note.clipId);
      if (clip) {
        playTone(clip.frequency, 0.2);
        setActiveClip(clip.id);
        setTimeout(() => setActiveClip(null), 150);
      }
      setPlayhead(currentIndex);
      currentIndex++;
    }, 200);
  }, [composerNotes, playTone]);

  const stopComposition = useCallback(() => {
    setIsPlaying(false);
    setPlayhead(0);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
  }, []);

  const clearComposition = useCallback(() => {
    setComposerNotes([]);
    stopComposition();
  }, [stopComposition]);

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="scanlines" />
      <div className="noise-overlay" />

      <header className="header">
        <motion.div
          className="glitch-wrapper"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
        >
          <h1 className="title glitch" data-text="FOR SURE">FOR SURE</h1>
          <div className="title-accent">MACRON MEME MACHINE</div>
        </motion.div>
        <motion.p
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          La bibliothèque définitive · Sample · Compose · Remix
        </motion.p>
      </header>

      <main className="main-content">
        <section className="library-section">
          <div className="section-header">
            <span className="section-number">01</span>
            <h2 className="section-title">MEME LIBRARY</h2>
            <span className="section-line" />
          </div>

          <div className="meme-grid">
            {memeLibrary.map((clip, index) => (
              <motion.button
                key={clip.id}
                className={`meme-tile ${activeClip === clip.id ? 'active' : ''}`}
                style={{ '--accent-color': clip.color } as React.CSSProperties}
                onClick={() => handleClipClick(clip)}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.05, rotate: Math.random() > 0.5 ? 2 : -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="tile-border" />
                <div className="tile-content">
                  <span className="tile-title">{clip.title}</span>
                  <span className="tile-subtitle">{clip.subtitle}</span>
                  <span className="tile-duration">{clip.duration}</span>
                </div>
                <div className="tile-pulse" />
              </motion.button>
            ))}
          </div>
        </section>

        <section className="composer-section">
          <div className="section-header">
            <span className="section-number">02</span>
            <h2 className="section-title">COMPOSER</h2>
            <span className="section-line" />
          </div>

          <div className="composer-wrapper">
            <div className="composer-timeline">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`timeline-slot ${composerNotes[i] ? 'filled' : ''} ${playhead === i && isPlaying ? 'playing' : ''}`}
                >
                  <AnimatePresence>
                    {composerNotes[i] && (
                      <motion.div
                        className="note-block"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        style={{
                          backgroundColor: memeLibrary.find(c => c.id === composerNotes[i].clipId)?.color
                        }}
                      >
                        <span className="note-label">{composerNotes[i].title.slice(0, 3)}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="slot-number">{i + 1}</span>
                </div>
              ))}
            </div>

            <div className="composer-controls">
              <motion.button
                className="control-btn play-btn"
                onClick={isPlaying ? stopComposition : playComposition}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? '■ STOP' : '▶ PLAY'}
              </motion.button>
              <motion.button
                className="control-btn clear-btn"
                onClick={clearComposition}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕ CLEAR
              </motion.button>
              <div className="note-count">
                {composerNotes.length}/16 samples
              </div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <motion.div
            className="info-card"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="card-icon">🇫🇷</div>
            <h3>The Origin</h3>
            <p>Born from a viral interview moment, Macron&apos;s confident &ldquo;For Sure&rdquo; became an instant meme phenomenon across the internet.</p>
          </motion.div>
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-icon">🎵</div>
            <h3>Sample It</h3>
            <p>Click any tile to trigger the audio sample. Build your own remix by clicking in sequence.</p>
          </motion.div>
          <motion.div
            className="info-card"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-icon">🎹</div>
            <h3>Compose</h3>
            <p>Your samples auto-fill the timeline. Hit play to hear your one-minute Macron masterpiece.</p>
          </motion.div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-credit">Requested by @GoldenFarFR · Built by @clonkbot</span>
        </div>
      </footer>
    </div>
  );
}

export default App;