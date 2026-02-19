'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ search });
        if (typeFilter) params.set('type', typeFilter);
        const res = await fetch(`/api/entries?${params}`);
        if (res.status === 401) {
          router.push('/');
          return;
        }
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err) {
        console.error('Failed to load entries');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, typeFilter, router]);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  }

  function getFlags(entry: any) {
    const flags = [];
    if (entry.is_new_build) flags.push({ label: 'NEW', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' });
    if (entry.is_rw_flight) flags.push({ label: 'RW', color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' });
    if (entry.type === 'ramp_input') flags.push({ label: 'RAMP', color: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' });
    if (entry.type === 'logistic_input' && !entry.is_new_build && !entry.is_rw_flight) flags.push({ label: 'LOG', color: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' });
    return flags;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19 19 2-9-18-9 18 9-2zm0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm">SkyRoute OK</h1>
              <p className="text-xs text-muted-foreground">C209 System</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> Ramp Input (C209)
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> Logistic Input (LOG)
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>📋</span> All Entries
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">All Entries</h1>
          <p className="text-muted-foreground">View and manage all C209/C208 records.</p>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            className="px-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-72 text-sm"
            placeholder="Search by flight, code, number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {['', 'ramp_input', 'logistic_input'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:bg-accent text-muted-foreground'
                }`}
              >
                {t === '' ? 'All' : t === 'ramp_input' ? 'RAMP' : 'LOG'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">C209</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">C208</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Bar Number</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Flight</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Route</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Pieces</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Flags</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Signature</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">No entries found.</td></tr>
                ) : (
                  entries.map(entry => {
                    const flags = getFlags(entry);
                    return (
                      <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            entry.type === 'ramp_input'
                              ? 'bg-gray-500/20 text-gray-300'
                              : 'bg-teal-500/20 text-teal-300'
                          }`}>
                            {entry.type === 'ramp_input' ? 'RAMP' : 'LOG'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-primary font-semibold">{entry.c209_number || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-muted-foreground">{entry.c208_number || '-'}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{entry.bar_number || entry.container_code || '-'}</td>
                        <td className="px-4 py-3">{entry.flight_number || '-'}</td>
                        <td className="px-4 py-3">
                          {entry.origin && entry.destination
                            ? `${entry.origin}\u2192${entry.destination}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3">{entry.pieces ?? '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {flags.map(f => (
                              <span key={f.label} className={`px-2 py-0.5 rounded text-xs font-bold ${f.color}`}>
                                {f.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">{entry.signature || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {entry.created_at
                            ? new Date(entry.created_at).toLocaleString('pl-PL', {
                                day: '2-digit', month: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              })
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-destructive hover:underline text-xs font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
