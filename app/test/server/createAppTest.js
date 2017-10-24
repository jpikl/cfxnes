import {expect} from 'chai';
import createApp from '../../src/server/createApp';

describe('server/createApp', () => {
  it('creates application', () => {
    const romDb = {};
    const app = createApp(romDb, {
      staticPath: __dirname,
      morganEnabled: true,
      morganFormat: 'dev',
    });
    expect(app).to.be.a('function');
    expect(app).to.have.property('listen');
  });
});
