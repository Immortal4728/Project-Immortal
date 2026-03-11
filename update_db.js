const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres' // Note: This might need correct env var
});

async function run() {
    try {
        await client.connect();
        await client.query('ALTER TABLE project_requests ADD COLUMN student_profile_photo TEXT;');
        console.log("Column added successfully!");
    } catch (e) {
        console.log(e.message);
    } finally {
        await client.end();
    }
}
run();
