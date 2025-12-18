import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RampInputForm from '@/components/RampInputForm';
import LogisticInputForm from '@/components/LogisticInputForm';
import LogTable from '@/components/LogTable';
import { Plane, Package, FileText } from 'lucide-react';

export default function C209System() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">C209/C208 Management System</h1>
        <p className="text-muted-foreground">
          Complete cargo documentation and tracking system for Emirates SkyRoute
        </p>
      </div>

      <Tabs defaultValue="input" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="input" className="gap-2">
            <Package className="h-4 w-4" />
            Input Forms
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-2">
            <FileText className="h-4 w-4" />
            View Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <RampInputForm onSuccess={handleSuccess} />
            <LogisticInputForm onSuccess={handleSuccess} />
          </div>
        </TabsContent>

        <TabsContent value="log">
          <LogTable refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
}