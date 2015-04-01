'use strict';
require('../bootstrap');
var QBOConnector = require('../../lib/connector');
var config = require('config');

var moment = require('moment');

describe.only('get change info', function () {
  this.timeout(50000);
  describe('valid connection to get /cdc', function () {
    var response;
    before(function () {
      var connector = new QBOConnector({
        consumerKey: config.get('consumerKey'),
        consumerSecret: config.get('consumerSecret'),
        isSandbox: true
      });
      var settings = {
        AccessToken: config.get('AccessToken'),
        AccessTokenSecret: config.get('AccessTokenSecret'),
        CompanyId: config.get('CompanyId')
      };
      connector.authorize({
        get: function (key) {
          return settings[key];
        }

      });
      response = connector.get('/cdc?entities=Invoice,CreditMemo,Payment&changedSince=' + moment().utc().add(-1, 'days').toISOString());
    });
    it('returns expected json', function () {
      return response.catch(function(err){
        console.log('error',err);
      }).then(function (json) {
        console.log('json',json.CDCResponse);
      });
    });
  });
});
