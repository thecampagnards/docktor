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

export const changeContainersStatus = (
  daemonID: string,
  status: string,
  containers: string[]
) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/daemons/${daemonID}/containers/status?status=${status}&containers=${containers.join(',')}`,
    {
      credentials: "same-origin",
      method: "POST"
    }
  )
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const changeServicesStatus = (
  daemonID: string,
  status: string,
  services: string[]
) => {
  return fetch(
    `${process.env.PUBLIC_URL}/api/daemons/${daemonID}/services/status?status=${status}&services=${services.join(',')}`,
    {
      credentials: "same-origin",
      method: "POST"
    }
  )
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

export const execCommand = (daemon: IDaemon, commands: string[]) => {
  return fetch(`${process.env.PUBLIC_URL}/api/daemons/${daemon._id}/ssh/exec`, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify(commands),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};