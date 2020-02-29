const winston = require('winston');
const {printf} = winston.format;

const folderPath = __dirname + "/logs/";
const ext = ".log";

module.exports = function (filename) {
    const myFormat = printf(({message, label, timestamp}) => {
        return `${filename} ${timestamp} [${label}]: ${message}`;
    });

    function getLogger(level) {
        return winston.createLogger({
            level: level,
            format: winston.format.combine(
                winston.format.label({label: level}),
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({stack: true}),
                winston.format.splat(),
                winston.format.simple(),
                winston.format.colorize(),
                myFormat
            ),
            transports: [
                new winston.transports.File({filename: folderPath + "error" + ext, level: "error"}),
                new winston.transports.File({filename: folderPath + "warn" + ext, level: "warn"}),
                new winston.transports.File({filename: folderPath + "activity" + ext, level: "info"}),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                        myFormat
                    )
                })
            ]
        });
    }

    const infoLogger = getLogger("info");
    const warnLogger = getLogger("warn");
    const errorLogger = getLogger("error");

    return {
        info: function (message) {
            infoLogger.info(message);
        },
        warn: function (message) {
            warnLogger.warn(message);
        },
        error: function (message) {
            errorLogger.error(message);
        }
    }
};