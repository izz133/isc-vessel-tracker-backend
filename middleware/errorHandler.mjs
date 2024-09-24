import { logEvents } from '../middleware/logger.mjs';

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.header.origin}`,
    'errorLog.log')
    console.log(err.stack)

    const status = res.statusCode ? res.statusCode : 500 //server error ni

    res.status(status)

    res.json({ message: err.message, isError: true })
}

export { errorHandler }