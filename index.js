// Sam Beals - CIS 371 Auth Project
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MongoDBStore = require('connect-mongodb-session')(session);
const { pbkdf2Sync } = require('pbkdf2')

const { User, userRoutes } = require('./users.js')
const { authRoutes } = require('./auth.js')
const { dataRoutes } = require('./data.js')

const app = express()
const port = 3000
const uri = "mongodb+srv://bealssa:Porpoise08@samcluster.atipphu.mongodb.net/radiohead?retryWrites=true&w=majority";

app.use(express.json());
app.use(express.static('public'));

const sessionStore = new MongoDBStore({
	uri: uri,
	ttl: 14 * 24 * 60 * 60,
	collection: 'sessions'
});

app.use(session({ 
	secret: 'okayComputer',
	resave: false,
	saveUninitialized: false,
	store: sessionStore
}));

sessionStore.on('error', function(error){
	console.log(error);
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.set('view engine', 'pug');
app.use(passport.initialize());
app.use(passport.session());

const validPassword = function(password, salt, hash) {
	let key = pbkdf2Sync(password, salt, 1, 32, 'sha512');
	return key.toString('hex') == hash
}

passport.use(new GitHubStrategy({
		clientID: "93f9a98a7399cebe96ba",
		clientSecret: "136398e3a18a8e51d16fb27cdab448f733f1085d",
		callbackURL: "http://localhost:3000/verify",
		scope: [ 'user:email' ],
	},
	function(accessToken, refreshToken, profile, done){
		process.nextTick(function() {
			return done(null, profile);
		})
	}
));

passport.use(new LocalStrategy(
	async function(username, password, done) {
		try {
			const user = await User.findOne({username: username})
			//cannot find user
			if (!user) {
				console.log("No user found")
				return done(null, false)
			}
			//password doesn't match
			if (!validPassword(password, user.salt, user.password)) {
				console.log('Wrong password')
				return(done(null, false))
			}
			//validated
			return done(null, user)
		} catch (err) {
			return done(err)
		}
	}
  ));

// auth routes in auth.js
app.use(authRoutes)
// user routes in users.js
app.use(userRoutes)
// data routes in data.js
app.use(dataRoutes)

// home page
app.get('/', function(req, res){
	res.render('index', { user: req.user });
});

async function main() {
    await mongoose.connect(uri);
    app.listen(port, () => {
        console.log(`Started up API on port ${port}.`);
    });
}

main().catch(err => console.log(err));

module.exports = { app }