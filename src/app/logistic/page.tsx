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
          pieces: formData.pieces ? parseInt(formData.pieces) : null,
          flight_number: formData.flight_number.toUpperCase(),
          origin: formData.origin.toUpperCase(),
          destination: formData.destination.toUpperCase(),
          is_new_build: formData.is_new_build,
          is_rw: formData.is_rw,
          signature: formData.signature,
          notes: formData.notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Blad serwera');
      setSuccess({ c209: data.c209, c208: data.c208 });
      setFormData({
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inp = 'w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary">&larr; Dashboard</Link>
          <h1 className="text-2xl font-bold mt-2">Logistic Input</h1>
          <p className="text-sm text-muted-foreground">Tworzy wpis C209 + C208 (para polaczona)</p>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
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
      </main>
    </div>
  );
}
