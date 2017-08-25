var express = require('express');  
var app = express();  
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
var lti = require("ims-lti");
var redis = require("redis");
var session = require('express-session')
const cookieParser = require('cookie-parser');
var mustacheExpress = require('mustache-express');

app.engine('html', require('hogan-express'));

app.set('view engine', 'html');

require('dotenv').config()
app.use(cookieParser());
app.enable("trust proxy");

var bodyParser = require('body-parser');

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var consumer_key = process.env.CONSUMER_KEY;
var consumer_secret = process.env.CONSUMER_SECRET;


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
      req.session.data = {}
      req.session.data.user_id = req.body.user_id;
      req.session.data.email = req.body.lis_person_contact_email_primary;
      req.session.data.name = req.body.lis_person_name_full;
      req.session.data.context_id = req.body.context_id;
        
      return next();
    }
  });
   
}

app.post('/lti_launch', handle_launch, chat_route);



const port = process.env.PORT || 5000;
server.listen(port);  

console.log("Listening!");
