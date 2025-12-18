import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createRampEntry, checkExpiredC209Numbers } from '@/lib/c209System';

const rampSchema = z.object({
  containerCode: z.string().min(1, 'Container Code is required'),
  pieces: z.string().min(1, 'Pieces is required'),
  flight: z.string().optional(),
  signature: z.string().optional()
});

export default function RampInputForm({ onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(rampSchema)
  });

  const onSubmit = (data) => {
    try {
      const result = createRampEntry(data);
      
      if (result.success) {
        toast.success('RAMP data saved!', {
          description: `C209: ${result.c209Number}\nC208: Will be generated at LOGISTIC INPUT`
        });
        
        // Check for expired entries
        const expired = checkExpiredC209Numbers();
        if (expired.length > 0) {
          toast.warning('Expired C209 numbers', {
            description: `The following C209 numbers have expired: ${expired.join(', ')}`
          });
        }
        
        reset();
        if (onSuccess) onSuccess(result);
      }
    } catch (error) {
      toast.error('Error saving RAMP data', {
        description: error.message
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RAMP INPUT</CardTitle>
        <CardDescription>Create new C209 entry</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="containerCode">Container Code *</Label>
            <Input 
              id="containerCode" 
              {...register('containerCode')} 
              placeholder="Enter container code"
            />
            {errors.containerCode && (
              <p className="text-sm text-red-500">{errors.containerCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pieces">Pieces *</Label>
            <Input 
              id="pieces" 
              {...register('pieces')} 
              placeholder="Enter number of pieces"
            />
            {errors.pieces && (
              <p className="text-sm text-red-500">{errors.pieces.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="flight">Flight Number</Label>
            <Input 
              id="flight" 
              {...register('flight')} 
              placeholder="Enter flight number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Signature</Label>
            <Input 
              id="signature" 
              {...register('signature')} 
              placeholder="Enter your name"
            />
          </div>

          <Button type="submit" className="w-full">Create C209 Entry</Button>
        </form>
      </CardContent>
    </Card>
  );
}