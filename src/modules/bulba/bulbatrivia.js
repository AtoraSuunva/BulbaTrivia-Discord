// Yay Trivia
const config = module.exports.config = {
  name: 'trivia',
  invokers: ['trivia'],
  help: 'Get some fun "trivia".',
  expandedHelp: 'Just run it fam'
}

const Discord  = require('discord.js')
const tumblr   = require('tumblr')
const entities = require('entities')
const auth = require('./auth.json')

const blog = new tumblr.Blog('thanksbulbapedia.tumblr.com', {consumer_key: auth.tumblr})

let totalPosts = 0

blog.quote({limit: 1}, (e, r) => {
  if (e) throw e

  totalPosts = r.total_posts
})

module.exports.events = {}
module.exports.events.message = (bot, message) => {
  const [cmd] = bot.sleet.shlex(message)

  if (cmd && !config.invokers.includes(cmd.toLowerCase())) return

  blog.quote({limit: 1, offset: randOffset(totalPosts - 1)}, (e,r) => {
    if (e) {
      message.channel.send('Something went wrong while getting the quote...')
      bot.logger.error(e)
    }

    if (r.posts[0] == undefined) return

    totalPosts = r.total_posts

    let text = clean(r.posts[0].text).replace(/<br\/?>/g, '')
    let source = r.posts[0].source

    if (r.posts[0].source && r.posts[0].source.match(/<a.*?>(.*?)<\/a>/)[1] !== undefined)
      source = source.match(/<a.*?>(.*?)<\/a>/)[1]

    message.channel.send(
      `*"${text}"*\n` +
      `—${source}`
    )
  })
}

function clean(str) {
  return Discord.Util.escapeMarkdown(entities.decodeHTML(str))
}

function randOffset(max) {
  return Math.floor(Math.random() * (max));
}
