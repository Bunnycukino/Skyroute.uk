'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RampInputPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{c209: string} | null>(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    container_code: '',
    pieces: '',
    flight_number: '',
    origin: '',
    destination: '',
    signature: '',
    notes: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    if (!formData.container_code) {
      setError('Wprowadz Container Code (Bar Number)!');
      setLoading(false);
      return;
    }
    if (!formData.signature) {
      setError('Podpis jest wymagany!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ramp_input',
          container_code: formData.container_code.toUpperCase(),
          pieces: parseInt(formData.pieces) || 0,
          flight_number: formData.flight_number.toUpperCase(),
          origin: formData.origin.toUpperCase(),
          destination: formData.destination.toUpperCase(),
          signature: formData.signature.toUpperCase(),
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad zapisu');

      setSuccess({ c209: data.c209 });
      setFormData({ container_code: '', pieces: '', flight_number: '', origin: '', destination: '', signature: '', notes: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inp = 'w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none text-sm';

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19 19 2-9-18-9 18 9-2zm0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm">SkyRoute OK</h1>
              <p className="text-xs text-muted-foreground">C209 System</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>✈️</span> Ramp Input (C209)
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> Logistic Input (LOG)
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📋</span> All Entries
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold mb-1">Ramp Input (C209)</h1>
          <p className="text-muted-foreground mb-8">Nowy wpis RAMP — numer C209 generowany automatycznie.</p>

          {success && (
            <div className="mb-6 p-5 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-bold text-lg">Zapisano!</p>
              <p className="text-green-300 mt-1">Numer C209: <span className="font-mono text-xl font-bold">{success.c209}</span></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 bg-card p-8 rounded-2xl border border-border shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Container Code (Bar Number) *</label>
              <input required className={inp} value={formData.container_code}
                onChange={e => setFormData({...formData, container_code: e.target.value})}
                placeholder="np. AKE12345EK" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Origin</label>
                <input className={inp} value={formData.origin}
                  onChange={e => setFormData({...formData, origin: e.target.value})}
                  placeholder="np. DXB" maxLength={3} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Destination</label>
                <input className={inp} value={formData.destination}
                  onChange={e => setFormData({...formData, destination: e.target.value})}
                  placeholder="np. LHR" maxLength={3} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Pieces</label>
                <input type="number" className={inp} value={formData.pieces}
                  onChange={e => setFormData({...formData, pieces: e.target.value})}
                  placeholder="0" min={0} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Flight Number</label>
                <input className={inp} value={formData.flight_number}
                  onChange={e => setFormData({...formData, flight_number: e.target.value})}
                  placeholder="np. EK016" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Signature (Podpis) *</label>
              <input required className={inp} value={formData.signature}
                onChange={e => setFormData({...formData, signature: e.target.value})}
                placeholder="Twoje inicjaly / badge" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Ramp Comment</label>
              <textarea className={inp + ' min-h-[80px]'} value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Opcjonalny komentarz..." />
            </div>

            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

            <button disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Zapisywanie...' : 'Stworz wpis C209 (RAMP)'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
