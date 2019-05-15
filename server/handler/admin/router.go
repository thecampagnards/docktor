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
		assets.Use(middleware.WithAdmin)
		assets.GET("", getAssets)
		assets.POST(fmt.Sprintf("/:%s", types.ASSET_NAME_PARAM), saveAsset)
	}

	{
		config := admin.Group("/config")
		config.GET("", getConfig)
		config.POST("", saveConfig)
	}

	{
		cron := admin.Group("/cron")
		cron.Use(middleware.WithAdmin)
		cron.GET("/status", cronStatus)
	}
}
