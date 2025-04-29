import winston from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log directory
const logDir = path.join(process.cwd(), 'logs');

// Define log formats
const { combine, timestamp, printf } = winston.format;

// Custom log format (same as main logger)
const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const metaString = Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 2)}` 
    : '';
  
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Define transports array
const transports = [];

// Cron file transport (for info and error levels)
const cronTransport = new DailyRotateFile({
  filename: path.join(logDir, 'cron-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info' // Captures info and error (error is included in info)
});
transports.push(cronTransport);

// Console transport (optional, uncomment for development)
// transports.push(new winston.transports.Console());

// Create logger
const cronLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat
  ),
  transports: transports
});

export default cronLogger;