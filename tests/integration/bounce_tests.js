'use strict';
var Connector = require('../../lib/connector');
var BBPromise = require('bluebird');
var config = require('config');
describe.skip('bounce flow', function () {
  var connector;
  before(function () {
    connector = new Connector({
      consumerKey: config.get('consumerKey'),
      consumerSecret: config.get('consumerSecret')
    });
  });
  describe('initial bounce', function () {
    before(function () {
      var bounce = {
        query: {
          payments: true,
          quickbooks: true
        },
        get: function () {
          return undefined;
        },
        delete: function () {
          return BBPromise.resolve(null);
        },
        set: function () {
          console.log('set', arguments);
          return BBPromise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return BBPromise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return BBPromise.resolve(null);
        }
      };
      return connector.receiveBounce(bounce).catch(function (err) {
        console.log(err);
        throw err;
      });
    });
    it('should do some redirect', function () {

    });
  });
  describe('get request token bounce', function () {
    before(function () {
      var bounce = {
        get: function (key) {
          if(key==='IntuitSetup'){
            return true;
          }
        },
        delete: function () {
          return BBPromise.resolve(null);
        },
        set: function () {
          console.log('set', arguments);
          return BBPromise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return BBPromise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return BBPromise.resolve(null);
        }
      };
      return connector.receiveBounce(bounce).catch(function (err) {
        console.log(err);
        throw err;
      });
    });
    it('should do some redirect', function () {

    });

  });
  describe('swap request token for access token bounce', function () {
    before(function () {
      /*jshint camelcase: false */
      var bounce = {
        query: {
          realmId: config.get('companyId'),
          oauth_verifier: 'VERIFIER HERE'
        },
        get: function (key) {
          if (key === 'RequestToken') {
            return 'REQUEST TOKEN HERE';
          }
          if (key === 'RequestTokenSecret') {
            return 'REQUEST TOKEN SECRET HERE';
          }
          return undefined;
        },
        delete: function () {
          return BBPromise.resolve(null);
        },
        set: function () {
          console.log('set', arguments);
          return BBPromise.resolve(null);
        },
        redirect: function () {
          console.log('redirect', arguments);
          return BBPromise.resolve(null);
        },
        done: function () {
          console.log('done', arguments);
          return BBPromise.resolve(null);
        }
      };
      return connector.receiveBounce(bounce).catch(function (err) {
        console.log(err);
        throw err;
      });
    });
    it('should do some redirect', function () {

    });
  });
});
