
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Loader2, Clipboard, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const AIRLINES = [
  { name: "TUI", barPrefix: "TA", flightPrefix: "TOM" },
  { name: "RYANAIR", barPrefix: "RYR", flightPrefix: "FR" },
  { name: "EASYJET", barPrefix: "EZ", flightPrefix: "EZY" },
  { name: "SINGAPORE", barPrefix: "POLY", flightPrefix: "SQ" },
  { name: "EMIRATES", barPrefix: "EK", flightPrefix: "EK" },
];

export default function RampInput() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    container_code: "",
    pieces: "",
    flight_number: "",
    signature: "",
    airline: "",
  });
  const [generatedNumbers, setGeneratedNumbers] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: shipments = [] } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => base44.entities.Shipment.list(),
    initialData: [],
  });

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

  const createShipmentMutation = useMutation({
    mutationFn: async (data) => {
      const c209Number = generateNumber('C209');
      const c208Number = generateNumber('C208');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const currentMonth = months[new Date().getMonth()];
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 48);

      return base44.entities.Shipment.create({
        c209_number: c209Number,
        c208_number: c208Number,
        month: currentMonth,
        month_con: currentMonth,
        bar_number: data.container_code,
        container_no: data.container_code,
        ramp_container_code: data.container_code,
        pieces: parseInt(data.pieces),
        ramp_pieces: parseInt(data.pieces),
        pcs: parseInt(data.pieces),
        flight_number: data.flight_number,
        ramp_flight: data.flight_number,
        signature: data.signature,
        ramp_signature: data.signature,
        airline: data.airline,
        date: new Date().toISOString().split('T')[0],
        status: 'INBOUND',
        expiry_date: expiryDate.toISOString(),
        fluid_date: new Date().toISOString(),
        fluid_number: c209Number,
        is_complete: false,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setGeneratedNumbers({
        c209: data.c209_number,
        c208: data.c208_number
      });
      setSuccess(`Przesyłka utworzona pomyślnie!`);
      setFormData({
        container_code: "",
        pieces: "",
        flight_number: "",
        signature: "",
        airline: "",
      });
    },
    onError: () => {
      setError("Błąd podczas tworzenia przesyłki. Spróbuj ponownie.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGeneratedNumbers(null);

    if (!formData.container_code || !formData.pieces || !formData.flight_number || !formData.signature) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    if (parseInt(formData.pieces) <= 0) {
      setError("Liczba sztuk musi być większa od 0");
      return;
    }

    createShipmentMutation.mutate(formData);
  };

  const handleClear = () => {
    setFormData({
      container_code: "",
      pieces: "",
      flight_number: "",
      signature: "",
      airline: "",
    });
    setError("");
    setSuccess("");
    setGeneratedNumbers(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RAMP INPUT</h1>
          <p className="text-gray-600">Wprowadź początkowe dane przesyłki</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && generatedNumbers && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900 mb-3">{success}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">C209 Number</p>
                        <p className="font-mono font-bold text-lg text-gray-900">
                          {generatedNumbers.c209}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedNumbers.c209)}
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">C208 Number</p>
                        <p className="font-mono font-bold text-lg text-gray-900">
                          {generatedNumbers.c208}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedNumbers.c208)}
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("ShipmentLog"))}
                >
                  Zobacz w logu
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(createPageUrl("InBondForm"))}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Drukuj formularz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Formularz Ramp
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="airline" className="text-base font-semibold">
                  Airline
                </Label>
                <select
                  id="airline"
                  value={formData.airline}
                  onChange={(e) => setFormData({...formData, airline: e.target.value})}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Wybierz linię lotniczą</option>
                  {AIRLINES.map((airline) => (
                    <option key={airline.name} value={airline.name}>
                      {airline.name} ({airline.barPrefix}/{airline.flightPrefix})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="container_code" className="text-base font-semibold">
                  Container Code / Bar Number *
                </Label>
                <Input
                  id="container_code"
                  placeholder="Wpisz kod kontenera"
                  value={formData.container_code}
                  onChange={(e) => setFormData({...formData, container_code: e.target.value.toUpperCase()})}
                  className="text-lg h-12"
                />
                <p className="text-xs text-gray-500">Ten sam numer jest używany jako Container Code i Bar Number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pieces" className="text-base font-semibold">
                  Pieces *
                </Label>
                <Input
                  id="pieces"
                  type="number"
                  min="1"
                  placeholder="Liczba sztuk"
                  value={formData.pieces}
                  onChange={(e) => setFormData({...formData, pieces: e.target.value})}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight_number" className="text-base font-semibold">
                  Flight Number *
                </Label>
                <Input
                  id="flight_number"
                  placeholder="Numer lotu"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({...formData, flight_number: e.target.value.toUpperCase()})}
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
                  className="text-lg h-12"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 h-12"
                  disabled={createShipmentMutation.isPending}
                >
                  Wyczyść
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-lg"
                  disabled={createShipmentMutation.isPending}
                >
                  {createShipmentMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Tworzenie...
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
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informacje</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Numery C209 i C208 będą wygenerowane automatycznie</li>
              <li>• Format: MMM0000 (np. JAN0001, JAN0002...)</li>
              <li>• Container Code = Bar Number</li>
              <li>• Przesyłka wygaśnie po 48 godzinach</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
