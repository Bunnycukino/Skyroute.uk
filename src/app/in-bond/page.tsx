'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function InBondFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    c209_number: '',
    bar_number: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    flight_number: '',
    seal_numbers: '',
    lock_seal_check: 'YES',
    inbound_bars_comments: '',
    manager_informed: 'YES',
    manager_name: '',
    bar_recorded_on_dispatch: 'YES',
    packing_pieces: '',
    packing_date: new Date().toISOString().split('T')[0],
    packing_manager_informed: 'YES',
    packing_signature: '',
    equipment_serviceable_doors: 'YES',
    equipment_serviceable_wheels: 'YES'
  });

  // Auto-fill from URL params
  useEffect(() => {
    const c209 = searchParams.get('c209') || '';
    const bar = searchParams.get('bar') || '';
    const flight = searchParams.get('flight') || '';
    const pieces = searchParams.get('pieces') || '';
    const sig = searchParams.get('sig') || '';
    const autoPrint = searchParams.get('autoPrint') === 'true';

    if (c209 || bar || flight || pieces || sig) {
      setFormData(prev => ({
        ...prev,
        c209_number: c209,
        bar_number: bar,
        flight_number: flight,
        packing_pieces: pieces,
        packing_signature: sig,
        manager_name: sig // Auto-fill manager name with signature initials if available
      }));
    }

    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/entries?limit=1').then(res => {
      if (res.status === 401) router.push('/');
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/in-bond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Błąd zapisu');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const RadioGroup = ({ label, name }: { label: string, name: keyof typeof formData }) => (
    <div className=\"flex items-center justify-between py-2 border-b border-gray-100 last:border-0\">
      <span className=\"text-xs font-bold uppercase text-gray-600\">{label}</span>
      <div className=\"flex gap-6\">
        {['YES', 'NO'].map(opt => (
          <label key={opt} className=\"flex items-center gap-2 cursor-pointer group\">
            <input
              type=\"radio\"
              name={name}
              checked={formData[name] === opt}
              onChange={() => setFormData(prev => ({ ...prev, [name]: opt }))}
              className=\"w-4 h-4 border-2 border-gray-300 text-black focus:ring-0 cursor-pointer\"
            />
            <span className=\"text-xs font-black\">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className=\"min-h-screen bg-white print:bg-white\">
      {/* Sidebar - hidden on print */}
      <aside className=\"fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 print:hidden\">
        <div className=\"p-6 border-b border-slate-800\">
          <Link href=\"/dashboard\" className=\"flex items-center gap-3\">
            <div className=\"w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 font-black text-xl\">SR</div>
            <div>
              <h1 className=\"font-black text-white text-lg tracking-tighter\">SkyRoute.uk</h1>
              <p className=\"text-[10px] text-slate-500 uppercase font-bold tracking-widest\">In-Bond Control</p>
            </div>
          </Link>
        </div>
        <nav className=\"flex-1 p-4 space-y-2\">
          <Link href=\"/ramp\" className=\"flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold text-slate-400 hover:text-white group\">
            <span className=\"text-lg group-hover:scale-110 transition-transform\">✈️</span> Ramp Input
          </Link>
          <Link href=\"/in-bond\" className=\"flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500 text-white text-sm font-black shadow-lg shadow-green-500/20\">
            <span className=\"text-lg\">📄</span> In Bond Sheet
          </Link>
          <Link href=\"/entries\" className=\"flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-sm font-bold text-slate-400 hover:text-white group\">
            <span className=\"text-lg group-hover:scale-110 transition-transform\">📋</span> View All
          </Link>
        </nav>
        <div className=\"p-6 border-t border-slate-800\">
          <button 
            onClick={() => window.print()}
            className=\"w-full bg-slate-800 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all\"
          >
            🖨️ Print Sheet
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className=\"pl-64 print:pl-0 min-h-screen flex flex-col items-center py-12 px-4 print:py-0 print:px-0\">
        <form onSubmit={handleSubmit} className=\"w-full max-w-[210mm] bg-white print:shadow-none p-8 md:p-12 space-y-8\">
          
          {/* Official Header */}
          <div className=\"flex justify-between items-start border-b-4 border-black pb-6 mb-8\">
            <div className=\"space-y-1\">
              <h1 className=\"text-4xl font-black uppercase tracking-tighter leading-none\">In Bond Control Sheet</h1>
              <p className=\"text-xs font-bold text-gray-500 italic uppercase tracking-widest\">Security Restricted Document - Emirates Group Logistics</p>
            </div>
            <div className=\"text-right\">
              <div className=\"text-2xl font-black\">SR-{formData.c209_number || '---'}</div>
              <div className=\"text-[10px] font-bold uppercase text-gray-400 tracking-widest\">Official Ref No.</div>
            </div>
          </div>

          {success && <div className=\"bg-green-100 border-2 border-green-500 text-green-700 p-4 rounded-xl font-black text-center print:hidden\">FORM SAVED SUCCESSFULLY / FORMULARZ ZAPISANY</div>}
          {error && <div className=\"bg-red-100 border-2 border-red-500 text-red-700 p-4 rounded-xl font-black text-center print:hidden\">{error}</div>}

          {/* Core Info Table */}
          <div className=\"grid grid-cols-3 border-2 border-black divide-x-2 divide-black\">
            <div className=\"p-4 space-y-1\">
              <label className=\"text-[9px] font-black uppercase text-gray-500\">C209 Number</label>
              <input 
                className=\"w-full text-xl font-black uppercase outline-none\"
                value={formData.c209_number}
                onChange={e => setFormData(p => ({...p, c209_number: e.target.value}))}
              />
            </div>
            <div className=\"p-4 space-y-1\">
              <label className=\"text-[9px] font-black uppercase text-gray-500\">Bar Number</label>
              <input 
                className=\"w-full text-xl font-black uppercase outline-none\"
                value={formData.bar_number}
                onChange={e => setFormData(p => ({...p, bar_number: e.target.value}))}
              />
            </div>
            <div className=\"p-4 space-y-1\">
              <label className=\"text-[9px] font-black uppercase text-gray-500\">Flight No.</label>
              <input 
                className=\"w-full text-xl font-black uppercase outline-none\"
                value={formData.flight_number}
                onChange={e => setFormData(p => ({...p, flight_number: e.target.value}))}
              />
            </div>
          </div>

          <div className=\"grid grid-cols-2 border-x-2 border-b-2 border-black divide-x-2 divide-black\">
            <div className=\"p-4 space-y-1\">
              <label className=\"text-[9px] font-black uppercase text-gray-500\">Date</label>
              <input 
                type=\"date\"
                className=\"w-full text-lg font-bold outline-none\"
                value={formData.date}
                onChange={e => setFormData(p => ({...p, date: e.target.value, packing_date: e.target.value}))}
              />
            </div>
            <div className=\"p-4 space-y-1\">
              <label className=\"text-[9px] font-black uppercase text-gray-500\">Time</label>
              <input 
                type=\"time\"
                className=\"w-full text-lg font-bold outline-none\"
                value={formData.time}
                onChange={e => setFormData(p => ({...p, time: e.target.value}))}
              />
            </div>
          </div>

          {/* Section 1: Inbound */}
          <section className=\"space-y-4\">
            <div className=\"bg-black text-white px-4 py-1 flex justify-between items-center\">
              <h2 className=\"text-sm font-black uppercase tracking-widest\">Section 1: Inbound Bars Verification</h2>
              <span className=\"text-[10px] font-bold\">C209-CHECK-A</span>
            </div>
            <div className=\"border-2 border-black p-6 space-y-4\">
              <RadioGroup label=\"Lock & Seal Integrity Check\" name=\"lock_seal_check\" />
              <div className=\"space-y-2\">
                <label className=\"text-[10px] font-black uppercase text-gray-500\">Seal Numbers (Range: From - To)</label>
                <input 
                  placeholder=\"e.g. 098123 - 098130\"
                  className=\"w-full border-b-2 border-gray-200 py-2 text-sm font-bold outline-none focus:border-black transition-colors\"
                  value={formData.seal_numbers}
                  onChange={e => setFormData(p => ({...p, seal_numbers: e.target.value}))}
                />
              </div>
              <div className=\"space-y-2\">
                <label className=\"text-[10px] font-black uppercase text-gray-500\">Observations / Comments</label>
                <textarea 
                  className=\"w-full h-24 border-2 border-gray-100 p-4 text-sm font-medium outline-none focus:border-black resize-none\"
                  value={formData.inbound_bars_comments}
                  onChange={e => setFormData(p => ({...p, inbound_bars_comments: e.target.value}))}
                />
              </div>
            </div>
          </section>

          {/* Section 2: Packing & Management */}
          <div className=\"grid grid-cols-2 gap-8\">
            <section className=\"space-y-4\">
              <div className=\"bg-gray-200 px-4 py-1 border-l-4 border-black\">
                <h2 className=\"text-[11px] font-black uppercase tracking-widest\">Section 3: Bar Packing</h2>
              </div>
              <div className=\"border-2 border-black p-6 space-y-6\">
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-black uppercase text-gray-500\">Pieces Count</label>
                  <input 
                    type=\"number\"
                    className=\"w-full text-3xl font-black outline-none\"
                    value={formData.packing_pieces}
                    onChange={e => setFormData(p => ({...p, packing_pieces: e.target.value}))}
                  />
                </div>
                <RadioGroup label=\"Manager Notified\" name=\"packing_manager_informed\" />
                <div className=\"pt-4 border-t border-gray-200\">
                  <label className=\"text-[10px] font-black uppercase text-gray-500 mb-2 block\">Signature (Initials)</label>
                  <div className=\"text-2xl font-serif italic border-b-2 border-black h-12 flex items-end pb-1\">
                    {formData.packing_signature}
                  </div>
                </div>
              </div>
            </section>

            <section className=\"space-y-4\">
              <div className=\"bg-gray-200 px-4 py-1 border-l-4 border-black\">
                <h2 className=\"text-[11px] font-black uppercase tracking-widest\">Section 5: Final Completion</h2>
              </div>
              <div className=\"border-2 border-black p-6 space-y-4\">
                <RadioGroup label=\"Doors Serviceable\" name=\"equipment_serviceable_doors\" />
                <RadioGroup label=\"Wheels & Brakes OK\" name=\"equipment_serviceable_wheels\" />
                <div className=\"pt-6 space-y-2\">
                  <label className=\"text-[10px] font-black uppercase text-gray-500\">Lead / Supervisor Name</label>
                  <input 
                    className=\"w-full border-b-2 border-black py-2 text-sm font-bold uppercase outline-none\"
                    value={formData.manager_name}
                    onChange={e => setFormData(p => ({...p, manager_name: e.target.value}))}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Form Actions - Hidden on print */}
          <div className=\"flex justify-center pt-12 print:hidden\">
            <button
              type=\"submit\"
              disabled={loading}
              className=\"bg-black text-white px-16 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl disabled:opacity-50\"
            >
              {loading ? 'Processing...' : 'Save & Finalize Form'}
            </button>
          </div>

          {/* Footer Info */}
          <div className=\"text-center pt-20 border-t border-gray-100 opacity-30\">
            <p className=\"text-[8px] font-bold uppercase tracking-widest\">System generated via SkyRoute.uk | Emirates Group Logistics v1.2</p>
          </div>
        </form>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white;
          }
          aside {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function InBondControlSheetPage() {
  return (
    <Suspense fallback={<div className=\"flex items-center justify-center min-h-screen font-black uppercase\">Loading Sheet...</div>}>
      <InBondFormContent />
    </Suspense>
  );
}
