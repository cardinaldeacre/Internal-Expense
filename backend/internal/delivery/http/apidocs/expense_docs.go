package apidocs

import (
	_ "internal-expense-backend/pkg/response"
)

// CreateExpense godoc
// @Summary      Buat pengajuan pengeluaran baru
// @Description  Membuat pengajuan pengeluaran baru. Jika is_submitted=true, struk (receipt) wajib diunggah. Mendukung upload file struk (JPEG, PNG, PDF, max 2MB).
// @Tags         Expenses
// @Accept       multipart/form-data
// @Produce      json
// @Param        title         formData  string  true   "Judul pengeluaran" minlength(3) maxlength(100)
// @Param        description   formData  string  false  "Deskripsi pengeluaran" maxlength(500)
// @Param        amount        formData  number  true   "Jumlah pengeluaran" minimum(1)
// @Param        is_submitted  formData  bool    false  "Status apakah langsung diajukan"
// @Param        receipt       formData  file    false  "File struk (JPEG, PNG, PDF, max 2MB)"
// @Security     BearerAuth
// @Success      201  {object}  response.APIResponse
// @Failure      400  {object}  response.APIResponse
// @Failure      401  {object}  response.APIResponse
// @Failure      500  {object}  response.APIResponse
// @Router       /expenses [post]
func CreateExpenseDoc() {}

// UpdateStatus godoc
// @Summary      Update status pengajuan pengeluaran
// @Description  Mengubah status pengajuan pengeluaran.
// @Tags         Expenses
// @Accept       json
// @Produce      json
// @Param        id    path  string  true  "Expense ID"
// @Param        body  body  object{status=string,notes=string}  true  "Request body"
// @Security     BearerAuth
// @Success      200  {object}  response.APIResponse
// @Failure      400  {object}  response.APIResponse
// @Failure      401  {object}  response.APIResponse
// @Failure      404  {object}  response.APIResponse
// @Failure      500  {object}  response.APIResponse
// @Router       /expenses/{id}/status [patch]
func UpdateStatusDoc() {}

// GetExpenses godoc
// @Summary      Ambil daftar pengajuan
// @Description  Mengambil data pengeluaran dengan filter status, pencarian, dan pagination.
// @Tags         Expenses
// @Accept       json
// @Produce      json
// @Param        page    query     int     false  "Nomor Halaman" default(1) minimum(1)
// @Param        limit   query     int     false  "Jumlah Data" default(10) minimum(1) maximum(100)
// @Param        search  query     string  false  "Cari berdasarkan judul" maxlength(100)
// @Param        status  query     string  false  "Filter status" Enums(DRAFT, SUBMITTED, APPROVED, REJECTED, PAID)
// @Param        sort    query     string  false  "Urutan data" Enums(created_at_desc, created_at_asc, amount_desc, amount_asc) default(created_at_desc)
// @Security     BearerAuth
// @Success      200  {object}  response.APIResponse
// @Failure      400  {object}  response.APIResponse
// @Failure      401  {object}  response.APIResponse
// @Failure      500  {object}  response.APIResponse
// @Router       /expenses [get]
func GetExpensesDoc() {}

// GetReceiptImage godoc
// @Summary      Ambil file struk pengeluaran
// @Description  Mengambil file struk (receipt) dari cloud storage berdasarkan ID pengeluaran.
// @Tags         Expenses
// @Produce      image/jpeg
// @Produce      image/png
// @Produce      application/pdf
// @Param        id  path  string  true  "Expense ID"
// @Security     BearerAuth
// @Success      200  {file}    binary  "Receipt file"
// @Failure      400  {object}  response.APIResponse
// @Failure      401  {object}  response.APIResponse
// @Failure      404  {object}  response.APIResponse
// @Failure      500  {object}  response.APIResponse
// @Router       /expenses/{id}/receipt [get]
func GetReceiptImageDoc() {}
