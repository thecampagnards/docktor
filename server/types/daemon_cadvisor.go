package types

import (
	"errors"
	"fmt"
	"strings"

	client "github.com/google/cadvisor/client"
	v1 "github.com/google/cadvisor/info/v1"
	v2 "github.com/google/cadvisor/info/v2"
)

// MachineUsage
type MachineUsage struct {
	CPU int          `json:"cpu"`
	RAM int          `json:"ram"`
	FS  []FileSystem `json:"fs"`
}

// MachineUsage
type FileSystem struct {
	Device   string `json:"device"`
	Capacity uint64 `json:"capacity"`
	Usage    uint64 `json:"usage"`
}

// CAdvisorInfo gets usage of resources
func (d *Daemon) CAdvisorInfo() (*MachineUsage, error) {
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
		inst := stats[n-2].CpuInst.Usage.Total
		fmt.Printf("CPU inst : %v nanocores/s \n", inst)
		ratio := float32(inst) / float32(machineInfo.NumCores) / 1000000000
		fmt.Printf("CPU ratio : %v \n", ratio)
		usage.CPU = int(ratio * 100)
	}

	// compute RAM usage
	{
		capacity := machineInfo.MemoryCapacity
		inst := stats[n-1].Memory.Usage
		fmt.Printf("RAM capa : %v, RAM inst : %v \n", capacity, inst)
		ratio := float32(inst) / float32(capacity)
		fmt.Printf("RAM ratio : %v \n", ratio)
		percent := ratio * 100
		usage.RAM = int(percent)
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

// CAdvisorInfoFilterFs keeps only group filesystem
func (d *Daemon) CAdvisorInfoFilterFs(groupName string) (*MachineUsage, error) {
	u, err := d.CAdvisorInfo()
	if err != nil {
		return nil, err
	}

	groupFS := make([]FileSystem, 1)

	for _, fs := range u.FS {
		if strings.HasSuffix(fs.Device, groupName) {
			groupFS[0] = fs
			break
		}
	}

	if groupFS[0].Device == "" {
		return nil, errors.New("Group filesystem not found")
	}

	u.FS = groupFS

	return u, nil
}
