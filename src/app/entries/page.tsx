'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/entries?search=${search}`);
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
  }, [search, router]);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  }

  function getTypeLabel(type: string) {
    if (type === 'ramp_input') return { label: 'RAMP', color: 'bg-gray-100 text-gray-700' };
    if (type === 'logistic_input') return { label: 'LOG', color: 'bg-teal-100 text-teal-700' };
    return { label: type, color: 'bg-blue-100 text-blue-700' };
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="font-bold">SkyRoute OK</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> Ramp Input (C209)
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> Logistic Input (LOG)
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
            <span>📋</span> All Entries
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">All Entries</h1>
            <p className="text-muted-foreground text-sm mt-1">View and manage all C209/C208 records.</p>
          </div>
          <div className="flex gap-3">
            <input
              className="px-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-64 text-sm"
              placeholder="Search by flight, code, number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">C209</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">C208</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Bar Number</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Flight</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Route</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Pieces</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Flags</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Signature</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">No entries found.</td></tr>
                ) : (
                  entries.map(entry => {
                    const typeInfo = getTypeLabel(entry.type);
                    return (
                      <tr key={entry.id} className="border-b border-border hover:bg-accent/50">
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-primary text-xs">{entry.c209_number || '-'}</td>
                        <td className="p-3 font-mono text-xs">{entry.c208_number || '-'}</td>
                        <td className="p-3 font-mono text-xs">{entry.bar_number || entry.container_code || '-'}</td>
                        <td className="p-3">{entry.flight_number || '-'}</td>
                        <td className="p-3 text-xs">{entry.origin && entry.destination ? `${entry.origin}\u2192${entry.destination}` : '-'}</td>
                        <td className="p-3 text-xs">{entry.pieces ?? '-'}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {entry.is_new_build && <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">NEW</span>}
                            {entry.is_rw_flight && <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">RW</span>}
                          </div>
                        </td>
                        <td className="p-3 text-xs">{entry.signature || '-'}</td>
                        <td className="p-3 text-xs text-muted-foreground">{entry.created_at ? new Date(entry.created_at).toLocaleString('pl-PL', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                        <td className="p-3 text-right">
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
