'use strict';
require('../bootstrap');
var poll = require('../../lib/poll');
var sinon = require('sinon');
var QBOConnector = require('../../lib/connector');
var BBPromise = require('bluebird');
var expect = require('chai').expect;
var moment = require('moment');
describe('QBOPoller', function () {
  describe('on poll with no existing info', function () {
    var context = {
      application: {
        _id: 'application'
      },
      subscription: {
        _id: 'subscription',
        endpoints: ['Invoice', 'Payment'],
        get: sinon.stub(),
        set: sinon.stub()
      },
      settings: {

      },
      connectorKey: 'connectorKey'
    };
    var raiseMethod = sinon.stub();
    before(function () {
      sinon.stub(QBOConnector.prototype, 'get').withArgs('/query?select * from Invoice').returns(BBPromise.resolve(require('../example_responses/invoice_query.json')));
      QBOConnector.prototype.get.withArgs('/query?select * from Payment').returns(BBPromise.resolve(require('../example_responses/payment_query.json')));
      return poll(context, raiseMethod);
    });
    after(function () {

      QBOConnector.prototype.get.restore();
    });
    it('gets entities for endpoint', function () {
      return expect(QBOConnector.prototype.get)
        .to.have.been.calledWith('/query?select * from Invoice')
        .and.calledWith('/query?select * from Payment');
    });
    it('raises modified invoice events', function () {
      return expect(raiseMethod.withArgs('connectorkey:modified:invoice').callCount).to.eql(30);
    });
    it('raises modified payment events', function () {
      return expect(raiseMethod.withArgs('connectorkey:modified:payment').callCount).to.eql(17);
    });
  });
  describe('on poll with existing info', function () {
    var context = {
      application: {
        _id: 'application'
      },
      subscription: {
        _id: 'subscription',
        endpoints: ['Invoice', 'Payment'],
        get: sinon.stub(),
        set: sinon.stub()
      },
      settings: {

      },
      connectorKey: 'connectorKey'
    };
    var raiseMethod = sinon.stub();
    var clock;
    before(function () {
      clock = sinon.useFakeTimers();
      context.subscription.get.withArgs('Invoice').returns({
        ids: ["103", "119"],
        lastPolled: moment().utc()
      });
      sinon.stub(QBOConnector.prototype, 'get').withArgs('/query?select * from Invoice').returns(BBPromise.resolve(require('../example_responses/invoice_query.json')));
      QBOConnector.prototype.get.withArgs('/query?select * from Payment').returns(BBPromise.resolve(require('../example_responses/payment_query.json')));
      QBOConnector.prototype.get.withArgs('/cdc?entities=Invoice&changedSince=1970-01-01T00:00:00.000Z').returns(BBPromise.resolve(require('../example_responses/cdc.json')));
      return poll(context, raiseMethod);
    });
    after(function () {
      clock.restore();
      QBOConnector.prototype.get.restore();
    });
    it('gets entities for endpoint', function () {
      return expect(QBOConnector.prototype.get)
        .to.have.been.calledWith('/query?select * from Payment');
    });
    it('calls cdc for pre polled endpoint', function () {
      return expect(QBOConnector.prototype.get)
        .to.have.been.calledWith('/cdc?entities=Invoice&changedSince=1970-01-01T00:00:00.000Z');
    });
    it('raises modified invoice events', function () {
      return expect(raiseMethod.withArgs('connectorkey:modified:invoice', sinon.match(function (invoice) {
        return invoice.Id === '103';
      })).callCount).to.eql(1);
    });
    it('raises new invoice events', function () {
      return expect(raiseMethod.withArgs('connectorkey:new:invoice', sinon.match(function (invoice) {
        return invoice.Id === '104';
      })).callCount).to.eql(1);
    });
    it('raises deleted invoice events', function () {
      return expect(raiseMethod.withArgs('connectorkey:deleted:invoice', sinon.match(function (invoice) {
        return invoice.Id === '119';
      })).callCount).to.eql(1);
    });
    it('raises modified payment events', function () {
      return expect(raiseMethod.withArgs('connectorkey:modified:payment').callCount).to.eql(17);
    });
  });
  describe('#flattenCDCResponse', function () {
    var _result;
    before(function () {
      var poller = new poll._poller({
        application: {
          _id: 'application'
        },
        subscription: {
          _id: 'subscription'
        },
        settings: {

        }
      });
      _result = poller.flattenCDCResponse(['Invoice', 'CreditMemo', 'Payment'], require('../example_responses/cdc.json'));
    });
    it('returns correct entity collections', function () {
      return expect(_result).to.eventually.have.property('Invoice');
    });
    it('creates correct arrays for Invoices', function () {
      return expect(_result.then(function (result) {
        return result.Invoice;
      })).to.eventually.have.length(3);
    });
  });
});
