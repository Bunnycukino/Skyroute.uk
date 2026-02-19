'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RampInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{c209: string} | null>(null);
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
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ramp_input',
          container_code: formData.bar_number.toUpperCase(),
          pieces: parseInt(formData.pieces) || 0,
          flight_number: formData.flight_number.toUpperCase(),
          signature: formData.signature.toUpperCase(),
          notes: formData.notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd zapisu');
      setSuccess({ c209: data.c209 });
      setFormData({ bar_number: '', pieces: '', flight_number: '', signature: '', notes: '' });
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
            <span className="font-bold text-sm text-foreground">SkyRoute OK</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground"><span>📊</span> Dashboard</Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm"><span>✈️</span> Ramp Input</Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground"><span>📦</span> Logistic Input</Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground"><span>📋</span> All Entries</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Ramp Input (C209)</h1>
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
                    <th className={th}>Bar Number</th>
                    <th className={th}>Pieces</th>
                    <th className={th}>Flight Number</th>
                    <th className={th}>Signature</th>
                    <th className={th}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={td + " bg-yellow-400/20"}>
                      <input required className={inp + " uppercase"} placeholder="np. TA1234" 
                        value={formData.bar_number}
                        onChange={e => setFormData({...formData, bar_number: e.target.value})}
                      />
                    </td>
                    <td className={td + " bg-yellow-400/20 w-24"}>
                      <input required type="number" className={inp} placeholder="0" 
                        value={formData.pieces}
                        onChange={e => setFormData({...formData, pieces: e.target.value})}
                      />
                    </td>
                    <td className={td + " bg-yellow-400/20"}>
                      <input required className={inp + " uppercase"} placeholder="np. TOM123" 
                        value={formData.flight_number}
                        onChange={e => setFormData({...formData, flight_number: e.target.value})}
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

            <div className="flex justify-end">
              <button disabled={loading} className="bg-primary text-primary-foreground px-12 py-3 rounded-lg font-black uppercase tracking-tighter shadow-lg hover:opacity-90 disabled:opacity-50">
                {loading ? 'Adding...' : 'AddEntry'}
              </button>
            </div>

            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-bold border border-destructive/20">{error}</div>}
            {success && <div className="p-4 bg-green-500/10 text-green-500 rounded-lg text-sm font-bold border border-green-500/20">Wpis Ramp dodany! Numer C209: {success.c209}</div>}

            <div className="mt-12">
              <h3 className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Prefix Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="p-2 border border-green-700 text-left uppercase">Airline</th>
                      <th className="p-2 border border-green-700 text-left uppercase">Bar Prefix</th>
                      <th className="p-2 border border-green-700 text-left uppercase">Flight Prefix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PREFIXES.map((p, i) => (
                      <tr key={i} className="hover:bg-muted/50 border-b border-border">
                        <td className="p-2 font-bold">{p.airline}</td>
                        <td className="p-2 font-mono text-primary font-bold">{p.bar}</td>
                        <td className="p-2 font-mono text-muted-foreground">{p.flight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-card border border-border p-6 rounded-2xl flex items-center justify-center">
                   <div className="text-center">
                     <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">REWAREHOUSE (RR)</p>
                     <p className="text-sm font-medium">Use consistent prefixes for automated tracking.</p>
                   </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
