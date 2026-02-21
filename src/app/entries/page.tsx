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
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ search });
        if (typeFilter) params.set('type', typeFilter);
        const res = await fetch(`/api/entries?${params}`);
        if (res.status === 401) { router.push('/'); return; }
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
    } catch (err) { alert('Failed to delete'); }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col print:hidden">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">SR</div>
            <div>
              <h1 className="font-bold text-foreground text-sm">SkyRoute OK</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">C209 System</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> C209 Input ( Ramp Input )
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> C208 Input ( Logistic Input )
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>📋</span> All Entries
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">All Entries</h1>
          <p className="text-muted-foreground">Detailed view of all system records.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-muted/30">
            <input 
              className="px-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-full md:w-72 text-sm"
              placeholder="Search by flight, code, number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex bg-muted p-1 rounded-lg">
              {[
                { id: '', label: 'All' },
                { id: 'ramp_input', label: 'RAMP' },
                { id: 'logistic_input', label: 'LOG' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    typeFilter === t.id 
                      ? 'bg-card shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3 font-semibold">C209</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold">Bar Number</th>
                  <th className="px-4 py-3 font-semibold text-center">Pieces</th>
                  <th className="px-4 py-3 font-semibold">Flight</th>
                  <th className="px-4 py-3 font-semibold">C208</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Signature</th>
                  <th className="px-4 py-3 font-semibold">Comments</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground italic">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-12 text-center text-muted-foreground italic">No entries found.</td></tr>
                ) : (
                  entries.map(entry => {
                    const date = new Date(entry.created_at);
                    const monthPrefix = date.toLocaleString('en-US', { month: 'short' }).toUpperCase() + '-' + date.getFullYear().toString().slice(-2);
                    return (
                      <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{entry.c209_number || '-'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{date.toLocaleDateString('pl-PL')}</td>
                        <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground">{monthPrefix}</td>
                        <td className="px-4 py-3 font-mono">{entry.bar_number || entry.container_code || '-'}</td>
                        <td className="px-4 py-3 font-medium text-center">{entry.pieces ?? '-'}</td>
                        <td className="px-4 py-3 font-bold">{entry.flight_number || '-'}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">{entry.c208_number || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {entry.type === 'ramp_input' && <span className="bg-gray-500/20 text-gray-400 text-[9px] px-1.5 py-0.5 rounded border border-gray-500/30 font-bold uppercase">RAMP</span>}
                            {entry.type === 'logistic_input' && <span className="bg-teal-500/20 text-teal-400 text-[9px] px-1.5 py-0.5 rounded border border-teal-500/30 font-bold uppercase">LOG</span>}
                            {entry.is_new_build && <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30 font-bold uppercase">NEW</span>}
                            {entry.is_rw_flight && <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/30 font-bold uppercase">RW</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium uppercase">{entry.signature || '-'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate">{entry.notes || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => setSelectedEntry(entry)} className="text-primary hover:underline text-xs font-bold">Form</button>
                            <button onClick={() => handleDelete(entry.id)} className="text-destructive hover:underline text-xs font-bold">Del</button>
                          </div>
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

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
          <div className="bg-white text-black w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl print:max-h-none print:shadow-none print:rounded-none">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 print:hidden">
              <button onClick={() => setSelectedEntry(null)} className="text-sm font-bold border border-black px-4 py-2 hover:bg-gray-100 uppercase">Close</button>
              <button onClick={() => window.print()} className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:opacity-90">Print Control Sheet</button>
            </div>

            <div className="p-12 control-sheet">
              <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-6">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter">dnata</h1>
                  <p className="text-sm font-bold">IN BOND CONTROL SHEET</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">C209 Number</p>
                  <p className="text-3xl font-black">{selectedEntry.c209_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="border-2 border-black p-4">
                    <p className="text-[10px] font-bold uppercase mb-1">Bar Number</p>
                    <p className="text-xl font-bold">{selectedEntry.bar_number || selectedEntry.container_code}</p>
                  </div>
                  <div className="border-2 border-black p-4">
                    <p className="text-[10px] font-bold uppercase mb-1">Number of Pieces</p>
                    <p className="text-xl font-bold">{selectedEntry.pieces}</p>
                  </div>
                </div>
                <div className="border-2 border-black p-4">
                  <p className="text-[10px] font-bold uppercase mb-1">Date Received</p>
                  <p className="text-xl font-bold">{new Date(selectedEntry.created_at).toLocaleDateString('pl-PL')}</p>
                  <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
                    <div className="flex justify-between text-xs font-bold"><span>Lock & Seal Check:</span><span>YES / NO</span></div>
                    <div className="flex justify-between text-xs font-bold"><span>C209 Present:</span><span>YES / NO</span></div>
                    <div className="flex justify-between text-xs font-bold"><span>Recorded on I/B Despatch:</span><span>YES / NO</span></div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-black p-4 mb-8 min-h-[100px]">
                <p className="text-[10px] font-bold uppercase mb-2">Comments</p>
                <p className="text-sm">{selectedEntry.notes || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="border-2 border-black p-4">
                  <p className="text-[10px] font-bold uppercase mb-4">Print Name</p>
                  <p className="font-bold border-b border-black/20 pb-1">{selectedEntry.signature}</p>
                </div>
                <div className="border-2 border-black p-4">
                  <p className="text-[10px] font-bold uppercase mb-4">Sign Name</p>
                  <div className="border-b border-black/20 h-6"></div>
                </div>
              </div>

              <div className="text-[8px] font-bold text-center border-t border-black pt-4 text-gray-400">
                SYSTEM GENERATED DOCUMENT - SKYROUTE OK C209 SYSTEM
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          .control-sheet, .control-sheet * { visibility: visible; }
          .control-sheet { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 0; 
          }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}
