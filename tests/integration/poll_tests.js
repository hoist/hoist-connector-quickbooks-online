'use strict';
require('../bootstrap');
var poll = require('../../lib/poll');
var model = require('hoist-model');
var ConnectorSetting = model.ConnectorSetting;
var BouncerToken = model.BouncerToken;
var Application = model.Application;
var sinon = require('sinon');

describe('polling', function () {
  describe('given no previous polls', function () {
    var subscription;
    before(function () {
      var subscriptionSettings = {

      };
      subscription = {
        get: function (key) {
          return subscriptionSettings[key];
        },
        eventEmitter: {
          emit: sinon.stub()
        }
      };
      var connector = new ConnectorSetting({

      });
      var bouncerToken = new BouncerToken();
      var app = new Application();
      poll(app, subscription, connector, bouncerToken);
    });
    it('raises NEW:INVOICE events', function () {
      expect(subscription.eventEmitter.emit)
      .to.have.been.calledWith()

    });
  });
});
