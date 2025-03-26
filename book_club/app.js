const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// 1. Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bookClub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection successful!'))
.catch((err) => console.error('MongoDB connection error:', err));

// 2. Setup EJS templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// 4. Session configuration
app.use(session({
  secret: 'monSecretPourLeBookClub',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/bookClub' }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// 5. Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// 6. Make session data available in all EJS templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// 7. Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/book');
const authorRoutes = require('./routes/author');
const dashboardRoutes = require('./routes/dashboard');

// 8. Use routes
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/', bookRoutes);
app.use('/', authorRoutes);
app.use('/', dashboardRoutes);

// 9. Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});





