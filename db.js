const { Pool } = require('pg');

let pool = null;

async function getPool() {
  if (pool) return pool;

  if (process.env.SUPABASE_CONNECTION_STRING) {
    pool = new Pool({
      connectionString: process.env.SUPABASE_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
    });
    console.log('Supabase/PostgreSQL connection pool created.');
  } else {
    pool = null;
  }
  return pool;
}

async function saveEnquiry(data) {
  const p = await getPool();
  if (!p) {
    console.log('Supabase not configured, enquiry not saved.');
    return { id: null };
  }

  try {
    const { name, email, phone, company, message, type, position, education, experience, exp_city, exp_state, resume_name } = data;
    const result = await p.query(
      `INSERT INTO enquiries (name, email, phone, company, message, type, position, education, experience, city, state, resume_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        name || null,
        email || null,
        phone || null,
        company || null,
        message || null,
        type || 'contact',
        position || null,
        education || null,
        experience || null,
        exp_city || null,
        exp_state || null,
        resume_name || null
      ]
    );
    console.log(`Enquiry saved to Supabase, id: ${result.rows[0].id}`);
    return { id: result.rows[0].id };
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    return { id: null };
  }
}

async function saveSubscriber(email) {
  const p = await getPool();
  if (!p) {
    console.log('Supabase not configured, subscriber not saved.');
    return { id: null };
  }

  try {
    const result = await p.query(
      'INSERT INTO subscribers (email) VALUES ($1) RETURNING id',
      [email]
    );
    console.log(`Subscriber saved to Supabase, id: ${result.rows[0].id}`);
    return { id: result.rows[0].id };
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    return { id: null };
  }
}

module.exports = { getPool, saveEnquiry, saveSubscriber };
