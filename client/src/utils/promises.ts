export function checkStatus(response: Response) {
    if (response.ok) {
      return Promise.resolve(response);
    }
    return response
      .text()
      .then(text =>
        Promise.reject(new Error(text || response.statusText)),
      );
  }
  