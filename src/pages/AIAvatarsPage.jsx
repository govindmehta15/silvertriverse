import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AI_WRITER_TOOLS } from '../data/aiWriterData';
import { AI_PRODUCER_TOOLS } from '../data/aiProducerData';
import { AI_AVATAR_AGENTS } from '../data/aiAvatarAgents';

function zoneClasses(zone) {
  if (zone === 'Writer') return 'border-cyan-500/40 bg-cyan-900/20 text-cyan-300';
  if (zone === 'Producer') return 'border-gold/40 bg-gold/10 text-gold';
  return 'border-violet-500/40 bg-violet-900/20 text-violet-300';
}

export default function AIAvatarsPage() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [activating, setActivating] = useState(false);
  const [portalOpening, setPortalOpening] = useState(false);
  const [zoneFilter, setZoneFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('ai-writer');

  const quickTools = useMemo(() => {
    const writerTop = (AI_WRITER_TOOLS || []).slice(0, 3).map((t) => ({
      id: `w-${t.id}`,
      label: t.name,
      route: `/ai-writer/tool/${t.id}`,
      type: 'Writer Tool',
    }));
    const producerTop = (AI_PRODUCER_TOOLS || []).slice(0, 3).map((t) => ({
      id: `p-${t.id}`,
      label: t.name,
      route: `/ai-producer/tool/${t.id}`,
      type: 'Producer Tool',
    }));
    return [...writerTop, ...producerTop];
  }, []);

  const openAgent = (agent) => {
    navigate(agent.route);
  };

  const activateScan = () => {
    if (activating) return;
    setActivating(true);
    setPortalOpening(true);
    setTimeout(() => {
      setUnlocked(true);
      setActivating(false);
      setPortalOpening(false);
    }, 1250);
  };

  const filteredAgents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AI_AVATAR_AGENTS.filter((agent) => {
      const zonePass = zoneFilter === 'All' ? true : agent.zone === zoneFilter;
      const qPass = q.length === 0
        ? true
        : `${agent.name} ${agent.specialty} ${agent.description}`.toLowerCase().includes(q);
      return zonePass && qPass;
    });
  }, [zoneFilter, query]);

  const selectedAgent = useMemo(
    () => AI_AVATAR_AGENTS.find((a) => a.id === selectedAgentId) || filteredAgents[0] || null,
    [selectedAgentId, filteredAgents]
  );

  if (!unlocked) {
    return (
      <div className="space-y-5 rounded-2xl border border-navy-700/50 bg-gradient-to-br from-[#050914] via-[#0a1020] to-[#091528] p-5">
        <header className="rounded-xl border border-cyan-500/20 bg-navy-950/40 p-4">
          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/80">Neural Access Interface</p>
          <h1 className="mt-1 font-serif text-4xl font-bold tracking-wide text-white md:text-5xl">AI AVATARS</h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-300">
            Access to Futur unlocks the AI command system for Writer, Producer, and specialized assistant agents.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-navy-600/70 bg-navy-950/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Security Level</p>
              <p className="text-sm font-semibold text-cyan-300">Tier-4 Protected</p>
            </div>
            <div className="rounded-lg border border-navy-600/70 bg-navy-950/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Agents Online</p>
              <p className="text-sm font-semibold text-white">{AI_AVATAR_AGENTS.length} Active Nodes</p>
            </div>
            <div className="rounded-lg border border-navy-600/70 bg-navy-950/70 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Core Modules</p>
              <p className="text-sm font-semibold text-gold">Writer + Producer</p>
            </div>
          </div>
        </header>

        <div className="relative flex h-[430px] w-full items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/20 bg-navy-950/60">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.15),transparent_60%)]" />
          <motion.div
            animate={{ rotate: activating ? 360 : 180, scale: activating ? [1, 1.08, 1.18] : 1 }}
            transition={{
              rotate: { duration: activating ? 0.9 : 7, ease: 'linear', repeat: Infinity },
              scale: { duration: 0.8 },
            }}
            className="absolute h-72 w-72 rounded-full border-2 border-cyan-400/60 border-b-transparent"
          />
          <motion.div
            animate={{ rotate: activating ? -420 : -220, scale: activating ? [1, 1.06, 1.15] : 1 }}
            transition={{
              rotate: { duration: activating ? 0.95 : 8, ease: 'linear', repeat: Infinity },
              scale: { duration: 0.8 },
            }}
            className="absolute h-56 w-56 rounded-full border-2 border-violet-400/60 border-t-transparent"
          />
          <motion.div
            animate={{ rotate: activating ? 540 : 300, scale: activating ? [1, 1.04, 1.12] : 1 }}
            transition={{
              rotate: { duration: activating ? 1 : 6.5, ease: 'linear', repeat: Infinity },
              scale: { duration: 0.8 },
            }}
            className="absolute h-40 w-40 rounded-full border border-gold/70 border-r-transparent"
          />

          <button
            type="button"
            onClick={activateScan}
            className="relative z-10 flex h-36 w-36 items-center justify-center rounded-full border border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_70px_rgba(34,211,238,0.22)]"
          >
            <svg className="h-20 w-20 text-cyan-100" fill="none" viewBox="0 0 80 80">
              <path d="M40 16c-9 0-16 7-16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M56 32c0-9-7-16-16-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M22 36c0-10 8-18 18-18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M58 36c0-10-8-18-18-18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M26 41c0-8 6-14 14-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M54 41c0-8-6-14-14-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 46c0-6 4-10 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M50 46c0-6-4-10-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M34 52c0-4 3-7 6-7s6 3 6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M40 58V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <motion.span
              animate={{ y: activating ? [22, -22, 22] : [-20, 20, -20] }}
              transition={{ duration: activating ? 0.75 : 2.2, ease: 'linear', repeat: Infinity }}
              className="pointer-events-none absolute left-6 right-6 h-0.5 rounded-full bg-cyan-300/85 shadow-[0_0_10px_rgba(103,232,249,0.8)]"
            />
          </button>

          <div className="absolute left-6 top-6 rounded-lg border border-cyan-500/20 bg-navy-950/70 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Access to Futur</p>
            <p className="text-xs text-gray-400">Model: FP-9 Neural Mesh</p>
          </div>
          <div className="absolute bottom-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300/90">Access to Futur</p>
            <p className="mt-1 text-sm text-gray-300">
              {activating ? 'Synchronizing access signature...' : 'Tap to initialize agent matrix'}
            </p>
          </div>

          <AnimatePresence>
            {portalOpening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              >
                <div className="relative h-80 w-80">
                  <motion.div
                    initial={{ scale: 0.25, rotate: 0, opacity: 0.2 }}
                    animate={{ scale: 1.4, rotate: 320, opacity: 1 }}
                    transition={{ duration: 1.15, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-4 border-orange-300/85 shadow-[0_0_70px_rgba(251,146,60,0.85)]"
                  />
                  <motion.div
                    initial={{ scale: 0.2, rotate: 0, opacity: 0.1 }}
                    animate={{ scale: 1.22, rotate: -280, opacity: 0.95 }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="absolute inset-5 rounded-full border-2 border-amber-300/85"
                  />
                  <motion.div
                    initial={{ scale: 0.18, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 0.88 }}
                    transition={{ duration: 1.05 }}
                    className="absolute inset-10 rounded-full bg-gradient-to-br from-orange-500/55 via-amber-300/45 to-transparent"
                  />
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 0.95, opacity: 0.7 }}
                    transition={{ duration: 1.05 }}
                    className="absolute inset-16 rounded-full border border-orange-200/55"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="avatars-grid"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="space-y-6"
      >
        <header className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-navy-900/60 to-cyan-950/30 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-violet-300">AI COMMAND CENTER</p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-white">AI Avatars</h1>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-navy-600/50 bg-navy-950/60 px-3 py-2">
                <p className="text-[10px] text-gray-500">Agents</p>
                <p className="font-serif text-lg text-white">{AI_AVATAR_AGENTS.length}</p>
              </div>
              <div className="rounded-lg border border-navy-600/50 bg-navy-950/60 px-3 py-2">
                <p className="text-[10px] text-gray-500">Writer Tools</p>
                <p className="font-serif text-lg text-cyan-300">{AI_WRITER_TOOLS.length}</p>
              </div>
              <div className="rounded-lg border border-navy-600/50 bg-navy-950/60 px-3 py-2">
                <p className="text-[10px] text-gray-500">Producer Tools</p>
                <p className="font-serif text-lg text-gold">{AI_PRODUCER_TOOLS.length}</p>
              </div>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-gray-300">
            Writer and Producer modules are now under one avatar command page. Select any agent card to open its page.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['All', 'Writer', 'Producer', 'Hybrid'].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoneFilter(z)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  zoneFilter === z
                    ? 'border-violet-400/70 bg-violet-500/20 text-violet-100'
                    : 'border-navy-600/70 bg-navy-950/60 text-gray-300'
                }`}
              >
                {z}
              </button>
            ))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search avatar..."
              className="ml-auto min-w-[180px] rounded-lg border border-navy-600/70 bg-navy-950/65 px-3 py-1.5 text-xs text-white placeholder:text-gray-500"
            />
          </div>
        </header>

        {selectedAgent && (
          <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-900/15 via-navy-900/60 to-violet-900/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cyan-300">Selected Avatar</p>
                <h2 className="font-serif text-xl font-bold text-white">{selectedAgent.name}</h2>
                <p className="mt-1 text-sm text-gray-300">{selectedAgent.specialty}</p>
              </div>
              <button
                type="button"
                onClick={() => openAgent(selectedAgent)}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-cyan-200"
              >
                Open Selected
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedAgent.capabilities.slice(0, 4).map((cap) => (
                <span key={cap} className="rounded-md border border-navy-600/70 bg-navy-950/60 px-2 py-1 text-[11px] text-gray-200">
                  {cap}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent, i) => (
            <motion.article
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-navy-600/40 bg-navy-900/50 p-4"
              onMouseEnter={() => setSelectedAgentId(agent.id)}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">{agent.status}</p>
                  <h3 className="mt-1 font-serif text-lg font-bold text-white">{agent.name}</h3>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${zoneClasses(agent.zone)}`}>
                  {agent.zone}
                </span>
              </div>
              <p className="text-sm text-gray-300">{agent.specialty}</p>
              <p className="mt-1 text-xs text-gray-500">{agent.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {agent.capabilities.slice(0, 2).map((cap) => (
                  <span key={cap} className="rounded border border-navy-600/70 bg-navy-950/70 px-2 py-0.5 text-[10px] text-gray-300">
                    {cap}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openAgent(agent)}
                className="mt-4 w-full rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
              >
                Open Agent Page
              </button>
            </motion.article>
          ))}
        </section>

        <section className="rounded-2xl border border-navy-600/40 bg-navy-900/40 p-5">
          <h2 className="font-serif text-xl font-bold text-white">Quick Tool Actions</h2>
          <p className="mt-1 text-xs text-gray-400">Direct launch into top Writer and Producer tools.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {quickTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => navigate(tool.route)}
                className="rounded-xl border border-navy-600 bg-navy-950/50 px-3 py-2 text-left hover:border-gold/40"
              >
                <p className="text-[10px] uppercase tracking-widest text-gray-500">{tool.type}</p>
                <p className="text-sm font-semibold text-white">{tool.label}</p>
              </button>
            ))}
          </div>
        </section>
      </motion.div>
    </AnimatePresence>
  );
}
