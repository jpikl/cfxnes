import chai from 'chai';
import chaiHttp from 'chai-http';

before(() => {
  chai.use(chaiHttp);
});
