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

  const [formData, setFormData] = useState({
    c209_number: '',
    bar_number: '',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        manager_name: sig
      }));
    }

    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'in_bond_input',
          ...formData
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save form');
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sectionHeader = "bg-gray-100 p-2 font-black text-xs border-b-2 border-black uppercase tracking-widest";
  const cellStyle = "p-4 border-r-2 border-black last:border-r-0";
  const labelStyle = "text-[9px] font-black uppercase text-gray-500 mb-1 block";
  const inputStyle = "w-full text-lg font-black uppercase outline-none bg-transparent placeholder:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 print:p-0 print:bg-white">
      <div className="max-w-[1000px] mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/ramp" className="text-sm font-bold flex items-center gap-2 hover:underline">
          ← Back to Ramp Input
        </Link>
        <button onClick={() => window.print()} className="bg-black text-white px-6 py-2 rounded-xl font-bold text-sm">
          Print Form
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[1000px] mx-auto bg-white border-[3px] border-black shadow-2xl print:shadow-none print:border-2">
        <div className="p-8 border-b-4 border-black flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl rounded">SR</div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">In Bond Control Sheet</h1>
            </div>
            <p className="text-[10px] font-bold text-gray-400 italic uppercase tracking-widest">Security Restricted Document - Emirates Group Logistics</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black">SR-{formData.c209_number || '---'}</div>
            <div className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Official Ref No.</div>
          </div>
        </div>

        {success && <div className="bg-green-100 border-b-2 border-green-500 text-green-700 p-4 font-black text-center print:hidden">FORM SAVED SUCCESSFULLY</div>}
        {error && <div className="bg-red-100 border-b-2 border-red-500 text-red-700 p-4 font-black text-center print:hidden">{error}</div>}

        <div className="grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black">
          <div className={cellStyle}>
            <label className={labelStyle}>C209 Number</label>
            <input required className={inputStyle} value={formData.c209_number} onChange={e => setFormData({...formData, c209_number: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Bar Number / Code</label>
            <input required className={inputStyle} value={formData.bar_number} onChange={e => setFormData({...formData, bar_number: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Flight No.</label>
            <input required className={inputStyle} value={formData.flight_number} onChange={e => setFormData({...formData, flight_number: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-4 border-b-2 border-black divide-x-2 divide-black">
          <div className={cellStyle}>
            <label className={labelStyle}>Date</label>
            <input type="date" className={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Time</label>
            <input className={inputStyle} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
          <div className="col-span-2 p-4">
            <label className={labelStyle}>Seal Numbers</label>
            <input placeholder="E.G. 123456, 123457" className={inputStyle} value={formData.seal_numbers} onChange={e => setFormData({...formData, seal_numbers: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black bg-gray-50/50">
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-tight">Lock & Seal Present and Intact?</span>
            <select className="bg-black text-white text-xs font-black p-2 rounded" value={formData.lock_seal_check} onChange={e => setFormData({...formData, lock_seal_check: e.target.value})}>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-tight">Manager Informed?</span>
            <select className="bg-black text-white text-xs font-black p-2 rounded" value={formData.manager_informed} onChange={e => setFormData({...formData, manager_informed: e.target.value})}>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-b-2 border-black">
          <label className={labelStyle}>Inbound Bars Comments</label>
          <textarea rows={2} className="w-full text-sm font-bold uppercase outline-none bg-transparent resize-none" placeholder="No discrepancies noted..." value={formData.inbound_bars_comments} onChange={e => setFormData({...formData, inbound_bars_comments: e.target.value})} />
        </div>

        <div className={sectionHeader}>Packing Details / Szczegóły Pakowania</div>
        
        <div className="grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black">
          <div className={cellStyle}>
            <label className={labelStyle}>Total Pieces</label>
            <input className={inputStyle} value={formData.packing_pieces} onChange={e => setFormData({...formData, packing_pieces: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Packing Date</label>
            <input type="date" className={inputStyle} value={formData.packing_date} onChange={e => setFormData({...formData, packing_date: e.target.value})} />
          </div>
          <div className={cellStyle}>
            <label className={labelStyle}>Signature / Initials</label>
            <input className={inputStyle} value={formData.packing_signature} onChange={e => setFormData({...formData, packing_signature: e.target.value})} />
          </div>
        </div>

        <div className={sectionHeader}>Equipment Serviceability Check</div>

        <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-tight">Doors Serviceable?</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" checked={formData.equipment_serviceable_doors === 'YES'} onChange={() => setFormData({...formData, equipment_serviceable_doors: 'YES'})} /><span className="text-[10px] font-black">YES</span></label>
              <label className="flex items-center gap-2"><input type="radio" checked={formData.equipment_serviceable_doors === 'NO'} onChange={() => setFormData({...formData, equipment_serviceable_doors: 'NO'})} /><span className="text-[10px] font-black">NO</span></label>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-tight">Wheels / Base Serviceable?</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" checked={formData.equipment_serviceable_wheels === 'YES'} onChange={() => setFormData({...formData, equipment_serviceable_wheels: 'YES'})} /><span className="text-[10px] font-black">YES</span></label>
              <label className="flex items-center gap-2"><input type="radio" checked={formData.equipment_serviceable_wheels === 'NO'} onChange={() => setFormData({...formData, equipment_serviceable_wheels: 'NO'})} /><span className="text-[10px] font-black">NO</span></label>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-2 gap-12 bg-gray-50/30">
          <div className="space-y-4">
            <label className={labelStyle}>Manager Name / Signature</label>
            <div className="border-b-2 border-black pb-2">
              <input className="w-full font-black text-xl uppercase outline-none bg-transparent" value={formData.manager_name} onChange={e => setFormData({...formData, manager_name: e.target.value})} />
            </div>
            <p className="text-[8px] font-bold text-gray-400 uppercase">I confirm that all details are accurate and equipment has been checked.</p>
          </div>
          <div className="flex flex-col justify-end items-end print:hidden">
            <button type="submit" disabled={loading} className="bg-black text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Save & Close Form'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function InBondPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black">Loading Control Sheet...</div>}>
      <InBondFormContent />
    </Suspense>
  );
}
