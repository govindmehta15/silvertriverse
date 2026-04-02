/**
 * DemoMode.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated scene sequencer for SilverTriverse PR video recording.
 *
 * HOW TO USE:
 *   1. Start the app: npm run dev
 *   2. A floating "🎬 Record Demo" button appears in bottom-right corner.
 *   3. Click it → countdown → all 13 scenes play automatically.
 *   4. Each scene navigates to the right page, shows a scene title overlay,
 *      voiceover text, and moves to the next scene at the correct time.
 *   5. Press ESC or click "✕ Stop" to end at any time.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Scene Definitions ───────────────────────────────────────────────────────
// Each scene: { id, title, route, duration (ms), voiceover, note }
const SCENES = [
  {
    id: 1,
    title: 'Scene 01 — Logo Reveal',
    route: '/',
    duration: 20000,
    voiceover:
      'This is SilverTriverse — an entertainment platform where film fans, collectors, and creators come together in one connected world.',
    note: 'Stay on Home. Let the page animations play.',
    accentColor: '#f59e0b',
  },
  {
    id: 2,
    title: 'Scene 02 — Home Page Overview',
    route: '/',
    duration: 28000,
    voiceover:
      'From the home screen, every part of the platform is one click away. Fans explore. Creators build. Professionals discover.',
    note: 'Hover slowly over feature cards — glow effects visible.',
    accentColor: '#f59e0b',
  },
  {
    id: 3,
    title: 'Scene 03 — Profile & Identity',
    route: '/profile',
    duration: 30000,
    loginAs: 'u1', // Natalie Portman
    voiceover:
      'Log in as Natalie Portman — a Gold-ranked Creator with over 120,000 followers. Your profile is your identity in the SilverTriverse.',
    note: 'Show Shelf tab, then Themes tab. Select Emerald theme.',
    accentColor: '#f59e0b',
  },
  {
    id: 4,
    title: 'Scene 04 — Reelity: Social Feed',
    route: '/reelity',
    duration: 32000,
    voiceover:
      'Reelity is the social heartbeat. Share posts, discover creators, vote in live film battles, and earn participation points in real time.',
    note: 'Scroll feed. Like a post. Vote in the battle. +50 pts animation.',
    accentColor: '#22d3ee',
  },
  {
    id: 5,
    title: 'Scene 05 — Visiting a Profile',
    route: '/reelity/people',
    duration: 15000,
    voiceover:
      'Tap any creator\'s name anywhere in the app — and their public profile loads instantly. No login required.',
    note: 'Click Elias Vance → /profile/u2. Show collaboration bell.',
    accentColor: '#a78bfa',
  },
  {
    id: 6,
    title: 'Scene 06 — Relics: Auction House',
    route: '/relics',
    duration: 25000,
    voiceover:
      'Relics are rare digital artefacts from real film productions. Every item has a story. Every bid is a claim to cinema history.',
    note: 'Click a relic → place a bid → toast confirms.',
    accentColor: '#f59e0b',
  },
  {
    id: 7,
    title: 'Scene 07 — Collectible Units',
    route: '/collectible-units',
    duration: 30000,
    voiceover:
      'Collectible Units turn film discovery into a game. Fans collect. Creators publish. Studio professionals screen talent — powered by the same platform.',
    note: 'Click a card → Film detail. Switch to Marcus (professional). Show Talent Pipeline.',
    accentColor: '#fcd34d',
  },
  {
    id: 8,
    title: 'Scene 08 — Merchandise Shop',
    route: '/merchandise',
    duration: 25000,
    voiceover:
      'Official merchandise — premium and daily drops — each piece digitally authenticated with a Serial Number and a Digital Twin ID. Your collection is provably yours.',
    note: 'Click a product → Add to cart → Navigate to Profile > Shelf.',
    accentColor: '#fb7185',
  },
  {
    id: 9,
    title: 'Scene 09 — Societies & Sync Room',
    route: '/reelity/clubs',
    duration: 25000,
    voiceover:
      'Societies let fans, creators, and professionals gather around shared obsessions. The Sync Room brings members together for live watch parties in real time.',
    note: 'Click a club → Join → Post something → Enter Sync Room.',
    accentColor: '#818cf8',
  },
  {
    id: 10,
    title: 'Scene 10 — AI Writer & AI Producer',
    route: '/ai-writer',
    duration: 25000,
    voiceover:
      'The AI suite gives writers a creative co-pilot and studios a smart screening assistant. Intelligence — built into every workflow.',
    note: 'Show AI Writer hub → tool workflow → streaming output. Then AI Producer.',
    accentColor: '#f59e0b',
  },
  {
    id: 11,
    title: 'Scene 11 — Land Marketplace 3D',
    route: '/land',
    duration: 30000,
    voiceover:
      'The Land Marketplace is a living, breathing 3D world. Your house reflects your rank, your cards, your theme colour. Your collectibles hang on your walls for all to see.',
    note: 'Orbit the 3D scene slowly. Zoom into house walls (frames). Click a plot → modal.',
    accentColor: '#4ade80',
  },
  {
    id: 12,
    title: 'Scene 12 — Rankings',
    route: '/leaderboard',
    duration: 8000,
    voiceover:
      'The rankings update live. Every interaction earns you points. Everyone can see where they stand — and everyone can climb.',
    note: 'Scroll through all three columns. Hover #1 briefly.',
    accentColor: '#f59e0b',
  },
  {
    id: 13,
    title: 'Scene 13 — Finale',
    route: '/',
    duration: 8000,
    voiceover:
      'SilverTriverse — where every fan has a home, every creator has a stage, and every collector has a story to tell. Join the universe.',
    note: 'Return to home. Let the page breathe. Final shot.',
    accentColor: '#f59e0b',
  },
];

const TOTAL_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0); // ~5 minutes

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Scene Overlay ────────────────────────────────────────────────────────────
function SceneOverlay({ scene, sceneElapsed, totalElapsed, onStop }) {
  const progress = Math.min((sceneElapsed / scene.duration) * 100, 100);
  const totalProgress = Math.min((totalElapsed / TOTAL_DURATION) * 100, 100);
  const remaining = scene.duration - sceneElapsed;

  return (
    <>
      {/* ── Top progress bar ──────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
        <div className="h-1 bg-black/40">
          <motion.div
            className="h-full"
            style={{ width: `${totalProgress}%`, background: '#f59e0b' }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* ── Scene Title Card (top-left) ───────────────── */}
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.4 }}
        className="fixed top-4 left-4 z-[9998] max-w-xs pointer-events-none"
        style={{ fontFamily: 'sans-serif' }}
      >
        <div
          className="rounded-xl px-4 py-3 backdrop-blur-md"
          style={{
            background: 'rgba(7,13,31,0.88)',
            border: `1px solid ${scene.accentColor}40`,
            boxShadow: `0 0 20px ${scene.accentColor}25`,
          }}
        >
          <div
            className="text-[10px] font-bold tracking-widest uppercase mb-1"
            style={{ color: scene.accentColor }}
          >
            {scene.title}
          </div>
          {/* Scene progress bar */}
          <div className="h-0.5 rounded-full bg-white/10 mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: scene.accentColor }}
            />
          </div>
          <div className="text-gray-400 text-[10px]">
            Scene ends in{' '}
            <span style={{ color: scene.accentColor }} className="font-mono font-bold">
              {formatTime(remaining)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Director's Note (bottom-left) ────────────── */}
      <motion.div
        key={`note-${scene.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="fixed bottom-6 left-4 z-[9998] max-w-sm pointer-events-none"
        style={{ fontFamily: 'sans-serif' }}
      >
        <div
          className="rounded-xl px-4 py-3 backdrop-blur-md"
          style={{ background: 'rgba(7,13,31,0.82)', border: '1px solid rgba(148,163,184,0.15)' }}
        >
          <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mb-1">
            🎬 Director's Note
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">{scene.note}</p>
        </div>
      </motion.div>

      {/* ── Voiceover (bottom-center) ─────────────────── */}
      <motion.div
        key={`vo-${scene.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] max-w-lg w-full px-4 pointer-events-none"
        style={{ fontFamily: 'sans-serif' }}
      >
        <div
          className="rounded-2xl px-5 py-4 text-center backdrop-blur-md"
          style={{ background: 'rgba(7,13,31,0.90)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mb-1.5">
            🎙 Voiceover
          </div>
          <p className="text-white text-[13px] leading-relaxed italic">"{scene.voiceover}"</p>
        </div>
      </motion.div>

      {/* ── Stop button (top-right) ──────────────────── */}
      <button
        onClick={onStop}
        className="fixed top-4 right-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
        style={{
          background: 'rgba(7,13,31,0.88)',
          border: '1px solid rgba(248,113,113,0.4)',
          color: '#f87171',
          fontFamily: 'sans-serif',
        }}
      >
        ✕ Stop Demo
      </button>
    </>
  );
}

// ─── Countdown Overlay ────────────────────────────────────────────────────────
function CountdownOverlay({ count }) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
      style={{ background: 'rgba(7,13,31,0.92)', backdropFilter: 'blur(8px)', fontFamily: 'sans-serif' }}
    >
      <div className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-6">
        Demo starts in
      </div>
      <motion.div
        key={count}
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="font-serif text-8xl font-bold"
        style={{ color: '#f59e0b', textShadow: '0 0 40px rgba(245,158,11,0.5)' }}
      >
        {count}
      </motion.div>
      <div className="text-gray-500 text-xs mt-6 tracking-widest">
        Get your recording software ready
      </div>
    </div>
  );
}

// ─── Main DemoMode Component ──────────────────────────────────────────────────
export default function DemoMode({ autostart = false }) {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [status, setStatus] = useState('idle'); // idle | countdown | running | finished
  const [countdown, setCountdown] = useState(3);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneElapsed, setSceneElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const sceneTimerRef = useRef(null);
  const tickRef = useRef(null);
  const startTimeRef = useRef(null);
  const sceneStartRef = useRef(null);

  // ── Cleanup ────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    clearTimeout(sceneTimerRef.current);
    clearInterval(tickRef.current);
  }, []);

  const stopDemo = useCallback(() => {
    cleanup();
    setStatus('idle');
    setSceneIndex(0);
    setSceneElapsed(0);
    setTotalElapsed(0);
  }, [cleanup]);

  // ── Advance to scene ───────────────────────────────────────────────
  const goToScene = useCallback(
    (index) => {
      if (index >= SCENES.length) {
        cleanup();
        setStatus('finished');
        return;
      }

      const scene = SCENES[index];
      setSceneIndex(index);
      setSceneElapsed(0);
      sceneStartRef.current = Date.now();

      // Login if scene requires a specific user
      if (scene.loginAs) {
        login(scene.loginAs);
      }

      // Navigate to the scene's route
      navigate(scene.route);

      // Schedule next scene
      clearTimeout(sceneTimerRef.current);
      sceneTimerRef.current = setTimeout(() => {
        goToScene(index + 1);
      }, scene.duration);
    },
    [navigate, login, cleanup]
  );

  // ── Start the full demo ────────────────────────────────────────────
  const startDemo = useCallback(() => {
    setStatus('countdown');
    setCountdown(3);
    let c = 3;

    const cdInterval = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(cdInterval);
        setStatus('running');
        startTimeRef.current = Date.now();
        sceneStartRef.current = Date.now();

        // Log in as Natalie first
        login('u1');

        // Tick timer every 200ms for elapsed time displays
        tickRef.current = setInterval(() => {
          const now = Date.now();
          setTotalElapsed(now - startTimeRef.current);
          setSceneElapsed(now - sceneStartRef.current);
        }, 200);

        goToScene(0);
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, [login, goToScene]);

  // ── Auto-start if prop is passed ─────────────────────────────────────
  useEffect(() => {
    if (autostart && status === 'idle') {
      startDemo();
    }
  }, [autostart, status, startDemo]);

  // ── ESC to stop ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && status !== 'idle') stopDemo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, stopDemo]);

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => () => cleanup(), [cleanup]);

  const currentScene = SCENES[sceneIndex];

  // ── Finished screen ────────────────────────────────────────────────
  if (status === 'finished') {
    return (
      <div
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
        style={{ background: 'rgba(7,13,31,0.95)', fontFamily: 'sans-serif' }}
      >
        <div className="text-6xl mb-4">🎬</div>
        <h2 className="font-serif text-3xl text-white font-bold mb-2">Demo Complete!</h2>
        <p className="text-gray-400 text-sm mb-8">All 13 scenes have played. Stop your recording.</p>
        <button
          onClick={stopDemo}
          className="px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: '#f59e0b', color: '#070d1f' }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ── Floating Launch Button ──────────────────────────────── */}
      {status === 'idle' && !autostart && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={startDemo}
          className="fixed bottom-6 right-6 z-[9997] flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#070d1f',
            boxShadow: '0 0 30px rgba(245,158,11,0.4)',
            fontFamily: 'sans-serif',
          }}
        >
          <span className="text-lg">🎬</span>
          Start Demo Recording
        </motion.button>
      )}

      {/* ── Countdown ──────────────────────────────────────────── */}
      <AnimatePresence>
        {status === 'countdown' && <CountdownOverlay count={countdown} />}
      </AnimatePresence>

      {/* ── Running Overlays ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {status === 'running' && currentScene && (
          <SceneOverlay
            key={currentScene.id}
            scene={currentScene}
            sceneElapsed={sceneElapsed}
            totalElapsed={totalElapsed}
            onStop={stopDemo}
          />
        )}
      </AnimatePresence>

      {/* ── Scene Number Badge (top-center) ───────────────────── */}
      {status === 'running' && currentScene && (
        <motion.div
          key={`badge-${currentScene.id}`}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none"
          style={{ fontFamily: 'sans-serif' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md"
            style={{
              background: 'rgba(7,13,31,0.85)',
              border: `1px solid ${currentScene.accentColor}50`,
              color: currentScene.accentColor,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#ef4444' }}
            />
            REC &nbsp;·&nbsp; Scene {currentScene.id} of {SCENES.length} &nbsp;·&nbsp;{' '}
            {formatTime(TOTAL_DURATION - totalElapsed)} left
          </div>
        </motion.div>
      )}
    </>
  );
}
