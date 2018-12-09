import { checkStatus } from "../../../utils/promises";
import { IService } from "../types/service";

export const fetchServices = () => {
  return fetch(`${process.env.PUBLIC_URL}/api/services`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchService = (serviceID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/services/${serviceID}`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const fetchServiceBySubService = (ssID: string) => {
  return fetch(`${process.env.PUBLIC_URL}/api/services/subservice/${ssID}`, {
    credentials: "same-origin",
    method: "GET"
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};

export const saveService = (service: IService) => {
  return fetch(`${process.env.PUBLIC_URL}/api/services`, {
    credentials: "same-origin",
    method: "POST",
    body: JSON.stringify(service),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(checkStatus)
    .then((response: Response) => response.json());
};
