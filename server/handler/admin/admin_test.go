package admin

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"docktor/server/types"

	"github.com/labstack/echo"
	"github.com/stretchr/testify/assert"
)

const assetsJSON = `{"cadvisor-compose.yml":".*","watchtower-compose.yml":".*"}`

func TestGetAssets(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	dir, _ := os.Getwd()
	defer os.Chdir(dir)

	// change workdir to server
	os.Chdir("../..")

	// Assertions
	if assert.NoError(t, getAssets(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)
		fmt.Println(rec.Body.String())
		assert.Regexp(t, assetsJSON, rec.Body.String())
	}
}

func TestSaveAsset(t *testing.T) {
	// Setup
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader("test"))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetParamNames(types.ASSET_NAME_PARAM)
	c.SetParamValues("test.txt")

	dir, _ := os.Getwd()
	defer os.Chdir(dir)

	// change workdir to server
	os.Chdir("../..")

	// Assertions
	if assert.NoError(t, saveAsset(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)
		filepath := rec.Body.String()
		assert.Regexp(t, ".*/docktor/server/assets/test.txt", filepath)
		os.Remove(filepath[1 : len(filepath)-2])
	}
}

func TestAddRoute(t *testing.T) {
	// Setup
	e := echo.New()
	g := e.Group("/api")

	AddRoute(g)

	assert.Regexp(t, "/api/admin.*", e.Routes()[len(e.Routes())-1].Path)
}
