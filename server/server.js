require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/dbConn');
const corsOptions = require('./config/corsOptions');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(logger);
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database unavailable',
  });
});

app.use('/member', require('./routes/member'));
app.use('/alumni', require('./routes/alumni'));
app.use('/projects', require('./routes/project'));
app.use('/media', require('./routes/media'));
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    console.log(`Connected to MongoDB${process.env.DB_NAME ? ` (${process.env.DB_NAME})` : ''}`);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error(`Could not start API: ${error.message}`);
    process.exitCode = 1;
  }
}

start();
