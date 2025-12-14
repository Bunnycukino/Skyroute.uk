# SkyRoute UK

Aplikacja do zarządzania lotami bazująca na Base44.

## 🚀 Deployment na Vercel

### Automatyczne wdrożenie

1. Połącz repozytorium z Vercel:
   - Zaloguj się na [vercel.com](https://vercel.com)
   - Kliknij "Add New Project"
   - Importuj to repozytorium GitHub
   - Vercel automatycznie wykryje framework Vite

2. Konfiguracja domeny:
   - W ustawieniach projektu Vercel, przejdź do "Domains"
   - Dodaj domenę `skyroute.uk`
   - Postępuj zgodnie z instrukcjami Vercel dla konfiguracji DNS

### ⚠️ WAŻNE - Dokończenie migracji

Aby aplikacja działała, musisz przenieść zawartość z `src/base44` do głównego katalogu:

```bash
# Sklonuj repozytorium lokalnie
git clone https://github.com/Bunnycukino/skyroute.uk.git
cd skyroute.uk

# Skopiuj pliki źródłowe
cp -r src/base44/src ./src
cp -r src/base44/components.json ./
cp -r src/base44/jsconfig.json ./
cp -r src/base44/eslint.config.js ./

# Usuń stary katalog
rm -rf src/base44

# Commit i push
git add .
git commit -m "Complete migration to root structure"
git push origin main
```

## 📦 Lokalne uruchomienie

```bash
# Zainstaluj zależności
npm install

# Uruchom serwer deweloperski
npm run dev

# Build produkcyjny
npm run build

# Podgląd builda
npm run preview
```

## 🛠️ Technologie

- React 18
- Vite
- Tailwind CSS
- Radix UI
- Base44 SDK
- React Router v7

## 📝 Struktura projektu

```
skyroute.uk/
├── src/
│   ├── components/    # Komponenty UI
│   ├── pages/        # Strony aplikacji
│   ├── lib/          # Biblioteki pomocnicze
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Funkcje pomocnicze
│   ├── api/          # API handlers
│   ├── App.jsx       # Główny komponent
│   ├── main.jsx      # Entry point
│   └── index.css     # Style globalne
├── public/           # Statyczne pliki
├── index.html        # HTML template
├── package.json      # Zależności
├── vite.config.js    # Konfiguracja Vite
└── tailwind.config.js # Konfiguracja Tailwind
```

## 🔧 Konfiguracja DNS dla skyroute.uk

W panelu zarządzania domeną dodaj następujące rekordy:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 📞 Wsparcie

W razie problemów, sprawdź logi na Vercel dashboard lub otwórz issue w tym repozytorium.
