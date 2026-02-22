'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InBondControlSheetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    c209_number: '',
    bar_number: '',
    time: '',
    seal_numbers: '',
    lock_seal_check: 'YES',
    inbound_bars_comments: '',
    manager_informed: 'YES',
    manager_name: '',
    bar_recorded_on_dispatch: 'YES',
    packing_pieces: '',
    packing_date: '',
    packing_manager_informed: 'YES',
    packing_signature: '',
    equipment_serviceable_doors: 'YES',
    equipment_serviceable_wheels: 'YES'
  });

  useEffect(() => {
    fetch('/api/entries?limit=1').then(res => {
      if (res.status === 401) router.push('/');
    });
  }, [router]);

  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  }

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

  const RadioGroup = ({ label, name, value }: { label: string, name: keyof typeof formData, value: string }) => (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold w-32">{label}</span>
      <div className="flex gap-4">
        {['YES', 'NO'].map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              checked={formData[name] === opt}
              onChange={() => setFormData(prev => ({ ...prev, [name]: opt }))}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">SR</div>
            <div>
              <h1 className="font-bold text-foreground text-sm">SkyRoute.uk</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">C209 System</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> C209 Input ( Ramp Input )
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> C208 Input ( Logistic Input )
          </Link>
          <Link href="/in-bond" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>📄</span> In Bond Control Sheet
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📋</span> All Entries
          </Link>
          <div className="pt-4 mt-4 border-t border-border">
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-muted-foreground hover:text-destructive transition-colors w-full text-left">
              <span>🚪</span> Wyloguj
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight uppercase">In Bond Control Sheet</h1>
              <p className="text-muted-foreground italic">Template v1.2 250124</p>
            </div>
            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
              >
                {loading ? 'SAVING...' : 'SAVE FORM'}
              </button>
            </div>
          </div>

          {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl">Formularz zapisany pomyślnie!</div>}
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">{error}</div>}

          {/* SECTION 1: HEADER INFO */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-card border border-border p-6 rounded-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">C209 Number</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                value={formData.c209_number}
                onChange={e => setFormData(p => ({ ...p, c209_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Bar Number</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                value={formData.bar_number}
                onChange={e => setFormData(p => ({ ...p, bar_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Time</label>
              <input
                type="time"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                value={formData.time}
                onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Date</label>
              <input
                type="date"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                value={formData.packing_date}
                onChange={e => setFormData(p => ({ ...p, packing_date: e.target.value }))}
              />
            </div>
          </div>

          {/* SECTION 1: INBOUND BARS */}
          <section className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="bg-muted/30 px-6 py-3 border-b border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider">Section 1: Inbound Bars</h3>
            </div>
            <div className="p-6 space-y-6">
              <RadioGroup label="Lock / Seal Check" name="lock_seal_check" value={formData.lock_seal_check} />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Seal Numbers (From - To)</label>
                <input
                  type="text"
                  placeholder="e.g. 12345 - 12350"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none"
                  value={formData.seal_numbers}
                  onChange={e => setFormData(p => ({ ...p, seal_numbers: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Comments</label>
                <textarea
                  className="w-full h-24 bg-background border border-border rounded-lg px-3 py-2 outline-none resize-none"
                  value={formData.inbound_bars_comments}
                  onChange={e => setFormData(p => ({ ...p, inbound_bars_comments: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* SECTION 2 & 3: PACKING & MANAGEMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="bg-muted/30 px-6 py-3 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider">Section 3: Bar Packing</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Number of Pieces</label>
                  <input
                    type="number"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none"
                    value={formData.packing_pieces}
                    onChange={e => setFormData(p => ({ ...p, packing_pieces: e.target.value }))}
                  />
                </div>
                <RadioGroup label="Manager Informed" name="packing_manager_informed" value={formData.packing_manager_informed} />
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Sign Name (Initials)</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none font-mono"
                    value={formData.packing_signature}
                    onChange={e => setFormData(p => ({ ...p, packing_signature: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="bg-muted/30 px-6 py-3 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider">Section 5: Bar Completion</h3>
              </div>
              <div className="p-6 space-y-4">
                <RadioGroup label="Doors / Locks Serviceable" name="equipment_serviceable_doors" value={formData.equipment_serviceable_doors} />
                <RadioGroup label="Wheels / Brakes Serviceable" name="equipment_serviceable_wheels" value={formData.equipment_serviceable_wheels} />
                <div className="pt-4 space-y-2 border-t border-border">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Manager/Shift Leader Name</label>
                  <input
                    type="text"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 outline-none"
                    value={formData.manager_name}
                    onChange={e => setFormData(p => ({ ...p, manager_name: e.target.value }))}
                  />
                </div>
              </div>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}
