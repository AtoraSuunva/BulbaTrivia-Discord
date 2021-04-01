//Invite the butt

module.exports.config = {
  name: 'invite',
  invokers: ['invite'],
  help: 'Get an invite for the bot/the help server!',
  expandedHelp:
    'Use `bulba invite` to invite the bot, `bulba invite server` for an invite to the help server (DMed to you) so you can yell at me.',
}

module.exports.events = {}
module.exports.events.message = (bot, message) => {
  let args = bot.sleet.shlex(message.content)

  if (args[1] === 'server' || args[1] === 'guild') {
    message.author.send('https://discord.gg/0w6AYrrMIUfO71oV')
    return message.channel.send('Sent! Check your DMs')
  }

  bot.generateInvite(['EMBED_LINKS']).then(link => {
    message.channel.send(
      `Invite me! ${link}\nUse \`bulba invite server\` for the help server!`,
    )
  })
}
