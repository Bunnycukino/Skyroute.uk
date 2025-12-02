
import React, { useRef, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function InBondForm() {
  const printRef = useRef();
  const navigate = useNavigate();
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  // Fetch current user information for role-based access control
  // We explicitly name the query object to access its isLoading property later
  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });
  const user = currentUserQuery.data;
  const isUserLoading = currentUserQuery.isLoading;

  // Redirect non-admin users
  useEffect(() => {
    // Only redirect if user data has loaded and the user is not an admin
    if (!isUserLoading && user && user.role !== 'admin') {
      navigate(createPageUrl("RampInput"));
    }
  }, [user, isUserLoading, navigate]); // Added isUserLoading to dependencies to ensure correct timing

  // Display loading spinner for user data
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Display access denied message if user is not an admin (user data is already loaded at this point)
  // This check precedes all other content rendering
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Brak dostępu</h2>
            <p className="text-gray-600">Ta strona jest dostępna tylko dla administratorów.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch shipment data for admin users (this will only run if user is an admin)
  const { data: shipments = [], isLoading, refetch } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date'),
    initialData: [],
  });

  useEffect(() => {
    if (!isLoading && shipments.length > 0 && selectedShipmentId === null) {
      setSelectedShipmentId(shipments[0].id);
    }
  }, [isLoading, shipments, selectedShipmentId]);

  const selectedShipment = selectedShipmentId
    ? shipments.find(s => s.id === selectedShipmentId)
    : shipments[0];

  const handlePrint = () => {
    window.print();
  };

  // Display loading spinner for shipment data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Display no data message if no shipments are available
  if (!selectedShipment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Brak danych do wydruku</p>
            <p className="text-sm text-gray-500">Najpierw wprowadź dane przez RAMP INPUT</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Button Bar */}
      <div className="print:hidden bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[210mm] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">IN BOND CONTROL SHEET</h1>
              <p className="text-sm text-gray-600">Formularz dla przesyłki {selectedShipment.c209_number}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={selectedShipmentId || (shipments.length > 0 ? shipments[0].id : '')}
                onValueChange={setSelectedShipmentId}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Wybierz przesyłkę" />
                </SelectTrigger>
                <SelectContent>
                  {shipments.slice(0, 20).map((shipment) => (
                    <SelectItem key={shipment.id} value={shipment.id}>
                      {shipment.c209_number} - {format(new Date(shipment.created_date), 'dd/MM HH:mm')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => refetch()} variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Drukuj
              </Button>
            </div>
          </div>

          <Card className="mt-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">C209:</span>
                  <p className="font-mono font-bold">{selectedShipment.c209_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">C208:</span>
                  <p className="font-mono font-bold">{selectedShipment.c208_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">Container:</span>
                  <p className="font-semibold">{selectedShipment.container_no || selectedShipment.ramp_container_code || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Pieces:</span>
                  <p className="font-semibold">{selectedShipment.pieces || selectedShipment.ramp_pieces || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable Document */}
      <div ref={printRef} className="w-full bg-white print:shadow-none shadow-lg my-8 print:my-0 p-8 print:p-3">
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              margin: 0;
              padding: 0;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
          
          .form-table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
          }
          
          .form-table td {
            border: 1px solid #000;
            padding: 2px 3px;
            font-size: 7px;
            vertical-align: middle;
            line-height: 1.2;
          }
          
          .form-table td.no-border {
            border: none;
          }
          
          .form-table td.thick-border {
            border: 2px solid #000;
          }
          
          .form-table td.border-right-thick {
            border-right: 2px solid #000;
          }
          
          .section-header {
            background-color: #000;
            color: #fff;
            font-weight: bold;
            font-size: 8px;
            padding: 4px 4px !important;
          }
          
          .data-cell {
            height: 18px;
          }
          
          .empty-row {
            height: 25px;
          }
        `}</style>

        {/* Header */}
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td rowSpan="2" style={{width: '18%', border: 'none', padding: '0 5px'}}>
                <div style={{fontSize: '36px', fontWeight: 'bold', color: '#0088cc', fontFamily: 'Arial, sans-serif', lineHeight: '0.9'}}>
                  dnata
                </div>
              </td>
              <td rowSpan="2" colSpan="6" style={{width: '62%', textAlign: 'center', border: '1px solid #000', verticalAlign: 'middle'}}>
                <div style={{fontSize: '13px', fontWeight: 'bold', lineHeight: '1.2'}}>
                  <div>IN BOND</div>
                  <div>CONTROL SHEET</div>
                </div>
              </td>
              <td colSpan="2" className="thick-border" style={{width: '20%', textAlign: 'center', fontSize: '8px', fontWeight: 'bold', padding: '3px'}}>
                C209 Number
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="thick-border" style={{textAlign: 'center', fontSize: '12px', fontWeight: 'bold', padding: '5px'}}>
                {selectedShipment.c209_number}
              </td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 1: INBOUND BARS */}
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td colSpan="9" className="section-header">SECTION 1: INBOUND BARS</td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="2" style={{width: '20%'}}>Bar Number:</td>
              <td colSpan="3" style={{width: '30%'}}>Number of Pieces:</td>
              <td colSpan="4" style={{width: '50%'}}>Date Received: _____ / _____ / _____</td>
            </tr>
            <tr>
              <td colSpan="2" className="data-cell" style={{fontSize: '8px', fontWeight: 'bold'}}>
                {selectedShipment.bar_number || selectedShipment.ramp_container_code || ''}
              </td>
              <td colSpan="3" className="data-cell" style={{fontSize: '8px', fontWeight: 'bold'}}>
                {selectedShipment.pieces || selectedShipment.ramp_pieces || ''}
              </td>
              <td colSpan="4" className="data-cell" style={{fontSize: '8px', fontWeight: 'bold'}}>
                {selectedShipment.date ? format(new Date(selectedShipment.date), 'd/M/yy') : 
                 selectedShipment.created_date ? format(new Date(selectedShipment.created_date), 'd/M/yy') : ''}
              </td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="2">Lock & Seal Check: YES / NO</td>
              <td colSpan="3">C209 Present: YES/NO</td>
              <td colSpan="4">Bar Recorded on I/B Despatch Sheet: YES / NO</td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="9">Comments:</td>
            </tr>
            <tr>
              <td colSpan="9" className="empty-row"></td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="4" className="border-right-thick">PRINT NAME:</td>
              <td colSpan="5">SIGN NAME:</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell border-right-thick" style={{fontSize: '8px'}}>
                {selectedShipment.signature || selectedShipment.ramp_signature || ''}
              </td>
              <td colSpan="5" className="data-cell"></td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 2: BAR STORAGE */}
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td colSpan="5" className="section-header">SECTION 2: BAR STORAGE</td>
              <td colSpan="4" style={{fontSize: '6px', fontStyle: 'italic', padding: '3px'}}>
                To be used for bars that are being stored and/or checked
              </td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="9">Comments:</td>
            </tr>
            <tr>
              <td colSpan="9" className="empty-row"></td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 3: BAR PACKING */}
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td colSpan="4" className="section-header border-right-thick">SECTION 3: BAR PACKING - CORE BAR</td>
              <td colSpan="5" className="section-header">BAR PACKING - GIFT CART</td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="4" className="border-right-thick">Locks & Seals Checked Prior to Opening Bar: YES / NO</td>
              <td colSpan="5">Locks & Seals Checked Prior to Opening Bar: YES / NO</td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="4" className="border-right-thick">Locks & Seals Intact: YES / NO *</td>
              <td colSpan="5">Locks & Seals Intact: YES / NO *</td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="4" className="border-right-thick">Seal numbers match paperwork? YES / NO *</td>
              <td colSpan="5">Seal numbers match paperwork? YES / NO *</td>
            </tr>
            <tr>
              <td colSpan="9" style={{fontSize: '6px', padding: '2px 3px'}}>
                * If NO, complete details below & inform Manager/ Shift Leader
              </td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="4" className="border-right-thick">PRINT NAME:</td>
              <td colSpan="5">PRINT NAME:</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell border-right-thick"></td>
              <td colSpan="5" className="data-cell"></td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="4" className="border-right-thick">SIGN NAME:</td>
              <td colSpan="5">SIGN NAME:</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell border-right-thick"></td>
              <td colSpan="5" className="data-cell"></td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="4" className="border-right-thick">Comments:</td>
              <td colSpan="5">Comments:</td>
            </tr>
            <tr>
              <td colSpan="4" className="empty-row border-right-thick"></td>
              <td colSpan="5" className="empty-row"></td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="4" className="border-right-thick">MANAGER or SHIFT LEADER Informed: YES / NO</td>
              <td colSpan="5">Name of MANAGER/SHIFT LEADER informed:</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell border-right-thick"></td>
              <td colSpan="5" className="data-cell"></td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 4: RE-SEALED or RE-ALLOCATED BAR */}
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td colSpan="9" className="section-header">
                SECTION 4: RE-SEALED or RE-ALLOCATED BAR
              </td>
            </tr>
            <tr>
              <td colSpan="9" style={{fontSize: '6px', textAlign: 'center', padding: '2px'}}>
                To be completed for Incomplete Bar left by Previous Shift or
              </td>
            </tr>
            <tr>
              <td colSpan="9" style={{fontSize: '6px', textAlign: 'center', padding: '2px'}}>
                Bar Re-opened for Bar Check or when bar Re-allocated
              </td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="2">SEAL NUMBERS</td>
              <td colSpan="3" style={{textAlign: 'center'}}>FROM</td>
              <td colSpan="4" style={{textAlign: 'center'}}>TO</td>
            </tr>
            <tr>
              <td colSpan="2" className="empty-row"></td>
              <td colSpan="3" className="empty-row"></td>
              <td colSpan="4" className="empty-row"></td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 5: BAR COMPLETION */}
        <table className="form-table mb-2">
          <tbody>
            <tr>
              <td colSpan="4" className="section-header border-right-thick">SECTION 5: BAR COMPLETION - CORE BAR</td>
              <td colSpan="5" className="section-header">SECTION 5: BAR COMPLETION - GIFT CART</td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="3" className="border-right-thick">Equipment Serviceable (Doors & Locks)</td>
              <td style={{width: '8%', textAlign: 'center'}} className="border-right-thick">YES / NO</td>
              <td colSpan="4">Equipment Serviceable (Doors & Locks)</td>
              <td style={{width: '8%', textAlign: 'center'}}>YES / NO</td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="3" className="border-right-thick">Equipment Serviceable (Wheels & Brakes)</td>
              <td style={{textAlign: 'center'}} className="border-right-thick">YES / NO</td>
              <td colSpan="4">Equipment Serviceable (Wheels & Brakes)</td>
              <td style={{textAlign: 'center'}}>YES / NO</td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="4" className="border-right-thick">Comments:</td>
              <td colSpan="5">Comments:</td>
            </tr>
            <tr>
              <td colSpan="4" className="empty-row border-right-thick"></td>
              <td colSpan="5" className="empty-row"></td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="4" className="border-right-thick">PRINT NAME:</td>
              <td colSpan="5">PRINT NAME:</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell border-right-thick"></td>
              <td colSpan="5" className="data-cell"></td>
            </tr>
            <tr style={{height: '16px'}}>
              <td colSpan="4" className="border-right-thick">SIGN NAME:</td>
              <td colSpan="5">SIGN NAME:</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell border-right-thick"></td>
              <td colSpan="5" className="data-cell"></td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 6: RECORD BAR ON DISPATCH SHEET */}
        <table className="form-table">
          <tbody>
            <tr>
              <td colSpan="4" className="section-header">SECTION 6: RECORD BAR ON DISPATCH SHEET</td>
              <td colSpan="3">Date:</td>
              <td colSpan="2">Time:</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell"></td>
              <td colSpan="3" className="data-cell"></td>
              <td colSpan="2" className="data-cell"></td>
            </tr>
            <tr style={{height: '18px'}}>
              <td colSpan="4">PRINT NAME:</td>
              <td colSpan="3">Bar Details Entered on Despatch Sheet</td>
              <td colSpan="2" style={{textAlign: 'center'}}>YES / NO</td>
            </tr>
            <tr>
              <td colSpan="4" className="data-cell"></td>
              <td colSpan="5">SIGN NAME:</td>
            </tr>
            <tr>
              <td colSpan="4" className="empty-row"></td>
              <td colSpan="5" className="data-cell"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
