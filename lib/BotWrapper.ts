import eris, { CommandGenerator } from 'eris';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ftl from './ftl.js';

export type TimelordCommand = (options: { bot: BotWrapper }) => void;

export default class BotWrapper extends eris.CommandClient {
  constructor(
    token: string,
    options?: eris.ClientOptions,
    commandOptions: eris.CommandClientOptions = {},
  ) {
    if (!commandOptions.description) {
      commandOptions.description = ftl('bot-description');
    }
    super(token, options, commandOptions);
  }

  registerCommand(
    label: string,
    generator: CommandGenerator,
    { ftlVariables, ...options }: eris.CommandOptions & { ftlVariables?: unknown } = {},
  ): eris.Command {
    if (!options.description) {
      options.description = ftl(`${label}-cmd-description`, ftlVariables);
    }
    if (!options.fullDescription) {
      options.fullDescription = ftl(`${label}-cmd-full-description`, ftlVariables);
    }
    if (!options.errorMessage) {
      options.errorMessage = ftl(`error-unknown`);
    }

    const command = super.registerCommand(label, generator, options);
    return commandWrapper(command);
  }
}

function commandWrapper(command: eris.Command): eris.Command {
  return new Proxy(command, {
    get(obj, prop: string) {
      if (prop === 'registerSubcommand') {
        return (
          label: string,
          generator: eris.CommandGenerator,
          options: eris.CommandOptions = {},
        ) => {
          if (!options.description) {
            options.description = ftl(`${command.label}-${label}-cmd-description`);
          }
          if (!options.fullDescription) {
            options.description = ftl(`${command.label}-${label}-cmd-full-description`);
          }
          if (!options.errorMessage) {
            options.errorMessage = ftl(`error-unknown`);
          }

          return obj[prop](label, generator, options);
        };
      }

      if (has(obj, prop)) {
        return obj[prop];
      } else {
        return undefined;
      }
    },
  });
}

/** Check if `key` is a property on `x` in a type-safe way when `x` is `unknown` */
export function has<K extends string | symbol>(x: unknown, key: K): x is { [key in K]: unknown } {
  return !!(x && typeof x === 'object' && key in x);
}
