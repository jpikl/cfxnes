import {expect} from 'chai';
import {Router} from 'express';
import createRouter from '../../../src/server/roms/createRouter';

describe('server/roms/createRouter', () => {
  it('creates router', () => {
    const router = createRouter({});
    expect(Object.getPrototypeOf(router)).to.be.equal(Router);
  });
});
