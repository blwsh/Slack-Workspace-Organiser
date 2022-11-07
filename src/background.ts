import {captureXoxcToken} from "./utils/sharedUtils";

console.log('Slack Org Sidebar Organiser created by Ben Watson')

// Find and store tokens which are used to authenticate with Slack
chrome.webRequest.onBeforeRequest
  .addListener(captureXoxcToken, {urls: ["https://*.slack.com/api/*"]}, ["requestBody"]);
