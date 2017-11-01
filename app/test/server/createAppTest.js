import {expect} from 'chai';
import createApp from '../../src/server/createApp';
import {STATIC_PATH, getRomDb} from './fixtures';

describe('server/createApp', () => {
  it('creates application', () => {
    const app = createApp(getRomDb(), {
      staticPath: STATIC_PATH,
      morganEnabled: true,
      morganFormat: 'dev',
    });
    expect(app).to.be.a('function').with.property('listen');
  });
});
