
import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CheckNumbers() {
  const navigate = useNavigate();
  
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

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl("RampInput"));
    }
  }, [user, navigate]);

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentMonth = months[new Date().getMonth()];

  const getUsedNumbers = (type) => {
    return shipments
      .map(s => type === 'C209' ? s.c209_number : s.c208_number)
      .filter(num => num?.startsWith(currentMonth))
      .sort();
  };

  const getNextNumber = (type) => {
    const used = getUsedNumbers(type);
    if (used.length === 0) return `${currentMonth}0001`;
    
    const lastNum = parseInt(used[used.length - 1].substring(3));
    return `${currentMonth}${String(lastNum + 1).padStart(4, '0')}`;
  };

  const c209Used = getUsedNumbers('C209');
  const c208Used = getUsedNumbers('C208');

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sprawdź numery</h1>
          <p className="text-gray-600">Dostępne i użyte numery C209 i C208</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* C209 Numbers */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-6 h-6" />
                Numery C209
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-2">Następny dostępny numer:</p>
                  <p className="text-2xl font-bold text-green-900">{getNextNumber('C209')}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Użyte numery ({c209Used.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {c209Used.length === 0 ? (
                      <p className="text-gray-500 text-sm">Brak użytych numerów</p>
                    ) : (
                      c209Used.map((num, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-mono font-medium">{num}</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Użyty
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* C208 Numbers */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-6 h-6" />
                Numery C208
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-2">Następny dostępny numer:</p>
                  <p className="text-2xl font-bold text-green-900">{getNextNumber('C208')}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Użyte numery ({c208Used.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {c208Used.length === 0 ? (
                      <p className="text-gray-500 text-sm">Brak użytych numerów</p>
                    ) : (
                      c208Used.map((num, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-mono font-medium">{num}</span>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Użyty
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informacje o numeracji</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Format numerów: MMM0000 (np. JAN0001)</li>
            <li>• Aktualny miesiąc: <span className="font-semibold">{currentMonth}</span></li>
            <li>• Numeracja resetuje się co miesiąc</li>
            <li>• System automatycznie generuje kolejne numery</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
