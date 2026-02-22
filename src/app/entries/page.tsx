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
    <div className=\"min-h-screen bg-background flex\">
      <aside className=\"w-64 bg-card border-r border-border flex flex-col print:hidden\">
        <div className=\"p-6 border-b border-border\">
          <Link href=\"/dashboard\" className=\"flex items-center gap-3\">
            <div className=\"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold\">SR</div>
            <div>
              <h1 className=\"font-bold text-foreground text-sm\">SkyRoute.uk</h1>
              <p className=\"text-[10px] text-muted-foreground uppercase tracking-wider\">C209 System</p>
            </div>
          </Link>
        </div>
        <nav className=\"flex-1 p-4 space-y-1\">
          <Link href=\"/dashboard\" className=\"flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground\">
            <span>📊</span> Dashboard
          </Link>
          <Link href=\"/ramp\" className=\"flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground\">
            <span>✈️</span> C209 Input ( Ramp Input )
          </Link>
          <Link href=\"/logistic\" className=\"flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground\">
            <span>📦</span> C208 Input ( Logistic Input )
          </Link>
          <Link href=\"/entries\" className=\"flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm\">
            <span>📋</span> All Entries
          </Link>
        </nav>
      </aside>

      <main className=\"flex-1 p-8 overflow-auto\">
        <div className=\"mb-8\">
          <h1 className=\"text-3xl font-bold tracking-tight\">All Entries</h1>
          <p className=\"text-muted-foreground\">Detailed view of all system records.</p>
        </div>

        <div className=\"bg-card border border-border rounded-2xl shadow-sm overflow-hidden\">
          <div className=\"p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-muted/30\">
            <input 
              className=\"px-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-full md:w-72 text-sm\"
              placeholder=\"Search by flight, code, number...\"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className=\"flex bg-muted p-1 rounded-lg\">
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

          <div className=\"overflow-x-auto\">
            <table className=\"w-full text-sm text-left\">
              <thead>
                <tr className=\"bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider\">
                  <th className=\"px-4 py-3 font-semibold\">C209</th>
                  <th className=\"px-4 py-3 font-semibold\">Date</th>
                  <th className=\"px-4 py-3 font-semibold\">Month</th>
                  <th className=\"px-4 py-3 font-semibold\">Bar Number</th>
                  <th className=\"px-4 py-3 font-semibold text-center\">Pieces</th>
                  <th className=\"px-4 py-3 font-semibold\">Flight</th>
                  <th className=\"px-4 py-3 font-semibold\">C208</th>
                  <th className=\"px-4 py-3 font-semibold\">Flags</th>
                  <th className=\"px-4 py-3 font-semibold\">Signature</th>
                  <th className=\"px-4 py-3 font-semibold text-right\">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className=\"px-4 py-12 text-center text-muted-foreground italic\">Loading...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={10} className=\"px-4 py-12 text-center text-muted-foreground italic\">No entries found.</td></tr>
                ) : (
                  entries.map(entry => {
                    const date = new Date(entry.created_at);
                    const monthPrefix = date.toLocaleString('en-US', { month: 'short' }).toUpperCase() + '-' + date.getFullYear().toString().slice(-2);
                    return (
                      <tr key={entry.id} className=\"border-b border-border/50 hover:bg-muted/20 transition-colors\">
                        <td className=\"px-4 py-3 font-mono font-bold text-primary\">{entry.c209_number || '-'}</td>
                        <td className=\"px-4 py-3 text-muted-foreground\">{date.toLocaleDateString('pl-PL')}</td>
                        <td className=\"px-4 py-3 text-[10px] font-bold text-muted-foreground\">{monthPrefix}</td>
                        <td className=\"px-4 py-3 font-mono\">{entry.bar_number || entry.container_code || '-'}</td>
                        <td className=\"px-4 py-3 font-medium text-center\">{entry.pieces ?? '-'}</td>
                        <td className=\"px-4 py-3 font-bold\">{entry.flight_number || '-'}</td>
                        <td className=\"px-4 py-3 font-mono text-muted-foreground\">{entry.c208_number || '-'}</td>
                        <td className=\"px-4 py-3\">
                          <div className=\"flex gap-1\">
                            {entry.type === 'ramp_input' && <span className=\"bg-gray-500/20 text-gray-400 text-[9px] px-1.5 py-0.5 rounded border border-gray-500/30 font-bold uppercase\">RAMP</span>}
                            {entry.type === 'logistic_input' && <span className=\"bg-teal-500/20 text-teal-400 text-[9px] px-1.5 py-0.5 rounded border border-teal-500/30 font-bold uppercase\">LOG</span>}
                            {entry.is_new_build && <span className=\"bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30 font-bold uppercase\">NEW</span>}
                            {entry.is_rw_flight && <span className=\"bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded border border-purple-500/30 font-bold uppercase\">RW</span>}
                          </div>
                        </td>
                        <td className=\"px-4 py-3 font-medium uppercase\">{entry.signature || '-'}</td>
                        <td className=\"px-4 py-3 text-right\">
                          <div className=\"flex justify-end gap-3\">
                            <button onClick={() => setSelectedEntry(entry)} className=\"text-primary hover:underline text-xs font-bold\">Form</button>
                            <button onClick={() => handleDelete(entry.id)} className=\"text-destructive hover:underline text-xs font-bold\">Del</button>
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
        <div className=\"fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block\">
          <div className=\"bg-white text-black w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl print:max-h-none print:shadow-none print:rounded-none\">
            <div className=\"p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 print:hidden\">
              <button onClick={() => setSelectedEntry(null)} className=\"text-sm font-bold border border-black px-4 py-2 hover:bg-gray-100 uppercase\">Close</button>
              <button onClick={() => window.print()} className=\"bg-black text-white px-6 py-2 text-sm font-bold uppercase hover:opacity-90\">Print Control Sheet</button>
            </div>
            
            <div className=\"p-8 control-sheet text-[12px] leading-tight\">
              {/* Header Section */}
              <div className=\"flex justify-between items-end mb-4 border-b-2 border-black pb-2\">
                <div className=\"flex items-center gap-4\">
                  <h1 className=\"text-3xl font-black tracking-tighter italic\">dnata</h1>
                  <div className=\"border-l border-black pl-4\">
                    <p className=\"font-bold text-lg uppercase leading-none\">In Bond Control Sheet</p>
                    <p className=\"text-[9px] font-bold\">Template v1.2 250124</p>
                  </div>
                </div>
                <div className=\"text-right\">
                  <p className=\"text-[10px] font-bold uppercase\">C209 Number</p>
                  <p className=\"text-2xl font-black border-2 border-black px-4 py-1 inline-block min-w-[150px]\">{selectedEntry.c209_number}</p>
                </div>
              </div>

              {/* Top Info Bar */}
              <div className=\"grid grid-cols-3 gap-2 mb-4\">
                <div className=\"border border-black p-2\">
                  <p className=\"text-[10px] font-bold uppercase mb-1\">Bar Number</p>
                  <p className=\"text-lg font-bold\">{selectedEntry.bar_number || selectedEntry.container_code}</p>
                </div>
                <div className=\"border border-black p-2 flex flex-col justify-center\">
                  <p className=\"text-[10px] font-bold uppercase mb-1\">Lock / Seal Check</p>
                  <div className=\"flex gap-4 font-bold text-lg\">
                    <span>YES</span>
                    <span className=\"text-gray-300\">/</span>
                    <span>NO</span>
                  </div>
                </div>
                <div className=\"border border-black p-2\">
                  <p className=\"text-[10px] font-bold uppercase mb-1\">Seal Numbers</p>
                  <div className=\"grid grid-cols-2 gap-2\">
                    <div><span className=\"text-[8px] uppercase\">From:</span><div className=\"border-b border-black h-5\"></div></div>
                    <div><span className=\"text-[8px] uppercase\">To:</span><div className=\"border-b border-black h-5\"></div></div>
                  </div>
                </div>
              </div>

              {/* Section 1 & 2 */}
              <div className=\"grid grid-cols-2 gap-4 mb-4\">
                <div className=\"border border-black flex flex-col min-h-[100px]\">
                  <div className=\"bg-gray-100 border-b border-black p-1 font-bold uppercase text-[10px]\">Section 1: Inbound Bars</div>
                  <div className=\"p-2 text-[11px] flex-1 italic text-gray-500\">Comments: {selectedEntry.notes || 'No comments'}</div>
                </div>
                <div className=\"border border-black flex flex-col min-h-[100px]\">
                  <div className=\"bg-gray-100 border-b border-black p-1 font-bold uppercase text-[10px]\">Section 2: Bar Storage</div>
                  <div className=\"p-2 text-[10px] text-gray-400\">To be used for bars being stored and/or checked...</div>
                </div>
              </div>

              {/* Section 3: Bar Packing */}
              <div className=\"border border-black mb-4\">
                <div className=\"bg-gray-100 border-b border-black p-1 font-bold uppercase text-[10px]\">Section 3: Bar Packing - Core Bar</div>
                <div className=\"grid grid-cols-2 p-2 gap-4\">
                  <div className=\"space-y-3\">
                    <div className=\"flex justify-between items-center border-b border-black pb-1\">
                      <span className=\"font-bold uppercase text-[10px]\">Number of Pieces</span>
                      <span className=\"text-lg font-bold\">{selectedEntry.pieces}</span>
                    </div>
                    <div className=\"flex justify-between items-center border-b border-black pb-1\">
                      <span className=\"font-bold uppercase text-[10px]\">Date Received</span>
                      <span className=\"font-bold\">{new Date(selectedEntry.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className=\"grid grid-cols-2 gap-4 pt-2\">
                      <div><p className=\"text-[8px] font-bold uppercase\">Print Name</p><p className=\"font-bold border-b border-black\">{selectedEntry.signature}</p></div>
                      <div><p className=\"text-[8px] font-bold uppercase\">Sign Name</p><div className=\"border-b border-black h-5\"></div></div>
                    </div>
                  </div>
                  <div className=\"border-l border-black pl-4 space-y-1\">
                    {[
                      \"Locks & Seals Checked Prior to Opening Bar\",
                      \"Lock & Seals Intact\",
                      \"Seal numbers match paperwork?\",
                      \"C209 Present\",
                      \"Bar Recorded on IB Despatch Sheet\",
                      \"Manager or Shift Leader Informed\"
                    ].map((item, i) => (
                      <div key={i} className=\"flex justify-between text-[9px] font-bold\">
                        <span>{item}</span>
                        <span className=\"ml-4\">YES / NO</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4 & 5 */}
              <div className=\"grid grid-cols-2 gap-4 mb-4\">
                <div className=\"border border-black flex flex-col\">
                  <div className=\"bg-gray-100 border-b border-black p-1 font-bold uppercase text-[10px]\">Section 4: Re-Sealed / Re-Allocated Bar</div>
                  <div className=\"p-2 min-h-[80px]\"></div>
                  <div className=\"p-2 border-t border-black grid grid-cols-2 gap-2\">
                    <div><p className=\"text-[8px] font-bold uppercase\">Print</p><div className=\"border-b border-black h-4\"></div></div>
                    <div><p className=\"text-[8px] font-bold uppercase\">Sign</p><div className=\"border-b border-black h-4\"></div></div>
                  </div>
                </div>
                <div className=\"border border-black flex flex-col\">
                  <div className=\"bg-gray-100 border-b border-black p-1 font-bold uppercase text-[10px]\">Section 5: Bar Completion</div>
                  <div className=\"p-2 space-y-1\">
                    <div className=\"flex justify-between text-[9px] font-bold\"><span>Equipment Serviceable (Doors/Locks)</span><span>YES / NO</span></div>
                    <div className=\"flex justify-between text-[9px] font-bold\"><span>Equipment Serviceable (Wheels/Brakes)</span><span>YES / NO</span></div>
                    <div className=\"flex justify-between text-[9px] font-bold\"><span>Seal numbers match paperwork?</span><span>YES / NO</span></div>
                  </div>
                  <div className=\"p-2 border-t border-black grid grid-cols-2 gap-2\">
                    <div><p className=\"text-[8px] font-bold uppercase\">Print</p><div className=\"border-b border-black h-4\"></div></div>
                    <div><p className=\"text-[8px] font-bold uppercase\">Sign</p><div className=\"border-b border-black h-4\"></div></div>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className=\"border border-black\">
                <div className=\"bg-gray-100 border-b border-black p-1 font-bold uppercase text-[10px]\">Section 6: Record Bar on Dispatch Sheet</div>
                <div className=\"p-2 flex justify-between items-center\">
                   <div className=\"flex items-center gap-4\">
                      <span className=\"text-[10px] font-bold uppercase\">Bar Details entered on Dispatch Sheet?</span>
                      <span className=\"font-bold\">YES / NO</span>
                   </div>
                   <div className=\"flex gap-4\">
                      <div><p className=\"text-[8px] font-bold uppercase\">Print Name</p><div className=\"border-b border-black w-32 h-4\"></div></div>
                      <div><p className=\"text-[8px] font-bold uppercase\">Sign Name</p><div className=\"border-b border-black w-32 h-4\"></div></div>
                   </div>
                </div>
              </div>

              <div className=\"text-[8px] font-bold text-center mt-6 pt-4 border-t border-black text-gray-400\">
                SYSTEM GENERATED DOCUMENT - SKYROUTE.UK C209 SYSTEM - {new Date().toLocaleString()}
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
