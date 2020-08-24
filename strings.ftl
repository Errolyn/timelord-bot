bot-description = A helpful server bot

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
coc-welcome-prompt = Hi { $userName }, welcome to **{ $serverName }**! When you have a moment check out our <#{ $cocChannel }> and once you have accepted it we will give you access to the rest of the server.

acceptcoc-cmd-description = Accepts our discords Code of Conduct
acceptcoc-cmd-full-description = Pings mods and applies the COC role if configured.
acceptcoc-member-message = Thanks for accepting the Code of Conduct, a mod will get you access to the wider server soon!

# $userId - The id of the user that accepted the CoC
accept-coc-admin-message = <@{ $userID }> has accepted the Code of Conduct.
