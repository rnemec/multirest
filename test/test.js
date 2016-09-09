
process.env.NODE_ENV = 'test';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multirest = require('..');

var request = require('supertest-as-promised');
var chai = require('chai');
var chaiDeepMatch = require('chai-deep-match');

// Load Chai assertions
global.expect = chai.expect;
global.assert = chai.assert;
chai.should();
chai.use(chaiDeepMatch);

describe('MultiREST', function() {
  const GET1_URL = '/api/one/111?getFilter=getBlah';
  const GET2_URL = '/api/two/222';
  const POST_URL = '/api/one/222?postFilter=postBlah';
  const PUT_URL = '/api/one/222';
  const PATCH_URL = '/api/one/222';
  const DELETE_URL = '/api/one/222';
  const POST_BODY = {postval: 74};
  const GET_COOKIE_URL = '/api/servecookies';

  var app;

  before(function() {
    app = App();
  });

  describe('for normal requests', function() {

    it('should get', function() {
      return request(app)
      .get(GET1_URL)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(3);
        res.body[1].should.have.property('one');
        res.body[1].one.should.equal(1);
        var reqRep = res.body[0];
        testReqRep(reqRep, {
          url: GET1_URL,
          method: 'GET',
          params: {oneGetId: '111'},
          query: {getFilter: 'getBlah'},
          cookies: {},
          body: {}
        });
      })
    });

    it('should post', function() {
      return request(app)
      .post(POST_URL)
      .send({postval: 2})
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        var reqRep = res.body[0];
        testReqRep(reqRep, {
          url: POST_URL,
          method: 'POST',
          params: {onePostId: '222'},
          query: {postFilter: 'postBlah'},
          cookies: {},
          body: {postval: 2}
        });
      })
    });

    it('should get and pass cookie', function() {
      var agent = request.agent(app);
      return agent
      .get(GET_COOKIE_URL)
      .set('testheader', 'Test Value')
      .set('Cookie', 'cookie-1=1234567;cookie-2=blah')
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        var reqRep = res.body[0];
        testReqRep(reqRep, {
          url: GET_COOKIE_URL,
          method: 'GET',
          params: {},
          query: {},
          cookies: {
            'cookie-1': '1234567',
            'cookie-2': 'blah'
          },
          body: {}
        }, {testheader: 'Test Value'});
      })
      .then(function() {
        return agent
        .get(GET1_URL)
        .set('testheader', 'Test Value')
        .expect(200)
        .expect('Content-Type', /json/)
      })
      .then(res => {
        res.body.should.be.instanceOf(Array);
        var reqRep = res.body[0];
        testReqRep(reqRep, {
          url: GET1_URL,
          method: 'GET',
          params: {oneGetId: '111'},
          query: {getFilter: 'getBlah'},
          cookies: {
            'server-cookieone': 'server;cookieone&val',
            'server-cookietwo': 'server;cookietwo&val'
          },
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

  });

  describe('for multirest requests', function() {

    it('should succeed for 0 requests', function() {
      return request(app)
      .post('/multirest')
      .send([])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(0);
      });
    });

    it('should succeed for 1 GET', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'GET',
          url: GET1_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: GET1_URL,
          method: 'GET',
          params: {oneGetId: '111'},
          query: {getFilter: 'getBlah'},
          cookies: {},
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

    it('should succeed for 1 POST', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'POST',
          url: POST_URL,
          body: POST_BODY
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: POST_URL,
          method: 'POST',
          params: {onePostId: '222'},
          query: {postFilter: 'postBlah'},
          cookies: {},
          body: POST_BODY
        }, {testheader: 'Test Value'});
      });
    });

    it('should succeed for 1 PUT', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'PUT',
          url: PUT_URL,
          body: POST_BODY
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: PUT_URL,
          method: 'PUT',
          params: {onePutId: '222'},
          query: {},
          cookies: {},
          body: POST_BODY
        }, {testheader: 'Test Value'});
      });
    });

    it('should succeed for 1 PATCH', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'PATCH',
          url: PATCH_URL,
          body: POST_BODY
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: PATCH_URL,
          method: 'PATCH',
          params: {onePatchId: '222'},
          query: {},
          cookies: {},
          body: POST_BODY
        }, {testheader: 'Test Value'});
      });
    });

    it('should succeed for 1 DELETE', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'DELETE',
          url: DELETE_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(204);
        res.body[0].body.should.deep.equal({});
      });
    });

    it('should succeed for 2 GETs', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'GET',
          url: GET1_URL
        },
        {
          method: 'GET',
          url: GET2_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(2);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        res.body[1].status.should.be.equal(200);
        res.body[1].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: GET1_URL,
          method: 'GET',
          params: {oneGetId: '111'},
          query: {getFilter: 'getBlah'},
          cookies: {},
          body: {}
        }, {testheader: 'Test Value'});
        reqRep = res.body[1].body[0];
        testReqRep(reqRep, {
          url: GET2_URL,
          method: 'GET',
          params: {twoGetId: '222'},
          query: {},
          cookies: {},
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

    it('should succeed for mix GET-POST-GET', function() {

      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'GET',
          url: GET1_URL
        },
        {
          method: 'POST',
          url: POST_URL,
          body: POST_BODY
        },
        {
          method: 'GET',
          url: GET2_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(3);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        res.body[1].status.should.be.equal(200);
        res.body[1].body.should.be.instanceOf(Array);
        res.body[2].status.should.be.equal(200);
        res.body[2].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: GET1_URL,
          method: 'GET',
          params: {oneGetId: '111'},
          query: {getFilter: 'getBlah'},
          cookies: {},
          body: {}
        }, {testheader: 'Test Value'});
        var reqRep = res.body[1].body[0];
        testReqRep(reqRep, {
          url: POST_URL,
          method: 'POST',
          params: {onePostId: '222'},
          query: {postFilter: 'postBlah'},
          cookies: {},
          body: POST_BODY
        }, {testheader: 'Test Value'});
        reqRep = res.body[2].body[0];
        testReqRep(reqRep, {
          url: GET2_URL,
          method: 'GET',
          params: {twoGetId: '222'},
          query: {},
          cookies: {},
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

    it('should handle 404 in mix', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'GET',
          url: '/api/fourofour'
        },
        {
          method: 'GET',
          url: GET2_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(2);
        res.body[0].status.should.be.equal(404);
        res.body[0].body.should.deep.equal({});
        res.body[1].status.should.be.equal(200);
        res.body[1].body.should.be.instanceOf(Array);
        var reqRep = res.body[1].body[0];
        testReqRep(reqRep, {
          url: GET2_URL,
          method: 'GET',
          params: {twoGetId: '222'},
          query: {},
          cookies: {},
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

    it('should handle 500 in mix', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .send([
        {
          method: 'GET',
          url: '/api/fail'
        },
        {
          method: 'GET',
          url: GET2_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(2);
        res.body[0].status.should.be.equal(500);
        res.body[0].body.should.deep.equal({});
        res.body[1].status.should.be.equal(200);
        res.body[1].body.should.be.instanceOf(Array);
        var reqRep = res.body[1].body[0];
        testReqRep(reqRep, {
          url: GET2_URL,
          method: 'GET',
          params: {twoGetId: '222'},
          query: {},
          cookies: {},
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

    it('should pass cookies in', function() {
      return request(app)
      .post('/multirest')
      .set('testheader', 'Test Value')
      .set('Cookie', 'cookie-1=1234567;cookie-2=blah')
      .send([
        {
          method: 'GET',
          url: GET1_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: GET1_URL,
          method: 'GET',
          params: {oneGetId: '111'},
          query: {getFilter: 'getBlah'},
          cookies: {
            'cookie-1': '1234567',
            'cookie-2': 'blah'
          },
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

    it('should pass cookies between requests', function() {
      var agent = request.agent(app);
      return agent
      .post('/multirest')
      .set('testheader', 'Test Value')
      .set('Cookie', 'cookie-1=1234567;cookie-2=blah')
      .send([
        {
          method: 'GET',
          url: GET_COOKIE_URL
        }
      ])
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: GET_COOKIE_URL,
          method: 'GET',
          params: {},
          query: {},
          cookies: {
            'cookie-1': '1234567',
            'cookie-2': 'blah'
          },
          body: {}
        }, {testheader: 'Test Value'});
      })
      .then(function() {
        return agent
        .post('/multirest')
        .set('testheader', 'Test Value')
        .send([
          {
            method: 'GET',
            url: GET1_URL
          }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
      })
      .then(res => {
        res.body.should.be.instanceOf(Array);
        res.body.should.have.length(1);
        res.body[0].status.should.be.equal(200);
        res.body[0].body.should.be.instanceOf(Array);
        var reqRep = res.body[0].body[0];
        testReqRep(reqRep, {
          url: GET1_URL,
          method: 'GET',
          params: {oneGetId: '111'},
          query: {getFilter: 'getBlah'},
          cookies: {
            // 'cookie-1': '1234567',
            // 'cookie-2': 'blah',
            'server-cookieone': 'server;cookieone&val',
            'server-cookietwo': 'server;cookietwo&val'
          },
          body: {}
        }, {testheader: 'Test Value'});
      });
    });

  });
});

function App(options) {
  options = options || {};
  var app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use('/multirest', multirest(app, options));

  app.get('/api/one/:oneGetId', function(req, res) {
    setTimeout(function () {
      res.json([reqReport(req),{one:1},{two:2}]);
    }, 10);
  });
  app.get('/api/two/:twoGetId', function(req, res) {
    setTimeout(function () {
      res.json([reqReport(req),{one:1},{two:2}]);
    }, 10);
  });
  app.post('/api/one/:onePostId', function(req, res) {
    setTimeout(function () {
      res.json([reqReport(req)]);
    }, 10);
  });
  app.put('/api/one/:onePutId', function(req, res) {
    setTimeout(function () {
      res.json([reqReport(req)]);
    }, 10);
  });
  app.patch('/api/one/:onePatchId', function(req, res) {
    setTimeout(function () {
      res.json([reqReport(req)]);
    }, 10);
  });
  app.delete('/api/one/:oneDeleteId', function(req, res) {
    setTimeout(function () {
      res.status(204).end();
    }, 10);
  });
  app.get('/api/fail', function(req, res) {
    throw new Error('Failed explicitly');
  });
  app.get('/api/servecookies', function(req, res) {
    setTimeout(function () {
      res.cookie('server-cookieone', 'server;cookieone&val')
      res.cookie('server-cookietwo', 'server;cookietwo&val')
      res.json([reqReport(req),{one:1},{two:2}]);
    }, 10);
  });

  return app;
}

function reqReport(req) {
  var reqRep = {
    inputs: {
      url: req.url,
      method: req.method,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
      body: req.body
    },
    advanced: {
      headers: req.headers,
      route: req.route,
      _parsedUrl: req._parsedUrl,
      originalUrl: req.originalUrl
    }
  };
  return reqRep;
}

function testReqRep(reqRep, expectedInputs, headers) {
  reqRep.should.have.property('inputs');
  reqRep.inputs.should.deep.equal(expectedInputs);
  if (headers) {
    reqRep.should.have.property('advanced');
    reqRep.advanced.headers.should.deep.match(headers);
  }
}
