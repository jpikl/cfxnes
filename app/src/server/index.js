import path from 'path';
import express from 'express';
import fallback from 'express-history-api-fallback';
import * as roms from './roms';

const app = express();
const dev = app.get('env') === 'development'; // True when NODE_ENV is 'development' or unset
const root = path.join(__dirname, 'static');

if (dev) {
  app.use(require('morgan')('dev'));
}

app.use('/', roms.router);
app.use('/', express.static(root));
app.use(fallback('index.html', {root}));

app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  if (dev) {
    console.log(error.stack);
  }
  res.sendStatus(500);
});

app.listen(process.env.PORT || 5000);

roms.watch(path.join(__dirname, dev ? '../../../roms' : 'roms'));
