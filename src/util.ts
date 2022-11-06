import * as ui from "./ui";
import WebRequestBodyDetails = chrome.webRequest.WebRequestBodyDetails;
import Slack from "./slack";

/**
 * A simple function which communicates with storage to initialise slack.
 *
 * There is no need to call util.captureXoxcToken() as it is automatically called whenever a request is made to the
 * Slack API.
 */
export async function InitSlack() {
  return new Slack({xoxcToken: await getSlackToken()});
}

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

export function invalidateToken() {
  setSlackToken(undefined).then(() => console.warn('Cleared invalid token'));
  ui.statusIndicator.setIsOk(false);
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
      ui.statusIndicator.setIsOk(true)
      return;
    }

    ui.statusIndicator.setIsOk(false)

    if (foundXoxcToken) {
      setSlackToken(foundXoxcToken).then(() => {
        console.log('✅ Slack xoxc token captured.')
        ui.statusIndicator.setIsOk(true);
        ui.visitSlackNotice.show(false);
        ui.introduction.show(true);
      }).catch(console.error);
    }
  });
}

export function swap(json: Record<any, any>) {
  const result: Record<any, any> = {};
  for(const key in json) result[json[key]] = key;
  return result;
}
