import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, RefreshCw } from 'lucide-react';
import { exportToCSV } from '@/lib/c209System';

export default function LogTable({ refreshTrigger }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch entries from API
  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[LogTable] Fetching entries from /api/entries/list...');
      const response = await fetch('/api/entries/list');
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[LogTable] API response:', result);
      
      // Handle both array and object responses
      if (Array.isArray(result)) {
        setEntries(result);
        console.log(`[LogTable] Loaded ${result.length} entries (array format)`);
      } else if (result.success && Array.isArray(result.entries)) {
        setEntries(result.entries);
        console.log(`[LogTable] Loaded ${result.entries.length} entries (object format)`);
      } else {
        console.warn('[LogTable] Unexpected API response format:', result);
        setEntries([]);
      }
    } catch (err) {
      console.error('[LogTable] Error fetching entries:', err);
      setError(err.message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    fetchEntries();
  }, [refreshTrigger]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return entries;
    
    const term = searchTerm.toLowerCase();
    return entries.filter(entry => 
      entry.c209Number?.toLowerCase().includes(term) ||
      entry.c208Number?.toLowerCase().includes(term) ||
      entry.flightNumber?.toLowerCase().includes(term) ||
      entry.barNumber?.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>C209 + C208 LOG</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${entries.length} total entries`}
              {error && <span className="text-red-500 ml-2">Error: {error}</span>}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchEntries} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => exportToCSV(entries)} variant="outline" size="sm" disabled={entries.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by C209, C208, Flight, or Bar Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            disabled={loading}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>C209</TableHead>
                <TableHead>Container</TableHead>
                <TableHead>Pieces</TableHead>
                <TableHead>C208</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Bar #</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Loading entries...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-red-500">
                    Error loading entries: {error}
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    {searchTerm ? 'No entries match your search' : 'No entries found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.c209Number || '-'}</TableCell>
                    <TableCell>{entry.containerCode || '-'}</TableCell>
                    <TableCell>{entry.pieces || '-'}</TableCell>
                    <TableCell className="font-medium">{entry.c208Number || '-'}</TableCell>
                    <TableCell>{entry.flightNumber || '-'}</TableCell>
                    <TableCell>{entry.barNumber || '-'}</TableCell>
                    <TableCell>{entry.signature || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                        entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status || 'unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '-'}
                    </TableCell>
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