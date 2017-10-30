import {log} from '../common';
import {ObjectNotFoundError} from './common';

const statusCodes = {
  [ObjectNotFoundError]: 404,
};

export default function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const {constructor, message} = err;
  const statusCode = statusCodes[constructor] || 500;
  if (statusCode === 500) {
    log.error(err);
  }
  res.status(statusCode).json({message});
}
