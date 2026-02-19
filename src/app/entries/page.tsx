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

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="print:hidden">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">All Entries</h1>
            <p className="text-muted-foreground">Detailed view of all system records.</p>
          </header>

          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <input
              className="px-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-72 text-sm"
              placeholder="Search by flight, code, number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex bg-muted rounded-lg p-1">
              {[
                { id: '', label: 'All' },
                { id: 'ramp_input', label: 'RAMP' },
                { id: 'logistic_input', label: 'LOG' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    typeFilter === t.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="px-4 py-3 font-bold">C209</th>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Month</th>
                    <th className="px-4 py-3 font-bold">Bar Number</th>
                    <th className="px-4 py-3 font-bold text-center">Pieces</th>
                    <th className="px-4 py-3 font-bold">Flight</th>
                    <th className="px-4 py-3 font-bold">C208</th>
                    <th className="px-4 py-3 font-bold">Flags</th>
                    <th className="px-4 py-3 font-bold">Signature</th>
                    <th className="px-4 py-3 font-bold">Comments</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
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
                      const monthPrefix = date.toLocaleString(\'en-US\', { month: \'short\' }).toUpperCase() + \'-\' + date.getFullYear().toString().slice(-2);
                      return (
                        <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-primary">{entry.c209_number || \'-\'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{date.toLocaleDateString(\'pl-PL\')}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-muted-foreground">{monthPrefix}</td>
                          <td className="px-4 py-3 font-mono">{entry.bar_number || entry.container_code || \'-\'}</td>
                          <td className="px-4 py-3 text-center font-medium">{entry.pieces ?? \'-\'}</td>
                          <td className="px-4 py-3 font-bold">{entry.flight_number || \'-\'}</td>
                          <td className="px-4 py-3 font-mono text-muted-foreground">{entry.c208_number || \'-\'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              {entry.type === \'ramp_input\' && <span className="bg-gray-500/20 text-gray-400 text-[9px] px-1.5 py-0.5 rounded border border-gray-500/30 font-bold uppercase">RAMP</span>}
                              {entry.type === \'logistic_input\' && <span className="bg-teal-500/20 text-teal-400 text-[9px] px-1.5 py-0.5 rounded border border-teal-500/30 font-bold uppercase">LOG</span>}
                              {entry.is_new_build && <span className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30 font-bold uppercase">NEW</span>}
                              {entry.is_rw_flight && <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/30 font-bold uppercase">RW</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 uppercase font-medium">{entry.signature || \'-\'}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{entry.notes || \'-\'}</td>
                          <td className="px-4 py-3 text-right flex justify-end gap-3">
                            <button onClick={() => setSelectedEntry(entry)} className="text-primary hover:underline text-xs font-bold">Form</button>
                            <button onClick={() => handleDelete(entry.id)} className="text-destructive hover:underline text-xs font-bold">Del</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 print:relative print:p-0 print:bg-white">
            <div className="bg-white text-black w-full max-w-[800px] p-8 shadow-2xl rounded-none border-[1px] border-black overflow-y-auto max-h-[95vh] print:shadow-none print:border-none print:max-h-none print:p-0">
              <div className="flex justify-between items-start border-b-[2px] border-black pb-4 mb-6 print:hidden">
                <button onClick={() => setSelectedEntry(null)} className="text-sm font-bold border border-black px-4 py-2 hover:bg-gray-100 uppercase">Close</button>
                <button onClick={() => window.print()} className="bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:opacity-90">Print Control Sheet</button>
              </div>

              <div className="control-sheet">
                <div className="flex border-[2px] border-black">
                  <div className="flex-1 p-4 bg-[#0073b6] flex items-center justify-center border-r-[2px] border-black">
                    <h1 className="text-5xl font-black italic text-white tracking-tighter">dnata</h1>
                  </div>
                  <div className="flex-[2] p-4 flex flex-col justify-center border-r-[2px] border-black">
                    <h2 className="text-xl font-bold uppercase">IN BOND</h2>
                    <h2 className="text-xl font-bold uppercase">CONTROL SHEET</h2>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="border-b-[2px] border-black p-2 text-xs font-bold bg-gray-100">C209 Number</div>
                    <div className="flex-1 p-3 text-xl font-black text-center italic">{selectedEntry.c209_number}</div>
                  </div>
                </div>

                <div className="bg-gray-200 p-2 text-sm font-bold border-x-[2px] border-b-[2px] border-black uppercase italic">SECTION 1: INBOUND BARS</div>
                
                <div className="grid grid-cols-3 border-x-[2px] border-b-[2px] border-black text-xs">
                  <div className="p-2 border-r-[2px] border-black">
                    <span className="font-bold uppercase block mb-1">Bar Number:</span>
                    <span className="text-lg font-black">{selectedEntry.bar_number || selectedEntry.container_code}</span>
                  </div>
                  <div className="p-2 border-r-[2px] border-black">
                    <span className="font-bold uppercase block mb-1">Number of Pieces:</span>
                    <span className="text-lg font-black">{selectedEntry.pieces}</span>
                  </div>
                  <div className="p-2">
                    <span className="font-bold uppercase block mb-1">Date Received:</span>
                    <span className="text-lg font-black">{new Date(selectedEntry.created_at).toLocaleDateString(\'pl-PL\')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-x-[2px] border-b-[2px] border-black text-[10px] font-bold uppercase">
                  <div className="p-2 border-r-[2px] border-black flex justify-between">
                    <span>Lock & Seal Check:</span>
                    <span className="text-gray-400">YES / NO</span>
                  </div>
                  <div className="p-2 border-r-[2px] border-black flex justify-between">
                    <span>C209 Present:</span>
                    <span className="text-gray-400">YES / NO</span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span>Recorded on I/B Despatch:</span>
                    <span className="text-gray-400">YES / NO</span>
                  </div>
                </div>

                <div className="border-x-[2px] border-b-[2px] border-black p-2 min-h-[60px]">
                  <span className="text-[10px] font-bold uppercase block mb-1">Comments:</span>
                  <span className="text-sm italic">{selectedEntry.notes || \'-\'}</span>
                </div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black text-[10px]">
                  <div className="p-2 border-r-[2px] border-black">
                    <span className="font-bold uppercase block">Print Name:</span>
                    <span className="text-base font-bold uppercase">{selectedEntry.signature}</span>
                  </div>
                  <div className="p-2">
                    <span className="font-bold uppercase block">Sign Name:</span>
                  </div>
                </div>

                <div className="bg-gray-200 p-2 text-sm font-bold border-x-[2px] border-b-[2px] border-black uppercase italic flex justify-between">
                  <span>SECTION 2: BAR STORAGE</span>
                  <span className="text-[10px] font-normal italic">To be used for bars that are being stored and/or checked</span>
                </div>

                <div className="border-x-[2px] border-b-[2px] border-black p-2 min-h-[40px]">
                  <span className="text-[10px] font-bold uppercase block">Comments:</span>
                </div>

                <div className="grid grid-cols-2">
                  <div className="border-l-[2px] border-r-[1px] border-b-[2px] border-black">
                    <div className="bg-gray-200 p-2 text-xs font-bold border-b-[2px] border-black uppercase italic">SECTION 3: BAR PACKING - CORE BAR</div>
                    <div className="p-2 space-y-1 text-[9px] font-bold uppercase">
                      <div className="flex justify-between"><span>Locks & Seals Checked Prior to Opening:</span><span className="text-gray-400">YES / NO</span></div>
                      <div className="flex justify-between"><span>Locks & Seals Intact:</span><span className="text-gray-400 font-black text-sm">YES / NO *</span></div>
                      <div className="flex justify-between"><span>Seal numbers match paperwork?</span><span className="text-gray-400 text-sm">YES / NO *</span></div>
                    </div>
                  </div>
                  <div className="border-r-[2px] border-l-[1px] border-b-[2px] border-black">
                    <div className="bg-gray-200 p-2 text-xs font-bold border-b-[2px] border-black uppercase italic">BAR PACKING - GIFT CART</div>
                    <div className="p-2 space-y-1 text-[9px] font-bold uppercase">
                      <div className="flex justify-between"><span>Locks & Seals Checked Prior to Opening:</span><span className="text-gray-400">YES / NO</span></div>
                      <div className="flex justify-between"><span>Locks & Seals Intact:</span><span className="text-gray-400 font-black text-sm">YES / NO *</span></div>
                      <div className="flex justify-between"><span>Seal numbers match paperwork?</span><span className="text-gray-400 text-sm">YES / NO *</span></div>
                    </div>
                  </div>
                </div>

                <div className="border-x-[2px] border-b-[2px] border-black p-1 text-[9px] font-bold uppercase italic">* If NO, complete details below & inform Manager/Shift Leader</div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black text-[10px]">
                  <div className="p-2 border-r-[2px] border-black space-y-2">
                    <div><span className="font-bold uppercase block">Print Name:</span></div>
                    <div><span className="font-bold uppercase block">Sign Name:</span></div>
                  </div>
                  <div className="p-2 space-y-2">
                    <div><span className="font-bold uppercase block">Print Name:</span></div>
                    <div><span className="font-bold uppercase block">Sign Name:</span></div>
                  </div>
                </div>

                <div className="border-x-[2px] border-b-[2px] border-black p-2 min-h-[40px]">
                  <span className="text-[10px] font-bold uppercase block">Comments:</span>
                </div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black text-[10px] font-bold uppercase">
                  <div className="p-2 border-r-[2px] border-black flex justify-between"><span>MANAGER or SHIFT LEADER Informed:</span><span className="text-gray-400">YES / NO</span></div>
                  <div className="p-2 flex justify-between items-center"><span>Name of MANAGER/SHIFT LEADER informed:</span><div className="flex-1 border-b border-black ml-2 h-4"></div></div>
                </div>

                <div className="grid grid-cols-4 border-x-[2px] border-b-[2px] border-black">
                  <div className="col-span-1 bg-gray-200 p-2 text-[10px] font-bold uppercase italic border-r-[2px] border-black flex items-center">SECTION 4: RE-SEALED or RE-ALLOCATED BAR</div>
                  <div className="col-span-3 p-1 text-[8px] font-bold italic text-center">To be completed for Incomplete Bar left by Previous Shift or Bar Re-opened for Bar Check or when bar Re-allocated</div>
                </div>

                <div className="grid grid-cols-3 border-x-[2px] border-b-[2px] border-black text-[10px] font-bold uppercase">
                  <div className="p-2 border-r-[2px] border-black">SEAL NUMBERS</div>
                  <div className="p-2 border-r-[2px] border-black">FROM</div>
                  <div className="p-2">TO</div>
                </div>
                <div className="border-x-[2px] border-b-[2px] border-black h-8"></div>

                <div className="grid grid-cols-2">
                  <div className="border-l-[2px] border-r-[1px] border-b-[2px] border-black">
                    <div className="bg-gray-200 p-2 text-xs font-bold border-b-[2px] border-black uppercase italic">SECTION 5: BAR COMPLETION - CORE BAR</div>
                    <div className="p-2 space-y-2 text-[10px] font-bold uppercase">
                      <div className="flex justify-between"><span>Equipment Serviceable (Doors & Locks)</span><span className="text-gray-400">YES / NO</span></div>
                      <div className="flex justify-between"><span>Equipment Serviceable (Wheels & Brakes)</span><span className="text-gray-400">YES / NO</span></div>
                    </div>
                  </div>
                  <div className="border-r-[2px] border-l-[1px] border-b-[2px] border-black">
                    <div className="bg-gray-200 p-2 text-xs font-bold border-b-[2px] border-black uppercase italic">SECTION 5: BAR COMPLETION - GIFT CART</div>
                    <div className="p-2 space-y-2 text-[10px] font-bold uppercase">
                      <div className="flex justify-between"><span>Equipment Serviceable (Doors & Locks)</span><span className="text-gray-400">YES / NO</span></div>
                      <div className="flex justify-between"><span>Equipment Serviceable (Wheels & Brakes)</span><span className="text-gray-400">YES / NO</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black p-2 min-h-[40px]">
                  <div className="border-r-[2px] border-black px-2"><span className="text-[10px] font-bold uppercase block">Comments:</span></div>
                  <div className="px-2"><span className="text-[10px] font-bold uppercase block">Comments:</span></div>
                </div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black text-[10px] font-bold uppercase">
                  <div className="p-2 border-r-[2px] border-black space-y-2">
                    <div><span>Print Name:</span></div>
                    <div><span>Sign Name:</span></div>
                  </div>
                  <div className="p-2 space-y-2">
                    <div><span>Print Name:</span></div>
                    <div><span>Sign Name:</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black">
                  <div className="bg-gray-200 p-2 text-xs font-bold border-r-[2px] border-black uppercase italic">SECTION 6: RECORD BAR ON DISPATCH SHEET</div>
                  <div className="grid grid-cols-2">
                    <div className="border-r-[2px] border-black p-1 text-[10px]">Date:</div>
                    <div className="p-1 text-[10px]">Time:</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black text-[10px] font-bold uppercase">
                  <div className="border-r-[2px] border-black p-4"></div>
                  <div className="flex justify-between items-center p-2">
                    <span>Bar Details Entered on Despatch Sheet</span>
                    <span className="text-gray-400">YES / NO</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-x-[2px] border-b-[2px] border-black text-[10px] font-bold uppercase pb-1">
                  <div className="p-2 border-r-[2px] border-black"><span>Print Name:</span></div>
                  <div className="p-2"><span>Sign Name:</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
