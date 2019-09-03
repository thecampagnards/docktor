export interface IDaemon {
  _id: string;
  name: string;
  description: string;
  cadvisor: string;
  host: string;
  tags: string[];
  docker: IDocker;
  ssh: ISSH;
}

export type dockerStatus = "OK" | "DOWN" | "OLD" | "CERT" | "";

export interface IDocker {
  status: dockerStatus;
  port: number;
  volume: string;
  certs: ICerts;
}

export interface ICerts {
  cert: string;
  ca: string;
  key: string;
}

export interface ISSH {
  port: number;
  user: string;
  password: string;
  commands: string[];
}

export interface IContainer {
  Command: string;
  Created: number;
  HostConfig: { NetworkMode: string };
  Id: string;
  Image: string;
  ImageID: string;
  Labels: string[];
  Mounts: [
    {
      Type: string;
      Name: string;
      Source: string;
      Destination: string;
      Driver: string;
      Mode: string;
      RW: boolean;
    }
  ];
  Name: string;
  Names: string[];
  NetworkSettings: any;
  Ports: IPort[];
  State: string;
  Status: string;
  Config: {
    Image: string;
  }
}

export interface IPort {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

