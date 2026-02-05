const bcrypt = require('bcryptjs');

const testPassword = 'admin123';
const hashFromDB = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqMLvlWUGH1D3X.';

bcrypt.compare(testPassword, hashFromDB).then(result => {
  console.log('Password match:', result);
  if (!result) {
    console.log('Password does not match - will generate new hash');
    bcrypt.hash(testPassword, 12).then(newHash => {
      console.log('New hash:', newHash);
    });
  }
});
