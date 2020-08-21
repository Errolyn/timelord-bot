# timelord-bot

To start the timelord bot locally you will need to set the following env variables:

- TOKEN='' *Discords bot token*
- NEWS_CHANNEL='' *Channel number for whichever room you want a news feed in.*
- COC_CHANNEL_ID='' *Channel where new members should be directed. Optional*
- COC_ROLE_ID='' *This is the role that will be applied when a member agrees to your code of conduct. Optional*
- ADMIN_CHANNEL_ID='' *The room where you would like notifications on when a member has agreed to the Code of Conduct. Optional*

You will need to install dependentcies `yarn install`

Add envs to a .env file and run `source .env`

To run: `yarn start`
