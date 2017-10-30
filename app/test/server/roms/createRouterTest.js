import {expect} from 'chai';
import {Router} from 'express';
import createRouter from '../../../src/server/roms/createRouter';
import {getRomDb} from '../fixtures';

describe('server/roms/createRouter', () => {
  it('creates router', () => {
    const router = createRouter(getRomDb());
    expect(router).to.be.a('function');
    expect(Object.getPrototypeOf(router)).to.equal(Router);
  });
});
