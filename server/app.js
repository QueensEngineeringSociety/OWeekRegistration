const app = require("./server");
const log = require(__dirname + "/logger")(__filename);
const port = process.env.PORT || 8000;
app.listen(port);
log.info(`Listening on port ${port}`);