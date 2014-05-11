var test = require('tape');
var Router = require('..');
var PassThrough = require('stream').PassThrough;
var req, res, r;

function initRouter() {
  r = new Router();
}

function resetReqRes() {
  req = new PassThrough();
  res = new PassThrough();
}

test('No routes returns 500 error', function (t) {
  t.plan(1);
  initRouter();
  resetReqRes();
  t.equal(r.getRoute(req).statusCode, 500);
});

test('No routes returns error text', function (t) {
  t.plan(1);
  initRouter();
  resetReqRes();
  t.equal(r.getRoute(req).message, 'Internal Server Error');
});

test('Unmatched route returns 404 statusCode', function (t) {
  var fakeController = {
    getRoutes: function () { return [
      ['get', '/', function () {}]
    ]; }
  };
  t.plan(1);
  initRouter();
  resetReqRes();
  req.url = 'http://example.com/haha';
  r.registerController(fakeController);
  t.equal(r.getRoute(req).statusCode, 404);
});

test('Webroot get action', function (t) {
  var fakeController = {
    getRoutes: function () { return [
      ['get', '/', {
        magic: 'object'
      }]
    ]; }
  };
  t.plan(1);
  initRouter();
  resetReqRes();
  req.url = '/';
  req.method = 'GET';
  r.registerController(fakeController);
  t.equal(r.getRoute(req).magic, 'object');
});

test('Webroot post action', function (t) {
  var fakeController = {
    getRoutes: function () { return [
      ['post', '/', { output: 'SUCCESSINATOR' }]
    ]; }
  };
  t.plan(1);
  initRouter();
  resetReqRes();
  req.url = '/';
  req.method = 'POST';
  r.registerController(fakeController);
  t.equal(r.getRoute(req).output, 'SUCCESSINATOR');
});

test('Webroot get action with params', function (t) {
  var fakeController = {
    getRoutes: function () { return [
      ['get', '/:name', { jimbo: 'aeroplane' }]
    ]; }
  };
  t.plan(1);
  initRouter();
  resetReqRes();
  req.url = '/NAMEPARAMISHERE';
  req.method = 'GET';
  r.registerController(fakeController);
  t.equal(r.getRoute(req).params.name, 'NAMEPARAMISHERE');
});
