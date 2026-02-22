'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function InBondControlSheetPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/entries?limit=1').then(res => {
      if (res.status === 401) router.push('/');
    });
  }, [router]);

  async function handleSignOut() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Wgraj plik PDF.');
      return;
    }

    try {
      setError(null);
      setUploading(true);
      setUrl(null);
      setFileName(file.name);

      const path = `public/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('in-bond-sheets')
        .upload(path, file, { upsert: false, contentType: 'application/pdf' });

      if (uploadError) {
        console.error(uploadError);
        setError('Upload nieudany: ' + uploadError.message);
        return;
      }

      const { data, error: urlError } = await supabase.storage
        .from('in-bond-sheets')
        .createSignedUrl(path, 60 * 60);

      if (urlError || !data?.signedUrl) {
        console.error(urlError);
        setError('Nie mogę utworzyć linku do podglądu.');
        return;
      }

      setUrl(data.signedUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">SR</div>
            <div>
              <h1 className="font-bold text-foreground text-sm">SkyRoute.uk</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">C209 System</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/ramp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>✈️</span> C209 Input ( Ramp Input )
          </Link>
          <Link href="/logistic" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📦</span> C208 Input ( Logistic Input )
          </Link>
          <Link href="/in-bond" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm">
            <span>📄</span> In Bond Control Sheet
          </Link>
          <Link href="/entries" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
            <span>📋</span> All Entries
          </Link>
          <div className="pt-4 mt-4 border-t border-border">
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-sm text-muted-foreground hover:text-destructive transition-colors w-full text-left">
              <span>🚪</span> Wyloguj
            </button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">In Bond Control Sheet</h1>
          <p className="text-muted-foreground">Wgraj plik PDF, aby go wyświetlić i udostępnić</p>
        </header>
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <h3 className="font-bold text-lg">Wgraj dokument PDF</h3>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-accent/30 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl mb-2">📄</span>
                <p className="text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : fileName ? fileName : 'Kliknij lub przeciągnij plik PDF tutaj'}
                </p>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {uploading && (
              <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg text-sm">
                Uploading...
              </div>
            )}
          </div>
        </div>
        {url && (
          <div className="mt-6 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <h3 className="font-bold">Podgląd: {fileName}</h3>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold hover:opacity-90">
                Otwórz w nowej karcie
              </a>
            </div>
            <div style={{ height: '75vh' }}>
              <iframe
                src={url}
                style={{ width: '100%', height: '100%' }}
                title="In Bond Control Sheet PDF"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
