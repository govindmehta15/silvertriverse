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
import { plotsService } from '../services/plotsService';
import { getData, setData } from '../utils/storageService';
import { mockUsers } from '../mock/mockUsers';

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

const AUDIO_3MIN_SCENES = [
  {
    id: 1,
    title: 'Scene 01 — Citizen Entry',
    route: '/reelity',
    duration: 20000,
    loginAs: 'u1',
    voiceover:
      'What if your digital presence wasn’t just a profile… but a space you truly own? Welcome to Silvertriverse — a new kind of digital ecosystem where identity, ownership, and entertainment come together. Every user who enters this world begins as a Citizen. And from the very beginning… they are not limited.',
    note: 'Enter Reelity and reveal portal cards.',
    accentColor: '#22d3ee',
  },
  {
    id: 2,
    title: 'Scene 02 — Ecosystem Movement',
    route: '/collectible-units',
    duration: 18000,
    voiceover:
      'Citizens can move seamlessly across the ecosystem — exploring advanced civilizations, experiencing innovative creations, and discovering new possibilities. They can also enter Collectible Units — to explore, understand, and unlock their utility.',
    note: 'Scroll collectibles page to show active exploration.',
    accentColor: '#a78bfa',
  },
  {
    id: 3,
    title: 'Scene 03 — Reelity Social Layer',
    route: '/reelity',
    duration: 20000,
    voiceover:
      'At the heart of Silvertriverse lies Reelity — the social engine of the entire experience. Reelity is where everything connects. From your personal actions… to the activity across the entire platform, everything is visible, interactive, and alive. It brings users together, drives engagement, and creates a truly immersive social layer.',
    note: 'Scroll feed and highlight live hub activity.',
    accentColor: '#22d3ee',
  },
  {
    id: 4,
    title: 'Scene 04 — Land Identity',
    route: '/land',
    duration: 22000,
    voiceover:
      'In Silvertriverse, profiles don’t exist the way you know them. Instead… you own digital land. This land becomes your identity — a space where you build, grow, and showcase your journey. But not all land is the same.',
    note: 'Open Land and perform one real plot purchase.',
    accentColor: '#4ade80',
  },
  {
    id: 5,
    title: 'Scene 05 — Advanced Civilization Land',
    route: '/land-world',
    duration: 20000,
    voiceover:
      'To unlock advanced capabilities like construction, expansion, and enhanced systems, users can upgrade to Advanced Civilization Land — where true transformation begins.',
    note: 'Show Land World camera movement and build ambiance.',
    accentColor: '#818cf8',
  },
  {
    id: 6,
    title: 'Scene 06 — Avatar Assistants',
    route: '/ai-producer',
    duration: 18000,
    voiceover:
      'And you’re not building alone. Every land owner is supported by expert AI agents — called Avatars. These Avatars are intelligent, task-focused assistants designed to support you across multiple domains. They help you learn, execute, and optimize your work… assist in business and operational tasks… and guide you in growing your digital presence. Your Avatar evolves with you — making your journey more efficient, strategic, and powerful.',
    note: 'Show AI Producer then jump to AI Writer briefly.',
    accentColor: '#f59e0b',
  },
  {
    id: 7,
    title: 'Scene 07 — Collectible Utility',
    route: '/collectible-units',
    duration: 20000,
    voiceover:
      'Now, step into the core driver of this ecosystem — Collectible Units. From films… to sports… to global brands and entertainment, these collectibles exist as digital assets — and for iconic items, even as physical counterparts, connected through a digital twin. But here’s what makes them different… They are not just collectibles. They carry utility.',
    note: 'Simulate collectible acquisition and scroll detail-rich cards.',
    accentColor: '#fcd34d',
  },
  {
    id: 8,
    title: 'Scene 08 — Utility-Powered Economy',
    route: '/land',
    duration: 22000,
    voiceover:
      'Each collectible holds power — power that can be used to build and develop your land into dynamic townships. With the support of your Avatars, this becomes a strategic experience. The right collectibles unlock the right possibilities. Users who act early, build intelligently, and use their resources effectively can unlock significant rewards. This creates an ecosystem that is interactive, competitive, and constantly evolving.',
    note: 'Return to Land and show utility strip + purchased growth.',
    accentColor: '#4ade80',
  },
  {
    id: 9,
    title: 'Scene 09 — Tradable Value Finale',
    route: '/relics',
    duration: 20000,
    voiceover:
      'Because of this utility, collectibles are no longer valuable just for rarity… They become functional assets. Tradable. Usable. Valuable. Land itself becomes part of this economy — where users can develop, enhance, and trade based on activity, progress, and demand. Silvertriverse is not just a platform. It’s a shift — from passive profiles to intelligent, evolving ownership. From static collectibles to utility-driven assets. From exploration to creation. From working alone to building alongside AI. This is where identity evolves… where value is created… and where the future of digital interaction begins. Welcome to Silvertriverse.',
    note: 'Open relic market and finish on confident close.',
    accentColor: '#f59e0b',
  },
];

function getActiveScenes() {
  if (typeof window === 'undefined') return SCENES;
  const script = new URLSearchParams(window.location.search).get('demoScript');
  if (script === 'audio3min' || script === '3min') return AUDIO_3MIN_SCENES;
  return SCENES;
}

const ACTIVE_SCENES = getActiveScenes();
const TOTAL_DURATION = ACTIVE_SCENES.reduce((sum, s) => sum + s.duration, 0);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const AUTH_KEY = 'silvertriverse_auth_session';

function smoothScrollTo(top) {
  try {
    window.scrollTo({ top, behavior: 'smooth' });
  } catch {
    window.scrollTo(0, top);
  }
}

function getCurrentDemoUser() {
  return getData(AUTH_KEY, mockUsers[0]);
}

function ensureUsersStore() {
  const users = getData('users');
  if (!Array.isArray(users) || users.length === 0) setData('users', mockUsers);
}

function grantCollectibleToUser(userId, itemId = 'y2', cardId = 'c5') {
  ensureUsersStore();
  const users = getData('users', []);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return;
  const next = { ...users[idx] };
  next.purchasedItems = Array.isArray(next.purchasedItems) ? [...next.purchasedItems] : [];
  next.ownedCards = Array.isArray(next.ownedCards) ? [...next.ownedCards] : [];
  if (!next.purchasedItems.includes(itemId)) next.purchasedItems.push(itemId);
  if (!next.ownedCards.includes(cardId)) next.ownedCards.push(cardId);
  users[idx] = next;
  setData('users', users);
  if (next.id === userId) setData(AUTH_KEY, next);
}

async function purchaseOneAvailablePlot() {
  const user = getCurrentDemoUser();
  const ownership = plotsService.getOwnershipMapSync();
  let target = null;
  for (let i = 0; i < 625; i += 1) {
    if (!ownership[i]) { target = i; break; }
  }
  if (target === null) return;
  await plotsService.purchasePlot(user.id, user.name, target);
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
  const actionTimersRef = useRef([]);
  const startTimeRef = useRef(null);
  const sceneStartRef = useRef(null);

  // ── Cleanup ────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    clearTimeout(sceneTimerRef.current);
    clearInterval(tickRef.current);
    actionTimersRef.current.forEach((t) => clearTimeout(t));
    actionTimersRef.current = [];
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
      if (index >= ACTIVE_SCENES.length) {
        cleanup();
        setStatus('finished');
        return;
      }

      const scene = ACTIVE_SCENES[index];
      setSceneIndex(index);
      setSceneElapsed(0);
      sceneStartRef.current = Date.now();

      // Login if scene requires a specific user
      if (scene.loginAs) {
        login(scene.loginAs);
      }

      // Navigate to the scene's route
      navigate(scene.route);

      // Automated in-scene actions for the 3-min audio script
      actionTimersRef.current.forEach((t) => clearTimeout(t));
      actionTimersRef.current = [];
      const queueAction = (delay, fn) => {
        const t = setTimeout(fn, delay);
        actionTimersRef.current.push(t);
      };

      const script = new URLSearchParams(window.location.search).get('demoScript');
      const isAudio3 = script === 'audio3min' || script === '3min';
      if (isAudio3) {
        if (scene.id === 1) {
          queueAction(1200, () => smoothScrollTo(120));
          queueAction(5200, () => smoothScrollTo(420));
        } else if (scene.id === 2) {
          queueAction(900, () => smoothScrollTo(260));
          queueAction(5200, () => smoothScrollTo(980));
        } else if (scene.id === 3) {
          queueAction(1200, () => smoothScrollTo(520));
          queueAction(7800, () => smoothScrollTo(60));
        } else if (scene.id === 4) {
          queueAction(1900, async () => { await purchaseOneAvailablePlot(); });
          queueAction(7200, () => {
            const guide = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('House Guide'));
            guide?.click();
          });
        } else if (scene.id === 5) {
          queueAction(2200, () => smoothScrollTo(460));
          queueAction(9200, () => smoothScrollTo(70));
        } else if (scene.id === 6) {
          queueAction(8200, () => navigate('/ai-writer'));
        } else if (scene.id === 7) {
          queueAction(1800, () => grantCollectibleToUser(getCurrentDemoUser().id));
          queueAction(4200, () => smoothScrollTo(860));
          queueAction(9800, () => smoothScrollTo(90));
        } else if (scene.id === 8) {
          queueAction(2500, async () => { await purchaseOneAvailablePlot(); });
          queueAction(7200, () => {
            const jumpBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Jump to My Plot'));
            jumpBtn?.click();
          });
        } else if (scene.id === 9) {
          queueAction(4200, () => {
            const firstRelic = document.querySelector('a[href^="/relics/"]');
            if (firstRelic) firstRelic.click();
          });
        }
      }

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

  const currentScene = ACTIVE_SCENES[sceneIndex];

  // ── Finished screen ────────────────────────────────────────────────
  if (status === 'finished') {
    return (
      <div
        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center"
        style={{ background: 'rgba(7,13,31,0.95)', fontFamily: 'sans-serif' }}
      >
        <div className="text-6xl mb-4">🎬</div>
        <h2 className="font-serif text-3xl text-white font-bold mb-2">Demo Complete!</h2>
        <p className="text-gray-400 text-sm mb-8">All {ACTIVE_SCENES.length} scenes have played. Stop your recording.</p>
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
            REC &nbsp;·&nbsp; Scene {currentScene.id} of {ACTIVE_SCENES.length} &nbsp;·&nbsp;{' '}
            {formatTime(TOTAL_DURATION - totalElapsed)} left
          </div>
        </motion.div>
      )}
    </>
  );
}
