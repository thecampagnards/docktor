package admin

import (
	"docktor/server/jobs"
	"net/http"

	"github.com/labstack/echo"
)

// cronStatus
func cronStatus(c echo.Context) error {
	jobs.CheckDaemonsStatuses()
	return c.JSON(http.StatusOK, "ok")
}
