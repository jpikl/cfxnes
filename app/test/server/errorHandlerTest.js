import {expect} from 'chai';
import {ObjectNotFoundError} from '../../src/server/common';
import errorHandler from '../../src/server/errorHandler';

describe('server/errorHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status(value) { this.statusValue = value; return this; },
      json(value) { this.jsonValue = value; return this; },
    };
    next = () => {};
  });

  it('handles ObjectNotFoundError as 404', () => {
    const err = new ObjectNotFoundError('X not found');
    errorHandler(err, req, res, next);
    expect(res.statusValue).to.equal(404);
    expect(res.jsonValue).to.deep.equal({message: 'X not found'});
  });

  it('handles any other error as 500', () => {
    const err = new Error('something went wrong');
    errorHandler(err, req, res, next);
    expect(res.statusValue).to.equal(500);
    expect(res.jsonValue).to.deep.equal({message: 'something went wrong'});
  });
});
