import app from './app.ts';
import dotenv from 'dotenv';

// load environment variables
dotenv.config;

// mengambil port API
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[INFO] Server SIMAS berjalan di port ${PORT}`)
});
