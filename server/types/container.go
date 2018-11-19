package types

import (
	"github.com/docker/docker/api/types"
)

type Container struct {
	types.Container
}

type Containers []Container
