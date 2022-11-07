import WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;

export function getSlackToken() {
  return new Promise((resolve: (value: string | undefined) => void, reject) => {
    chrome.storage.local.get(['xoxcToken'], (result) => {
      resolve(result.xoxcToken); // We always resolve the promise, even if the token is undefined

      if (!result.xoxcToken) {
        reject('No xoxc token found');
      }
    });
  });
}

export function setSlackToken(token: string | undefined) {
  return new Promise((resolve: (value: string | undefined) => void) => {
    chrome.storage.local.set({ xoxcToken: token }, () => {
      resolve(token);
    });
  });
}

export function getSlackApiHost() {
  return new Promise((resolve: (value: string | undefined) => void) => {
    chrome.storage.local.get(['apiHost'], (result) => {
      resolve(result.apiHost);
    });
  });
}

export function setSlackApiHost(host: string) {
  return new Promise((resolve: (value: string) => void) => {
    chrome.storage.local.set({ apiHost: host }, () => {
      resolve(host);
    });
  });
}

export function captureXoxcToken(details: WebRequestBodyDetails) {
  // Check chrome.storage.local for token
  getSlackToken().then((tokenFromStorage) => {
    // Check the request body for a xoxc token
    const foundXoxcToken = details?.requestBody?.formData?.token[0];

    // If we've found a token in storage, we can return early but only if the token in the request body is:
    // 1. not undefined
    // 2. the same as the token in storage
    if (tokenFromStorage && foundXoxcToken && tokenFromStorage === foundXoxcToken) {
      return;
    }

    if (foundXoxcToken) {
      Promise.all([
        setSlackApiHost(new URL(details.url).origin + '/api'),
        setSlackToken(foundXoxcToken)
      ]).then(() => {
        console.log('✅ Slack xoxc token captured.')
      }).catch(console.error)
    }
  });
}
