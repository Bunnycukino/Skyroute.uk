
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, AlertTriangle, Trash2, Filter } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function ShipmentLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  const isAdmin = user?.role === 'admin';

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date'),
    initialData: [],
  });

  const deleteShipmentMutation = useMutation({
    mutationFn: (id) => base44.entities.Shipment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Shipment.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });

  useEffect(() => {
    const checkExpiry = async () => {
      const now = new Date();
      shipments.forEach(shipment => {
        const createdDate = new Date(shipment.created_date);
        const hoursDiff = differenceInHours(now, createdDate);
        
        if (hoursDiff >= 48 && shipment.status !== 'EXPIRED' && shipment.status !== 'COMPLETED') {
          updateStatusMutation.mutate({ id: shipment.id, status: 'EXPIRED' });
        }
      });
    };

    // Only run expiry check for admins
    if (isAdmin) {
      const interval = setInterval(checkExpiry, 60000);
      checkExpiry();

      return () => clearInterval(interval);
    }
  }, [shipments, isAdmin]);

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.c209_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.c208_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.bar_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.flight_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.container_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.earmark_no?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const expiredCount = shipments.filter(s => s.status === 'EXPIRED').length;

  const downloadExcel = () => {
    const headers = [
      'C209 Number', 'EarmarkNo', 'Bar', 'Month Con', 'Bar Number', 'Pieces', 
      'Flight Number', 'Date', 'Container No', 'Signature', 'PCS', 
      'Fluid Number', 'Fluid Date', 'Status', 'Flight Number (Log)', 
      'Pieces (Log)', 'Date (Log)', 'Signature (Log)', 'C208'
    ];

    const rows = filteredShipments.map(s => [
      s.c209_number || '',
      s.earmark_no || '',
      s.bar || '',
      s.month_con || '',
      s.bar_number || '',
      s.pieces || '',
      s.flight_number || '',
      s.date ? format(new Date(s.date), 'dd/MM/yyyy') : '',
      s.container_no || s.ramp_container_code || '',
      s.signature || '',
      s.pcs || '',
      s.fluid_number || '',
      s.fluid_date ? format(new Date(s.fluid_date), 'dd/MM/yyyy HH:mm') : '',
      s.status || '',
      s.logistic_flight_number || '',
      s.logistic_pieces || '',
      s.logistic_date ? format(new Date(s.logistic_date), 'dd/MM/yyyy') : '',
      s.logistic_signature || '',
      s.c208_number || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => {
        // Escape commas and double quotes for CSV
        return row.map(field => {
          if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `C209_C208_LOG_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const bulkDelete = () => {
    selectedIds.forEach(id => deleteShipmentMutation.mutate(id));
    setSelectedIds([]);
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShipments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredShipments.map(s => s.id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">C209 + C208 LOG</h1>
            <p className="text-gray-600 text-sm">
              {isAdmin ? 'Główny rejestr wszystkich przesyłek' : 'Podgląd przesyłek (tylko do odczytu)'}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={bulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Usuń zaznaczone ({selectedIds.length})
              </Button>
            )}
            <Button onClick={downloadExcel} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Excel
            </Button>
          </div>
        </div>

        {/* Expired Alert */}
        {isAdmin && expiredCount > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    {expiredCount} przesyłek wygasło (ponad 48h)
                  </p>
                  <p className="text-sm text-red-700">Automatycznie oznaczone jako EXPIRED</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  shipments
                    .filter(s => s.status === 'EXPIRED')
                    .forEach(s => deleteShipmentMutation.mutate(s.id));
                }}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Usuń wszystkie wygasłe
              </Button>
            </CardContent>
          </Card>
        )}

        {!isAdmin && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-blue-800 text-sm">
                ℹ️ Jesteś zalogowany jako <strong>Ramp Agent</strong> - masz dostęp tylko do odczytu
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Szukaj: C209, C208, Bar Number, Flight, Container, Earmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">Wszystkie</TabsTrigger>
                  <TabsTrigger value="INBOUND">Inbound</TabsTrigger>
                  <TabsTrigger value="OUTBOUND">Outbound</TabsTrigger>
                  <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-600 hover:bg-blue-600">
                  {isAdmin && (
                    <TableHead className="text-white font-bold">
                      <Checkbox 
                        checked={selectedIds.length === filteredShipments.length && filteredShipments.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="border-white"
                      />
                    </TableHead>
                  )}
                  <TableHead className="text-white font-bold whitespace-nowrap">C209</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Flight Date</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Time</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Month-Year</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Bar Number</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Pieces</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Flight Number</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Signature</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">C208 Number</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Flight Date</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Time</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Month</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Flight Number</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Bar number</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Pieces</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Signature</TableHead>
                  <TableHead className="text-white font-bold whitespace-nowrap">Status</TableHead>
                  {isAdmin && (
                    <TableHead className="text-white font-bold whitespace-nowrap">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 19 : 17} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 19 : 17} className="text-center py-8 text-gray-500">
                      Brak przesyłek do wyświetlenia
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map((shipment) => (
                    <TableRow 
                      key={shipment.id}
                      className={`hover:bg-gray-50 ${
                        shipment.status === 'EXPIRED' ? 'bg-red-50' : ''
                      } ${selectedIds.includes(shipment.id) ? 'bg-blue-50' : ''}`}
                    >
                      {isAdmin && (
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.includes(shipment.id)}
                            onCheckedChange={() => toggleSelection(shipment.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono font-semibold text-blue-600">
                        {shipment.c209_number}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {shipment.date 
                          ? format(new Date(shipment.date), 'dd/MM/yyyy')
                          : shipment.created_date
                          ? format(new Date(shipment.created_date), 'dd/MM/yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {shipment.created_date 
                          ? format(new Date(shipment.created_date), 'HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm">
                        {shipment.month ? `${shipment.month}-${format(new Date(shipment.created_date), 'yy')}` : '-'}
                      </TableCell>
                      <TableCell className="text-sm">{shipment.bar_number || '-'}</TableCell>
                      <TableCell className="font-medium">{shipment.pieces || shipment.ramp_pieces || '-'}</TableCell>
                      <TableCell className="font-medium">{shipment.flight_number || shipment.ramp_flight || '-'}</TableCell>
                      <TableCell className="text-sm">{shipment.signature || shipment.ramp_signature || '-'}</TableCell>
                      <TableCell className="font-mono font-semibold text-purple-600">{shipment.c208_number}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {shipment.logistic_date 
                          ? format(new Date(shipment.logistic_date), 'dd/MM/yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {shipment.logistic_date 
                          ? format(new Date(shipment.logistic_date), 'HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-sm">
                        {shipment.logistic_date 
                          ? format(new Date(shipment.logistic_date), 'MMM-yy').toUpperCase()
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="font-medium">{shipment.logistic_flight_number || '-'}</TableCell>
                      <TableCell className="text-sm">{shipment.logistic_bar_number || '-'}</TableCell>
                      <TableCell className="font-medium">{shipment.logistic_pieces || '-'}</TableCell>
                      <TableCell className="text-sm">{shipment.logistic_signature || '-'}</TableCell>
                      <TableCell>
                        <Badge className={
                          shipment.status === 'INBOUND' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          shipment.status === 'OUTBOUND' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 
                          shipment.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border border-green-300' : 
                          shipment.status === 'EXPIRED' ? 'bg-red-100 text-red-800 border border-red-300' :
                          'bg-gray-100 text-gray-800 border border-gray-300' // Default for any unhandled status
                        }>
                          {shipment.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteShipmentMutation.mutate(shipment.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Wszystkie</p>
                <p className="text-2xl font-bold text-gray-900">{shipments.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Inbound</p>
                <p className="text-2xl font-bold text-blue-600">
                  {shipments.filter(s => s.status === 'INBOUND').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Outbound</p>
                <p className="text-2xl font-bold text-green-600">
                  {shipments.filter(s => s.status === 'OUTBOUND').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {expiredCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Dzisiaj</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {shipments.filter(s => {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    const shipmentDate = format(new Date(s.created_date), 'yyyy-MM-dd');
                    return today === shipmentDate;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
