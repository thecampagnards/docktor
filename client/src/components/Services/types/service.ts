export interface IService {
  _id: string
  Name: string
  Description: string
  Link: string
  Tags: string[]
  Image: string
  SubServices: ISubService[]
}

export interface ISubService {
  _id?: string
  Name: string
  File: string
  Active: boolean
  Variables?: any
}