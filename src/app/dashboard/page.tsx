'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalEntries: 0, todayEntries: 0, expiringSoon: 0, totalFlights: 0 });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/entries?limit=20');
        if (res.status === 401) { router.push('/'); return; }
        const data = await res.json();
        setRecentEntries(data.entries || []);
        setStats(data.stats || {});
      } catch {
        // DB might not be connected yet
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  }

  function getExpiryStatus(createdAt: string, type: string) {
    if (type === 'ramp_input') return null;
    const created = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const hoursLeft = 48 - hoursElapsed;
    if (hoursLeft < 0) return { label: 'WYGASL', color: 'bg-red-100 text-red-800' };
    if (hoursLeft < 4) return { label: `${Math.floor(hoursLeft)}h`, color: 'bg-red-100 text-red-700' };
    if (hoursLeft < 12) return { label: `${Math.floor(hoursLeft)}h`, color: 'bg-orange-100 text-orange-700' };
    return { label: `${Math.floor(hoursLeft)}h`, color: 'bg-green-100 text-green-700' };
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm">SkyRoute OK</h1>
              <p className="text-xs text-muted-foreground">C209 System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> Ramp Input (C209)
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> Logistic Input (LOG)
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent">
            Wyloguj
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">System C209 - Ramp & Logistic</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Wszystkie wpisy</p>
            <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalEntries ?? 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Dzisiaj</p>
            <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.todayEntries ?? 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Wygasaja wkrotce</p>
            <p className="text-2xl font-bold mt-1 text-orange-600">{loading ? '...' : stats.expiringSoon ?? 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Loty dzisiaj</p>
            <p className="text-2xl font-bold mt-1">{loading ? '...' : stats.totalFlights ?? 0}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Ostatnie wpisy</h3>
            <div className="flex gap-2">
              <Link href="/ramp" className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">+ Ramp (C209)</Link>
              <Link href="/logistic" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg">+ Logistic (LOG)</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-muted-foreground font-medium">C209</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">C208</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Bar Number</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Lot</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Trasa</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Flagi</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Podpis</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Waznosc</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Ladowanie...</td></tr>
                ) : recentEntries.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Brak wpisow. Dodaj pierwszy wpis!</td></tr>
                ) : recentEntries.map((entry: any) => {
                  const expiry = getExpiryStatus(entry.created_at, entry.type);
                  return (
                    <tr key={entry.id} className="border-b border-border hover:bg-accent/50">
                      <td className="p-3 font-mono font-bold text-primary">{entry.c209_number || '-'}</td>
                      <td className="p-3 font-mono">{entry.c208_number || '-'}</td>
                      <td className="p-3 font-mono text-xs">{entry.bar_number || entry.container_code || '-'}</td>
                      <td className="p-3">{entry.flight_number || '-'}</td>
                      <td className="p-3 text-xs">{entry.origin && entry.destination ? `${entry.origin}→${entry.destination}` : '-'}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {entry.is_new_build && <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">NEW</span>}
                          {entry.is_rw && <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">RW</span>}
                          {entry.type === 'ramp_input' && <span className="text-xs bg-gray-100 text-gray-700 px-1 rounded">RAMP</span>}
                        </div>
                      </td>
                      <td className="p-3 text-xs">{entry.signature || '-'}</td>
                      <td className="p-3">
                        {expiry ? <span className={`text-xs px-2 py-0.5 rounded font-medium ${expiry.color}`}>{expiry.label}</span> : <span className="text-xs text-muted-foreground">-</span>}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{entry.created_at ? new Date(entry.created_at).toLocaleString('pl-PL', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
