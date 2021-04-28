import { Message } from 'eris';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ftl from '../lib/ftl';

// General functions that are command agnostic.
export function stripContent(messageContent: string): string {
  const stringParts = messageContent.split(' ');
  stringParts.shift();

  const userPost = stringParts.join(' ');
  return userPost;
}

export function memberName(msg: Message): string {
  if (msg.channel.type === 0) {
    return msg.member?.nick ?? msg.author.username; //Prefers member nickname when available
  } else if (msg.channel.type === 1) {
    return msg.author.username; //Nickname not available from DMs
  }
  return 'unknown';
}

export function incomingChannel(msg: Message): string {
  if (msg.channel.type === 0) {
    return msg.channel.name;
  } else if (msg.channel.type === 1) {
    return ftl('news-dm-description'); //There is no built in name for the DM channel
  }
  return 'unknown';
}

export function getRandomNumber(max: number): number {
  const randomNumber = Math.floor(Math.random() * max) + 1;
  return randomNumber;
}

export class Deferred<T> {
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  promise: Promise<T>;

  constructor() {
    this.resolve = () => {
      void 0;
    };
    this.reject = () => {
      void 0;
    };
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
