# timelord-bot

To start the timelord bot locally you will need to set the following env variables:

- TOKEN='' _Discords bot token_
- NEWS_CHANNEL='' _Channel number for whichever room you want a news feed in._
- COC_CHANNEL_ID='' _Channel where new members should be directed. Optional_
- COC_ROLE_ID='' _This is the role that will be applied when a member agrees to your code of conduct. Optional_
- ADMIN_CHANNEL_ID='' _The room where you would like notifications on when a member has agreed to the Code of Conduct. Optional_

You will need to install dependentcies `yarn install`

Add envs to a .env file and run `source .env`

To run: `yarn start`
