package types

import "time"

const (
	// Admin
	ASSET_NAME_PARAM = "assetname"

	// Daemon
	DAEMONS_DB_COLUMN   = "daemons"
	DAEMON_ID_PARAM     = "daemonID"
	CONTAINER_ID_PARAM  = "containerID"
	PROJECT_NAME        = "Docktor"
	DOCKER_STOP_TIMEOUT = 10 * time.Second
	DOCKER_LOG_SINCE    = "10m"
	WATCHTOWER_LABEL    = "com.centurylinklabs.watchtower.enable=true"

	// Group
	GROUP_ID_PARAM   = "groupID"
	GROUPS_DB_COLUMN = "groups"

	// User
	USERNAME_PARAM  = "username"
	USERS_DB_COLUMN = "users"
	ADMIN_ROLE      = "admin"
	USER_ROLE       = "user"
	authValidity    = 72 * time.Hour
	JWT_QUERY_PARAM = "jwt_token"

	// Service
	SERVICE_ID_PARAM            = "serviceID"
	SUBSERVICE_ID_PARAM         = "subserviceID"
	SERVICES_DB_COLUMN          = "services"
	FORM_DATA_IMAGES_FIELD_NAME = "images"
	FORM_DATA_FILES_FIELD_NAME  = "files"
	FORM_DATA_DATA_FIELD_NAME   = "data"

	// Config
	CONFIG_DB_COLUMN = "config"
)

var (
	ROLES = [...]string{ADMIN_ROLE, USER_ROLE}
)
