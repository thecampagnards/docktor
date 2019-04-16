export interface IService {
  _id: string
  name: string
  description: string
  link: string
  tags: string[]
  image: string
  sub_services?: ISubService[]
}

export interface ISubService {
  _id?: string
  name: string
  file?: string
  active: boolean
  variables: any
}