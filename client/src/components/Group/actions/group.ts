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
  return fetch(`${process.env.PUBLIC_URL}/api/groups/${groupID}/containers`, {
    credentials: "same-origin",
    method: "GET",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
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
  variables: any,
  opts: object
) => {
  let opt = "";
  for (const o in opts) {
    if (opts.hasOwnProperty(o)) {
      opt += `${o}=${opts[o]}&`;
    }
  }
  opt = opt.slice(0, -1);
  return fetch(
    `${
      process.env.PUBLIC_URL
    }/api/groups/${groupID}/create/${serviceID}?${opt}`,
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

export const startService = (groupID: string, serviceID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/start/${serviceID}`,
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

export const fetchCadvisorContainers = (groupID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/cadvisor/container`,
    {
      credentials: "same-origin",
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
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
}