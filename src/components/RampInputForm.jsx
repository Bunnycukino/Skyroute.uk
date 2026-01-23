import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createEntry, generateC209Number } from '@/lib/neonApi';
import { useRef, useState } from 'react';
import InBondForm from './InBondForm';
import { useReactToPrint } from 'react-to-print';
import { Printer, Loader2 } from 'lucide-react';

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
  const [lastEntry, setLastEntry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `InBond_C209_${lastEntry?.c209Number || 'Form'}`,
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log('[RampInputForm] Submitting data:', data);
      
      // Generate C209 number
      const c209Number = await generateC209Number();
      console.log('[RampInputForm] Generated C209:', c209Number);
      
      // Create entry in Neon database
      const entryData = {
        c209Number,
        containerCode: data.containerCode,
        pieces: parseInt(data.pieces) || 0,
        flightNumber: data.flight || '',
        signature: data.signature || '',
        status: 'pending'
      };
      
      const result = await createEntry(entryData);
      console.log('[RampInputForm] API result:', result);
      
      if (result.success) {
        setLastEntry({ ...data, c209Number });
        
        toast.success('RAMP data saved!', {
          description: `C209: ${c209Number}\nStatus: Pending C208`,
          action: {
            label: 'Print Form',
            onClick: () => setTimeout(handlePrint, 100)
          }
        });
        
        reset();
        if (onSuccess) onSuccess({ ...result, c209Number });
      } else {
        throw new Error(result.error || 'Failed to save entry');
      }
    } catch (error) {
      console.error('[RampInputForm] Error:', error);
      toast.error('Error saving RAMP data', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>RAMP INPUT</CardTitle>
          <CardDescription>Create new C209 entry in Neon database</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="containerCode">Container Code *</Label>
              <Input 
                id="containerCode" 
                {...register('containerCode')} 
                placeholder="Enter container code"
                disabled={isSubmitting}
              />
              {errors.containerCode && (
                <p className="text-sm text-red-500">{errors.containerCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pieces">Pieces *</Label>
              <Input 
                id="pieces" 
                type="number"
                {...register('pieces')} 
                placeholder="Enter number of pieces"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Signature</Label>
              <Input 
                id="signature" 
                {...register('signature')} 
                placeholder="Enter your name"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Create C209 Entry'
                )}
              </Button>
              {lastEntry && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Printer className="h-4 w-4" />
                  Print Form
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Hidden print component */}
      <div className="hidden">
        <InBondForm ref={printRef} data={lastEntry} />
      </div>
    </>
  );
}