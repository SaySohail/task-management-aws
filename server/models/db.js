const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is missing. Check /server/.env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = mongoose;
