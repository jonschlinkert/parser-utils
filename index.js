/*!
 * parser-utils <https://github.com/jonschlinkert/parser-utils>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');


/**
 * Default properties expected on `file` objects.
 *
 *   - `path` The source file path.
 *   - `data`: metadata, like from yaml front matter
 *   - `contetn`: the content of a file, excluding front-matter
 *
 * @return {Array}
 * @api private
 */

exports.file = {
  path: '',
  content: '',
  orig: {},
  data: {}
};


/**
 * Properties to be applied to `file` objects.
 *
 *   - `data` Object of data.
 *   - `locals` Alternative to `data`
 *
 * @return {Array}
 * @api private
 */

exports.dataProps = [
  'locals',
  'data'
];


/**
 * Return an object composed only of `data` properties.
 * If a `locals` object is supplied, properties in that
 * object will override any properties on the `data`
 * object.
 *
 * @param  {Object} `obj` Object with data objects to merge.
 * @param  {Object} `locals` Optional object of data that should "win" over other data.
 * @param  {Array} `props` Additional properties to merge in.
 * @return {Object} Object composed only of a single data property.
 * @api private
 */

exports.mergeData = function (obj, locals, props) {
  if (Array.isArray(locals)) {
    props = locals;
    locals = {};
  }

  props = _.pick(obj, props || exports.dataProps);
  var data = _.values(props).concat(locals);

  return _.merge.apply(_, data);
};


/**
 * Return an object composed only of `data` properties.
 *
 * @return {Object}
 * @api private
 */

exports.siftKeys = function (obj, props) {
  obj = _.merge({}, exports.file, obj);

  var file = _.keys(exports.file);
  var keys = _.keys(obj);
  var diff = _.difference(keys, file);

  var o = _.pick(obj, file);

  o.orig = _.merge({}, o.orig, _.pick(obj, diff));
  defineGetter(o.orig, 'content', function(value) {
    return o.content;
  });

  return o;
};


/**
 * Extend and normalize a file object, to ensure that it
 * has the _ideal_ properties expected by the next parser.
 *
 * **Example:**
 *
 * ```js
 * var file = {content: 'foo'};
 * utils.extendFile(file);
 * //=> {content: 'foo', data: {}, orig: 'foo', options: {}}
 * ```
 *
 * @param  {Object} `file`
 * @param  {Object} `options`
 * @return {Object}
 */

exports.extendFile = function extendFile(file, options) {
  var opts = _.extend({}, options);
  var o = {};

  if (!file) {
    return exports.file;
  }

  if (typeof file === 'string') {
    o.content = file;
  } else {
    o = file;
  }

  // gray-matter compatibility
  if (o.original) {
    o.orig = o.original;
    delete o.original;
  }

  var locals = opts;
  if (opts.hasOwnProperty('locals')) {
    locals = opts.locals;
  }

  o.data = exports.mergeData(o, locals);
  return exports.siftKeys(o)
};



function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: false,
    enumerable: true,
    get: getter,
    set: function() {}
  });
};