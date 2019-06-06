package types

import (
	"errors"
	"math"

	client "github.com/google/cadvisor/client"
	v1 "github.com/google/cadvisor/info/v1"
	v2 "github.com/google/cadvisor/info/v2"
)

type MachineUsage struct {
	CPU byte
	RAM byte
	FS  []FileSystem
}

type FileSystem struct {
	Device   string `json:"device"`
	Capacity uint64 `json:"capacity"`
	Usage    uint64 `json:"usage"`
}

// CAdvisorContainerInfo gets usage of resources over timestamps
func (d *Daemon) CAdvisorContainerInfo() (*MachineUsage, error) {
	cli, err := client.NewClient(d.CAdvisor)
	if err != nil {
		return nil, err
	}

	machineInfo, err := cli.MachineInfo()
	if err != nil {
		return nil, err
	}

	containerInfo, err := cli.ContainerInfo("/", nil)
	if err != nil {
		return nil, err
	}

	stats := v2.MachineStatsFromV1(containerInfo)
	n := len(stats)
	if n == 0 {
		return nil, errors.New("Stats array is empty")
	}

	usage := MachineUsage{
		CPU: 0,
		RAM: 0,
		FS:  []FileSystem{},
	}

	// compute CPU usage
	if len(stats) > 1 {
		deltaTime := stats[n-1].Timestamp.Sub(stats[n-2].Timestamp).Nanoseconds()
		inst := stats[n-2].CpuInst.Usage.Total
		ratio := math.Round(float64(inst) / float64(deltaTime))
		percent := byte(ratio / float64(machineInfo.NumCores) * 100)
		usage.CPU = percent
	}

	// compute RAM usage
	{
		capacity := machineInfo.MemoryCapacity
		inst := stats[n-1].Memory.Usage
		percent := byte(math.Round(float64(inst) / float64(capacity)))
		usage.RAM = percent
	}

	// compute filesystems
	for _, fs := range stats[n-1].Filesystem {
		capacity := *fs.Capacity
		inst := *fs.Usage
		filesystem := FileSystem{
			Device:   fs.Device,
			Capacity: capacity,
			Usage:    inst,
		}
		usage.FS = append(usage.FS, filesystem)
	}

	return &usage, nil
}

// CAdvisorMachineInfo gets machine specs
func (d *Daemon) CAdvisorMachineInfo() (*v1.MachineInfo, error) {
	cli, err := client.NewClient(d.CAdvisor)
	if err != nil {

		return nil, err
	}
	return cli.MachineInfo()
}

func (d *Daemon) CAdvisorContainerInfoFilterFs(groupName string) (*v1.ContainerInfo, error) {
	_, err := d.CAdvisorContainerInfo()
	if err != nil {
		return nil, err
	}

	return nil, nil
}
