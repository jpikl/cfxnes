import express from 'express';
import morgan from 'morgan';
import path from 'path';
import * as roms from './roms';

var app = express();
var dev = app.get('env') === 'development';

app.use(morgan(dev ? 'dev' : 'common'));
app.use('/', express.static(path.join(__dirname, 'static')));

app.get('/roms', roms.list);
app.get('/roms/:id', roms.get);
app.get('/files/:name', roms.download);

app.use(function(error, req, res, next) {
  console.log(error.stack);
  res.send(500, 'Server internal error.');
});

app.listen(process.env.PORT || 5000);

roms.start();
