'use client';
import { useState } from 'react';
import Link from 'next/link';
export default function LogisticInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{c209: string; c208: string} | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    container_code: '',
    pieces: '',
    flight_number: '',
    c208_number: '',
    signature: '',
    notes: '',
    is_new_build: false
  });
  const AIRLINES = [
    { name: 'TUI Airways', prefix: 'TA', rw: 'RWTA' },
    { name: 'Ryanair', prefix: 'RYR', rw: 'RWRYR' },
    { name: 'EasyJet', prefix: 'EZ', rw: 'RWEZ' },
    { name: 'Singapore Airlines', prefix: 'POLY', rw: 'RWPOLY' },
    { name: 'Emirates', prefix: 'EK', rw: 'RWEK' },
  ];
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logistic_input',
          container_code: formData.container_code.toUpperCase(),
          pieces: parseInt(formData.pieces) || 0,
          flight_number: formData.flight_number.toUpperCase(),
          c208_number: formData.c208_number.toUpperCase(),
          signature: formData.signature.toUpperCase(),
          notes: formData.notes,
          is_new_build: formData.is_new_build
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad zapisu');
      setSuccess({ c209: data.c209, c208: data.c208 });
      setFormData({ container_code: '', pieces: '', flight_number: '', c208_number: '', signature: '', notes: '', is_new_build: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  const th = "px-4 py-2 border border-border bg-muted text-[10px] font-bold uppercase text-left";
  const td = "p-0 border border-border";
  const inp = "w-full px-3 py-2 bg-transparent outline-none text-sm font-bold";
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">SR</div>
            <span className="font-bold text-sm text-foreground">SkyRoute.uk</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground"><span>📊</span> Dashboard</Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground"><span>✈️</span> C209 Input ( Ramp Input )</Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm"><span>📦</span> C208 Input ( Logistic Input )</Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground"><span>📋</span> All Entries</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Logistic Input (LOG)</h1>
            <div className="text-right">
              <span className="text-primary font-black text-2xl italic">dnata</span>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">catering</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Container Code</th>
                    <th className={th}>Pieces</th>
                    <th className={th}>Flight Number</th>
                    <th className={th}>C208</th>
                    <th className={th}>Signature</th>
                    <th className={th}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={td + " bg-yellow-400/20"}>
                      <input required className={inp + " uppercase"} placeholder="np. EK001"
                        value={formData.container_code}
                        onChange={e => setFormData({...formData, container_code: e.target.value})}
                      />
                    </td>
                    <td className={td + " bg-yellow-400/20 w-24"}>
                      <input required type="number" className={inp} placeholder="0"
                        value={formData.pieces}
                        onChange={e => setFormData({...formData, pieces: e.target.value})}
                      />
                    </td>
                    <td className={td + " bg-yellow-400/20"}>
                      <input required className={inp + " uppercase"} placeholder="np. EK123"
                        value={formData.flight_number}
                        onChange={e => setFormData({...formData, flight_number: e.target.value})}
                      />
                    </td>
                    <td className={td + " bg-yellow-400/20"}>
                      <input className={inp + " uppercase"} placeholder="C208..."
                        value={formData.c208_number}
                        onChange={e => setFormData({...formData, c208_number: e.target.value})}
                      />
                    </td>
                    <td className={td + " bg-yellow-400/20"}>
                      <input required className={inp + " uppercase"} placeholder="Podpis"
                        value={formData.signature}
                        onChange={e => setFormData({...formData, signature: e.target.value})}
                      />
                    </td>
                    <td className={td + " bg-yellow-400/20"}>
                      <input className={inp} placeholder="..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-4 bg-muted/20 p-4 border border-border rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.is_new_build ? 'bg-blue-500' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.is_new_build ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <input type="checkbox" className="hidden" checked={formData.is_new_build} onChange={e => setFormData({...formData, is_new_build: e.target.checked})} />
                <span className="text-sm font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">New build only</span>
              </label>
              <button disabled={loading} className="bg-primary text-primary-foreground px-12 py-3 rounded-lg font-black uppercase tracking-tighter shadow-lg hover:opacity-90 disabled:opacity-50">
                {loading ? 'Adding...' : 'AddEntry'}
              </button>
            </div>
            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-bold border border-destructive/20">{error}</div>}
            {success && <div className="p-4 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold border border-green-500/20">Wpis LOG dodany! C209: {success.c209} / C208: {success.c208}</div>}
            <div className="mt-12">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Airlines Reference Data</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <table className="w-full border-collapse text-xs border border-border overflow-hidden rounded-lg">
                    <thead>
                      <tr className="bg-green-600 text-white font-black uppercase tracking-widest">
                        <th className="p-3 border border-green-700 text-left">AIRLINE</th>
                        <th className="p-3 border border-green-700 text-left">FLIGHT PREFIX</th>
                        <th className="p-3 border border-green-700 text-left">PREFIX RW EXAMPLE</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card">
                      {AIRLINES.map((a, i) => (
                        <tr key={i} className="hover:bg-muted/50 border-b border-border transition-colors">
                          <td className="p-3 font-bold text-foreground">{a.name}</td>
                          <td className="p-3 font-mono text-muted-foreground font-bold">{a.prefix}</td>
                          <td className="p-3 font-mono text-primary font-black italic">{a.rw}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-8 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-primary italic">RW</span>
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">Rewarehouse Protocol</p>
                  <p className="text-sm font-black leading-tight tracking-tighter">ADD PREFIX <span className="text-primary italic">RW</span> TO ALL REWAREHOUSE FLIGHT NUMBERS</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
