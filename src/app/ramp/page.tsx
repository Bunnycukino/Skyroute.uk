'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Printer, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function RampInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    c209: string,
    bar: string,
    flight: string,
    pieces: number,
    signature: string,
    notes: string
  } | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bar_number: '',
    pieces: '',
    flight_number: '',
    signature: '',
    notes: ''
  });

  const PREFIXES = [
    { airline: 'TUI', bar: 'TA', flight: 'TOM' },
    { airline: 'RYANAIR', bar: 'RYR', flight: 'FR' },
    { airline: 'EASYJET', bar: 'EZ', flight: 'EZY' },
    { airline: 'SINGAPORE', bar: 'POLY', flight: 'SQ' },
    { airline: 'EMIRATES', bar: 'EK', flight: 'EK' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const payload = {
        action: 'ramp_input',
        container_code: formData.bar_number.toUpperCase(),
        pieces: parseInt(formData.pieces) || 0,
        flight_number: formData.flight_number.toUpperCase(),
        signature: formData.signature.toUpperCase(),
        notes: formData.notes
      };
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad zapisu');
      setSuccess({
        c209: data.c209,
        bar: payload.container_code,
        flight: payload.flight_number,
        pieces: payload.pieces,
        signature: payload.signature,
        notes: payload.notes
      });
      setFormData({
        bar_number: '',
        pieces: '',
        flight_number: '',
        signature: '',
        notes: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyles = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all";
  const labelStyles = "text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-8">
        <Link href="/dashboard" className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-slate-950 shadow-lg shadow-green-500/20">
            <span className="font-black text-2xl">SR</span>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter">SkyRoute</h1>
            <p className="text-[10px] text-green-500 uppercase font-black tracking-widest leading-none">Terminal Operations</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-2">
          <Link href="/ramp" className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black shadow-xl">
            <span className="text-xl">&#x2708;&#xFE0F;</span> Ramp Input
          </Link>
          <Link href="/logistic" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-900 text-slate-400 hover:text-white transition-all group">
            <span className="text-xl group-hover:scale-110 transition-transform">&#x1F4E6;</span> Logistics
          </Link>
          <Link href="/entries" className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-slate-900 text-slate-400 hover:text-white transition-all group">
            <span className="text-xl group-hover:scale-110 transition-transform">&#x1F4CB;</span> Logs
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter">C209 Ramp Input</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Register incoming containers and cargo</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelStyles}>Container Bar Code</label>
                <input
                  required
                  placeholder="e.g. AKE12345"
                  className={inputStyles}
                  value={formData.bar_number}
                  onChange={e => setFormData({...formData, bar_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyles}>Pieces Count</label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className={inputStyles}
                  value={formData.pieces}
                  onChange={e => setFormData({...formData, pieces: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelStyles}>Flight Number</label>
                <input
                  required
                  placeholder="e.g. EK017"
                  className={inputStyles}
                  value={formData.flight_number}
                  onChange={e => setFormData({...formData, flight_number: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyles}>Signature (Initials)</label>
                <input
                  required
                  placeholder="RR"
                  className={inputStyles}
                  value={formData.signature}
                  onChange={e => setFormData({...formData, signature: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelStyles}>Additional Comments / Notes</label>
              <textarea
                placeholder="Any observations..."
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={loading}
                className="group flex items-center gap-3 bg-green-500 hover:bg-green-400 text-slate-950 px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-xl shadow-green-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                {loading ? 'Processing...' : 'Register Entry'}
              </button>
            </div>
          </form>

          {/* Success / Error States */}
          <div className="mt-8 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-500 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="w-6 h-6" />
                <span className="font-black uppercase text-sm tracking-tight">System Error: {error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl animate-in zoom-in">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                    <div>
                      <div className="text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">Registration Successful</div>
                      <div className="text-2xl font-black text-white">C209 Reference: <span className="underline decoration-green-500 decoration-4 underline-offset-8">{success.c209}</span></div>
                    </div>
                  </div>

                  <Link
                    href={`/in-bond?c209=${success.c209}&bar=${success.bar}&flight=${success.flight}&pieces=${success.pieces}&sig=${success.signature}&notes=${encodeURIComponent(success.notes)}&autoPrint=true`}
                    className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-all shadow-xl group"
                  >
                    <Printer className="w-4 h-4 group-hover:animate-bounce" />
                    Print In-Bond Form
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Reference Table */}
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">System Reference Prefixes</h3>
              <div className="h-[1px] flex-1 bg-slate-800"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <table className="w-full text-left text-[11px] font-bold uppercase tracking-tight">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-4 px-2">Airline</th>
                    <th className="pb-4 px-2">Bar Code</th>
                    <th className="pb-4 px-2">Flight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {PREFIXES.map((p, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 text-white">{p.airline}</td>
                      <td className="py-4 px-2 text-green-500">{p.bar}</td>
                      <td className="py-4 px-2 text-slate-400">{p.flight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
