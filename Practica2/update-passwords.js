const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const password = 'admin123';

async function updatePasswords() {
  const hash = await bcrypt.hash(password, 12);
  console.log('Generated hash:', hash);
  
  const connection = await mysql.createConnection({
    host: 'auth-db',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'auth_db'
  });
  
  await connection.execute(
    'UPDATE users SET password = ?',
    [hash]
  );
  
  console.log('Passwords updated successfully');
  await connection.end();
}

updatePasswords().catch(console.error);
