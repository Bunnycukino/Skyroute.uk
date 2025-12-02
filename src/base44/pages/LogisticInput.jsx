
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, CheckCircle, AlertCircle, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LogisticInput() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    c209_number: "",
    flight_number: "",
    flight_date: "",
    bar_number: "",
    signature: "",
    pieces: "",
  });
  const [foundShipment, setFoundShipment] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: Infinity,
  });

  const { data: shipments = [] } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list(),
    initialData: [],
  });

  const updateShipmentMutation = useMutation({
    mutationFn: async (data) => {
      const hasRWPrefix = data.flight_number.toUpperCase().startsWith('RW');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const currentMonth = months[new Date().getMonth()];
      
      if (foundShipment.is_new_build) {
        const c208Number = hasRWPrefix ? 'RW' : generateNumber('C208');
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 48);

        return base44.entities.Shipment.create({
          c209_number: 'NEW BUILD',
          c208_number: c208Number,
          month: currentMonth,
          logistic_flight_number: data.flight_number,
          logistic_date: data.flight_date,
          logistic_bar_number: data.bar_number,
          logistic_signature: data.signature,
          logistic_pieces: data.pieces ? parseInt(data.pieces, 10) : 0,
          pieces: data.pieces ? parseInt(data.pieces, 10) : 0,
          status: 'OUTBOUND', // Changed from 'NEW BUILD'
          expiry_date: expiryDate.toISOString(),
          fluid_date: new Date().toISOString(),
          is_complete: false,
        });
      }
      
      const c208Display = hasRWPrefix ? 'RW' : foundShipment.c208_number;
      
      return base44.entities.Shipment.update(foundShipment.id, {
        c208_number: c208Display,
        logistic_flight_number: data.flight_number,
        logistic_date: data.flight_date,
        logistic_bar_number: data.bar_number,
        logistic_signature: data.signature,
        logistic_pieces: data.pieces ? parseInt(data.pieces, 10) : foundShipment.ramp_pieces,
        bar_number: foundShipment.bar_number || data.bar_number,
        is_complete: true,
        status: 'OUTBOUND', // Changed from hasRWPrefix ? 'RW' : 'COMPLETED'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setSuccess("✓ Dane logistyczne zaktualizowane!");
      setTimeout(() => {
        navigate(createPageUrl("ShipmentLog"));
      }, 2000);
    },
    onError: (error) => {
      console.error("Update error:", error);
      setError("✗ Błąd podczas aktualizacji: " + (error.message || "Spróbuj ponownie."));
    },
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl("RampInput"));
    }
  }, [user, navigate]);

  const generateNumber = (prefix) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const currentMonth = months[new Date().getMonth()];
    
    const existingNumbers = shipments
      .map(s => prefix === 'C209' ? s.c209_number : s.c208_number)
      .filter(num => num?.startsWith(currentMonth))
      .map(num => parseInt(num.substring(3)))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${currentMonth}${String(nextNumber).padStart(4, '0')}`;
  };

  const findShipment = () => {
    setError("");
    setFoundShipment(null);
    
    if (!formData.c209_number) {
      setError("Wprowadź numer C209 lub 'NEW BUILD'");
      return;
    }

    if (formData.c209_number.toUpperCase() === "NEW BUILD") {
      setFoundShipment({ is_new_build: true });
      setSuccess("✓ Tryb NEW BUILD - wprowadź pozostałe dane");
      return;
    }

    const shipment = shipments.find(s => s.c209_number === formData.c209_number.toUpperCase());
    if (shipment) {
      setFoundShipment(shipment);
      setSuccess(`✓ Znaleziono przesyłkę: ${shipment.c209_number}`);
      setFormData(prev => ({
        ...prev,
        pieces: shipment.ramp_pieces ? String(shipment.ramp_pieces) : "",
      }));
    } else {
      setError(`✗ Nie znaleziono przesyłki z numerem ${formData.c209_number}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!foundShipment) {
      setError("Najpierw znajdź przesyłkę C209 lub wpisz 'NEW BUILD'");
      return;
    }

    if (!formData.flight_number || !formData.flight_date || !formData.signature || !formData.pieces) {
      setError("Wypełnij wszystkie wymagane pola");
      return;
    }

    updateShipmentMutation.mutate(formData);
  };

  const handleClear = () => {
    setFormData({
      c209_number: "",
      flight_number: "",
      flight_date: "",
      bar_number: "",
      signature: "",
      pieces: "",
    });
    setFoundShipment(null);
    setError("");
    setSuccess("");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LOGISTIC INPUT</h1>
          <p className="text-gray-600">Uzupełnij dane logistyczne</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Find C209 Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-6 h-6" />
              Wyszukaj C209
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c209_number" className="text-base font-semibold">
                  C209 Number lub "NEW BUILD" *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="c209_number"
                    placeholder="np. JAN0001 lub NEW BUILD"
                    value={formData.c209_number}
                    onChange={(e) => setFormData({...formData, c209_number: e.target.value.toUpperCase()})}
                    className="text-lg h-12 flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && findShipment()}
                  />
                  <Button
                    type="button"
                    onClick={findShipment}
                    className="bg-green-600 hover:bg-green-700 h-12 px-6"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Szukaj
                  </Button>
                </div>
              </div>

              {foundShipment && !foundShipment.is_new_build && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-900 mb-3">Znaleziona przesyłka:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 bg-white rounded">
                        <span className="text-green-700 font-medium">C209:</span>
                        <p className="font-mono font-bold">{foundShipment.c209_number}</p>
                      </div>
                      <div className="p-2 bg-white rounded">
                        <span className="text-green-700 font-medium">C208:</span>
                        <p className="font-mono font-bold">{foundShipment.c208_number}</p>
                      </div>
                      <div className="p-2 bg-white rounded">
                        <span className="text-green-700 font-medium">Container:</span>
                        <p className="font-bold">{foundShipment.container_code || foundShipment.ramp_container_code}</p>
                      </div>
                      <div className="p-2 bg-white rounded">
                        <span className="text-green-700 font-medium">Pieces:</span>
                        <p className="font-bold">{foundShipment.ramp_pieces}</p>
                      </div>
                      <div className="p-2 bg-white rounded col-span-2">
                        <span className="text-green-700 font-medium">Status:</span>
                        <p className="font-bold">{foundShipment.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {foundShipment && foundShipment.is_new_build && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📝 Tryb NEW BUILD</h4>
                    <p className="text-sm text-blue-800">Utworzysz nową przesyłkę z C209 = "NEW BUILD"</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logistic Form */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-6 h-6" />
              Dane logistyczne
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="flight_number" className="text-base font-semibold">
                  Flight Number *
                </Label>
                <Input
                  id="flight_number"
                  placeholder="Numer lotu (np. RW123 dla RW prefix)"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({...formData, flight_number: e.target.value.toUpperCase()})}
                  disabled={!foundShipment}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight_date" className="text-base font-semibold">
                  Flight Date *
                </Label>
                <Input
                  id="flight_date"
                  type="date"
                  value={formData.flight_date}
                  onChange={(e) => setFormData({...formData, flight_date: e.target.value})}
                  disabled={!foundShipment}
                  className="text-lg h-12"
                />
              </div>

              {/* New Bar Number Input */}
              <div className="space-y-2">
                <Label htmlFor="bar_number" className="text-base font-semibold">
                  Bar Number
                </Label>
                <Input
                  id="bar_number"
                  placeholder="Numer baru"
                  value={formData.bar_number}
                  onChange={(e) => setFormData({...formData, bar_number: e.target.value.toUpperCase()})}
                  disabled={!foundShipment}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pieces" className="text-base font-semibold">
                  Pieces *
                </Label>
                <Input
                  id="pieces"
                  type="number"
                  placeholder="Liczba sztuk"
                  value={formData.pieces}
                  onChange={(e) => setFormData({...formData, pieces: e.target.value})}
                  disabled={!foundShipment}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature" className="text-base font-semibold">
                  Signature *
                </Label>
                <Input
                  id="signature"
                  placeholder="Twój podpis"
                  value={formData.signature}
                  onChange={(e) => setFormData({...formData, signature: e.target.value})}
                  disabled={!foundShipment}
                  className="text-lg h-12"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 h-12"
                  disabled={updateShipmentMutation.isPending}
                >
                  Wyczyść
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-lg"
                  disabled={!foundShipment || updateShipmentMutation.isPending}
                >
                  {updateShipmentMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Instrukcje i zasady specjalne</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Wprowadź numer C209 lub wpisz "NEW BUILD" i kliknij "Szukaj"</li>
              <li>2. Wypełnij dane logistyczne (w tym liczbę sztuk)</li>
              <li>3. <strong>ZASADA NEW BUILD:</strong> Wpisanie "NEW BUILD" w C209 utworzy wpis z C209 = "NEW BUILD" i statusem "OUTBOUND"</li>
              <li>4. <strong>ZASADA RW:</strong> Jeśli Flight Number zaczyna się od "RW", C208 będzie pokazywał "RW"</li>
              <li>5. Kliknij "Submit" aby zapisać</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
