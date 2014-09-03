/*!
 * parser-utils <https://github.com/jonschlinkert/parser-utils>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var extend = _.extend;
var merge = _.merge;
var pick = _.pick;


/**
 * Expose `utils`
 */

var utils = module.exports;


/**
 * Utility method to define getters.
 *
 * @param  {Object} `obj`
 * @param  {String} `name`
 * @param  {Function} `getter`
 * @return {Getter}
 * @api private
 */

function defineGetter(obj, name, getter) {
  Object.defineProperty(obj, name, {
    configurable: false,
    enumerable: true,
    get: getter,
    set: function() {}
  });
}


/**
 * Default properties expected on `file` objects.
 *
 *   - `path` The source file path.
 *   - `data`: metadata, like from yaml front matter
 *   - `content`: the content of a file, **excluding** front-matter
 *   - `orig`: the original content of a file, **including** front-matter
 *
 * @return {Array}
 * @api private
 */

utils.file = {
  path: '',
  content: '',
  orig: {},
  data: {},
  locals: {}
};


/**
 * Get the array of keys expected on normalized `file` objects.
 *
 * @return {Array} Array of keys.
 * @api public
 */

utils.fileKeys = Object.keys(utils.file);


/**
 * Get an array of keys that should not be on the root of a
 * normalized `file` object.
 *
 * **Example:**
 *
 * ```js
 * var utils = require('parser-utils');
 * var file = {a: 'a', b: 'b', path: 'a/b/c.md'};
 * console.log(utils.diffKeys(file));
 * //=> ['a', 'b']
 * ```
 *
 * @param {Object} `obj` The object to inspect.
 * @param {Array} `props` Array of properties to concat to the output.
 * @return {Array} Array of keys
 * @api public
 */

utils.diffKeys = function diffKeys(o, props) {
  if (!props) {
    props = [];
  }

  var keys = Object.keys(o).concat(props);
  var file = utils.fileKeys;

  return _.difference(keys, file);
};


/**
 * Normalize the properties on the given `obj`.
 *
 * @param  {Object} `obj` The object to normalize.
 * @param  {Array} `props` Any additional properties to include.
 * @return {Object} Normalized object.
 * @api public
 */

utils.siftKeys = function siftKeys(obj, props) {
  obj = merge({}, utils.file, obj);

  var diff = utils.diffKeys(obj, props);
  var o = pick(obj, utils.fileKeys);

  o.orig = merge({}, o.orig, pick(obj, diff));
  defineGetter(o.orig, 'content', function() {
    return o.content;
  });

  return o;
};


/**
 * Merge the given `prop` from `a` and `b` into `o`.
 *
 * @param  {Object} `o` The object to merge into.
 * @param  {Object} `prop` The property to merge.
 * @param  {Object} `a` The first object with `prop`.
 * @param  {Object} `b` The second object with `prop`.
 * @return {Object} Merged object.
 * @api public
 */

utils.mergeProps = function mergeProps(o, prop, a, b) {
  o[prop] = merge({}, a[prop], b[prop]);
};


/**
 * Merge nested properties into the root of the given object. Nested
 * properties occur when, for instance, and options object - intended
 * as `locals`, is also passed with an actual `locals` property.
 *
 * **Note** that this will only merge properties one level deep.
 *
 * @param  {Object} `obj` The object to flatten.
 * @param  {String} `key` The property to merge onto the root of the object.
 * @param  {Function} `merge` Function to use for merging data.
 * @return {Object} Object with `locals` merged into the root.
 * @api public
 */

utils.flattenObject = function flattenObject(o, key, mergeFunction) {
  if (!mergeFunction) {
    mergeFunction = merge;
  }

  if (o.hasOwnProperty(key)) {
    o = mergeFunction({}, o[key], o);
    delete o[key];
  }
  return o;
};


/**
 * Extend and normalize a file object, to ensure that it
 * has the properties expected by the next parser.
 *
 * **Example:**
 *
 * ```js
 * var file = {content: 'foo'};
 * utils.extendFile(file);
 * //=> {path: '', content: 'foo', data: {}, orig: 'foo'}
 * ```
 *
 * @param  {Object|String} `file` The value to normalize.
 * @param  {Object} `options` Options or locals.
 *   @option  {Function} [options] `merge` Function to use for merging data.
 * @return {Object} File object with normalized properties.
 */

utils.extendFile = function extendFile(file, options) {
  var opts = extend({}, options);
  var o = {};

  if (!file) {
    return utils.file;
  }

  if (typeof file === 'string') {
    o.content = file;
  } else {
    o = file;
  }

  if (o.original) {
    o.orig = o.original;
    delete o.original;
  }

  utils.mergeProps(o, 'data', file, opts);
  utils.mergeProps(o, 'locals', file, opts);

  var otherProps = _.omit(opts, ['locals', 'data']);
  o.locals = merge(o.locals, otherProps);

  return utils.siftKeys(o);
};




module.exports = utils;