package apidocs

import (
	_ "internal-expense-backend/pkg/response"
)

// Login godoc
// @Summary      Login user
// @Description  Autentikasi user dengan email dan password, mengembalikan access token & refresh token.
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        body  body      object{email=string,password=string}  true  "Login credentials"
// @Success      200   {object}  response.APIResponse
// @Failure      400   {object}  response.APIResponse
// @Failure      401   {object}  response.APIResponse
// @Router       /auth/login [post]
func LoginDoc() {}

// Logout godoc
// @Summary      Logout user
// @Description  Menghapus sesi user / invalidate token.
// @Tags         Auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  response.APIResponse
// @Failure      401  {object}  response.APIResponse
// @Router       /auth/logout [post]
func LogoutDoc() {}

// Me godoc
// @Summary      Get current user profile
// @Description  Mengambil data user yang sedang login.
// @Tags         Auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  response.APIResponse
// @Failure      401  {object}  response.APIResponse
// @Router       /auth/me [get]
func MeDoc() {}
