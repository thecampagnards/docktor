package types

import (
	"errors"
	"math"

	client "github.com/google/cadvisor/client"
	v1 "github.com/google/cadvisor/info/v1"
	v2 "github.com/google/cadvisor/info/v2"
)

type MachineUsage struct {
	CPU MachineStats `json:"cpu"`
	RAM MachineStats `json:"ram"`
	FS  []FileSystem `json:"fs"`
}

type MachineStats struct {
	Current uint64 `json:"current"`
	Max     uint64 `json:"maw"`
	Percent byte   `json:"percent"`
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
		CPU: MachineStats{
			Max:     0,
			Current: 0,
			Percent: 0,
		},
		RAM: MachineStats{
			Max:     0,
			Current: 0,
			Percent: 0,
		},
		FS: []FileSystem{},
	}

	// compute CPU usage
	if len(stats) > 1 {
		cpuFreqGhz := (machineInfo.CpuFrequency / 1000000) * uint64(machineInfo.NumCores)
		deltaTime := stats[n-1].Timestamp.Sub(stats[n-2].Timestamp).Nanoseconds()
		capacity := cpuFreqGhz * uint64(deltaTime)
		inst := stats[n-2].CpuInst.Usage.Total
		usage.CPU = MachineStats{
			Max:     capacity,
			Current: inst,
			Percent: byte(math.Round(float64(inst) / float64(capacity))),
		}
	}

	// compute RAM usage
	{
		capacity := machineInfo.MemoryCapacity
		inst := stats[n-1].Memory.Usage
		usage.RAM = MachineStats{
			Max:     capacity,
			Current: inst,
			Percent: byte(math.Round(float64(inst) / float64(capacity))),
		}
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
