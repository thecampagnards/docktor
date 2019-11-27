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

export const fetchGroupsByDaemon = (daemonID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups/daemon/${daemonID}`, {
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

export const deleteGroup = (groupID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups/${groupID}`, {
    credentials: "same-origin",
    method: "DELETE",
    headers: new Headers({
      Authorization: `Bearer ${GetToken()}`
    })
  })
    .then(checkStatus)
    .then(response => response.json());
}

export const deployService = (
  groupID: string,
  serviceID: string,
  serviceName: string,
  variables: any,
  opts: Map<string, string>,
  force: boolean
) => {
  let opt = "";
  opts.forEach(o => opts.has(o) && (opt += `&${o}=${opts.get(o)}`));
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/compose/create/${serviceID}?service-name=${serviceName}&force=${force}${opt}`,
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

export const updateServiceStatus = (
  groupID: string,
  serviceName: string,
  status: string,
  removeData?: boolean
) => {
  return fetch(
    `${
      process.env.PUBLIC_URL
    }/api/groups/${groupID}/compose/status/${serviceName}?status=${status}&${
      removeData ? "remove-data=true" : "remove-data=false"
    }`,
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

export const getServiceStatus = (groupID: string, serviceName: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/compose/status/${serviceName}`,
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

export const saveGroupService = (
  groupID: string,
  serviceName: string,
  file: string
) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/services/${serviceName}`,
    {
      credentials: "same-origin",
      method: "POST",
      body: file,
      headers: new Headers({
        Authorization: `Bearer ${GetToken()}`
      })
    }
  )
    .then(checkStatus)
    .then(response => response.json());
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
