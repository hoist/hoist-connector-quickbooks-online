'use strict';
var BBPromise = require('bluebird');
var OAuth = require('oauth').OAuth;
var _ = require('lodash');
var logger = require('hoist-logger');

function QBOConnector(settings) {
  logger.info({
    settings: settings
  }, 'constructed qbo-connector');
  this.settings = settings;

  this.auth = BBPromise.promisifyAll(new OAuth(
    'https://oauth.intuit.com/oauth/v1/get_request_token',
    'https://oauth.intuit.com/oauth/v1/get_access_token',
    settings.consumerKey,
    settings.consumerSecret,
    '1.0',
    'https://bouncer.hoist.io',
    'HMAC-SHA1'
  ));
  this.auth._originalCreateClient = this.auth._createClient;
  this.auth._createClient = function (port, hostname, method, path, headers, sslEnabled) {
    headers['user-agent'] = 'Hoist';
    headers.Accept = 'application/json';
    return this._originalCreateClient(port, hostname, method, path, headers, sslEnabled);
  };
  this.auth._performSecureRequestAsync = BBPromise.promisify(this.auth._performSecureRequest, this.auth);
  _.bindAll(this);
}


/* istanbul ignore next */
QBOConnector.prototype.authorize = function (authorization) {
  this.authorization = authorization;
  this.settings.accessKey = authorization.get('AccessToken');
  this.settings.accessSecret = authorization.get('AccessTokenSecret');
};

QBOConnector.prototype.swapRequestToken = function (requestToken, requestTokenSecret, verifier) {
  return this.auth.getOAuthAccessTokenAsync(requestToken, requestTokenSecret, verifier);
};

QBOConnector.prototype.generateRequestToken = function () {
  logger.info('requesting auth token');
  return this.auth.getOAuthRequestTokenAsync();
};


QBOConnector.prototype.receiveBounce = function (bounce) {
  logger.info(this.settings);
  if (bounce.get('RequestToken')) {
    /*jshint camelcase: false */
    return this.swapRequestToken(bounce.get('RequestToken'), bounce.get('RequestTokenSecret'), bounce.query.oauth_verifier)
      .spread(function (accessToken, accessTokenSecret, auth_headers) {
        logger.info(auth_headers);
        logger.info('got request token');
        return bounce.delete('RequestToken')
          .then(function () {
            return bounce.delete('RequestTokenSecret');
          }).then(function () {
            return bounce.set('AccessToken', accessToken);
          }).then(function () {
            return bounce.set('AccessTokenSecret', accessTokenSecret);
          }).then(function () {
            return bounce.set('CompanyId', bounce.query.realmId);
          }).then(function () {
            bounce.done();
          });
      });
  } else if (bounce.get('IntuitSetup')) {
    return this.generateRequestToken()
      .bind(this)
      .spread(function (requestToken, requestTokenSecret) {
        logger.info('got request token');
        return bounce.set('RequestToken', requestToken)
          .bind(this)
          .then(function () {
            return bounce.set('RequestTokenSecret', requestTokenSecret);
          })
          .bind(this)
          .then(function () {
            bounce.redirect('https://appcenter.intuit.com/Connect/Begin?oauth_token=' + requestToken);
          });
      });
  } else {
    return this.generateSetupUrl(bounce)
      .bind(this)
      .then(function (qboSetupUrl) {
        return bounce.set('IntuitSetup', true)
          .then(function () {
            bounce.redirect(qboSetupUrl);
          });
      });
  }
  bounce.done();
};

QBOConnector.prototype.generateSetupUrl = function (bounce) {
  var datasources = [];
  return BBPromise.try(function () {
    /* istanbul ignore else */
    if (bounce.query.quickbooks || (!(bounce.query.quickbooks) && !(bounce.query.payments))) {
      datasources.push('quckbooks');
    }
    /* istanbul ignore else */
    if (bounce.query.payments) {
      datasources.push('payments');
    }
    return 'https://appcenter.intuit.com/Connect/SessionStart?grantUrl=' + encodeURIComponent('https://bouncer.hoist.io/bounce') + '&datasources=' + encodeURIComponent(datasources.join());
  });
};

QBOConnector.prototype.get = function get(url, extraHeader) {
  logger.info('inside hoist-connector-qbo.get');
  return this.request('GET', url, null, extraHeader);
};

QBOConnector.prototype.update = function put(url, data) {
  logger.info('inside hoist-connector-qbo.put');
  var uri = require('url').parse(url, true);
  uri.query.operation = 'update';
  delete uri.search;
  delete uri.path;
  return this.request('POST', require('url').format(uri), data);
};
QBOConnector.prototype.delete = function put(url, data) {
  logger.info('inside hoist-connector-qbo.put');
  var uri = require('url').parse(url, true);
  uri.query.operation = 'delete';
  delete uri.search;
  delete uri.path;
  return this.request('POST', require('url').format(uri), data);
};

QBOConnector.prototype.create = function post(url, data) {
  logger.info('inside hoist-connector-qbo.post');
  return this.request('POST', url, data);
};

QBOConnector.prototype.authorize = function (authorization) {
  this.authorization = authorization;
  this.settings.accessKey = authorization.get('AccessToken');
  this.settings.accessSecret = authorization.get('AccessTokenSecret');
  this.settings.companyId = authorization.get('CompanyId');

};
QBOConnector.prototype.getRootUrl = function () {
  var domain = 'quickbooks.api.intuit.com';
  if (this.settings.isSandbox) {
    domain = 'sandbox-quickbooks.api.intuit.com';
  }
  return 'https://' + domain + '/v3/company/' + this.settings.companyId;
};
QBOConnector.prototype.request = function request(method, path, data) {
  var contentType = 'application/json';
  data = data ? data : null;

  logger.info({
    method: method,
    path: path
  }, 'inside hoist-connector-qbo.request');
  return this.auth._performSecureRequestAsync(this.settings.accessKey, this.settings.accessSecret, method, this.getRootUrl() + path, null, data, contentType).spread(function (data) {
    return JSON.parse(data);
  });
};


module.exports = QBOConnector;
