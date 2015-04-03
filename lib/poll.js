'use strict';
var moment = require('moment');
var QBOConnector = require('./connector');
var BBPromise = require('bluebird');
var _ = require('lodash');

function QBOPoller(context) {
  this.logger = require('hoist-logger').child({
    cls: 'QBOPoller',
    subscription: context.subscription._id,
    application: context.application._id
  });
  this.logger.alert = require('hoist-logger').alert;
  this.logger.info('setting up connector');
  this.context = context;
  this.context.settings.applicationId = context.application._id;
  this.connector = new QBOConnector(context.settings);
}


QBOPoller.prototype.poll = function () {
  return BBPromise.try(function buildPollCalls() {
      this.logger.info('starting poll');
      this.pollStart = moment().utc();
      this.lastPolled = this.context.subscription.get('lastPolled');
      if ((!this.context.subscription.endpoints) || this.context.subscription.endpoints.length < 1) {
        this.logger.warn('no endpoints to poll!');
        return [];
      }
      var sortedEndpoints = _.map(this.context.subscription.endpoints, _.bind(function (endpoint) {
        var mappedEndpoint = {
          endpointName: endpoint
        };
        var endpointMeta = this.context.subscription.get(endpoint);
        endpointMeta = endpointMeta || {};
        mappedEndpoint.endpointMeta = endpointMeta;
        if (!endpointMeta.lastPolled) {
          mappedEndpoint.pollType = 'new';

        } else {
          mappedEndpoint.pollType = 'update';
        }
        return mappedEndpoint;
      }, this));
      //we've polled this endpoint before so we can use cdc
      this.logger.info({
        endpoints: sortedEndpoints
      }, 'sorted endpoints');
      var updateEndpoints = _.filter(sortedEndpoints, function (endpoint) {
        return endpoint.pollType === 'update';
      });
      //we've not polled this endpoint before
      var newEndpoints = _.filter(sortedEndpoints, function (endpoint) {
        return endpoint.pollType === 'new';
      });
      this.logger.info({
        newEndpoints: newEndpoints,
        updateEndpoints: updateEndpoints
      }, 'polling endpoints');
      return _.map(newEndpoints, _.bind(function (newEndpoint) {
        return this.pollNewEndpoint(newEndpoint);
      }, this)).concat(this.pollForUpdates(updateEndpoints));
    }, [], this)
    .bind(this)
    .then(function (polls) {
      this.logger.info('waiting for all polls to finish');
      return BBPromise.settle(polls);
    })
    .then(function () {
      _.forEach(this.context.subscription.endpoints, _.bind(function (endpoint) {
        var endpointMeta = this.context.subscription.get(endpoint);
        if (!endpointMeta) {
          this.context.subscription.set(endpoint, (endpointMeta = {}));
        }
        endpointMeta.lastPolled = moment().utc().format();
      }, this));
      this.logger.info('setting last polled date');
      this.context.subscription.set('lastPolled', this.pollStart.format());
    });
};
QBOPoller.prototype.pollForUpdates = function (endpoints) {
  return BBPromise.try(function () {
    var entityList = _.pluck(endpoints, 'endpointName').join(',');
    this.logger.info({
      endpoints: endpoints,
      entityList: entityList
    }, 'calling cdc');

    return this.connector.get('/cdc?entities=' + entityList + '&changedSince=' + moment(this.lastPolled).toISOString())
      .bind(this)
      .then(function (response) {
        return this.flattenCDCResponse(_.pluck(endpoints, 'endpointName'), response);
      }).then(function (flattenedCDCResponse) {
        return _.filter(_.map(_.pluck(endpoints, 'endpointName'), _.bind(function (endpoint) {
          if (flattenedCDCResponse[endpoint]) {
            return this.processEntities(endpoint, flattenedCDCResponse[endpoint]);
          }
        }, this)));
      });
  }, [], this);
};
QBOPoller.prototype.pollNewEndpoint = function (endpoint) {
  this.logger.info({
    endpoint: endpoint
  }, 'polling endpoint');
  return this.connector.get('/query?select * from ' + endpoint.endpointName)
    .bind(this)
    .then(function (response) {
      this.logger.info({
        endpoint: endpoint
      }, 'got response, processing');
      return this.processEntities(endpoint.endpointName, response.QueryResponse[endpoint.endpointName]);
    });
};
QBOPoller.prototype.processEntities = function (endpointName, entities) {
  this.logger.info({
    endpoint: endpointName
  }, 'processing entities');
  return BBPromise.all(_.map(entities, _.bind(function (entity) {
    this.logger.info({
      endpoint: endpointName
    }, 'processing entity');
    return this.processEntity(endpointName, entity);
  }, this))).catch(function (err) {
    this.logger.error(err);
  });
};
QBOPoller.prototype.processEntity = function (endpointName, entity) {
  return BBPromise.try(function () {
    this.logger.info({
      entity: entity.Id
    }, 'setting entity status');
    return this.setStatus(endpointName, entity);
  }, [], this).bind(this).then(function () {
    this.logger.info({
      endpointName: endpointName
    }, 'raising event');
    return this.raiseEvent(endpointName, entity);
  }).catch(function (err) {
    this.logger.error(err);
    this.logger.alert(err);
  });
};
QBOPoller.prototype.raiseEvent = function (endpoint, entity) {
  return BBPromise.try(function () {
    var eventName = (this.context.connectorKey + ":" + entity.status + ":" + endpoint).toLowerCase();
    this.logger.info({
      eventName: eventName,
    }, 'raising event');
    return this.emit(eventName, entity);
  }, [], this);

};
QBOPoller.prototype.setStatus = function (endpoint, entity) {

  if (entity.status) {
    //deleted
    this.logger.info('using deleted status');
    return entity;
  } else {
    var endpointMeta = this.context.subscription.get(endpoint);
    var newStatus = 'new';
    if (!endpointMeta) {
      newStatus = 'modified';
      this.context.subscription.set(endpoint, (endpointMeta = {}));
    }

    if (!endpointMeta.ids) {
      endpointMeta.ids = [];
    }
    if (endpointMeta.ids.indexOf(entity.Id) < 0) {
      endpointMeta.ids.push(entity.Id);
      this.logger.info('setting status to ', newStatus);
      entity.status = newStatus;
    } else {
      this.logger.info('setting status to modified');
      entity.status = 'modified';
    }
  }
};
QBOPoller.prototype.flattenCDCResponse = function (endpoints, response) {

  return BBPromise.try(function () {
    var result = {};
    _.forEach(endpoints, function (endpoint) {
      result[endpoint] = [];
    });
    _.forEach(response.CDCResponse, function (response) {
      return _.forEach(response.QueryResponse, function (queryResponse) {
        return _.forEach(endpoints, function (endpoint) {
          var entities = queryResponse[endpoint];
          if (entities) {
            result[endpoint] = result[endpoint].concat(entities);
          }
        });
      });
    });
    return result;
  });
};
module.exports = function (context, raiseCallback) {
  var poller = new QBOPoller(context);
  poller.emit = raiseCallback;
  return poller.poll();
};
module.exports._poller = QBOPoller;
