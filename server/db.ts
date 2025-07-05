// db.ts
const pool = postgres(process.env.DATABASE_URL, {
   host: 'localhost',
   port: 5432,
    username: 'frauduser1',
    password: 'root',
    database: 'fraudshield',
    ssl: false,
    connection: {
      application_name: 'fraud-shield-app'
    }
  });