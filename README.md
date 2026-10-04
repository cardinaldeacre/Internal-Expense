# 🏢 Internal Expense Management System

Sistem manajemen pengeluaran internal perusahaan berbasis *Monorepo Architecture* yang dirancang untuk mengotomatisasi alur pengajuan, persetujuan berjenjang (RBAC), pencairan dana, penyimpanan dokumen digital aman via *Cloud Storage*, serta pemrosesan latar belakang asinkron.

![Go](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat-square&logo=go)
![Gin](https://img.shields.io/badge/Gin-Web%20Framework-008ECF?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react)

---

## 📋 Table of Contents

- [Application Overview & Problem Solved](#-application-overview--problem-solved)
- [Target Users & Key Features](#-target-users--key-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture & Database Design](#️-system-architecture--database-design)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Configuration](#️-environment-configuration)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Background Jobs (Redis + Asynq)](#-background-jobs-redis--asynq)
- [Technical Decisions & Trade-Offs](#️-technical-decisions--trade-offs)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🎯 Application Overview & Problem Solved

### 🏢 Problem Statement

Proses klaim pengeluaran operasional perusahaan secara konvensional (manual) sering kali menghadapi berbagai kendala:

1. **Transparansi & Pelacakan Lemah:** Sulit memantau status persetujuan secara *real-time*.
2. **Risiko Kehilangan Dokumen:** Struk fisik mudah rusak, hilang, atau rentan terhadap manipulasi ganda.
3. **Bottleneck Kinerja:** Persetujuan atasan yang lambat sering memicu hambatan operasional dan *delay* pencairan dana bagi staf.

### 💡 Solution

Sistem **Internal Expense Management** hadir sebagai solusi digital terpusat yang menawarkan:

- **Alur Persetujuan Terstruktur (RBAC):** Pemisahan peran yang ketat antara Staff, Manager, dan Finance.
- **Keamanan Cloud Storage:** Penyimpanan bukti struk/dokumen digital terisolasi menggunakan **MinIO** dengan validasi tipe file dan ukuran secara ketat.
- **Background Processing:** Penggunaan antrean asinkron (**Redis + Asynq**) untuk menangani tugas di latar belakang (seperti simulasi pengiriman notifikasi email) tanpa memblokir respons API utama.

---

## 👥 Target Users & Key Features

| Role | Tanggung Jawab & Fitur Utama |
| :--- | :--- |
| **STAFF** | • Mengajukan klaim pengeluaran baru.<br>• Mengunggah bukti struk (Gambar/PDF).<br>• Memantau daftar pengajuan pribadi beserta status terkini (*SUBMITTED*, *APPROVED*, *REJECTED*, *PAID*). |
| **MANAGER** | • Melihat daftar pengajuan masuk dari bawahan.<br>• Melakukan review dan memberikan keputusan (*Approve* atau *Reject* dengan catatan opsional). |
| **FINANCE** | • Memfilter pengajuan yang sudah disetujui.<br>• Memproses pencairan dana (*Disbursement / Paid*). |

### 🔄 Expense Lifecycle

```
DRAFT ──► SUBMITTED ──► APPROVED ──► PAID
                │
                └──► REJECTED
```

---

## 🛠️ Tech Stack

### Backend

- **Language:** Go (Golang) 1.22+
- **Web Framework:** Gin
- **ORM:** GORM
- **Queue Broker & Worker:** Redis 7 & [`hibiken/asynq`](https://github.com/hibiken/asynq)
- **Database:** PostgreSQL 15
- **Auth:** JWT (Bearer Token) + CSRF Protection
- **Storage:** MinIO (S3-compatible)

### Frontend

- **Framework:** React (TypeScript)
- **Build Tool:** Vite
- **Styling / UI:** Tailwind CSS
- **HTTP Client:** Axios (Interceptor untuk Auth, CSRF, & Centralized Error Handling)

### DevOps & Storage

- **Cloud Storage:** MinIO
- **Containerization:** Docker & Docker Compose
- **Testing:** Go `testing` & `testify` (Unit & Integration Test dengan SQLite In-Memory)

---

## 🏗️ System Architecture & Database Design

### 📐 Arsitektur Backend (Clean Architecture / Layered Pattern)

Backend dirancang dengan pemisahan lapisan yang jelas untuk mempermudah *Maintainability* dan *Testability*:

1. **Transport / HTTP Layer (`internal/delivery/http`):** Menangani *routing* Gin, *request binding*, validasi *payload*, dan *Centralized Error Handling Middleware*.
2. **Business Logic Layer (`internal/usecase`):** Menyimpan aturan bisnis inti, validasi hak akses (*Authorization*), dan orkestrasi pemanggilan *Worker*.
3. **Data Access Layer (`internal/repository`):** Berkomunikasi langsung dengan database PostgreSQL menggunakan GORM.

```
┌──────────────────────────────────────────────────┐
│                  CLIENT (React)                  │
└────────────────────────┬─────────────────────────┘
                         │ HTTP / JSON
                         ▼
┌──────────────────────────────────────────────────┐
│            GIN HTTP LAYER (Handlers)             │
│   Middleware: Auth JWT, CSRF, Error Handling     │
└────────────────────────┬─────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────┐
│         USECASE LAYER (Business Logic)           │
│       + Enqueue Background Task ke Redis         │
└────────┬───────────────────────┬─────────────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐   ┌──────────────────────────┐
│   PostgreSQL     │   │     Redis + Asynq        │
│   (GORM)         │   │     (Worker Queue)       │
└──────────────────┘   └──────────────────────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐   ┌──────────────────────────┐
│     MinIO        │   │ Asynq Worker (Goroutine) │
│  (Object Store)  │   │   Email Notification     │
└──────────────────┘   └──────────────────────────┘
```

### 🗄️ Database Schema Ringkas

- **`users`**: Menyimpan informasi pengguna, kredensial terenkripsi, dan `role` (`STAFF`, `MANAGER`, `FINANCE`).
- **`expense_requests`**: Menyimpan data klaim pengeluaran (`id`, `user_id`, `title`, `amount`, `receipt_url`, `status`, `notes`, `created_at`, dll).

---

## 📂 Project Directory Structure

```text
Internal Expense/
├── docker-compose.yml
├── .env
├── backend/
│   ├── cmd/api/
│   │   └── main.go                    # Entry point aplikasi
│   ├── docs/                          # Swagger docs (auto-generated by swag init)
│   │   ├── docs.go
│   │   ├── swagger.json
│   │   └── swagger.yaml
│   ├── internal/
│   │   ├── domain/                    # Entity & struct data
│   │   ├── delivery/http/             # Gin Handlers, Router, Middleware
│   │   │   ├── apidocs/               # Anotasi Swagger terpisah dari handler
│   │   │   ├── auth_handler.go
│   │   │   ├── expense_handler.go
│   │   │   └── router.go
│   │   ├── usecase/                   # Business logic + unit testing
│   │   └── repository/                # Akses database (GORM)
│   ├── pkg/
│   │   ├── database/                  # Koneksi & migrasi
│   │   ├── response/                  # Standard API response wrapper
│   │   └── utils/                     # MinIO helper, JWT, dsb
│   ├── worker/                        # Asynq background tasks
│   │   ├── email_task.go
│   │   └── handler.go
│   ├── Dockerfile
│   └── go.mod
└── frontend/
    ├── src/
    ├── Dockerfile
    └── package.json
```

---

## ⚙️ Environment Configuration

Salin file `.env.example` menjadi `.env` di root project, lalu sesuaikan:

```env
# Application
PORT=8080
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_USER=root
DB_PASSWORD=secret
DB_NAME=expense_db
POSTGRES_USER=root
POSTGRES_PASSWORD=secret
POSTGRES_DB=expense_db

# Redis
REDIS_ADDR=redis:6379

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=expense-receipts
MINIO_USE_SSL=false

# Frontend
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## 🚀 Getting Started & Installation

### Prasyarat

- **Docker** & **Docker Compose** terinstal
- **Go (Golang) 1.22+** (opsional, untuk menjalankan tes lokal)
- **Node.js 20+** (opsional, untuk pengembangan frontend lokal)

### Cara Menjalankan Aplikasi (Docker Compose)

**1. Clone repositori:**

```bash
git clone https://github.com/username/internal-expense.git
cd "Internal Expense"
```

**2. Siapkan environment:**

```bash
cp .env.example .env
# Edit .env sesuai kebutuhan
```

**3. Jalankan seluruh layanan:**

```bash
docker compose up --build -d
```

Ini akan menyalakan 5 service:

| Service | Container | Port | Deskripsi |
| :--- | :--- | :--- | :--- |
| `postgres` | `expense_postgres` | `5434:5432` | Database utama |
| `redis` | `expense_redis` | `6379:6379` | Broker untuk Asynq |
| `minio` | `expense_minio` | `9000`, `9001` | Object storage |
| `backend` | `expense_backend` | `8080:8080` | Gin API + Asynq Worker |
| `frontend` | `expense_frontend` | `3000:80` | React SPA |

**4. Akses layanan:**

| Layanan | URL |
| :--- | :--- |
| Frontend Web | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger/index.html |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | `localhost:5434` |

**5. Cek logs:**

```bash
docker compose logs -f backend
```

**6. Hentikan layanan:**

```bash
docker compose down
```

Untuk membersihkan volume (hapus data DB & MinIO):

```bash
docker compose down -v
```

---

## 🧪 Testing

Pengujian otomatis untuk lapisan bisnis (`usecase`) diimplementasikan menggunakan `testify` dan **In-Memory Database (SQLite)** agar eksekusi berjalan sangat cepat dan terisolasi.

```bash
cd backend
go test ./internal/usecase/test -v
```


## 📑 API Documentation

Seluruh endpoint terdokumentasi secara interaktif menggunakan **Swaggo** (Swagger/OpenAPI 2.0).

**Regenerate dokumentasi** setelah mengubah anotasi:

```bash
cd backend
swag init -g cmd/api/main.go -o ./docs --parseDependency --parseInternal
```

**Akses Swagger UI:**

👉 http://localhost:8080/swagger/index.html

> 💡 Anotasi Swagger disimpan terpisah di `internal/delivery/http/apidocs/` agar handler tetap bersih dan fokus pada logika bisnis.

### Ringkasan Endpoint

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Login user |
| `POST` | `/api/v1/auth/logout` | Auth | Logout user |
| `GET` | `/api/v1/auth/me` | Auth | Profil user aktif |
| `POST` | `/api/v1/expenses` | Auth + CSRF | Buat klaim pengeluaran (multipart) |
| `GET` | `/api/v1/expenses` | Auth | Daftar pengeluaran (pagination, filter, search) |
| `PATCH` | `/api/v1/expenses/:id/status` | Auth + CSRF | Update status (approve/reject/pay) |
| `GET` | `/api/v1/expenses/:id/receipt` | Auth | Ambil file struk |

---

## ⚙️ Background Jobs (Redis + Asynq)

Sistem menggunakan **Asynq** untuk memproses tugas asinkron (misalnya simulasi pengiriman email notifikasi) agar tidak memblokir response API.

### Task Types

| Task Type | Trigger | Handler |
| :--- | :--- | :--- |
| `email:notification` | Status expense berubah ke `APPROVED` atau `REJECTED` | `worker.HandleEmailNotificationTask` |

### Arsitektur Worker

```go
// Producer — di dalam usecase/handler
client := asynq.NewClient(asynq.RedisClientOpt{Addr: "redis:6379"})
task, _ := worker.NewEmailNotificationTask(expenseID, userID, status)
info, err := client.Enqueue(task, asynq.MaxRetry(3))

// Consumer — dijalankan di goroutine terpisah saat startup
srv := asynq.NewServer(redisOpt, asynq.Config{Concurrency: 10})
mux := asynq.NewServeMux()
mux.HandleFunc(worker.TypeEmailNotification, worker.HandleEmailNotificationTask)
go srv.Run(mux)
```

### Monitoring (Opsional)

Tambahkan **Asynqmon** ke `docker-compose.yml` untuk memonitor antrean:

```yaml
asynqmon:
  image: hibiken/asynqmon:latest
  container_name: expense_asynqmon
  ports:
    - "8090:8080"
  command:
    - "--redis-addr=redis:6379"
  networks:
    - expense-net
```

Akses di http://localhost:8090 untuk melihat statistik task, retry, dan failure.

---

## ⚖️ Technical Decisions & Trade-Offs

### 1. Mengapa Menggunakan MinIO Object Storage ketimbang Local File System?

- **Keputusan:** Menggunakan penyimpanan objek berbasis S3 (MinIO).
- **Trade-Off:** Membutuhkan manajemen kontainer tambahan, namun memberikan skalabilitas tinggi, keamanan isolasi berkas, dan kemudahan migrasi ke penyedia cloud publik (AWS S3 / Google Cloud Storage) di masa depan.

### 2. Mengapa Menggunakan Redis & Asynq untuk Background Processing?

- **Keputusan:** Memisahkan tugas pengiriman notifikasi/log berat dari request-response utama.
- **Trade-Off:** Kompleksitas arsitektur sedikit meningkat, namun memberikan performa API yang sangat instan (< 15ms) bagi User dan Manager saat melakukan aksi mutasi data.

### 3. Pemilihan SQLite In-Memory untuk Testing Usecase

- **Keputusan:** Memanfaatkan SQLite RAM untuk pengujian unit logika bisnis.
- **Trade-Off:** Memerlukan sedikit penyesuaian pada tipe data UUID bawaan PostgreSQL saat inisialisasi tabel tes, tetapi sangat efektif memangkas waktu eksekusi tes tanpa perlu menghidupkan kontainer database eksternal.

### 4. JWT + CSRF Double Protection

- **Keputusan:** Menggunakan Bearer JWT untuk autentikasi, ditambah CSRF middleware untuk operasi mutasi (POST/PATCH/PUT/DELETE).
- **Trade-Off:** Menambah kompleksitas di sisi frontend (perlu mengirim CSRF token di header), namun memberikan perlindungan berlapis terhadap serangan CSRF dan XSS.

---

## 🐛 Troubleshooting

### ❌ `dial tcp: lookup redis on 127.0.0.11:53: no such host`

**Penyebab:** Container `backend` dan `redis` tidak berada dalam Docker network yang sama, sehingga DNS internal Docker tidak dapat me-resolve hostname `redis`.

**Solusi:** Pastikan semua service mendeklarasikan network yang sama di `docker-compose.yml`:

```yaml
services:
  redis:
    # ...
    networks:
      - expense-net    # ← WAJIB ada

  backend:
    # ...
    networks:
      - expense-net

networks:
  expense-net:
---

## 🙏 Acknowledgments

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [GORM](https://gorm.io/)
- [Asynq](https://github.com/hibiken/asynq)
- [MinIO](https://min.io/)
- [Swaggo](https://github.com/swaggo/swag)
- [Testify](https://github.com/stretchr/testify)
    driver: bridge
```

Lalu force recreate:

```bash
docker compose down --remove-orphans
docker compose up --build -d
```

**Verifikasi:**

```bash
docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' expense_redis
docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' expense_backend
docker exec expense_backend sh -c "getent hosts redis"
```

### ❌ MinIO Bucket tidak tersedia

Pastikan `MINIO_BUCKET` di `.env` sesuai. Aplikasi akan otomatis membuat bucket saat startup jika belum ada.

### ❌ Swagger UI kosong (`paths: {}`)

Jalankan `swag init` dari **root project** (bukan dari `cmd/api`):

```bash
cd backend
swag init -g cmd/api/main.go -o ./docs --parseDependency --parseInternal
```

Pastikan:
1. File anotasi memiliki baris `// NamaFunc godoc` (kata `godoc` wajib ada).
2. File anotasi meng-import package yang direferensikan (mis. `_ "internal-expense-backend/pkg/response"`).
3. Ada minimal satu file `.go` di root project (bisa berupa `doc.go`) agar `go list` berhasil.

---

## 🙏 Acknowledgments

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [GORM](https://gorm.io/)
- [Asynq](https://github.com/hibiken/asynq)
- [MinIO](https://min.io/)
- [Swaggo](https://github.com/swaggo/swag)
- [Testify](https://github.com/stretchr/testify)
