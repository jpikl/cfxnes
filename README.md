# CFxNES

A Nintendo Entertainment System emulator written in CoffeeScript.

![CFxNES logo](https://raw.githubusercontent.com/jpikl/cfxnes/master/client/images/logo-md.png)

Try CFxNES out at [cfxnes.heroku.com](http://cfxnes.herokuapp.com)

CFxNES is in early development, so many of the NES games are not playable yet.
For best berformance, at least 2 GHz CPU and the **latest Google Chrome**
are recommended.

The source code is licensed under the MIT License.
See LICENSE.txt for more details.

## Building and Running

    npm install
    bower install
    gulp

or alternatively

    npm install
    ./node_modules/bower/bin/bower install
    ./node_modules/gulp/bin/gulp.js


* Application is running at <http://localhost:5000>
* Put your *.nes* ROM files inside the `server/roms` directory to see them in game library (application has to be restarted).
