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
    origin: '',
    destination: '',
    is_new_build: false,
    is_rw: false,
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
          action: 'logistic_input',
          container_code: formData.container_code.toUpperCase(),
          pieces: parseInt(formData.pieces) || 0,
          flight_number: formData.flight_number.toUpperCase(),
          origin: formData.origin.toUpperCase(),
          destination: formData.destination.toUpperCase(),
          is_new_build: formData.is_new_build,
          is_rw: formData.is_rw,
          signature: formData.signature.toUpperCase(),
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad zapisu');

      setSuccess({ c209: data.c209, c208: data.c208 });
      setFormData({
        container_code: '', pieces: '', flight_number: '',
        origin: '', destination: '', is_new_build: false,
        is_rw: false, signature: '', notes: ''
      });
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <span className="font-bold text-sm">SkyRoute OK</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> Ramp Input (C209)
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
            <span>📦</span> Logistic Input (LOG)
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent text-sm text-muted-foreground hover:text-foreground">
            <span>📋</span> All Entries
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Logistic Input (LOG)</h1>
            <p className="text-muted-foreground text-sm mt-1">Tworzy wpis C209 + C208 (para polaczona)</p>
          </div>

          {success && (
            <div className="mb-6 p-5 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="font-bold text-green-800">Utworzono pare C209/C208!</p>
              <p className="text-green-700">C209: <span className="font-mono font-bold">{success.c209}</span></p>
              <p className="text-green-700">C208: <span className="font-mono font-bold">{success.c208}</span></p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Container Code (Bar Number) *</label>
              <input required className={inp} value={formData.container_code}
                onChange={e => setFormData({...formData, container_code: e.target.value})}
                placeholder="np. AKE12345EK" />
            </div>

            <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Pieces</label>
                <input type="number" className={inp} value={formData.pieces}
                  onChange={e => setFormData({...formData, pieces: e.target.value})}
                  placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Flight Number</label>
                <input className={inp} value={formData.flight_number}
                  onChange={e => setFormData({...formData, flight_number: e.target.value})}
                  placeholder="np. EK016" />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_new_build}
                  onChange={e => setFormData({...formData, is_new_build: e.target.checked})}
                  className="w-4 h-4" />
                <span className="text-sm font-semibold">NEW BUILD</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_rw}
                  onChange={e => setFormData({...formData, is_rw: e.target.checked})}
                  className="w-4 h-4" />
                <span className="text-sm font-semibold">RW Flight</span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Signature (Podpis) *</label>
              <input required className={inp} value={formData.signature}
                onChange={e => setFormData({...formData, signature: e.target.value})}
                placeholder="Twoje inicjaly / badge" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Logistic Comment</label>
              <textarea className={inp + ' min-h-[80px]'} value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Opcjonalny komentarz..." />
            </div>

            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

            <button disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Zapisywanie...' : 'Stworz wpis C209 + C208 (LOG)'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
