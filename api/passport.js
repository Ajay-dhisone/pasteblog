const User = require('./models/usermodel.js'); // Import your User model
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function(passport) {
  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: '784991148790-bj28k8pp6r9kqkikogm47oihmg4h7a77.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback', // Adjust based on your callback URL
    scope: ['profile', 'email']
    
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // User already exists, return the existing user
          //console.log(existingUser);
          
          // console.log("existing accoumt");
          done(null, existingUser);
        } else {
          // Create a new user
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picurl: profile.photos[0].value
           
            // Add other fields as needed
          });

          // Save the new user to the database
          await newUser.save();
          // console.log(newUser);
          done(null, newUser);
        }
      } catch (err) {
        done(err);
      }
    }
  ));

  // Serialize and deserialize user data for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err);
      });
  });
};
