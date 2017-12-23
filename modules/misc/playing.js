//set a random playing game every X whatever
module.exports.config = {
  name: 'playing',
  invokers: ['playing'],
  help: 'Randomizes playing/allows manual playing setting',
  expandedHelp: '`playing`\nSelect new random playing\n`playing [something]`\nNew custom playing, stays until bot reboot/`playing` is used',
  invisible: true
}

const playings = [
'with Mediawiki!', 'on Bulbapedia!', 'I\'m #1!', 'フシギダネ', 'with some random facts',
'with """"fun"""" facts', '"thanks", bulbapedia', 'Pick me!',
'{streaming} the pokeyman anime!', '{streaming} pokerman', '{streaming} the Digimon anime',
'{streaming} Brock\'s 10/10 abs', '{streaming} a high class battle!',
'{streaming} a Bulbasaur yelling for 10h straight',
'Bul!', 'Ba!', 'Bulba!', 'Saur!', 'Bulbasaur!',
'alone', 'with Atlas!', 'with RobotOtter!', 'with Smol Bot!', 'with Haram-- wait he\'s dead',
'{streaming} memes.', '{streaming} Atlas Dying.',
'Pokemon Sun', 'Pokemon Moon', 'Pokemon Super Mystery Dungeon', 'Pokemon Pearl!',
'as a bulbasaur', 'as an Ivysaur (I wish)', 'as a Venusaur (One day...)',
'in Kanto\'s hidden garden', '{streaming} the Bulba-by', 'fuck yeah grass',
'<one more level...>', 'in the sun~!',
'{streaming} the Twitch logout page.', '{streaming} Playing', 'Streaming',
'does anyone read this?', 'send nudes', 'send dudes', '{streaming} Atlas crying while debugging'
]

//strings starting with '{streaming}' will be shown as "Streaming X"
const append = ' | bulba help | p?help' //use this to keep a constant message after
const interval = 60 * 15 //in seconds
const twitch = 'https:\/\/twitch.tv/logout' //memes
let interv

module.exports.events = {}

module.exports.events.ready = bot => {
  bot.user.setGame(getPlaying())
  interv = setInterval(() => bot.user.setPresence({game: getPlaying()}), interval * 1000)
}

module.exports.events.message = (bot, message) => {
  let args = bot.modules.shlex(message)

  if (message.author.id !== bot.modules.config.owner.id)
    return message.channel.send('Nah, how about I play what I want.')

  if (args[1] === undefined) {
    let game = getPlaying()
    bot.user.setPresence({game})
    interv = setInterval(() => bot.user.setPresence({game: getPlaying()}), interval * 1000)
    message.channel.send(`Now *${(game.url) ? 'streaming' : 'playing'}* **${game.name}**`)
  } else {
    bot.user.setPresence({game: {name: args[1], url: (args[2]) ? twitch : undefined, type: 0}})
    clearInterval(interv)
    message.channel.send(`Now *${(args[2]) ? 'streaming' : 'playing'}* **${args[1]}**`)
  }
}

//returns an array of [game, ?streamLink]
//steamLink if applicable
function getPlaying() {
  let streamLink
  let game = randChoice(playings) + append

  if (game.startsWith('{streaming}')) {
    streamLink = twitch
    game = game.replace(/^{streaming}\s+/, '')
    return {name: game, url: streamLink, type: 0}
  }

  return {name: game, type: 0}
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

