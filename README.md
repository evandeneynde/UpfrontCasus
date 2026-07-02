# Upfront Casus

Een app voor gebruik in de upfront fabriek. 

Admins stellen de receptuur van producten in en medewerkers doorlopen vervolgens (na het voltooien van de traininsmodule) de aangegeven stappen van het productieproces.

Het dashboard biedt een uitgebreid data-overzicht om de productie te vergeleken met voorgaande periodes. 

Ook is er een card op het dashboard die weergeeft hoe efficiënt er met ingrediënten word omgegaan.

Als admin kun je: producten toevoegen en aanpassen, de trainingsmodule aanpassen (filmpjes toevoegen door middel van een youtube link) en het dashboard bekijken. 

Als medewerker kun je, nadat je de traingsmodule hebt afgerond, je eigen batches zien en nieuwe batches starten. 

---

## Vereisten

De makkelijkste manier om PHP en een lokaal domein op macOS op te zetten is **[Laravel Herd](https://herd.laravel.com)** — dit bundelt PHP 8.3+, Nginx en een `.test`-domein voor elk project in je Herd-map, zonder configuratie. Download via [herd.laravel.com](https://herd.laravel.com).

Wil je de dependencies zelf beheren:

| Tool | Minimale versie | Installatie |
|------|----------------|-------------|
| PHP | 8.3 | inbegrepen bij Herd, of `brew install php` |
| Composer | 2.x | [getcomposer.org](https://getcomposer.org) |
| Node.js | 18 | [nodejs.org](https://nodejs.org) / `brew install node` |
| npm | 9 | inbegrepen bij Node |

> SQLite is ingebouwd in PHP — geen databaseserver nodig.

---

## Installatie

### 1. Repository clonen

```bash
git clone https://github.com/etiennevde/UpfrontCase.git
cd UpfrontCase
```

### 2. Overige stappen

**macOS / Linux**

```bash
# PHP-afhankelijkheden installeren
composer install

# Omgevingsbestand aanmaken en app-sleutel genereren
cp .env.example .env

# Noodzakelijke mappen aanmaken (Git negeert lege mappen)
mkdir -p bootstrap/cache storage/framework/{cache/data,sessions,views} storage/logs

# App-sleutel genereren
php artisan key:generate

# SQLite-database aanmaken, migraties uitvoeren en voorbeelddata inladen
touch database/database.sqlite
php artisan migrate --seed

# JS-afhankelijkheden installeren en bouwen
npm install
```

**Windows (PowerShell)**

```powershell
# PHP-afhankelijkheden installeren
composer install

# Omgevingsbestand aanmaken
Copy-Item .env.example .env

# Noodzakelijke mappen aanmaken (Git negeert lege mappen)
New-Item -ItemType Directory -Force -Path bootstrap\cache, storage\framework\cache\data, storage\framework\sessions, storage\framework\views, storage\logs

# App-sleutel genereren
php artisan key:generate

# SQLite-database aanmaken, migraties uitvoeren en voorbeelddata inladen
New-Item -ItemType File -Force -Path database\database.sqlite
php artisan migrate --seed

# JS-afhankelijkheden installeren en bouwen
npm install
```

---

## Opstarten

### Met Laravel Herd

Herd serveert de app automatisch op `http://upfrontcase.test`. Je hebt alleen Vite nodig voor de frontend:

```bash
npm run dev
```

### Zonder Herd

Je hebt **twee terminals** nodig:

```bash
# Terminal 1 — Laravel devserver
composer dev

# Terminal 2 — Vite (hot-reload)
npm run dev
```

Open [http://localhost:8000](http://localhost:8000).

---

## Inloggen

Alle accounts hebben als wachtwoord `supermarkt`

| E-mail | Rol                                   |
|--------|---------------------------------------|
| `admin@example.com` | Admin                                 |
| `trained@example.com` | Medewerker (training afgerond)        |
| `untrained@example.com` | Medewerker (training nog niet gedaan) |

De database seeder vult de database met twee producten (Eiwit oats appel kaneel en whey milkshake chocolade, de receptuur heb ik van de site gehaald) en ongeveer 1.400 random gegenereerde batches.

---

Opnieuw beginnen met een vers geseede database:

```bash
php artisan migrate:fresh --seed
```
