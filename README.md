# multirest

[![NPM Version](https://img.shields.io/npm/v/multirest.svg)](https://npmjs.org/package/multirest) [![Dependencies](https://david-dm.org/rnemec/multirest.svg)](https://github.com/rnemec/multirest) [![Build Status](https://travis-ci.org/rnemec/multirest.svg?branch=master)](https://travis-ci.org/rnemec/multirest) [![License](https://img.shields.io/npm/l/multirest.svg?maxAge=2592000)](LICENSE) [![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?maxAge=2592000)](https://github.com/rnemec/multirest) [![GitHub stars](https://img.shields.io/github/stars/rnemec/multirest.svg?style=social&label=Star&maxAge=259200)](https://github.com/rnemec/multirest)

Connect/express middleware to serve combined REST requests in one REST call over one HTTP(S) connection.

## Inspiration

The REST APIs are meant to be the generic servers for different clients (my own Angular, my own mobile client, but also third party client or other REST based integration). But if my Angular page needs to load 10 different resources to build the page, those may result in 10 HTTP requests to the server.

Or worse: I may be tempted to create a client-specific route to return the 10 resources.

The idea is that between concepts like `multirest` and `GraphQL` the client implementations should be able to specify what data is needed and to which extent, without affecting the general design of the REST server.

MultiREST allows the client (or client library, possibly working behind the scene) request several REST resources at once, without changing the generic behavior of the REST server by adding **one single line** to the server setup.

## Install

```bash
npm install -S multirest
```

## Setup

Declare it and use it
```javascript
var multirest = require("multirest");
// Assuming 'app' is a connect/express object
app.use('/api/multirest', multirest(app));
```
Yes, I know, it is three lines... Making it one line is left as homework to the reader :-)

### multirest(app, options)

Create a new multirest middleware with the provided options, at the specific route mount.
Recommended mount point is `'/api/multirest'`.

The `multirest` middleware will parse the combined request, execute the individual requests as if they were passes in one by one, collect their responses, combine and send back to the caller/client.

It is client's responsibility to combine the individual REST requests into the combined request (client libraries coming soon!), as well as splitting the response data (client libraries *really* coming soon!).

##### app
The `multirest` middleware needs a reference to the `app` object to be able to send the individual requests internally, without opening additional http connections to this very server.

##### options

Multirest middleware accepts these properties in the options object.

###### options.concurrency

How many individual subrequest are allowed to be in-flight at the same time.

Default = 5

## REST API

(Prototype of one approach for a client-side is in the [test.js](test/test.js): rest request method that returns a promise of the rest data (as if it were doing it directly), but you can call it multiple times, before firing it off. When the multirest request is done, the many individual promises get fulfilled with their data.)

* POST
  * url: configured route (e.g. '/api/multirest')
  * body: JSON Array of individual requests
    * method: 'GET', 'POST', 'PUT', 'PATCH' or 'DELETE'
    * url: individual request URL including query part
    * body: JSON with POST-like data
  * returns: JSON Array with individual responses:
    * status: http status of the individual response
    * body: JSON body of the individual response

**Example**:

```json
POST /api/multirest
[{
  "method": "GET",
  "url": "/api/things/1"
},
{
  "method": "POST",
  "url": "/api/things",
  "body": { "name": "TWO"}
},
{
  "method": "GET",
  "url": "/api/thongs"
}]
```
returns
```json
[{
  "status": "200",
  "body": { "id": "1", "name": "ONE"}
},
{
  "status": "200",
  "body": { "id": "2", "name": "TWO"}
},
{
  "status": "404",
  "body": {}
}]
```
### Other supported behavior
* cookies are passed in and out
* header fields are passed in

## Usage Limitations

### Local requests only

At this time, only locally served REST requests are supported.

### No multi-part, etc

Regular JSON-based requests (GET/POST/PUT/PATCH/DELETE) only.

## License

[MIT](LICENSE)
