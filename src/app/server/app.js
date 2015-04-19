import express         from "express";
import morgan          from "morgan";
import path            from "path";
import * as romService from "./services/rom-service"

var app = express();
var debug = app.get("env") !== "production";

if (debug) {
    app.use(morgan("dev"));
}

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/roms",        romService.getROMs);
app.get("/roms/:id",    romService.getROM);
app.get("/files/:name", romService.getFile);

app.use(function(error, req, res, next) {
    if (debug) {
        console.log(error.stack);
    }
    res.send(500, "Server internal error.");
});

app.listen(process.env.PORT || 5000);

romService.init();
