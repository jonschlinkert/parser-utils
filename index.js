/*!
 * parser-utils <https://github.com/jonschlinkert/parser-utils>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');

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
 *
 * @return {Object}
 * @api private
 */

exports.mergeData = function (obj, props) {
  props = _.pick(obj, props || exports.dataProps);
  var data = [].concat(_.values(props));
  return _.merge.apply(_, data);
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
 * //=> {content: 'foo', data: {}, original: 'foo', options: {}}
 * ```
 *
 * @param  {Object} `file`
 * @param  {Object} `options`
 * @return {Object}
 */

exports.extendFile = function extendFile(file, options) {
  var opts = _.extend({}, options);

  // Properties to merge onto the file object.
  var o = {data: {}, options: {}, content: '', original: ''};
  var props = _.keys(_.clone(o));

  // Normalize `file.content`
  if (typeof file === 'string') {
    o.original = file;
    o.content = file;
  } else {
    file = file || {};
    var original = file.original;
    _.merge(opts, file.options);
    _.merge(o, file);
  }

  // Merge data
  var obj = _.merge({}, o, file, opts);
  o.data = exports.mergeData(obj);

  // Move non-file props to the options
  o.options = _.omit(obj, props);

  // Move non-file props to the options
  o = _.pick(o, props);
  return o;
};
