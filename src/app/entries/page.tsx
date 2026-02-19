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
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            Ramp Input (C209)
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            Logistic Input (C208)
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium">
            All Entries
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Management Records</h1>
            <p className="text-muted-foreground mt-2">View and manage all system entries.</p>
          </div>
          <div className="flex gap-3">
            <input
              className="px-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-64"
              placeholder="Search by flight, code, number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Flight</th>
                  <th className="px-6 py-4 font-medium">Ref Number</th>
                  <th className="px-6 py-4 font-medium">Origin/Dest</th>
                  <th className="px-6 py-4 font-medium">Pieces/Weight</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No entries found.</td></tr>
                ) : (
                  entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${entry.type === 'c209' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{entry.flight_number}</td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {entry.type === 'c209' ? entry.c209_number : entry.c208_number}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.origin} → {entry.destination}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.pieces} pcs / {entry.weight} kg
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-destructive hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
