# 🚀 Deployment Guide - SkyRoute UK

## Status Aktu alny

✅ Pliki konfiguracyjne przeniesione  
✅ Struktura główna utworzona  
⏳ Pliki źródłowe wymagają dokończenia migracji

## Szybki Start

### Opcja 1: Automatyczna Migracja (Zalecane)

```bash
# Sklonuj repozytorium
git clone https://github.com/Bunnycukino/skyroute.uk.git
cd skyroute.uk

# Uruchom skrypt migracji
chmod +x migrate-files.sh
./migrate-files.sh

# Zainstaluj zależności i przetestuj
npm install
npm run dev

# Commit i push
git add .
git commit -m "Complete migration to root structure"
git push origin main
```

### Opcja 2: Ręczna Migracja

```bash
# Sklonuj repozytorium
git clone https://github.com/Bunnycukino/skyroute.uk.git
cd skyroute.uk

# Skopiuj wszystkie pliki stron
cp src/base44/pages/*.jsx src/pages/

# Skopiuj komponenty
cp -r src/base44/components/* src/components/

# Skopiuj biblioteki
cp -r src/base44/lib/* src/lib/

# Skopiuj hooks
cp -r src/base44/hooks/* src/hooks/

# Skopiuj utils
cp -r src/base44/utils/* src/utils/

# Skopiuj API
cp -r src/base44/api/* src/api/

# Skopiuj eslint config
cp src/base44/eslint.config.js .

# Usuń stary katalog
rm -rf src/base44

# Zainstaluj i przetestuj
npm install
npm run dev

# Commit i push
git add .
git commit -m "Complete migration to root structure"
git push origin main
```

## Konfiguracja Vercel

### 1. Połącz Repozytorium

1. Zaloguj się na [vercel.com](https://vercel.com)
2. Kliknij "Add New Project"
3. Importuj repozytorium `Bunnycukino/skyroute.uk`
4. Vercel automatycznie wykryje Vite
5. Kliknij "Deploy"

### 2. Konfiguracja Domeny

1. W dashboardzie projektu, przejdź do **Settings → Domains**
2. Dodaj domenę: `skyroute.uk`
3. Dodaj również: `www.skyroute.uk`
4. Vercel poda Ci adresy DNS do skonfigurowania

### 3. Konfiguracja DNS

W panelu zarządzania domeną `skyroute.uk`, dodaj następujące rekordy:

```
Typ: A
Host: @
Wartość: 76.76.21.21
TTL: 3600

Typ: CNAME
Host: www
Wartość: cname.vercel-dns.com
TTL: 3600
```

**Uwaga:** Propagacja DNS może potrwać od 5 minut do 48 godzin.

## Weryfikacja Deployment

### Sprawdź status buildu

```bash
# Po pushu sprawdź logi w Vercel Dashboard
# Lub użyj Vercel CLI
npx vercel --prod
```

### Test lokalny przed pushem

```bash
# Zainstaluj zależności
npm install

# Development
npm run dev
# Otwórz http://localhost:5173

# Build produkcyjny
npm run build

# Preview buildu
npm run preview
```

## Rozwiązywanie Problemów

### Problem: "Module not found"

```bash
# Sprawdź czy wszystkie pliki zostały skopiowane
ls -la src/

# Reinstaluj zależności
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Build failed on Vercel"

1. Sprawdź logi w Vercel Dashboard
2. Upewnij się że wszystkie pliki zostały spushowane:
   ```bash
   git status
   git add .
   git commit -m "Fix missing files"
   git push
   ```

### Problem: "Strona nie ładuje się"

1. Sprawdź console w przeglądarce (F12)
2. Sprawdź czy wszystkie komponenty zostały skopiowane
3. Zweryfikuj ścieżki w `src/pages/index.jsx`

## Monitoring

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Analytics**: Dostępne w Vercel (automatyczne)
- **Logs**: Real-time w Vercel Dashboard → Functions tab

## Automatyczne Deploymenty

Po skonfigurowaniu:
- ✅ Każdy push do `main` automatycznie deployuje do produkcji
- ✅ Pull requesty tworzą preview deployments
- ✅ Vercel automatycznie builduje i deployuje

## Wsparcie

W razie problemów:
1. Sprawdź logi w Vercel Dashboard
2. Sprawdź console.log w przeglądarce
3. Otwórz issue w repozytorium GitHub
4. Skontaktuj się z zespołem Base44

---

**Ostatnia aktualizacja:** 14 grudnia 2025  
**Status:** Gotowe do finalizacji migracji
