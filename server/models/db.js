const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is missing. Check /server/.env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = mongoose;
