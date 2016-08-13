import path from 'path';
import express from 'express';
import morgan from 'morgan';
import * as roms from './roms';

const app = express();
const dev = app.get('env') === 'dev';

app.use(morgan(dev ? 'dev' : 'common'));
app.use('/', express.static(path.join(__dirname, 'static')));

app.get('/roms', roms.list);
app.get('/roms/:id', roms.get);
app.get('/files/:name', roms.download);

app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(error.stack);
  res.sendStatus(500);
});

app.listen(process.env.PORT || 5000);

roms.start();
