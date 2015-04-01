'use strict';
var moment = require('moment');
var QBOConnector = require('./connector');
var BBPromise = require('bluebird');
var _ = require('lodash');

function QBOPoller(app, subscription, connector, bouncerToken) {
  this.subscription = subscription;
  this.connector = connector;
  this.bouncerToken = bouncerToken;
  this.connectorKey = connector.key;
  this.connector = new QBOConnector(connector.settings);
  this.connector.authorize(this.bouncerToken);
}
QBOPoller.prototype.poll = function () {

  var now = moment.utc();
  return BBPromise.try(function () {
    var lastPolled = this.subscription.get('lastPolled');

    if (!lastPolled) {
      return BBPromise.all(_.map(this.subscription.endpoints, _.bind(function (endpoint) {
        return this.connector.get('/query?select * from ' + endpoint)
          .bind(this)
          .then(function (response) {
            return BBPromise.all(response.QueryResponse[endpoint].map(_.bind(function (entity) {
              return this.subscription.eventEmitter.emit(this.connectorKey + ':new:' + endpoint.toLowerCase(), entity);
            }, this)));
          });
      }, this)));
    } else {
      var entityList = this.subscription.endpoints.join(',');
      return this.connector.get('/cdc?entities=' + entityList + '&changedSince=' + lastPolled.format())
        .bind(this)
        .then(function (response) {
          console.log(response);
        });
    }
  }).then(function () {
    this.subscription.set('lastPolled', now.format());
  });
};

module.exports = function (app, subscription, connector, bouncerToken) {
  var poller = new QBOPoller(app, subscription, connector, bouncerToken);
  poller.poll();
};
