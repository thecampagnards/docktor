import { IService } from "src/components/Services/types/service";

export interface IGroup {
  _id: string;
  Name: string;
  Description: string;
  DaemonID: string;
  Services: IServiceGroup[];
}

export interface IServiceGroup {
  _id: string;
  SubService: IService;
  Variables: any;
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
  Names: string[];
  NetworkSettings: any;
  Ports: IPort[];
  State: string;
  Status: string;
}

export interface IPort {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}