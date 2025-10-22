import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ReallocationRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchC209, setSearchC209] = useState("");
  const [foundShipment, setFoundShipment] = useState(null);
  const [formData, setFormData] = useState({
    new_flight_number: "",
    new_flight_date: "",
    new_destination: "",
    new_c208: "",
    new_base: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list('-created_date'),
    initialData: [],
  });

  const { data: reallocated = [] } = useQuery({
    queryKey: ['reallocated-shipments'],
    queryFn: () => base44.entities.Shipment.filter({ reallocated: true }, '-reallocation_date', 50),
    initialData: [],
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl("RampInput"));
    }
  }, [user, navigate]);

  const reallocateMutation = useMutation({
    mutationFn: (data) => base44.entities.Shipment.update(foundShipment.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['reallocated-shipments'] });
      setSuccess("✓ Przesyłka została przeniesiona!");
      setFoundShipment(null);
      setSearchC209("");
      setFormData({
        new_flight_number: "",
        new_flight_date: "",
        new_destination: "",
        new_c208: "",
        new_base: "",
      });
    },
    onError: () => {
      setError("✗ Błąd podczas przenoszenia przesyłki");
    },
  });

  const findShipment = () => {
    setError("");
    setFoundShipment(null);
    setSuccess("");
    
    if (!searchC209) {
      setError("Wprowadź numer C209");
      return;
    }

    const shipment = shipments.find(s => s.c209_number === searchC209.toUpperCase());
    if (shipment) {
      setFoundShipment(shipment);
    } else {
      setError(`✗ Nie znaleziono przesyłki z numerem ${searchC209}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!foundShipment) {
      setError("Najpierw znajdź przesyłkę");
      return;
    }

    if (!formData.new_flight_number || !formData.new_flight_date) {
      setError("Wypełnij przynajmniej Flight Number i Flight Date");
      return;
    }

    reallocateMutation.mutate({
      ...formData,
      reallocated: true,
      reallocation_date: new Date().toISOString(),
    });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">REALLOCATION REGISTER</h1>
          <p className="text-gray-600">Przenoś przesyłki na nowe loty</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-6 h-6" />
              Wyszukaj przesyłkę do przeniesienia
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                placeholder="Wprowadź C209 Number"
                value={searchC209}
                onChange={(e) => setSearchC209(e.target.value.toUpperCase())}
                className="text-lg h-12 flex-1"
                onKeyPress={(e) => e.key === 'Enter' && findShipment()}
              />
              <Button
                onClick={findShipment}
                className="bg-green-600 hover:bg-green-700 h-12 px-6"
              >
                <Search className="w-5 h-5 mr-2" />
                Szukaj
              </Button>
            </div>

            {foundShipment && (
              <Card className="mt-4 bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-900 mb-3">Oryginalne dane przesyłki:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">C209:</span>
                      <p className="font-mono font-bold">{foundShipment.c209_number}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">C208:</span>
                      <p className="font-mono font-bold">{foundShipment.c208_number}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">Flight:</span>
                      <p className="font-bold">{foundShipment.flight_number || foundShipment.logistic_flight_number}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">Date:</span>
                      <p className="font-bold">
                        {foundShipment.date ? format(new Date(foundShipment.date), 'dd/MM/yyyy') : 
                         foundShipment.logistic_date ? format(new Date(foundShipment.logistic_date), 'dd/MM/yyyy') : '-'}
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">Destination:</span>
                      <p className="font-bold">{foundShipment.destination || '-'}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">Bar:</span>
                      <p className="font-bold">{foundShipment.bar_number || foundShipment.ramp_container_code}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">Base:</span>
                      <p className="font-bold">{foundShipment.base || '-'}</p>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <span className="text-green-700 font-medium">Status:</span>
                      <p className="font-bold">{foundShipment.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Reallocation Form */}
        {foundShipment && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle>Nowe dane lotu</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new_flight_number" className="text-base font-semibold">
                      Flight Number *
                    </Label>
                    <Input
                      id="new_flight_number"
                      placeholder="Nowy numer lotu"
                      value={formData.new_flight_number}
                      onChange={(e) => setFormData({...formData, new_flight_number: e.target.value.toUpperCase()})}
                      className="text-lg h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_flight_date" className="text-base font-semibold">
                      Flight Date *
                    </Label>
                    <Input
                      id="new_flight_date"
                      type="date"
                      value={formData.new_flight_date}
                      onChange={(e) => setFormData({...formData, new_flight_date: e.target.value})}
                      className="text-lg h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_destination" className="text-base font-semibold">
                      Destination
                    </Label>
                    <Input
                      id="new_destination"
                      placeholder="Nowy cel"
                      value={formData.new_destination}
                      onChange={(e) => setFormData({...formData, new_destination: e.target.value.toUpperCase()})}
                      className="text-lg h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_c208" className="text-base font-semibold">
                      New C208 (if required)
                    </Label>
                    <Input
                      id="new_c208"
                      placeholder="Nowy C208"
                      value={formData.new_c208}
                      onChange={(e) => setFormData({...formData, new_c208: e.target.value.toUpperCase()})}
                      className="text-lg h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_base" className="text-base font-semibold">
                      Base
                    </Label>
                    <Input
                      id="new_base"
                      placeholder="Nowa baza"
                      value={formData.new_base}
                      onChange={(e) => setFormData({...formData, new_base: e.target.value.toUpperCase()})}
                      className="text-lg h-12"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFoundShipment(null);
                      setSearchC209("");
                      setFormData({
                        new_flight_number: "",
                        new_flight_date: "",
                        new_destination: "",
                        new_c208: "",
                        new_base: "",
                      });
                    }}
                    className="flex-1 h-12"
                    disabled={reallocateMutation.isPending}
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-lg"
                    disabled={reallocateMutation.isPending}
                  >
                    {reallocateMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Przeношę...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Przenieś przesyłkę
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center justify-between">
              <span>Historia przeniesień</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['reallocated-shipments'] })}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Odśwież
              </Button>
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-bold">Bar Number</TableHead>
                  <TableHead className="font-bold">C209</TableHead>
                  <TableHead className="font-bold">Original Flight</TableHead>
                  <TableHead className="font-bold">Original Date</TableHead>
                  <TableHead className="font-bold">Destination</TableHead>
                  <TableHead className="font-bold">C208</TableHead>
                  <TableHead className="font-bold">New Flight</TableHead>
                  <TableHead className="font-bold">New Date</TableHead>
                  <TableHead className="font-bold">New Destination</TableHead>
                  <TableHead className="font-bold">New C208</TableHead>
                  <TableHead className="font-bold">Reallocated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : reallocated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      Brak przeniesionych przesyłek
                    </TableCell>
                  </TableRow>
                ) : (
                  reallocated.map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{shipment.bar_number || shipment.ramp_container_code}</TableCell>
                      <TableCell className="font-mono font-semibold text-blue-600">{shipment.c209_number}</TableCell>
                      <TableCell>{shipment.flight_number || shipment.logistic_flight_number}</TableCell>
                      <TableCell className="text-sm">
                        {shipment.date ? format(new Date(shipment.date), 'dd/MM/yyyy') : 
                         shipment.logistic_date ? format(new Date(shipment.logistic_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{shipment.destination || '-'}</TableCell>
                      <TableCell className="font-mono">{shipment.c208_number}</TableCell>
                      <TableCell className="font-medium text-green-600">{shipment.new_flight_number || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {shipment.new_flight_date ? format(new Date(shipment.new_flight_date), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>{shipment.new_destination || '-'}</TableCell>
                      <TableCell className="font-mono">{shipment.new_c208 || '-'}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          {shipment.reallocation_date ? format(new Date(shipment.reallocation_date), 'dd/MM HH:mm') : 'Yes'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}