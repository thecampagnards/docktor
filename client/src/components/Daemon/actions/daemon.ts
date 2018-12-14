import { checkStatus } from "../../../utils/promises";
import { IDaemon } from "../types/daemon";

export const fetchDaemons = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/daemons`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchDaemon = (daemonID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/daemons/${daemonID}`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchContainers = (daemonID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/daemons/${daemonID}/containers`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchCadvisorContainers = (daemonID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/daemons/${daemonID}/cadvisor/container`,
    {
      credentials: "same-origin",
      method: "GET"
    }
  )
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchCadvisorMachine = (daemonID: string) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/daemons/${daemonID}/cadvisor/machine`,
    {
      credentials: "same-origin",
      method: "GET"
    }
  )
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const saveDaemon = (daemon: IDaemon) => {
  return fetch(`${process.env.PUBLIC_URL}/api/daemons`, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify(daemon),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
