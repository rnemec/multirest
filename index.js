/*!
 * multirest
 * Copyright(c) 2016 Richard Nemec
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */
const debug = require('debug')('multirest');
const request = require('supertest-as-promised');
const Bluebird = require('bluebird');

/**
 * Module exports.
 * @public
 */
module.exports = multirest;

/**
 * Create a new multirest middleware.
 *
 * @param {object} [options]
 * @param {array} [options.concurrency]
 * @return {function} middleware
 * @public
 */
function multirest(app, options) {
  var opts = options || {};

  var concurrency = opts.concurrency || 5;

  debug('multirest options %j', opts);

  return function _multirest(req, res, next) {

    function _invokeMethod(itemReq) {
      var r = request(app);
      if (itemReq.method === 'GET') {
        return r.get(itemReq.url);
      } else if (itemReq.method === 'POST') {
        return r.post(itemReq.url).send(itemReq.body);
      } else if (itemReq.method === 'PUT') {
        return r.put(itemReq.url).send(itemReq.body);
      } else if (itemReq.method === 'PATCH') {
        return r.patch(itemReq.url).send(itemReq.body);
      } else if (itemReq.method === 'DELETE') {
        return r.delete(itemReq.url);
      }
    }

    function invokeItemReq(itemReq) {
      return _invokeMethod(itemReq)
      .set(req.headers)
      .then(function(itemRes) {
        mergeCookies(itemRes, res);
        return {
          status: itemRes.status,
          body: itemRes.body
        };
      })
      .catch(function(err) {
        return {
          status: 500,
          body: err.toString()
        };
      })
    }

    try {

      if (!req.body) {
        var err = "No body in the multirest request - most likely body parser is not use-d before multirest";
        console.error(err);
        next(err);
        return;
      }

      // our URL to prevent cycling
      var multirestUrl = req.url;

      var requests = req.body;

      if (!Array.isArray(requests)) {
        var err = "The body in the multirest request must be an array. Likely client request mistake.";
        console.error(err);
        next(err);
        return;
      }

      // deal with headers
      delete req.headers['content-length'];

      Bluebird.map(requests, invokeItemReq, {concurrency: concurrency})
      .then(function(results) {res.json(results);})
      .catch(function(err) {
        console.error(err);
        next(err);
      });

    } catch (e) {
      console.error(e);
      next(e);
    }

  }

}

function mergeCookies(itemRes, res) {
  try {
    // get cookies from superagent response structure
    var cookiesHdr = itemRes.header['set-cookie'];
    if (cookiesHdr) {
      // set cookies into express/http response
      res.setHeader('set-cookie', cookiesHdr);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
