import winston from "winston";
import expressWinston from "express-winston";

const cliWithTimestamp = winston.format.combine(
    winston.format.timestamp(),
    winston.format.cli()
)
const logstashWithTimestamp = winston.format.combine(
    winston.format.timestamp(),
    winston.format.logstash()
)
export const middlewareLogger = expressWinston.logger({
    transports: [
        new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.label({label:"express-internal"}),
                    cliWithTimestamp
                ),
                level: "debug"
            }
        ),
        new winston.transports.File(
            {
                format: winston.format.combine(
                    winston.format.label({label:"app"}),
                    logstashWithTimestamp
                ),
                level: "warn",
                filename: "errors.log"
            }
        ),
    ],
    colorize: true,
    expressFormat: true
})

export const logger = winston.createLogger(
    {
        format: winston.format.combine(
            winston.format.label({label: "app"}),
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            new winston.transports.Console({
                    level: "debug"
                }
            ),
            new winston.transports.File(
                {
                    level: "warn",
                    filename: "errors.log"
                }
            )
        ]
    }
);