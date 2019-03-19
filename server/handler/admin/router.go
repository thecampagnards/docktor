package admin

import (
	"docktor/server/middleware"
	"docktor/server/types"
	"fmt"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	admin := e.Group("/admin")
	{
		assets := admin.Group("/assets")
		assets.GET("", getAssets, middleware.WithAdmin)
		assets.POST(fmt.Sprintf("/:%s", types.ASSET_NAME_PARAM), saveAsset)
	}
}
