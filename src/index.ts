import './env';
import app from './server';
import Database from './database';

const { PORT } = process.env;

const database = new Database();
database.getConnection().then(() => {
  app.listen(PORT, () => {
    process.send?.('ready');
  });
});
