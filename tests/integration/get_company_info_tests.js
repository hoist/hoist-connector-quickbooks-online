'use strict';
require('../bootstrap');
var QBOConnector = require('../../lib/connector');
var config = require('config');
var expect = require('chai').expect;

describe('get company info', function () {
  this.timeout(50000);
  describe('valid connection to get /contacts', function () {
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
      response = connector.get('/companyinfo/'+config.get('CompanyId'));
    });
    it('returns expected json', function () {
      return response.then(function (json) {
        return expect(json.CompanyInfo.CompanyName).to.eql(config.get('Company Name'));
      });
    });
  });
});
