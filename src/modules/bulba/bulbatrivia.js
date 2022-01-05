// @ts-check
// Yay Trivia
module.exports.config = {
  name: 'trivia',
  invokers: ['trivia'],
  help: 'Get some fun "trivia".',
  expandedHelp: 'Just run it fam',
}

const fetch = require('node-fetch')

const KEY = process.env.TUMBLR_CONSUMER_KEY
const BLOG_NAME = 'thanksbulbapedia'
const API_BASE = 'https://api.tumblr.com/v2/'
const QUOTE_BASE = `${API_BASE}blog/${BLOG_NAME}/posts/quote`

// fetch quotes from a tumblr blog
async function fetchQuotes(options) {
  const searchParams = new URLSearchParams({
    api_key: KEY,
    filter: 'text',
    limit: options.limit || 1,
  })

  if (options.offset !== undefined) {
    searchParams.set('offset', options.offset)
  }

  const url = `${QUOTE_BASE}?${searchParams}`
  const res = await fetch(url).then(res => res.json())

  totalPosts = res.response.total_posts
  return res.response.posts
}

let totalPosts = 1

// Fetch one post to initialize totalPosts
fetchQuotes({ limit: 1 })

module.exports.events = {}
module.exports.events.message = async (bot, message) => {
  const offset = randOffset(totalPosts - 1)
  const posts = await fetchQuotes({ limit: 1, offset })
  const post = posts[0]

  if (!post) {
    return message.channel.send('I failed to fetch a quote.')
  }

  const text = post.text.replace(/\n/g, '*\n> *')
  const source = post.source
  const url = post.post_url

  message.channel.send(`> *"${text}"*\n> —<${source}>\n> From <${url}>`)
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randOffset(max) {
  return randomInt(0, max)
}
