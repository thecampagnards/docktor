export interface IService {
  _id: string;
  name: string;
  description: string;
  link: string;
  tags: string[];
  image: string;
  sub_services: ISubService[];
  admin: boolean;
}

export interface ISubService {
  _id: string;
  name: string;
  file: string;
  compose?: string;
  variables: IServiceVariable[];
  active: boolean;
  version_index: number;
  update_index: number;
}

export interface IGroupService {
  sub_service_id: string;
  name: string;
  variables: IServiceVariable[];
  file: string;
  url: string;
}

export interface IServiceVariable {
  name: string;
  description: string;
  value: string;
  secret: boolean;
  optional: boolean;
}
