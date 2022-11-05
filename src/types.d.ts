export type SlackConfig = {
  xoxcToken: string,
  clientHeaders?: HeadersInit
}

export type API_METHODS =
  | 'users.channelSections.list'
  | 'users.channelSections.channels.bulkUpdate'
  | 'users.channelSections.create'
  | 'conversations.list'
  | 'users.list'

export type ChannelSection = {
  channel_section_id: string;
  name: string;
  type: string;
  emoji: string;
  next_channel_section_id: number;
  last_updated: number;
  channel_ids_page: {
    "channel_ids": string[],
    "count": number,
    "cursor": string
  };
  is_redacted: boolean;
}
