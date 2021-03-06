package types

import "time"

const (
	// Admin
	ASSET_NAME_PARAM = "assetname"

	// Daemon
	DAEMONS_DB_COLUMN   = "daemons"
	DAEMON_ID_PARAM     = "daemonID"
	DOCKER_IMAGE_PARAM  = "image"
	CONTAINER_ID_PARAM  = "containerID"
	PROJECT_NAME        = "Docktor"
	DOCKER_STOP_TIMEOUT = 10 * time.Second

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
	SERVICE_ID_PARAM        = "serviceID"
	SUBSERVICE_ID_PARAM     = "subserviceID"
	GROUPSERVICE_NAME_PARAM = "serviceName"
	SERVICES_DB_COLUMN      = "services"
	SERVICE_NAME_LABEL      = "SERVICE_NAME"
	WATCHTOWER_LABEL        = "com.centurylinklabs.watchtower.enable"

	// Config
	CONFIG_DB_COLUMN = "config"

	// Status
	STATUS_OK   = "OK"
	STATUS_DOWN = "DOWN"
	STATUS_OLD  = "OLD"
	STATUS_CERT = "CERT"

	// Images
	IMAGE_PARAM      = "image"
	IMAGE_ID_PARAM   = "imageID"
	COMMAND_ID_PARAM = "commandID"

	// Other
	MIME_YAML       = "application/x-yaml"
	SECRET_VARIABLE = "*************"
)

var (
	ROLES = [2]string{ADMIN_ROLE, USER_ROLE}
)
