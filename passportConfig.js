const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Pool } = require('pg');
require("dotenv").config();
const bcyrpt = require('bcrypt');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

function initialize(passport) {
    const authenticatedUser = (email, password, done) => {
        pool.query(
            `SELECT * FROM pet_care.pet_owner WHERE email = $1`,
            [email])
            .then(result => {
                if (result.rows.length == 1) {
                    const user = result.rows[0];
                    
                    bcyrpt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            return done(err);
                        }
                        if (isMatch) {
                            //First parameter is error, second parameter is the return.
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Incorrect password"});
                        }
                    })
                } else {
                    return done(null, false, { message : "Incorrect email"})
                }
            })
            .catch(err => {
                throw err;
            });
        
        
    }

    passport.use(
      new LocalStrategy(
        {
					usernameField: "email",
					passwordField: "password"
				},
					authenticatedUser
			)
		);
		
		//Stores user email in session cookie
		passport.serializeUser((user, done) => done(null, user.email));
		
		//Uses email in cookie to load user
		passport.deserializeUser((email, done) => {
			pool.query(`SELECT * FROM pet_care.pet_owner WHERE email = $1`, [email], (err, results) => {
				if (err) {
					throw err;
				}
				return done(null, results.rows[0]);
			})

		});

}

module.exports = initialize;