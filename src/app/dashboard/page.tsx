'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalEntries: number;
  todayEntries: number;
  expiringSoon: number;
  totalFlights: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalEntries: 0, todayEntries: 0, expiringSoon: 0, totalFlights: 0 });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/entries?limit=10');
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

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', active: true },
    { href: '/ramp', label: 'Ramp Input (C209)', icon: '✈️', active: false },
    { href: '/logistic', label: 'Logistic Input (C208)', icon: '📦', active: false },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
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
              <p className="text-xs text-muted-foreground">Ramp Management</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Overview of C209/C208 operations</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Entries', value: stats.totalEntries, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: "Today's Entries", value: stats.todayEntries, color: 'text-green-400', bg: 'bg-green-400/10' },
              { label: 'Expiring Soon', value: stats.expiringSoon, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'Total Flights', value: stats.totalFlights, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} mb-3`}>
                  <div className={`w-3 h-3 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link href="/ramp" className="bg-card border border-border hover:border-primary/50 rounded-xl p-6 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary/20 transition-colors">
                  ✈️
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Ramp Input (C209)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create and manage C209 ramp entries with container codes, flight handling, and 48hr expiry tracking</p>
                  <div className="mt-3 text-xs font-medium text-primary">Open → </div>
                </div>
              </div>
            </Link>
            <Link href="/logistic" className="bg-card border border-border hover:border-primary/50 rounded-xl p-6 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary/20 transition-colors">
                  📦
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Logistic Input (C208)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Generate C208 numbers, track shipments, and manage logistic entries</p>
                  <div className="mt-3 text-xs font-medium text-primary">Open → </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent entries */}
          <div className="bg-card border border-border rounded-xl">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Entries</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : recentEntries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="text-4xl mb-3">📋</div>
                <div className="font-medium">No entries yet</div>
                <div className="text-sm mt-1">Add your first entry from Ramp Input or Logistic Input</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      {['Type', 'Reference', 'Flight', 'Container', 'Created', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentEntries.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            entry.type === 'C209' ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'
                          }`}>{entry.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-foreground">{entry.reference}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{entry.flight_number || '—'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{entry.container_code || '—'}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(entry.created_at).toLocaleDateString('en-GB')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            entry.expired ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'
                          }`}>{entry.expired ? 'Expired' : 'Active'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
