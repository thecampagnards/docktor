export interface IDaemon {
  _id: string;
  Name: string;
  Description: string;
  CAdvisor: string;
  Host: string;
  Port: number;
  Volume: string;
  Cert: string;
  Ca: string;
  Key: string;
}

export interface ICadvisor {
  // The container id

  id: string;
  // The absolute name of the container. This is unique on the machine.

  name: string;
  // Other names by which the container is known within a certain namespace.
  // This is unique within that namespace.
  aliases: string[];
  // Namespace under which the aliases of a container are unique.
  // An example of a namespace is "docker" for Docker containers.
  namespace: string;
  // The direct subcontainers of the current container.

  subcontainers: IContainerReference[];
  // The isolation used in the container.

  spec: IContainerSpec;
  // Historical statistics gathered from the container.

  stats: IContainerStats[];
}

export interface IContainerReference {
  // The container id

  id: string;
  // The absolute name of the container. This is unique on the machine.

  name: string;

  // Other names by which the container is known within a certain namespace.
  // This is unique within that namespace.
  aliases: string[];
  // Namespace under which the aliases of a container are unique.
  // An example of a namespace is "docker" for Docker containers.
  namespace: string;
}

export interface IContainerSpec {
  // Time at which the container was created.

  creation_time: string;
  // Metadata labels associated with this container.

  labels: string[];
  // Metadata envs associated with this container. Only whitelisted envs are added.

  envs: string[];
  has_cpu: boolean;
  cpu: ICpuSpec;
  has_memory: boolean;
  memory: IMemorySpec;
  has_network: boolean;
  has_filesystem: boolean;
  // HasDiskIo when true, indicates that DiskIo stats will be available.

  has_diskio: boolean;
  has_custom_metrics: boolean;
  custom_metrics: IMetricSpec[];
  // Image name used for this container.

  image: string;
}

export interface IContainerStats {
  // The time of this stat point.
  timestamp: string;
  cpu: ICpuStats;
  diskio: IDiskIoStats;
  memory: IMemoryStats;

  // Filesystem statistics
  filesystem: IFsStats[];

  // ProcessStats for Containers
  processes: IProcessStats;

  // Custom metrics from all collectors
  custom_metrics: IMetricVal[][];
}

export interface ICpuStats {
  usage: ICpuUsage;
  cfs: ICpuCFS;
  schedstat: ICpuSchedstat;
  // Smoothed average of number of runnable threads x 1000.
  // We multiply by thousand to avoid using floats, but preserving precision.
  // Load is smoothed over the last 10 seconds. Instantaneous value can be read
  // from LoadStats.NrRunning.
  load_average: number;
}

export interface IDiskIoStats {
  IoServiceBytes: IPerDiskStats[];
  IoServiced: IPerDiskStats[];
  IoQueued: IPerDiskStats[];
  Sectors: IPerDiskStats[];
  IoServiceTime: IPerDiskStats[];
  IoWaitTime: IPerDiskStats[];
  IoMerged: IPerDiskStats[];
  IoTime: IPerDiskStats[];
}

export interface IMemoryStats {
  // Current memory usage, this includes all memory regardless of when it was
  // accessed.
  // Units: Bytes.
  usage: number;

  // Maximum memory usage recorded.
  // Units: Bytes.
  max_usage: number;

  // Number of bytes of page cache memory.
  // Units: Bytes.
  cache: number;

  // The amount of anonymous and swap cache memory (includes transparent
  // hugepages).
  // Units: Bytes.
  rss: number;

  // The amount of swap currently used by the processes in this cgroup
  // Units: Bytes.
  swap: number;

  // The amount of memory used for mapped files (includes tmpfs/shmem)
  mapped_file: number;

  // The amount of working set memory, this includes recently accessed memory,
  // dirty memory, and kernel memory. Working set is <= "usage".
  // Units: Bytes.
  working_set: number;

  failcnt: number;

  container_data: IMemoryStatsMemoryData;
  hierarchical_data: IMemoryStatsMemoryData;
}

export interface IPerDiskStats {
  device: string;
  major: number;
  minor: number;
  stats: number[];
}

export interface ICpuSpec {
  limit: number;
  maxlimit: number;
  mask: string;
  quota: number;
  period: number;
}

export interface IMemorySpec {
  // The amount of memory requested. Default is unlimited (-1).
  // Units: bytes.
  limit: number;

  // The amount of guaranteed memory.  Default is 0.
  // Units: bytes.
  reservation: number;

  // The amount of swap space requested. Default is unlimited (-1).
  // Units: bytes.
  swap_limit: number;
}

// Spec for custom metric.
export interface IMetricSpec {
  // The name of the metric.
  name: string;

  // Type of the metric.
  type: string;

  // Data Type for the stats.
  format: string;

  // Display Units for the stats.
  units: string;
}

export interface IFsStats {
  // The block device name associated with the filesystem.
  device: string;

  // Type of the filesytem.
  type: string;

  // Number of bytes that can be consumed by the container on this filesystem.
  capacity: number;

  // Number of bytes that is consumed by the container on this filesystem.
  usage: number;

  // Base Usage that is consumed by the container's writable layer.
  // This field is only applicable for docker container's as of now.
  base_usage: number;

  // Number of bytes available for non-root user.
  available: number;

  // HasInodes when true, indicates that Inodes info will be available.
  has_inodes: boolean;

  // Number of Inodes
  inodes: number;

  // Number of available Inodes
  inodes_free: number;

  // Number of reads completed
  // This is the total number of reads completed successfully.
  reads_completed: number;

  // Number of reads merged
  // Reads and writes which are adjacent to each other may be merged for
  // efficiency.  Thus two 4K reads may become one 8K read before it is
  // ultimately handed to the disk, and so it will be counted (and queued)
  // as only one I/O.  This field lets you know how often this was done.
  reads_merged: number;

  // Number of sectors read
  // This is the total number of sectors read successfully.
  sectors_read: number;

  // Number of milliseconds spent reading
  // This is the total number of milliseconds spent by all reads (as
  // measured from __make_request() to end_that_request_last()).
  read_time: number;

  // Number of writes completed
  // This is the total number of writes completed successfully.
  writes_completed: number;

  // Number of writes merged
  // See the description of reads merged.
  writes_merged: number;

  // Number of sectors written
  // This is the total number of sectors written successfully.
  sectors_written: number;

  // Number of milliseconds spent writing
  // This is the total number of milliseconds spent by all writes (as
  // measured from __make_request() to end_that_request_last()).
  write_time: number;

  // Number of I/Os currently in progress
  // The only field that should go to zero. Incremented as requests are
  // given to appropriate struct request_queue and decremented as they finish.
  io_in_progress: number;

  // Number of milliseconds spent doing I/Os
  // This field increases so long as field 9 is nonzero.
  io_time: number;

  // weighted number of milliseconds spent doing I/Os
  // This field is incremented at each I/O start, I/O completion, I/O
  // merge, or read of these stats by the number of I/Os in progress
  // (field 9) times the number of milliseconds spent doing I/O since the
  // last update of this field.  This can provide an easy measure of both
  // I/O completion time and the backlog that may be accumulating.
  weighted_io_time: number;
}

export interface IProcessStats {
  // Number of processes
  process_count: number;

  // Number of open file descriptors
  fd_count: number;
}

// An exported metric.
export interface IMetricVal {
  // Label associated with a metric
  label: string;

  // Time at which the metric was queried
  timestamp: string;

  // The value of the metric at this point.
  int_value: number;
  float_value: number;
}

// CPU usage time statistics.
export interface ICpuUsage {
  // Total CPU usage.
  // Unit: nanoseconds.
  total: number;

  // Per CPU/core usage of the container.
  // Unit: nanoseconds.
  per_cpu_usage: number[];

  // Time spent in user space.
  // Unit: nanoseconds.
  user: number;

  // Time spent in kernel space.
  // Unit: nanoseconds.
  system: number;
}

// Cpu Completely Fair Scheduler statistics.
export interface ICpuCFS {
  // Total number of elapsed enforcement intervals.
  periods: number;

  // Total number of times tasks in the cgroup have been throttled.
  throttled_periods: number;

  // Total time duration for which tasks in the cgroup have been throttled.
  // Unit: nanoseconds.
  throttled_time: number;
}

// Cpu Aggregated scheduler statistics
export interface ICpuSchedstat {
  // https://www.kernel.org/doc/Documentation/scheduler/sched-stats.txt

  // time spent on the cpu
  run_time: number;
  // time spent waiting on a runqueue
  runqueue_time: number;
  // # of timeslices run on this cpu
  run_periods: number;
}

export interface IMemoryStatsMemoryData {
  pgfault: number;
  pgmajfault: number;
}
