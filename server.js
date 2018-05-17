const express = require('express');
const app = express();
const request = require('request');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const lti = require("ims-lti");
const redis = require("redis");
const session = require('express-session')
const cookieParser = require('cookie-parser');
const mustacheExpress = require('mustache-express');

require('dotenv').config()
const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET;
const room_map_url = process.env.ROOM_MAP_URL;

app.engine('html', require('hogan-express'));

app.set('view engine', 'html');

app.use(cookieParser());
app.enable("trust proxy");

var bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var map;

// it's the map it's the map it's the map it's the map it's the map!
function update_map() {
  if (room_map_url !== "nope") {
    request(room_map_url, function (error, resp, body) {
      map = JSON.parse(body);
    });
  }
}

update_map();

function get_room(id, callback) {
  // we update the map because it can change
  update_map();
  if (map[id] !== undefined) {
    return map[id];
  } else {
    // this way the user is prompted for a room name, worst case
    return undefined;
  }
}


// Use the session middleware
app.use(session({ secret: process.env.SESSION_SECRET, cookie: { maxAge: 60000 }}))

let callIndex = 0;
app.get('/chat', chat_route);

app.use(express.static(__dirname + '/build', {index: false, redirect: false}));

function chat_route(req, res) {
  if (req.session.data) {
    res.render(__dirname + '/build/index.html', { config: JSON.stringify(req.session.data) });
  } else {
    res.sendFile(__dirname + '/build/index.html');
  }
}

function handle_launch(req, res, next) {
  let client = redis.createClient(process.env.REDIS_URL)
  store = new lti.Stores.RedisStore('consumer_key', client)
  req.lti = new lti.Provider(consumer_key, consumer_secret, store)
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
      req.session.data = {};
      req.session.data.user_id = req.body.user_id;
      req.session.data.email = email;
      req.session.data.name = req.body.lis_person_name_full;
      req.session.data.context_id = req.body.context_id;
      req.session.data.room = get_room(email);

      return next();
    }
  });

}

app.post('/lti_launch', handle_launch, chat_route);



const port = process.env.PORT || 5000;
server.listen(port);

console.log("Listening!");
