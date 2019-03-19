package services

import (
	"fmt"

	"docktor/server/middleware"
	"docktor/server/types"

	"github.com/labstack/echo"
)

// AddRoute add route on echo
func AddRoute(e *echo.Group) {
	services := e.Group("/services")

	// Basic services request
	services.GET("", getAll)
	services.POST("", save, middleware.WithAdmin)

	{
		service := services.Group(fmt.Sprintf("/:%s", types.SERVICE_ID_PARAM))

		service.GET("", getByID)
		service.DELETE("", deleteByID, middleware.WithAdmin)
	}

	{
		subService := services.Group(fmt.Sprintf("/subservice/:%s", types.SUBSERVICE_ID_PARAM))

		subService.GET("", getBySubServiceID)
	}
}
