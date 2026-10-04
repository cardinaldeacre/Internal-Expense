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
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Technical Decisions & Trade-Offs](#️-technical-decisions--trade-offs)

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
├── .env.example
├── backend/
│   ├── cmd/api/
│   │   └── main.go                    # Entry point aplikasi (Inisialisasi Server, DB, Redis, Worker)
│   ├── docs/                          # Swagger docs (auto-generated by swag init)
│   │   ├── docs.go
│   │   ├── swagger.json
│   │   └── swagger.yaml
│   ├── internal/
│   │   ├── domain/                    # Entity & struct data (User, ExpenseRequest, dll)
│   │   ├── delivery/http/             # Gin Handlers, Router, & Middleware
│   │   │   ├── apidocs/               # Anotasi Swagger
│   │   │   ├── auth_handler.go        # Handler untuk autentikasi (Login/Register)
│   │   │   ├── expense_handler.go     # Handler untuk pengajuan klaim & status update
│   │   │   └── router.go              # Pengaturan route API & Middleware group
│   │   ├── usecase/                   # Business logic core
│   │   │   ├── auth_usecase.go
│   │   │   ├── expense_usecase.go
│   │   │   └── test/                  # Unit & Integration Tests (Testify + SQLite In-Memory)
│   │   │       ├── auth_usecase_test.go
│   │   │       └── expense_usecase_test.go
│   │   └── repository/                # Akses database level bawah (GORM query)
│   ├── pkg/
│   │   ├── database/                  # Koneksi database PostgreSQL & AutoMigrate
│   │   ├── response/                  # Standard API response wrapper (AppError & JSON formatter)
│   │   └── utils/                     # Helper global (MinIO client, JWT generator, CSRF)
│   ├── worker/                        # Asynq background tasks & handlers
│   │   ├── email_task.go              # Definisi payload task antrean
│   │   └── handler_email.go           # Pekerja asynchronous (Background job handler)
│   ├── Dockerfile
│   └── go.mod
└── frontend/
    ├── src/
    │   ├── components/                # Komponen UI reusable (Button, Modal, Table, Card, Navbar)
    │   ├── context/                   # Global State / Auth Context (Manajemen Token & Session User)
    │   ├── hooks/                     # Custom hooks (useAuth, useFetch, dll)
    │   ├── pages/                     # Halaman utama aplikasi (Login, StaffDashboard, ManagerApproval, FinanceDisbursement)
    │   ├── services/                  # Konfigurasi Axios & API Client (Interceptor untuk Auth, CSRF, & Error)
    │   ├── types/                     # TypeScript Interfaces / Types definitions (User, Expense)
    │   ├── App.tsx                    # Root component & Route definitions (React Router)
    │   └── main.tsx                   # Entry point React DOM
    ├── Dockerfile
    ├── package.json
    └── vite.config.ts
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
docker compose logs -f
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
