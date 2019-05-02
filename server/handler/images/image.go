package images

import (
	"net/http"
	"net/url"

	"docktor/server/storage"
	"docktor/server/types"

	"github.com/labstack/echo"
	log "github.com/sirupsen/logrus"
)

// getAll find all images
func getAll(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)

	images, err := db.Images().FindAll()
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when retrieving images")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, images)
}

// getByImage find one image by image
func getByImage(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	imageName, err := url.QueryUnescape(c.Param(types.IMAGE_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"imageParam": c.Param(types.IMAGE_ID_PARAM),
			"error":      err,
		}).Error("Error when retrieving image")
		return c.JSON(http.StatusBadRequest, err.Error())
	}

	images, err := db.Images().Find(imageName)
	if err != nil {
		log.WithFields(log.Fields{
			"imageName": imageName,
			"error":     err,
		}).Error("Error when retrieving image")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	for _, image := range images {
		err = image.GetCommandsVariables()
		if err != nil {
			log.WithFields(log.Fields{
				"image": image,
				"error": err,
			}).Error("Error when retrieving image variables")
		}
	}

	return c.JSON(http.StatusOK, images)
}

// save create/update a image
func save(c echo.Context) error {
	var u types.Images
	err := c.Bind(&u)
	if err != nil {
		log.WithFields(log.Fields{
			"error": err,
		}).Error("Error when saving images")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	db := c.Get("DB").(*storage.Docktor)
	for key, image := range u {
		u[key], err = db.Images().Save(image)
		if err != nil {
			log.WithFields(log.Fields{
				"image": image,
				"error": err,
			}).Error("Error when creating/updating images")
		}
	}

	return c.JSON(http.StatusOK, u)
}

// deleteByImage delete one image by id
func deleteByImage(c echo.Context) error {
	db := c.Get("DB").(*storage.Docktor)
	err := db.Images().Delete(c.Param(types.IMAGE_ID_PARAM))
	if err != nil {
		log.WithFields(log.Fields{
			"imageImage": c.Param(types.IMAGE_ID_PARAM),
			"error":      err,
		}).Error("Error when deleting image")
		return c.JSON(http.StatusBadRequest, err.Error())
	}
	return c.JSON(http.StatusOK, "ok")
}
