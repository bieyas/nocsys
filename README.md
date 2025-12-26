
# NOCSys - Network Operation Center System

## Pendahuluan
NOCSys adalah aplikasi Network Operation Center berbasis web yang terdiri dari backend (Node.js/Express), frontend (React + Vite), dan deployment menggunakan Docker. Sistem ini digunakan untuk monitoring, manajemen perangkat, client, dan infrastruktur jaringan.

---

## Arsitektur

- **Backend**: Node.js, Express, Websocket, REST API, integrasi database (MySQL/PostgreSQL)
- **Frontend**: React, Vite, React-Leaflet (peta), TailwindCSS
- **Database**: SQL, migrasi otomatis
- **Deployment**: Docker Compose

---

## Backend

### Struktur Folder

- `backend/src/app.js` - Entry point Express
- `backend/src/routes/` - Routing API (auth, device, dhcp, infrastructure, pppoe, dsb)
- `backend/src/controllers/` - Logika bisnis tiap resource
- `backend/src/models/` - Model database
- `backend/src/config/` - Konfigurasi database & mikrotik
- `backend/scripts/` - Script migrasi, setup, sinkronisasi
- `backend/database/` - File SQL migrasi
- `backend/websocket/server.js` - Websocket server

### Konfigurasi Environment

- `.env` di backend: variabel DB, JWT, ORS_API_KEY, dsb

### Menjalankan Backend

```bash
cd backend
npm install
npm run dev
```

### Testing

```bash
cd backend/test
npm install
npm test
```

### Endpoint Utama

- `/api/auth` - Login, register, JWT
- `/api/device` - Manajemen perangkat
- `/api/pppoe-client` - Manajemen client PPPoE
- `/api/infrastructure` - Data ODP, POP, peta
- `/api/route-proxy/route` - Proxy ke OpenRouteService

---

## Frontend

### Struktur Folder

- `frontend/src/pages/` - Halaman utama (Dashboard, Map, Clients, Devices, dsb)
- `frontend/src/components/` - Komponen UI (Alert, Modal, Table, dsb)
- `frontend/src/services/` - API client
- `frontend/src/layouts/` - Layout utama
- `frontend/src/assets/` - Ikon, gambar

### Konfigurasi Environment

- `.env` di frontend: VITE_API_URL, dsb

### Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

### Fitur Utama

- Login JWT
- Dashboard monitoring
- Peta interaktif (react-leaflet)
- Manajemen client, device, ODP, POP
- Rute jalan otomatis (OpenRouteService)
- Notifikasi & alert

---

## Deployment (Docker)

### Struktur

- `docker/docker-compose.yml` - Orkestrasi backend, frontend, database

### Menjalankan dengan Docker

```bash
cd docker
docker-compose up -d
```

---

## Pengembangan & Kontribusi

1. Fork & clone repo
2. Buat branch baru untuk fitur/bugfix
3. Commit perubahan, push, dan buat Pull Request

---

## Lisensi

MIT License
