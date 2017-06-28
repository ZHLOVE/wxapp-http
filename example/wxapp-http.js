(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["wxHttp"] = factory();
	else
		root["wxHttp"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by axetroy on 17-6-23.
 */
/// <reference path="./index.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var event_emitter_js_1 = __webpack_require__(1);
function isFunction(func) {
    return typeof func === 'function';
}
var Http = (function (_super) {
    __extends(Http, _super);
    function Http(maxConcurrent) {
        if (maxConcurrent === void 0) { maxConcurrent = 5; }
        var _this = _super.call(this) || this;
        _this.maxConcurrent = maxConcurrent;
        _this.ctx = typeof wx === 'object' ? wx : { request: function () { } };
        _this.queue = [];
        _this.runningTask = 0;
        return _this;
    }
    Http.prototype.next = function () {
        var _this = this;
        var queue = this.queue;
        if (queue.length || this.runningTask >= this.maxConcurrent)
            return;
        var entity = queue.shift();
        var config = entity.config;
        if (isFunction(this.requestInterceptor) &&
            this.requestInterceptor.call(this, config) !== true) {
            entity.reject(new Error("Request Interceptor: Request can't pass the Interceptor"));
            return;
        }
        this.emit('request', config);
        this.runningTask = this.runningTask + 1;
        var callBack = {
            success: function (res) {
                entity.response = res;
                _this.emit('success', config, res);
                if (isFunction(_this.responseInterceptor) &&
                    _this.responseInterceptor.call(_this, config, res) !== true) {
                    entity.reject(res);
                }
                else {
                    entity.resolve(res);
                }
            },
            fail: function (err) {
                entity.response = err;
                _this.emit('fail', config, err);
                if (isFunction(_this.responseInterceptor) &&
                    _this.responseInterceptor.call(_this, config, err) === true) {
                    entity.resolve(err);
                }
                else {
                    entity.reject(err);
                }
            },
            complete: function () {
                _this.emit('complete', config, entity.response);
                _this.next();
                _this.runningTask = _this.runningTask - 1;
            }
        };
        var requestConfig = Object.assign(config, callBack);
        this.ctx.request(requestConfig);
    };
    Http.prototype.request = function (method, url, data, header, dataType) {
        var _this = this;
        if (data === void 0) { data = ''; }
        if (header === void 0) { header = {}; }
        if (dataType === void 0) { dataType = 'json'; }
        var config = {
            method: method,
            url: url,
            data: data,
            header: header,
            dataType: dataType
        };
        return new Promise(function (resolve, reject) {
            var entity = { config: config, resolve: resolve, reject: reject, response: null };
            _this.queue.push(entity);
            _this.next();
        });
    };
    Http.prototype.head = function (url, data, header, dataType) {
        return this.request('HEAD', url, data, header, dataType);
    };
    Http.prototype.options = function (url, data, header, dataType) {
        return this.request('OPTIONS', url, data, header, dataType);
    };
    Http.prototype.get = function (url, data, header, dataType) {
        return this.request('GET', url, data, header, dataType);
    };
    Http.prototype.post = function (url, data, header, dataType) {
        return this.request('POST', url, data, header, dataType);
    };
    Http.prototype.put = function (url, data, header, dataType) {
        return this.request('PUT', url, data, header, dataType);
    };
    Http.prototype['delete'] = function (url, data, header, dataType) {
        return this.request('DELETE', url, data, header, dataType);
    };
    Http.prototype.trace = function (url, data, header, dataType) {
        return this.request('TRACE', url, data, header, dataType);
    };
    Http.prototype.connect = function (url, data, header, dataType) {
        return this.request('CONNECT', url, data, header, dataType);
    };
    Http.prototype.requestInterceptor = function (func) {
        this.requestInterceptor = func;
        return this;
    };
    Http.prototype.responseInterceptor = function (func) {
        this.responseInterceptor = func;
        return this;
    };
    Http.prototype.clean = function () {
        this.queue = [];
    };
    return Http;
}(event_emitter_js_1.default));
exports.Http = Http;
exports.default = new Http(5);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["EventEmitter"] = factory();
	else
		root["EventEmitter"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/**
 * Created by axetroy on 2017/3/6.
 */
var name = '@axetroy/event-emitter.js';
var id_Identifier = '__id__';

function randomId() {
  return Math.random().toString(36).substr(2, 16);
}

function findIndexById(id) {
  return this.findIndex(function (callback) {
    return callback[id_Identifier] === id;
  });
}

var defineProperty = Object.defineProperty;

function EventEmitter() {
  this[name] = {};
  defineProperty && defineProperty(this, name, { enumerable: false, configurable: false });
}

var prototype = EventEmitter.prototype;

prototype.constructor = EventEmitter;

prototype.on = function (event, listener) {
  var events = this[name],
      container = events[event] = events[event] || [],
      id = randomId(),
      index = void 0;
  listener[id_Identifier] = id;
  container.push(listener);
  return function () {
    index = findIndexById.call(container, id);
    index >= 0 && container.splice(index, 1);
  };
};

prototype.off = function (event) {
  this[name][event] = [];
};

prototype.clear = function () {
  this[name] = {};
};

prototype.once = function (event, listener) {
  var self = this,
      events = self[name],
      container = events[event] = events[event] || [],
      id = randomId(),
      index = void 0,
      callback = function callback() {
    index = findIndexById.call(container, id);
    index >= 0 && container.splice(index, 1);
    listener.apply(self, arguments);
  };
  callback[id_Identifier] = id;
  container.push(callback);
};

prototype.emit = function () {
  var self = this,
      argv = [].slice.call(arguments),
      event = argv.shift(),
      events = self[name];
  (events['*'] || []).concat(events[event] || []).forEach(function (listener) {
    return self.emitting(event, argv, listener);
  });
};

prototype.emitting = function (event, dataArray, listener) {
  listener.apply(this, dataArray);
};

module.exports = EventEmitter;

/***/ })
/******/ ]);
});

/***/ })
/******/ ]);
});