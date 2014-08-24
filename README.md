# parser-utils [![NPM version](https://badge.fury.io/js/parser-utils.svg)](http://badge.fury.io/js/parser-utils)


> Utilies for parser-cache and compatible parsers.

## Install
#### Install with [npm](npmjs.org):

```bash
npm i parser-utils --save-dev
```

## Usage

```js
var parserUtils = require('parser-utils');
console.log(parserUtils('abc'));
//=> ['a', 'b', 'c'];
```

## API
###[.extendFile](index.js#L60)

Extend and normalize a file object, to ensure that it has the _ideal_ properties expected by the next parser.

* `file` **{Object}**  
* `options` **{Object}**  
* returns: {Object}  

**Example:**

```js
var file = {content: 'foo'};
utils.extendFile(file);
//=> {content: 'foo', data: {}, original: 'foo', options: {}}
```

## Author

**Jon Schlinkert**
 
+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert) 

## License
Copyright (c) 2014 Jon Schlinkert, contributors.  
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on August 24, 2014._