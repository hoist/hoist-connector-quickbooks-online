'use strict';
require('../bootstrap');
var QBOConnector = require('../../lib/connector');
var sinon = require('sinon');
var BBPromise = require('bluebird');
var expect = require('chai').expect;
var OAuth = require('oauth').OAuth;

describe('QBOConnector', function () {
  var connector;
  before(function () {
    connector = new QBOConnector({
      consumerKey: 'KEY',
      consumerSecret: 'SECRET'
    });
  });
  describe('#get', function () {
    var response = {};
    var result;
    before(function () {
      sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
      result = connector.get('/CompanyInfo/Id');
    });
    after(function () {
      connector.request.restore();
    });
    it('calls #request', function () {
      expect(connector.request)
        .to.have.been.calledWith('GET', '/CompanyInfo/Id');
    });

  });
  describe('#update', function () {
    var response = {};
    var data = 'data';
    var result;
    before(function () {
      sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
      result = connector.update('/CompanyInfo/Id', data);
    });
    after(function () {
      connector.request.restore();
    });
    it('calls #request', function () {
      expect(connector.request)
        .to.have.been.calledWith('POST', '/CompanyInfo/Id?operation=update', data);
    });

  });
  describe('#create', function () {
    var response = {};
    var data = 'data';
    var result;
    before(function () {
      sinon.stub(connector, 'request').returns(BBPromise.resolve(response));
      result = connector.create('/CompanyInfo/Id', data);
    });
    after(function () {
      connector.request.restore();
    });
    it('calls #request', function () {
      expect(connector.request)
        .to.have.been.calledWith('POST', '/CompanyInfo/Id', data);
    });

  });
  describe('#request', function () {
    describe('with GET', function () {
      var result;
      var xml = '{"CompanyInfo": {"CompanyName": "Owen Evans Sandbox Company"}}';
      before(function () {
        sinon.stub(OAuth.prototype, '_performSecureRequest').yields(null, xml, {});
        connector = new QBOConnector({
          consumerKey: 'KEY',
          consumerSecret: 'SECRET'
        });
        var settings = {
          CompanyId: 'CompanyId',
          AccessToken: 'AccessTokenKey',
          AccessTokenSecret:'AccessTokenSecret'
        };
        connector.authorize({
          get: function (key) {
            return settings[key];
          }

        });
        return (result = connector.request('GET', '/CompanyInfo'));
      });
      after(function () {
        OAuth.prototype._performSecureRequest.restore();
      });
      it('calls underlying auth library', function () {
        return expect(OAuth.prototype._performSecureRequest)
          .to.have.been.calledWith('AccessTokenKey', 'AccessTokenSecret', 'GET', 'https://quickbooks.api.intuit.com/v3/company/CompanyId/CompanyInfo', null, null, 'application/json');
      });
      it('returns json', function () {
        return expect(result)
          .to.become({
            CompanyInfo: {
              CompanyName: 'Owen Evans Sandbox Company'
            }
          });
      });
    });
    describe('with PUT', function () {
      var result;
      var json = '{"CompanyInfo": {"CompanyName": "Owen Evans Sandbox Company"}}';
      var data = 'data';
      before(function () {
        sinon.stub(OAuth.prototype, '_performSecureRequest').yields(null, json, {});
        connector = new QBOConnector({
          consumerKey: 'KEY',
          consumerSecret: 'SECRET'
        });
        var settings = {
          CompanyId: 'CompanyId',
          AccessToken: 'AccessTokenKey',
          AccessTokenSecret:'AccessTokenSecret'
        };
        connector.authorize({
          get: function (key) {
            return settings[key];
          }

        });
        return (result = connector.request('PUT', '/CompanyInfo', data));
      });
      after(function () {
        OAuth.prototype._performSecureRequest.restore();
      });
      it('calls underlying auth library', function () {
        return expect(OAuth.prototype._performSecureRequest)
          .to.have.been.calledWith('AccessTokenKey', 'AccessTokenSecret', 'PUT', 'https://quickbooks.api.intuit.com/v3/company/CompanyId/CompanyInfo', null, 'data', 'application/json');
      });
      it('returns json', function () {
        return expect(result)
          .to.become({
            CompanyInfo: {
              CompanyName: 'Owen Evans Sandbox Company'
            }
          });
      });
    });
    describe('with POST', function () {
      var result;
      var json = '{"CompanyInfo": {"CompanyName": "Owen Evans Sandbox Company"}}';
      var data = 'data';
      before(function () {
        sinon.stub(OAuth.prototype, '_performSecureRequest').yields(null, json, {});
        connector = new QBOConnector({
          ConsumerKey: 'KEY',
          ConsumerSecret: 'SECRET'
        });
        var settings = {
          CompanyId: 'CompanyId',
          AccessToken: 'AccessTokenKey',
          AccessTokenSecret:'AccessTokenSecret'
        };
        connector.authorize({
          get: function (key) {
            return settings[key];
          }

        });
        return (result = connector.request('POST', '/CompanyInfo', data));
      });
      after(function () {
        OAuth.prototype._performSecureRequest.restore();
      });
      it('calls underlying auth library', function () {
        return expect(OAuth.prototype._performSecureRequest)
          .to.have.been.calledWith('AccessTokenKey', 'AccessTokenSecret', 'POST', 'https://quickbooks.api.intuit.com/v3/company/CompanyId/CompanyInfo', null, 'data', 'application/json');
      });
      it('returns json', function () {
        return expect(result)
          .to.become({
            CompanyInfo: {
              CompanyName: 'Owen Evans Sandbox Company'
            }
          });
      });
    });
  });
});
