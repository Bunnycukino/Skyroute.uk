import React, { forwardRef } from 'react';
import { Card } from '@/components/ui/card';

const InBondForm = forwardRef(({ data = {} }, ref) => {
  const today = new Date().toLocaleDateString('en-GB');
  
  return (
    <div ref={ref} className="print-container p-8 bg-white">
      <style>{`
        @media print {
          .print-container {
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: avoid;
          }
          .section-break {
            page-break-before: avoid;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-5xl font-bold text-blue-500" style={{ fontFamily: 'Arial' }}>
          dnata
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold">IN BOND</h1>
          <h2 className="text-2xl font-bold">CONTROL SHEET</h2>
        </div>
        <div className="border-2 border-black p-2">
          <div className="text-center font-bold">C209 Number</div>
          <div className="text-center text-xl font-bold">{data.c209Number || 'NEW BUILD'}</div>
        </div>
      </div>

      {/* Section 1: Inbound Bars */}
      <div className="border-2 border-black mb-4">
        <div className="bg-gray-200 p-2 font-bold">SECTION 1: INBOUND BARS</div>
        <div className="grid grid-cols-3 border-b border-black">
          <div className="p-2 border-r border-black">
            <span className="font-bold">Bar Number:</span> {data.containerCode || 'poly'}
          </div>
          <div className="p-2 border-r border-black">
            <span className="font-bold">Number of Pieces:</span> {data.pieces || '13'}
          </div>
          <div className="p-2">
            <span className="font-bold">Date Received:</span> {today}
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-black">
          <div className="p-2 border-r border-black">
            <span className="font-bold">Lock & Seal Check:</span> YES / NO
          </div>
          <div className="p-2">
            <span className="font-bold">Bar Recorded on J/B Despatch Sheet:</span> YES / NO
          </div>
        </div>
        <div className="p-2 border-b border-black">
          <span className="font-bold">Comments:</span> AUTO
        </div>
        <div className="grid grid-cols-2 border-b border-black">
          <div className="p-2 border-r border-black">
            <span className="font-bold">PRINT NAME:</span> {data.signature || 'jw'}
          </div>
          <div className="p-2">
            <span className="font-bold">SIGN NAME:</span>
            <div className="border-b border-gray-400 mt-2 h-8"></div>
          </div>
        </div>
      </div>

      {/* Section 2: Bar Storage */}
      <div className="border-2 border-black mb-4">
        <div className="bg-gray-200 p-2 font-bold">SECTION 2: BAR STORAGE</div>
        <div className="p-2 text-right italic">To be used for bars that are being stored and/or checked</div>
        <div className="p-2">
          <span className="font-bold">Comments:</span>
          <div className="border-b border-gray-400 mt-2 h-8"></div>
        </div>
      </div>

      {/* Section 3: Bar Packing */}
      <div className="border-2 border-black mb-4 section-break">
        <div className="bg-gray-200 p-2 font-bold">SECTION 3: BAR PACKING - CORE BAR / GIFT CART</div>
        <div className="grid grid-cols-2">
          <div className="border-r border-black">
            <div className="p-2 border-b border-black">
              <span className="font-bold">Locks & Seals Checked Prior to Opening Bar:</span> YES / NO
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Locks & Seals Intact:</span> YES / NO *
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Seal numbers match paperwork?</span> YES / NO *
            </div>
            <div className="p-2 italic text-sm border-b border-black">
              * If NO, complete details below & inform Manager/ Shift Leader
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <span className="font-bold">PRINT NAME:</span>
                <div className="border-b border-gray-400 mt-2 h-8"></div>
              </div>
              <div className="p-2">
                <span className="font-bold">SIGN NAME:</span>
                <div className="border-b border-gray-400 mt-2 h-8"></div>
              </div>
            </div>
            <div className="p-2">
              <span className="font-bold">Comments:</span>
              <div className="border-b border-gray-400 mt-2 h-8"></div>
            </div>
          </div>
          <div>
            <div className="p-2 border-b border-black font-bold">BAR PACKING - GIFT CART</div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Locks & Seals Checked Prior to Opening Bar:</span> YES / NO
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Locks & Seals Intact:</span> YES / NO *
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Seal numbers match paperwork?</span> YES / NO *
            </div>
            <div className="p-2 italic text-sm border-b border-black">
              * If NO, complete details below & inform Manager/ Shift Leader
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-2 border-r border-black">
                <span className="font-bold">PRINT NAME:</span>
                <div className="border-b border-gray-400 mt-2 h-8"></div>
              </div>
              <div className="p-2">
                <span className="font-bold">SIGN NAME:</span>
                <div className="border-b border-gray-400 mt-2 h-8"></div>
              </div>
            </div>
            <div className="p-2">
              <span className="font-bold">Comments:</span>
              <div className="border-b border-gray-400 mt-2 h-8"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-black">
          <div className="p-2 border-r border-black">
            <span className="font-bold">MANAGER or SHIFT LEADER Informed:</span> YES / NO
          </div>
          <div className="p-2">
            <span className="font-bold">Name of MANAGER/SHIFT LEADER Informed:</span>
            <div className="border-b border-gray-400 mt-2 h-8"></div>
          </div>
        </div>
      </div>

      {/* Section 4: Re-sealed or Re-allocated Bar */}
      <div className="border-2 border-black mb-4">
        <div className="bg-gray-200 p-2 font-bold">SECTION 4: RE-SEALED or RE-ALLOCATED BAR</div>
        <div className="p-2 italic text-sm">To be completed for Incomplete Bar left by Previous Shift or Bar Re-opened for Bar Check or when bar Re-allocated</div>
        <div className="grid grid-cols-2 p-2">
          <div className="border-r border-black pr-2">
            <span className="font-bold">SEAL NUMBERS FROM:</span>
            <div className="border-b border-gray-400 mt-2 h-8"></div>
          </div>
          <div className="pl-2">
            <span className="font-bold">TO:</span>
            <div className="border-b border-gray-400 mt-2 h-8"></div>
          </div>
        </div>
      </div>

      {/* Section 5: Bar Completion */}
      <div className="border-2 border-black">
        <div className="bg-gray-200 p-2 font-bold">SECTION 5: BAR COMPLETION - CORE BAR / GIFT CART</div>
        <div className="grid grid-cols-2">
          <div className="border-r border-black">
            <div className="p-2 border-b border-black font-bold">SECTION 5: BAR COMPLETION - CORE BAR</div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Equipment Serviceable (Doors & Locks):</span> YES / NO
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Equipment Serviceable (Wheels & Brakes):</span> YES / NO
            </div>
            <div className="p-2">
              <span className="font-bold">Comments:</span>
              <div className="border-b border-gray-400 mt-2 h-8"></div>
            </div>
          </div>
          <div>
            <div className="p-2 border-b border-black font-bold">SECTION 5: BAR COMPLETION - GIFT CART</div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Equipment Serviceable (Doors & Locks):</span> YES / NO
            </div>
            <div className="p-2 border-b border-black">
              <span className="font-bold">Equipment Serviceable (Wheels & Brakes):</span> YES / NO
            </div>
            <div className="p-2">
              <span className="font-bold">Comments:</span>
              <div className="border-b border-gray-400 mt-2 h-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

InBondForm.displayName = 'InBondForm';

export default InBondForm;