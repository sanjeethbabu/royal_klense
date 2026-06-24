const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool = null;

async function getPool() {
  if (pool) return pool;

  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
    console.log('MySQL connection pool created.');
  } else {
    pool = null;
  }
  return pool;
}

function saveToFile(dir, prefix, data) {
  const logDir = path.join(__dirname, dir);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const filename = `${prefix}-${Date.now()}.json`;
  fs.writeFileSync(path.join(logDir, filename), JSON.stringify(data, null, 2));
  console.log(`${prefix} saved: ${filename}`);
  return filename;
}

async function saveEnquiry({ name, company, phone, email, message, type }) {
  const p = await getPool();
  const record = { name, company, phone, email, message, type: type || 'contact', created_at: new Date().toISOString() };

  if (p) {
    try {
      const [result] = await p.execute(
        'INSERT INTO enquiries (name, company, phone, email, message, type) VALUES (?, ?, ?, ?, ?, ?)',
        [name, company || null, phone || null, email, message, type || 'contact']
      );
      console.log(`Enquiry saved to DB, id: ${result.insertId}`);
      return { id: result.insertId };
    } catch (err) {
      console.error('DB insert failed, falling back to file:', err.message);
    }
  }

  saveToFile('data', `enquiry-${type || 'contact'}`, record);
  return { id: null };
}

async function saveSubscriber(email) {
  const p = await getPool();
  const record = { email, subscribedAt: new Date().toISOString() };

  if (p) {
    try {
      const [result] = await p.execute(
        'INSERT INTO subscribers (email) VALUES (?)',
        [email]
      );
      console.log(`Subscriber saved to DB, id: ${result.insertId}`);
      return { id: result.insertId };
    } catch (err) {
      console.error('DB insert failed, falling back to file:', err.message);
    }
  }

  saveToFile('data', 'subscriber', record);
  return { id: null };
}

module.exports = { getPool, saveEnquiry, saveSubscriber };
