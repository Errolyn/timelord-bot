bot-description = A helpful server bot

## General messages

error-unknown-subcommand = Unknown subcommand
error-unknown = Uh oh, something went wrong

## Ping Command

ping-cmd-description = Pong!
ping-cmd-full-description = Used to see if the bot is responding

# $pingCount (Number) - The number of times the bot has been pinged
ping-response =
  { $pingCount ->
    [1] I have been pinged once since I last took a nap.
    [2] I have been pinged twice since I last took a nap.
    *[other] I have been pinged { $pingCount } times since I last took a nap.
  }


## News command

-news-channel-name = #news-feed
news-cmd-description = News feed
news-cmd-full-description = Use this command to add content to { -news-channel-name }

# $userName - The user that posted the news
# $messageChannelName - The name of the channel that the user ran the command in.
#   May also be the localizable string with id 'news-dm-description'.
# $contentForNewsChannel - The text the user provided
news-post-message =
  { $userName } posted in { $messageChannelName }:
  { $contentForNewsChannel }

news-dm-description = a DM


## Roll command

roll-cmd-description = Rolls dice and outputs the resulting value

roll-cmd-full-description =
  Use this command with typical dice notation `amount d sides + modifier`.
  Add an `r` at the end for rerolling 1s.
  Examples:
    !roll 2d4
    !roll 5d6+4
    !roll 2d20+2r

# $amount (Number) - The number of dice rolled
# $sides (Number) - The number of sides the rolled dice had
# $modifier - The modifier applied to the roll. Ex: '+1' or '-2'
# $result (Number) - The result of the roll
roll-output =
  { $amount ->
    [1] A d{ $sides } { $modifier } was rolled to get { $result }
    *[other] { $amount } d{ $sides }s { $modifier } were rolled to get { $result }
  }

roll-error-invalid-chars = Please remove invalid characters
roll-error-multiple-parts = You can have one dice, modifier, or operator at a time
roll-error-r-not-at-end = "r" should only be at the end of your command
roll-error-atleast-one-die = Must roll at least one dice
roll-error-too-many-dice = You do not need that many dice
roll-error-no-dice-description = You must have a dice declared
roll-error-too-many-operators = You may only have one modifier or operator
roll-error-too-few-dice-sides = Dice must have more than one side


## Accept CoC command

# $userName - The user that joined
# $serverName - The name of the server the user joined
# $cocChannel - The Discord ID of the CoC channel for the server
coc-welcome-prompt = Hi { $userName }, welcome to **{ $serverName }**! When you have a moment check out our { $channelLink } and once you have accepted it we will give you access to the rest of the server.

acceptcoc-cmd-description = Accepts our discords Code of Conduct
acceptcoc-cmd-full-description = Pings mods and applies the COC role if configured.
acceptcoc-member-message = Thanks for accepting the Code of Conduct, a mod will get you access to the wider server soon!

# $user - The discord formated id of the user that accepted the CoC
acceptcoc-admin-message = { $user } has accepted the Code of Conduct.


## Voice Channel Manager command

voice-channel-cmd-description = Manage temporary voice channels
voice-channel-cmd-full-description =
  { voice-channel-cmd-description }. Once empty, channels will last { $channelTimeoutMinutes } minutes before expiring. Channels marked with a { $channelCleanupEmoji } will be deleted soon if no-one joins them.

  When specifying the names of existing channels for deletion or renaming, case doesn't matter and any unique substring can be used. For example, "Streaming Minecraft" could be matched by specifying only "minecraft" if no other channels contain the word minecraft.

voice-channel-create-cmd-description = Make a new channel with the given name.
voice-channel-create-cmd-full-description = { voice-channel-create-cmd-description }
voice-channel-delete-all-cmd-description = Delete ALL channels and groups made by the !vc command.
voice-channel-delete-all-cmd-full-description = { voice-channel-delete-all-cmd-description }
voice-channel-delete-cmd-description = Delete one channel made by the !vc command.
voice-channel-delete-cmd-full-description = { voice-channel-delete-cmd-description }
voice-channel-debug-cmd-description = Debug the !vc command.
voice-channel-debug-cmd-full-description = { voice-channel-debug-cmd-description }
voice-channel-rename-cmd-description = Updates a current channel's name.
voice-channel-rename-cmd-full-description = { voice-channel-rename-cmd-description }

# $prefixEmoji
# $confirmEmoji
# $cancelEmoji
voice-channel-cmd-delete-all-warning =
 Are you sure you want to delete ALL { $prefixEmoji } automatic voice channels?

  { $confirmEmoji } - Yes, delete them all.
  { $cancelEmoji } - No, I changed my mind.

voice-channel-cmd-delete-all-canceled = Ok, I won't delete anything.
voice-channel-cmd-delete-all-completed = All the automatic channels are gone now!

voice-channel-cmd-error-channel-not-found = I couldn't find just one { $prefixEmoji } channel with that search term. Try again?

# $channelName
voice-channel-cmd-error-channel-not-empty = You can't delete { $channelName } because people are still using it.
voice-channel-cmd-error-channel-name-too-long = That channel name is too long, sorry.
