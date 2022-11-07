import * as ui from "../ui";
import Slack from "../services/slack";
import {getSlackToken, setSlackToken} from "./sharedUtils";

/**
 * A simple function which communicates with storage to initialise slack.
 *
 * There is no need to call util.captureXoxcToken() as it is automatically called whenever a request is made to the
 * Slack API.
 */
export async function InitSlack() {
  return new Slack({xoxcToken: await getSlackToken()});
}

export function invalidateToken() {
  setSlackToken(undefined).then(() => console.warn('Cleared invalid token'));
  ui.statusIndicator.setIsOk(false);
}

export function swap(json: Record<any, any>) {
  const result: Record<any, any> = {};
  for(const key in json) result[json[key]] = key;
  return result;
}
