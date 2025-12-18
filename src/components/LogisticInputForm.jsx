import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createLogisticEntry, getAvailableC209List } from '@/lib/c209System';

const logisticSchema = z.object({
  c209Number: z.string().min(1, 'C209 Number is required'),
  flight: z.string().min(1, 'Flight Number is required'),
  signature: z.string().min(1, 'Signature is required'),
  date: z.string().optional(),
  barNumber: z.string().optional(),
  pieces: z.string().optional()
});

export default function LogisticInputForm({ onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(logisticSchema)
  });

  const onSubmit = (data) => {
    try {
      const result = createLogisticEntry(data);
      
      if (result.success) {
        const isNewBuild = result.c209Number === 'NEW BUILD';
        
        toast.success(isNewBuild ? 'NEW BUILD entry created!' : 'LOGISTIC data saved!', {
          description: `C209: ${result.c209Number}\nC208: ${result.c208Number}\nFlight: ${data.flight}`
        });
        
        reset();
        if (onSuccess) onSuccess(result);
      } else {
        toast.error('Error', {
          description: result.error
        });
      }
    } catch (error) {
      toast.error('Error saving LOGISTIC data', {
        description: error.message
      });
    }
  };

  const showAvailable = () => {
    const available = getAvailableC209List();
    toast.info('Available C209 Numbers', {
      description: available.length > 0 ? available.join(', ') : 'No available C209 numbers'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LOGISTIC INPUT</CardTitle>
        <CardDescription>Generate C208 and complete entry</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="c209Number">C209 Number *</Label>
              <Button type="button" variant="outline" size="sm" onClick={showAvailable}>
                Show Available
              </Button>
            </div>
            <Input 
              id="c209Number" 
              {...register('c209Number')} 
              placeholder="Enter C209 or type 'NEW BUILD'"
            />
            {errors.c209Number && (
              <p className="text-sm text-red-500">{errors.c209Number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="flight">Flight Number *</Label>
            <Input 
              id="flight" 
              {...register('flight')} 
              placeholder="Enter flight number"
            />
            {errors.flight && (
              <p className="text-sm text-red-500">{errors.flight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Signature *</Label>
            <Input 
              id="signature" 
              {...register('signature')} 
              placeholder="Enter your name"
            />
            {errors.signature && (
              <p className="text-sm text-red-500">{errors.signature.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Flight Date</Label>
            <Input 
              id="date" 
              type="date"
              {...register('date')} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barNumber">Bar Number</Label>
            <Input 
              id="barNumber" 
              {...register('barNumber')} 
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pieces">Pieces</Label>
            <Input 
              id="pieces" 
              {...register('pieces')} 
              placeholder="Optional"
            />
          </div>

          <Button type="submit" className="w-full">Generate C208 & Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}