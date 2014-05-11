var xtend = require('xtend');
var methods = require('methods');
var Error500 = require('./error_500.js');
var Error404 = require('./error_404.js');
var urlPattern = require('url-pattern');

function generateMethodFunction(method) {
  return function (match, action) {
    this._routes.push({
      method: method.toUpperCase(),
      pattern: urlPattern(match),
      action: action
    });
  };
}

function Ftybr() {
  this._routes = [];
}

methods.forEach(function (method) {
  Ftybr.prototype[method.replace(/[^a-z+]/, '')] = generateMethodFunction(method);
});

Ftybr.prototype.all = function (match, action) {
  this.get(match, action);
  this.post(match, action);
  this.delete(match, action);
  this.put(match, action);
};

Ftybr.prototype.getRoute = function (req) {
  if (this._noRoutesRegistered()) {
    return new Error500();
  }

  return this._actionForRequest(req) || new Error404();
};

Ftybr.prototype.registerController = function (controller) {
  controller.getRoutes().forEach(this._registerControllerRoute.bind(this));
};

Ftybr.prototype._noRoutesRegistered = function () {
  return !this._routes.length;
};

Ftybr.prototype._registerControllerRoute = function (route) {
  var method = route[0];
  var match = route[1];
  var action = route[2];

  this[method](match, action);
};

Ftybr.prototype._actionForRequest = function (req) {
  return this._routes.reduce(this._matchingRoute.bind(this, req), null);
};

Ftybr.prototype._matchingRoute = function (req, currentAction, route) {
  if (currentAction !== null) {
    return currentAction;
  }

  if (this._routeMatchesRequest(req, route)) {
    return this._addParamsToAction(route.action, route.pattern.match(req.url));
  }

  return null;
};

Ftybr.prototype._addParamsToAction = function (action, params) {
  return xtend(action, { params: params });
};

Ftybr.prototype._routeMatchesRequest = function (req, route) {
  return req.method === route.method && route.pattern.match(req.url) !== null;
};

module.exports = Ftybr;
