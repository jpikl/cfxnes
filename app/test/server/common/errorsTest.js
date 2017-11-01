import {expect} from 'chai';
import {ObjectNotFoundError} from '../../../src/server/common/errors';

describe('server/common/errors', () => {
  it('defines ObjectNotFoundError', () => {
    const error = new ObjectNotFoundError('X not found');
    expect(error).to.be.an('object').with.property('message', 'X not found');
  });
});
