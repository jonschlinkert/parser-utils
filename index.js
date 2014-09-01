/*!
 * parser-utils <https://github.com/jonschlinkert/parser-utils>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');


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

utils.dataProps = [
  'locals',
  'data'
];


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
  obj = _.merge({}, utils.file, obj);

  var diff = utils.diffKeys(obj, props);
  var o = _.pick(obj, utils.fileKeys);

  o.orig = _.merge({}, o.orig, _.pick(obj, diff));
  defineGetter(o.orig, 'content', function() {
    return o.content;
  });

  return o;
};


/**
 * Return an object composed only of `data` properties. If a `locals` object
 * is supplied, properties in that object will override any properties on the
 * `data` object. If a `locals` object is defined, and/or if the `locals` object
 * has a nested `locals` property, both will be merged with the `data` property
 * on the returned object.
 *
 * @param  {Object} `obj` Object with data objects to merge.
 * @param  {Object} `locals` Optional object of data that should "win" over other data.
 * @param  {Array} `props` Additional properties to merge in.
 * @return {Object} Object with a single `data` property.
 * @api public
 */

utils.mergeData = function mergeData(obj, locals) {
  var o = _.pick(obj, utils.dataProps);
  o.data = _.merge({}, o, locals);
  return utils.flattenObject(o.data, 'data');
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
 * @return {Object} Object with `locals` merged into the root.
 * @api public
 */

utils.flattenObject = function flattenObject(o, key) {
  if (o.hasOwnProperty(key)) {
    o = _.merge(o, o[key]);
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
 * @return {Object} File object with normalized properties.
 */

utils.extendFile = function extendFile(file, options) {
  var opts = _.extend({}, options);
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

  o.data = utils.mergeData(o, opts);
  return utils.siftKeys(o);
};




module.exports = utils;