const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { User, Company } = require('../models');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      include: [{ model: Company, as: 'company' }]
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({
      where: { email: profile.emails[0].value }
    });

    if (user) {
      // Update OAuth info if user exists
      await user.update({
        googleId: profile.id,
        profilePicture: profile.photos[0]?.value
      });
    } else {
      // Create new user from Google profile
      // Find or create default company
      let defaultCompany = await Company.findOne({
        where: { name: 'Default Company' }
      });

      if (!defaultCompany) {
        defaultCompany = await Company.create({
          name: 'Default Company',
          domain: 'default.com',
          settings: { autoEnroll: true }
        });
      }

      user = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        googleId: profile.id,
        profilePicture: profile.photos[0]?.value,
        companyId: defaultCompany.id,
        role: 'participant', // Default role
        isActive: true,
        password: 'oauth_user_' + Math.random().toString(36).slice(-8) // Random password for OAuth users
      });
    }

    // Load user with company
    user = await User.findByPk(user.id, {
      include: [{ model: Company, as: 'company' }]
    });

    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret',
  callbackURL: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:5000/api/auth/microsoft/callback',
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await User.findOne({
      where: { email: profile.emails[0].value }
    });

    if (user) {
      // Update OAuth info if user exists
      await user.update({
        microsoftId: profile.id,
        profilePicture: profile.photos[0]?.value
      });
    } else {
      // Create new user from Microsoft profile
      // Find or create default company
      let defaultCompany = await Company.findOne({
        where: { name: 'Default Company' }
      });

      if (!defaultCompany) {
        defaultCompany = await Company.create({
          name: 'Default Company',
          domain: 'default.com',
          settings: { autoEnroll: true }
        });
      }

      user = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        microsoftId: profile.id,
        profilePicture: profile.photos[0]?.value,
        companyId: defaultCompany.id,
        role: 'participant', // Default role
        isActive: true,
        password: 'oauth_user_' + Math.random().toString(36).slice(-8) // Random password for OAuth users
      });
    }

    // Load user with company
    user = await User.findByPk(user.id, {
      include: [{ model: Company, as: 'company' }]
    });

    return done(null, user);
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    return done(error, null);
  }
}));

module.exports = passport;