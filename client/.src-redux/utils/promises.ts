export function checkStatus(response: Response) {
    if (response.ok) {
      return Promise.resolve(response);
    }
    return response
      .json()
      .then(json =>
        Promise.reject(new Error(json.message || response.statusText)),
      );
  }
  