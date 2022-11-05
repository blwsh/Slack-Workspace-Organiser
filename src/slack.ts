import {API_METHODS, SlackConfig} from "./types";

export default class Slack {
  constructor(
    private config: SlackConfig
  ) {
    if (!config.xoxcToken) {
      throw new Error('No xoxc token provided');
    }
  }

  async postMessage(action: API_METHODS, body: Record<string, string | Blob> = {}): Promise<any> {
    const formData = new FormData()

    // Add the xoxc token to the request body
    formData.append('token', this.config.xoxcToken);

    // Add the action to the request body
    Object.entries(body).forEach(([key, value]) => formData.append(key, value));

    const response = await fetch(`https://txdo.slack.com/api/${action}`, {
      method: 'POST',
      "referrerPolicy": "no-referrer",
      headers: this.config.clientHeaders,
      body: formData,
    });

    return response.json();
  }

  async getConversationIdsToNameMap(
    userIdsToNameMap: { [key: string]: string },
    nextCursor?: string
  ): Promise<{ [key: string]: string }> {
    // Request Slack API for channel names and map them to ids
    return this.postMessage('conversations.list', {
      cursor: nextCursor || '',
      limit: '750',
      types: 'public_channel,private_channel,im',
    }).then(async res => {
      const {channels} = res as { channels: { id: string, name: string, user?: string }[] };
      const channelMap: { [key: string]: string } = {};

      channels.forEach(({id, name, user}) => {
        channelMap[id] = user ? (userIdsToNameMap[user] || user) : `#${name}`
      });

      // If there are more channels, recursively call this function
      if (res.response_metadata.next_cursor) {
        return {
          ...channelMap,
          ...await this.getConversationIdsToNameMap(userIdsToNameMap, res.response_metadata.next_cursor)
        };
      } else {
        return channelMap;
      }
    });
  }

  async listUsers(nextCursor?: string): Promise<{ [key: string]: string }> {
    // Request Slack API for channel names and map them to ids
    return this.postMessage('users.list', {
      cursor: nextCursor || '',
      limit: '750',
    }).then(async res => {
      const {members} = res as { members: { id: string, name: string }[] };
      const userMap: { [key: string]: string } = {};
      members.forEach(({id, name}) => userMap[id] = name);

      // If there are more channels, recursively call this function
      if (res.response_metadata.next_cursor) {
        return {...userMap, ...await this.listUsers(res.response_metadata.next_cursor)};
      } else {
        return userMap;
      }
    });
  }
}