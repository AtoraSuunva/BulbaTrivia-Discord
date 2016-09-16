/*jshint esversion: 6 */
/*jshint evil: true*/
//MUAHAHAHAHA I'M EVIL

//SETUP

const Discord = require('discord.js'); //Handles the API
const tumblr = require('tumblr'); //tumblr woo
const entities = require("entities"); //fug enities
const Auth = require('./auth.json'); //Auth details

const version = '1.1.0';

var totalPosts = 0; //For random quotes, you'll see why later
var currentOffset = 0;

var oauth = {
  consumer_key: Auth.tumblr.token
};

var bulba = new Discord.Client();

var blog = new tumblr.Blog('thanksbulbapedia.tumblr.com', oauth);

const inviteLink = "https://discordapp.com/oauth2/authorize?client_id=200723686205030400&scope=bot&permissions=0";

bulba.on('ready', () => {
  bulba.user.setStatus('online', '+bulba | +bulba help');

  blog.quote({limit: 1}, function(error, response) {
    if (error) {
      throw new Error(error);
    }
    totalPosts = response.total_posts;
  });

  console.log('Everything is ready!');
});

//ACTUAL BOT
bulba.on('message', message => { //switch is for the weak
  if (message.author.equals(bulba.user) || message.author.bot) return; //Don't reply to itself or bots

  message.content = cleanMessage(message); //Clean stuff between `` so it doesn't bother reading code

  if(message.content.indexOf('+bulba help') === 0) {
    message.channel.sendMessage('```xl' + '\n' +
      '+bulba        => Trivia from BulbaPedia.' + '\n' +
      '+bulba info   => Info about the bot.' + '\n' +
      '+bulba help   => Help menu (you know, this one).' + '\n' +
      '+bulba invite => Invite this useless bot.' + '\n' +
      '```');
    return;
  }

  if(message.content.indexOf('+bulba info') === 0) {
    message.channel.sendMessage(
      'BulbaTrivia V' + version + ' by AtlasTheBot (@Atlas)' + '\n' +
      'Source: https://github.com/AtlasTheBot/BulbaTrivia-Discord' + '\n' +
      'Official Chat: https://discord.gg/0w6AYrrMIUfO71oV' + '\n' +
      'Source of quotes: https://thanksbulbapedia.tumblr.com' + '\n' +
      'Made with tears and love');

    return;
  }

  if(message.content.indexOf('+bulba invite') === 0) {
    message.channel.sendMessage(
      'Invite Link: ' + inviteLink + '\n' +
      'but why?'
    );
    return;
  }

  if(message.content.indexOf('+bulba') === 0) {
    currentOffset = randInt(totalPosts - 1); //From 0 to totalPosts, to get a random quote
    //-1 because after an offset of totalPosts there's nothing

    //Quick tutorial on how I get random quotes
    //1. Get the number of posts
    //2. Get a random number from 0 to totalPosts
    //3. Use that as a offset

    blog.quote({limit: 1, offset: currentOffset}, function(error, response) {
      if (error) {
        message.channel.sendMessage('Sorry! Something went wrong! Tell Atlas `that\'s it, I quit`.');
        throw new Error(error);
      }

      if (response.posts[0] !== undefined) {
        totalPosts = response.total_posts; //update because why not

		if (response.posts[0].source.match(/<a.*?>(.*?)<\/a>/)[1] !== undefined) { //quick and dirty fix ;)
			message.channel.sendMessage(
			  '*"' + entities.decodeHTML(response.posts[0].text) + '"*' + '\n' +
			  '—' + response.posts[0].source.match(/<a.*?>(.*?)<\/a>/)[1]
      );
		} else {
			message.channel.sendMessage(
			  '*"' + entities.decodeHTML(response.posts[0].text) + '"*' + '\n' +
			  '—__' + response.posts[0].source + '__'
      );
		}

        console.log('Showed ' + response.posts[0].short_url + ' to ' + message.author.username + '#' + message.author.discriminator + ' (' + message.author.id + ')');
      } else {
        console.log('aaaaaaaaaaaaaaaaaaaaaaa: ' + currentOffset);
        message.channel.sendMessage('Sorry! Something went wrong! Tell Atlas `posts undefined`.');
      }
    });

    return; //stop
  }

  if(message.content.indexOf('++bulba eval') === 0) {

    if (message.author.id !== "74768773940256768") { //ain't nobody else runnin' eval on my watch
      message.channel.sendMessage('no');
      return;
    }

    var content = message.content.replace('++bulba eval', '');

    console.log('-------------------------EVAL STUFF');

    try {
      var result = eval(content);
      console.log(result);
      message.channel.sendMessage('`' + result + '`');
    } catch (err) {
      console.log(err);
      message.channel.sendMessage('`' + err + '`');
    }
  }
});

//FUNCTIONS

const thingsToClean = [/`{1,}\n?(.*\n?)*`{1,}/]; //In case I want to expand the black list later
//HORRIBLE CONFUSING REGEX GO!

function cleanMessage(message) { //wosh your code
  var cleanContent = message.content; //wow well done look at the effort

  for (i = 0; i <= thingsToClean.length; i++) { //JSHint screams if you declare i (var i)
      cleanContent = cleanContent.replace(thingsToClean[i], '');
  }

  return cleanContent;
}

function randInt(max) { //1-max, for the offset
    return Math.floor(Math.random() * (max));
}

//AUTH STUFF

if (Auth.discord.token !== '') {
  console.log('Logged in with token!');
  bulba.login(Auth.discord.token);
} else if (Auth.discord.email !== '' && Auth.discord.password !== '') {
  console.log('Logged in with email + pass!');
  bulba.login(Auth.discord.email, Auth.discord.password);
} else {
  console.log('No authentication details found!');
  process.exit(1);
}
