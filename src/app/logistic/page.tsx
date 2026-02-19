'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LogisticInputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    flight_number: '',
    c208_number: '',
    origin: '',
    destination: '',
    pieces: '',
    weight: '',
    notes: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'c208',
          pieces: parseInt(formData.pieces) || 0,
          weight: parseFloat(formData.weight) || 0
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);
      setFormData({
        flight_number: '',
        c208_number: '',
        origin: '',
        destination: '',
        pieces: '',
        weight: '',
        notes: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
            <span className="font-bold">SkyRoute OK</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            Ramp Input (C209)
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium">
            Logistic Input (C208)
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Logistic Input (C208)</h1>
            <p className="text-muted-foreground mt-2">Generate a C208 number and track shipments.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl border border-border shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Flight Number</label>
                <input
                  required
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.flight_number}
                  onChange={e => setFormData({ ...formData, flight_number: e.target.value })}
                  placeholder="e.g. EK123"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">C208 Number</label>
                <input
                  required
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.c208_number}
                  onChange={e => setFormData({ ...formData, c208_number: e.target.value })}
                  placeholder="C208-XXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Origin</label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.origin}
                  onChange={e => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="DXB"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="LHR"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pieces</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.pieces}
                  onChange={e => setFormData({ ...formData, pieces: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}
            {success && <div className="p-4 bg-primary/10 text-primary rounded-lg text-sm">C208 entry created successfully!</div>}

            <button
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Create C208 Entry'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
