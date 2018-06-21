const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const session = require('express-session')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const hoganXpress = require('hogan-xpress'); // mustache templating engine

const request = require('request');
const lti = require("ims-lti");
const redis = require("redis");

require('dotenv').config();
const config = require('config');
let serverConfig = config.get('server');
let clientConfig = config.get('client');
console.log('server config: ', serverConfig);
console.log('client config: ', clientConfig);

app.engine('html', hoganXpress);
app.set('view engine', 'html');

app.use(cookieParser());
app.enable("trust proxy");


// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var map;

// it's the map it's the map it's the map it's the map it's the map!
function update_map() {
  const room_map_url = config.get('server.lti.roomMapUrl');
  if (room_map_url) {
    request(room_map_url, function (error, resp, body) {
      map = JSON.parse(body);
    });
  }
}

update_map();

function get_room(id, callback) {
  // we update the map because it can change
  // TODO: ? if the map can change, shouldn't we wait until it's been updated before we use it?
  // TODO: update_map is asynchronous -mjl 2018-06-05
  update_map();
  if (map[id] !== undefined) {
    return map[id];
  } else {
    // this way the user is prompted for a room name, worst case
    return undefined;
  }
}


// Use the session middleware
app.use(session({ secret: config.get('server.sessionSecret'), cookie: { maxAge: 60000 }}));
app.use(serveStatic(__dirname + '/build', { index: false, redirect: false }));

app.get('/chat', chat_route);
app.post('/lti_launch', handle_launch, chat_route);


function chat_route(req, res) {
  let user_data = req.session.user_data ? JSON.stringify(req.session.user_data) : '{}';
  let client_config = JSON.stringify(config.get('client'));
  console.log('INFO: chat_route: config=', config);
  res.render(`${__dirname}/build/index.html`, { client_config, user_data });
}

function handle_launch(req, res, next) {
  console.log('INFO: handle_launch')
  const consumer_key = config.get('server.lti.consumerKey');
  const consumer_secret = config.get('server.lti.consumerSecret');

  let client = redis.createClient(config.get('server.lti.redisUrl'));
  store = new lti.Stores.RedisStore('consumer_key', client);
  req.lti = new lti.Provider(consumer_key, consumer_secret, store);
  req.session.body = req.body;
  req.lti.valid_request(req, function (err, isValid) {
    if (err) {
      // invalid lti launch request
      console.log(err);
      return res.send("LTI Verification failed!");
    } else {
      req.session.isValid = isValid;
      // collect the data we're interested in from the request
      let email = req.body.lis_person_contact_email_primary;
      req.session.user_data = { lti_user: true,
                                user_id: req.body.user_id,
                                email,
                                name: req.body.lis_person_name_full,
                                context_id: req.body.context_id,
                                room: get_room(email),
                              };

      return next();
    }
  });

}


const port = config.get('server.port') || 5000;
server.listen(port);

console.log("Listening!");
