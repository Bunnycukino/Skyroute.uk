import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function ExpiredAlert({ count, onCleanup }) {
  return (
    <Alert className="bg-red-50 border-red-200">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-red-900">
            Uwaga! {count} {count === 1 ? 'przesyłka wygasła' : 'przesyłek wygasło'}
          </span>
          <p className="text-sm text-red-700 mt-1">
            Przesyłki starsze niż 48 godzin zostały automatycznie oznaczone jako wygasłe
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCleanup}
          className="border-red-300 text-red-700 hover:bg-red-100 ml-4"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Usuń wygasłe
        </Button>
      </AlertDescription>
    </Alert>
  );
}