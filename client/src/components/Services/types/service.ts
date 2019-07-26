export interface IService {
  _id: string
  name: string
  description: string
  link: string
  tags: string[]
  image: string
  sub_services: ISubService[]
}

export interface ISubService {
  _id: string
  name: string
  file?: string
  variables: IServiceVariable[]
  active: boolean
}

export interface IGroupService {
  subServiceID: string
  template: string
  variables: IServiceVariable[]
  file: string
}

export interface IServiceVariable {
  name: string
  description: string
  value: string
  secret: boolean
}