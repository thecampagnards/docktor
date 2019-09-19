import { checkStatus } from '../../../utils/promises';
import { GetToken } from '../../User/actions/user';
import { IGroup } from '../types/group';

export const fetchGroups = (all: boolean) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups?all=${all}`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then(response => response.json());
};

export const fetchGroup = (groupID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups/${groupID}`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then(response => response.json());
};

export const fetchContainers = (groupID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/docker/containers`,
    {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
    .then(checkStatus)
    .then(response => response.json());
};

export const saveContainers = (groupID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/docker/containers`,
    {
      credentials: "same-origin",
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
    .then(checkStatus)
    .then(response => response.json());
};

export const transformServices = (groupID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/docker/containers/transform`,
    {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
    .then(checkStatus)
    .then(response => response.json());
};

export const saveGroup = (group: IGroup) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups`, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify(group),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GetToken()}`
    }
  })
    .then(checkStatus)
    .then(response => response.json());
};

export const deployService = (
  groupID: string,
  serviceID: string,
  serviceName: string,
  variables: any,
  opts: Map<string, string>
) => {
  let opt = "";
  opts.forEach(o => opts.has(o) && (opt += `${o}=${opts.get(o)}&`));
  opt = opt.slice(0, -1);
  return fetch(
    `${
      process.env.PUBLIC_URL
    }/api/groups/${groupID}/compose/create/${serviceID}?service-name=${serviceName}${opt && "&" + opt}`,
    {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GetToken()}`
      }
    }
  )
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const updateServiceStatus = (groupID: string, serviceID: string, status: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/compose/status/${serviceID}?status=${status}`,
    {
      credentials: "same-origin",
      method: "POST",
      headers: {
        Authorization: `Bearer ${GetToken()}`
      }
    }
  )
    .then(checkStatus)
    .then(response => response.json());
};

export const getServiceStatus = (groupID: string, serviceID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/compose/status/${serviceID}`,
    {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
    .then(checkStatus)
    .then(response => response.json())
};

export const getService = (groupID: string, serviceID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/compose/file/${serviceID}`,
    {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
    .then(checkStatus)
    .then(response => response.text());
};

export const fetchCadvisor = (groupID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups/${groupID}/cadvisor`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const updateUser = (groupID: string, userID: string, status: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/updateuser/${userID}/${status}`,
    {
      credentials: "same-origin",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GetToken()}`
      }
    }
  )
    .then(checkStatus)
    .then(response => response.json());
};
