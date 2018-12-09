import { checkStatus } from "../../../utils/promises";
import { IGroup } from "../types/group";

export const fetchGroups = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchGroup = (groupID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups/${groupID}`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchContainers = (groupID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups/${groupID}/containers`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const saveGroup = (group: IGroup) => {
  return fetch(`${process.env.PUBLIC_URL}/api/groups`, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify(group),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const deployService = (
  groupID: string,
  serviceID: string,
  variables: any
) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/groups/${groupID}/start/${serviceID}`,
    {
      credentials: "same-origin",
      method: "POST",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json"
      }
    }
  )
    .then(checkStatus)
    .then((response: Response) => response.json());
};
