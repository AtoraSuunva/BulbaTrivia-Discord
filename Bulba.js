/*jshint esversion: 6 */
/*jshint evil: true*/
//MUAHAHAHAHA I'M EVIL

//SETUP

const Discord = require('discord.js'); //Handles the API
const tumblr = require('tumblr'); //tumblr woo
const Auth = require('./auth.json'); //Auth details
var entities = require("entities"); //fug enities

const version = '1.0.2';

var totalPosts = 0; //For random quotes, you'll see why later
var currentOffset = 0;

var oauth = {
  consumer_key: Auth.tumblr.token
};

var bulba = new Discord.Client({
  "autoReconnect": true
});

var blog = new tumblr.Blog('thanksbulbapedia.tumblr.com', oauth);

const inviteLink = "https://discordapp.com/oauth2/authorize?client_id=200723686205030400&scope=bot&permissions=0";

bulba.on('ready', function() {
  bulba.setPlayingGame('+bulba | +bulba help');

  blog.quote({limit: 1}, function(error, response) {
    if (error) {
      throw new Error(error);
    }

    totalPosts = response.total_posts;
  });

  botLog('Everything is ready!');
});

bulba.on('disconnect', () => {
  botLog('Disconnected... time to kms');
  process.exit(1);
});

//ACTUAL BOT
bulba.on('message', function(message) { //switch is for the weak
  if (message.author.equals(bulba.user) || message.author.bot) return; //Don't reply to itself or bots

  message.content = cleanMessage(message); //Clean stuff between `` so it doesn't bother reading code

  if(message.content.indexOf('+bulba help') === 0) {
    bulba.sendMessage(message.channel, '```xl' + '\n' +
      '+bulba        => Trivia from BulbaPedia.' + '\n' +
      '+bulba info   => Info about the bot.' + '\n' +
      '+bulba help   => Help menu (you know, this one).' + '\n' +
      '+bulba invite => Invite this useless bot.' + '\n' +
      '```');
    return;
  }

  if(message.content.indexOf('+bulba info') === 0) {
    bulba.sendMessage(message.channel,
      'BulbaTrivia V' + version + ' by AtlasTheBot (@Atlas)' + '\n' +
      'Source: https://github.com/AtlasTheBot/BulbaTrivia-Discord' + '\n' +
      'Official Chat: https://discord.gg/0w6AYrrMIUfO71oV' + '\n' +
      'Source of quotes: https://thanksbulbapedia.tumblr.com' + '\n' +
      'Made with tears and love');

    return;
  }

  if(message.content.indexOf('+bulba invite') === 0) {
    bulba.sendMessage(message.channel,
      'Invite Link: ' + inviteLink + '\n' +
      'but why?');

    return;
  }

  if(message.content.indexOf('+bulba') === 0) {
    currentOffset = randInt(totalPosts - 1); //From 0 to totalPosts, to get a random quote
    //-1 because after an offset of totalPosts there's nothing

    //Quick tutorial on how I get random quotes
    //1. Get the number of posts
    //2. Get a random number from 0 to totalPosts
    //3. Use that as a offset
    //it's horrible but it works sooo

    blog.quote({limit: 1, offset: currentOffset}, function(error, response) {
      if (error) {
        bulba.sendMessage(message.channel, 'Sorry! Something went wrong! Tell Atlas `that\' it, I quit`.');
        throw new Error(error);
      }

      if (response.posts[0] !== undefined) {
        totalPosts = response.total_posts; //update because why not

		if (response.posts[0].source.match(/<a.*?>(.*?)<\/a>/)[1] !== undefined) { //quick and dirty fix ;)
			bulba.sendMessage(message.channel,
			  '*"' + entities.decodeHTML(response.posts[0].text) + '"*' + '\n' +
			  '—' + response.posts[0].source.match(/<a.*?>(.*?)<\/a>/)[1]);
		} else {
			ulba.sendMessage(message.channel,
			  '*"' + entities.decodeHTML(response.posts[0].text) + '"*' + '\n' +
			  '—__' + response.posts[0].source + '__');
		}

        botLog('Showed ' + response.posts[0].short_url + ' to ' + message.author.name + '#' + message.author.discriminator + ' (' + message.author.id + ')');
      } else {
        botLog('aaaaaaaaaaaaaaaaaaaaaaa: ' + currentOffset);
        bulba.sendMessage(message.channel, 'Sorry! Something went wrong! Tell Atlas `posts undefined`.');
      }
    });

    return; //stop
  }

  if(message.content.indexOf('++bulba eval') === 0) {

    if (message.author.id !== "74768773940256768") { //ain't nobody else runnin' eval on my watch
      bulba.sendMessage(message.channel, 'Nice try, but no.');
      return;
    }

    var content = message.content.replace('++bulba eval', '');

    botLog('-------------------------EVAL STUFF');

    try {
      var result = eval(content);
      botLog(result);
      bulba.sendMessage(message.channel, '`' + result + '`');
    } catch (err) {
      botLog(err);
      bulba.sendMessage(message.channel, '`' + err + '`');
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
  botLog('Logged in with token!');
  bulba.loginWithToken(Auth.discord.token);

} else if (Auth.discord.email !== '' && Auth.discord.password !== '') {
  bulba.login(Auth.discord.email, Auth.discord.password, function (error, token) {
    botLog('Logged in with email + pass!');
    Auth.discord.token = token;

    fs.writeFile('./auth.json', JSON.stringify(Auth, null, 4), function(err) {
      if(err) {
        botLog(err + '\n===\nError while saving token');
      } else {
        botLog('Token saved');
      }
    });

  });
} else {
  botLog('No authentication details found!');
  process.exit(1);
}

function botLog(message) { //log a thing to both a channel AND the console
  console.log(message);
  if (Auth.logChannel !== undefined && Auth.logChannel !== '') {
    bulba.sendMessage(Auth.logChannel, '```xl\n' + message + '\n```');
  }
}
