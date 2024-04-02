const express = require('express')
const passport = require('passport')

const authRoutes = express.Router();

function checkAuth(req,res,next){
    if(req.isAuthenticated()){
        next();
    } else{
        res.redirect("/");
    }
}

authRoutes.get('/login', function(req, res) {
	res.render('user', { buttonID: 'submitLogin' })
})

authRoutes.get('/register', function(req, res) {
	res.render('user', { buttonID: 'submitRegister' })
})

authRoutes.post('/auth/local', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
	res.redirect('/');
  });

authRoutes.get('/auth/github', passport.authenticate('github'))

authRoutes.get('/verify',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.user = req.user;
    req.session.save(err => {
        if(err){
            console.log(err);
        }
    });
    res.redirect('/');
  });

authRoutes.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		res.redirect('/');
	});
});

module.exports = { authRoutes, checkAuth }