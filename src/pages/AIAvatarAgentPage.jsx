import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getAvatarAgentById } from '../data/aiAvatarAgents';

function zoneClasses(zone) {
  if (zone === 'Writer') return 'border-cyan-500/40 bg-cyan-900/20 text-cyan-300';
  if (zone === 'Producer') return 'border-gold/40 bg-gold/10 text-gold';
  return 'border-violet-500/40 bg-violet-900/20 text-violet-300';
}

export default function AIAvatarAgentPage() {
  const { agentId } = useParams();
  const agent = useMemo(() => getAvatarAgentById(agentId), [agentId]);
  const [activeCap, setActiveCap] = useState(0);
  const [intensity, setIntensity] = useState(68);

  if (!agent) return <Navigate to="/ai-avatars" replace />;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-navy-950 via-violet-950/50 to-cyan-950/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-300">AI AVATAR NODE</p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-white">{agent.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-300">{agent.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${zoneClasses(agent.zone)}`}>
              {agent.zone}
            </span>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-900/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              {agent.status}
            </span>
            <span className="rounded-full border border-cyan-500/40 bg-cyan-900/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300">
              Signal: {intensity}%
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500">
            <span>Agent Intensity</span>
            <span>{intensity}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-navy-600/40 bg-navy-900/50 p-5">
          <h2 className="font-serif text-xl font-bold text-white">Primary Specialty</h2>
          <p className="mt-2 text-sm text-gray-300">{agent.specialty}</p>
          <p className="mt-4 text-xs uppercase tracking-widest text-gray-500">Capabilities</p>
          <div className="mt-2 grid gap-2">
            {agent.capabilities.map((cap, idx) => (
              <button
                key={cap}
                type="button"
                onClick={() => setActiveCap(idx)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  activeCap === idx
                    ? 'border-cyan-500/60 bg-cyan-900/20 text-cyan-100'
                    : 'border-navy-700/60 bg-navy-950/50 text-gray-200'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-navy-600/40 bg-navy-900/50 p-5">
          <h2 className="font-serif text-xl font-bold text-white">Interactive Detail</h2>
          <p className="mt-2 text-sm text-gray-300">
            Focus capability: <span className="text-cyan-300">{agent.capabilities[activeCap]}</span>
          </p>
          <div className="mt-3 rounded-xl border border-navy-700/70 bg-navy-950/60 p-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Response Profile</p>
            <div className="mt-2 space-y-2">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                  <span>Precision</span>
                  <span>{Math.min(99, intensity + 10)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-800">
                  <div className="h-1.5 rounded-full bg-cyan-400" style={{ width: `${Math.min(99, intensity + 10)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                  <span>Speed</span>
                  <span>{Math.max(40, intensity - 8)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-800">
                  <div className="h-1.5 rounded-full bg-violet-400" style={{ width: `${Math.max(40, intensity - 8)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                  <span>Context Depth</span>
                  <span>{Math.min(100, intensity + 4)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-800">
                  <div className="h-1.5 rounded-full bg-gold" style={{ width: `${Math.min(100, intensity + 4)}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link
              to={agent.type === 'core' ? agent.route : '/ai-avatars'}
              className="block w-full rounded-lg border border-violet-500/35 bg-violet-500/10 px-3 py-2 text-center text-sm font-semibold text-violet-200 hover:bg-violet-500/20"
            >
              {agent.type === 'core' ? 'Open Main Module' : 'Back to AI Avatars'}
            </Link>
            <Link
              to="/ai-avatars"
              className="block w-full rounded-lg border border-navy-500/35 bg-navy-900/60 px-3 py-2 text-center text-sm font-semibold text-gray-300 hover:bg-navy-800/70"
            >
              View All Agents
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
