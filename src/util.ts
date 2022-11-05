import WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;
import Slack from "./slack";


/**
 * A simple function which communicates with storage to initialise slack.
 *
 * There is no need to call util.captureXoxcToken() as it is automatically called whenever a request is made to the
 * Slack API.
 */
export async function InitSlack() {
  // Init slack
  const xoxcToken = await getSlackToken();

  if (!xoxcToken) {
    alert('❌ No xoxc token found. Please login to Slack and try again.');
    return new Slack({xoxcToken: ''});
  }

  return new Slack({xoxcToken});
}

export function getSlackToken() {
  return new Promise((resolve: (value: string | undefined) => void, reject) => {
    chrome.storage.local.get(['xoxcToken'], (result) => {
      if (result.xoxcToken) {
        resolve(result.xoxcToken);
      } else {
        reject();
      }
    });
  });
}

export function setSlackToken(token: string) {
  return new Promise((resolve: (value: string | undefined) => void) => {
    chrome.storage.local.set({ xoxcToken: token }, () => {
      resolve(token);
    });
  });
}

export function captureXoxcToken(details: WebRequestBodyDetails) {
  // Check chrome.storage.local for token
  getSlackToken().then((tokenFromStorage) => {
    if (tokenFromStorage) return;

    // When no token can be found in chrome.storage.local, check the request body for the xoxc token
    const xoxcToken = details?.requestBody?.formData?.token[0];

    if (xoxcToken) {
      setSlackToken(xoxcToken).then(() => {
        console.log('✅ Slack xoxc token captured.')
      }).catch(console.error);
    }
  });
}

export function swap(json: Record<any, any>) {
  const result: Record<any, any> = {};
  for(const key in json) result[json[key]] = key;
  return result;
}
