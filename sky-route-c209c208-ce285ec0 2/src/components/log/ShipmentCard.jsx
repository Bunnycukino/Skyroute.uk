import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInHours } from "date-fns";
import { pl } from "date-fns/locale";
import { Package, Calendar, User, Hash, Trash2, Clock, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  "NEW BUILD": "bg-blue-100 text-blue-800 border-blue-200",
  "RW": "bg-purple-100 text-purple-800 border-purple-200",
  "COMPLETED": "bg-green-100 text-green-800 border-green-200",
  "EXPIRED": "bg-red-100 text-red-800 border-red-200",
};

export default function ShipmentCard({ shipment, onDelete, onStatusChange }) {
  const createdDate = new Date(shipment.created_date);
  const now = new Date();
  const hoursLeft = 48 - differenceInHours(now, createdDate);
  const isExpiringSoon = hoursLeft <= 6 && hoursLeft > 0;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Main Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-lg">{shipment.c209_number}</span>
                    <Badge className={statusColors[shipment.status] + " border"}>
                      {shipment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">C208: {shipment.c208_number}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    •••
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onStatusChange('NEW BUILD')}>
                    Status: NEW BUILD
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('RW')}>
                    Status: RW
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange('COMPLETED')}>
                    Status: COMPLETED
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Usuń
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Ramp Data */}
            {shipment.container_code && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">Dane Ramp</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-blue-600" />
                    <span className="text-gray-600">Kontener:</span>
                    <span className="font-medium">{shipment.container_code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-blue-600" />
                    <span className="text-gray-600">Sztuki:</span>
                    <span className="font-medium">{shipment.ramp_pieces}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span className="text-gray-600">Lot:</span>
                    <span className="font-medium">{shipment.ramp_flight_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-blue-600" />
                    <span className="text-gray-600">Operator:</span>
                    <span className="font-medium text-xs">{shipment.ramp_signature}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logistic Data */}
            {shipment.logistic_flight_number && (
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <h4 className="font-semibold text-green-900 text-sm mb-2">Dane Logistyczne</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-green-600" />
                    <span className="text-gray-600">Lot:</span>
                    <span className="font-medium">{shipment.logistic_flight_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-green-600" />
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium text-xs">
                      {shipment.logistic_date && format(new Date(shipment.logistic_date), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  {shipment.logistic_bar_number && (
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-green-600" />
                      <span className="text-gray-600">Bar:</span>
                      <span className="font-medium">{shipment.logistic_bar_number}</span>
                    </div>
                  )}
                  {shipment.logistic_pieces && (
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-green-600" />
                      <span className="text-gray-600">Sztuki:</span>
                      <span className="font-medium">{shipment.logistic_pieces}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 col-span-2">
                    <User className="w-3 h-3 text-green-600" />
                    <span className="text-gray-600">Operator:</span>
                    <span className="font-medium text-xs">{shipment.logistic_signature}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Info */}
          <div className="md:text-right">
            <p className="text-xs text-gray-500 mb-2">
              Utworzono: {format(createdDate, 'dd.MM.yyyy HH:mm', { locale: pl })}
            </p>
            {shipment.status !== 'EXPIRED' && shipment.status !== 'COMPLETED' && (
              <div className={`flex items-center gap-1 ${isExpiringSoon ? 'text-red-600' : 'text-gray-600'}`}>
                {isExpiringSoon && <AlertTriangle className="w-4 h-4" />}
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {hoursLeft > 0 ? `${hoursLeft}h pozostało` : 'Wygasła'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}