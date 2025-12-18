import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { getLogEntries, exportToCSV } from '@/lib/c209System';

export default function LogTable({ refreshTrigger }) {
  const [searchTerm, setSearchTerm] = useState('');
  const entries = getLogEntries();

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    
    const term = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.c209Number?.toLowerCase().includes(term) ||
      entry.c208Number?.toLowerCase().includes(term) ||
      entry.flight?.toLowerCase().includes(term) ||
      entry.barNumber?.toLowerCase().includes(term)
    );
  }, [entries, searchTerm, refreshTrigger]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>C209 + C208 LOG</CardTitle>
            <CardDescription>{entries.length} total entries</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by C209, C208, Flight, or Bar Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>C209</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Bar #</TableHead>
                <TableHead>Pieces</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Sign</TableHead>
                <TableHead>C208</TableHead>
                <TableHead>New Date</TableHead>
                <TableHead>New Flight</TableHead>
                <TableHead>New Sign</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    No entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.c209Number}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>{entry.barNumber}</TableCell>
                    <TableCell>{entry.pieces}</TableCell>
                    <TableCell>{entry.flight}</TableCell>
                    <TableCell>{entry.signature}</TableCell>
                    <TableCell className="font-medium">{entry.c208Number}</TableCell>
                    <TableCell>{entry.newDate}</TableCell>
                    <TableCell>{entry.newFlight}</TableCell>
                    <TableCell>{entry.newSignature}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}