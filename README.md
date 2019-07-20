## Discord music bot
Lucio bot is a straightforward music bot utilizing node, [discord.js](https://github.com/discordjs/discord.js), and modern (for the moment) javascript. Written primarily for fun and the learning experience it provides.

**[Issue tracker](https://bitbucket.org/PartyLich/disco_bot/issues)** is on bitbucket. Please use it for bugs, feature requests, and similar ideas.

* Requires ffmpeg installed on the system running him.
* Requires node
* Create a config.json file with your desired command prefix and API tokens. Example in ./src/config-example.json

---
Dev 
1. `npm i`
1. `npm run startb` or `npm run mon`

Not-so-dev
1. `npm i`
1. `npm run build` or `npm run build:prod` (cleans up the src folder)
1. `npm start`

## Contributing
If you're interested in contributing, please
* get in touch or
* send a pull request or
* submit an issue (bug, enhancement, feature, etc)

He's in need of tests. I feel tremendously guilty about not operating even a loose TDD setup here, but what's done is done. Better to fix it going forward than fret over the past.
