"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e7) {
      throw err = [e7], e7;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e7) {
      throw mod = 0, e7;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/html2canvas/dist/html2canvas.js
  var require_html2canvas = __commonJS({
    "node_modules/html2canvas/dist/html2canvas.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.html2canvas = factory());
      })(exports, (function() {
        "use strict";
        var extendStatics = function(d3, b3) {
          extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d4, b4) {
            d4.__proto__ = b4;
          } || function(d4, b4) {
            for (var p3 in b4) if (Object.prototype.hasOwnProperty.call(b4, p3)) d4[p3] = b4[p3];
          };
          return extendStatics(d3, b3);
        };
        function __extends(d3, b3) {
          if (typeof b3 !== "function" && b3 !== null)
            throw new TypeError("Class extends value " + String(b3) + " is not a constructor or null");
          extendStatics(d3, b3);
          function __() {
            this.constructor = d3;
          }
          d3.prototype = b3 === null ? Object.create(b3) : (__.prototype = b3.prototype, new __());
        }
        var __assign = function() {
          __assign = Object.assign || function __assign2(t4) {
            for (var s4, i7 = 1, n5 = arguments.length; i7 < n5; i7++) {
              s4 = arguments[i7];
              for (var p3 in s4) if (Object.prototype.hasOwnProperty.call(s4, p3)) t4[p3] = s4[p3];
            }
            return t4;
          };
          return __assign.apply(this, arguments);
        };
        function __awaiter(thisArg, _arguments, P2, generator) {
          function adopt(value) {
            return value instanceof P2 ? value : new P2(function(resolve) {
              resolve(value);
            });
          }
          return new (P2 || (P2 = Promise))(function(resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e8) {
                reject(e8);
              }
            }
            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e8) {
                reject(e8);
              }
            }
            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        }
        function __generator(thisArg, body) {
          var _2 = { label: 0, sent: function() {
            if (t4[0] & 1) throw t4[1];
            return t4[1];
          }, trys: [], ops: [] }, f4, y3, t4, g2;
          return g2 = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g2[Symbol.iterator] = function() {
            return this;
          }), g2;
          function verb(n5) {
            return function(v2) {
              return step([n5, v2]);
            };
          }
          function step(op) {
            if (f4) throw new TypeError("Generator is already executing.");
            while (_2) try {
              if (f4 = 1, y3 && (t4 = op[0] & 2 ? y3["return"] : op[0] ? y3["throw"] || ((t4 = y3["return"]) && t4.call(y3), 0) : y3.next) && !(t4 = t4.call(y3, op[1])).done) return t4;
              if (y3 = 0, t4) op = [op[0] & 2, t4.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t4 = op;
                  break;
                case 4:
                  _2.label++;
                  return { value: op[1], done: false };
                case 5:
                  _2.label++;
                  y3 = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _2.ops.pop();
                  _2.trys.pop();
                  continue;
                default:
                  if (!(t4 = _2.trys, t4 = t4.length > 0 && t4[t4.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                    _2 = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t4 || op[1] > t4[0] && op[1] < t4[3])) {
                    _2.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _2.label < t4[1]) {
                    _2.label = t4[1];
                    t4 = op;
                    break;
                  }
                  if (t4 && _2.label < t4[2]) {
                    _2.label = t4[2];
                    _2.ops.push(op);
                    break;
                  }
                  if (t4[2]) _2.ops.pop();
                  _2.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _2);
            } catch (e8) {
              op = [6, e8];
              y3 = 0;
            } finally {
              f4 = t4 = 0;
            }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
          }
        }
        function __spreadArray(to, from, pack2) {
          if (pack2 || arguments.length === 2) for (var i7 = 0, l3 = from.length, ar; i7 < l3; i7++) {
            if (ar || !(i7 in from)) {
              if (!ar) ar = Array.prototype.slice.call(from, 0, i7);
              ar[i7] = from[i7];
            }
          }
          return to.concat(ar || from);
        }
        var Bounds = (
          /** @class */
          (function() {
            function Bounds2(left, top, width, height) {
              this.left = left;
              this.top = top;
              this.width = width;
              this.height = height;
            }
            Bounds2.prototype.add = function(x2, y3, w2, h3) {
              return new Bounds2(this.left + x2, this.top + y3, this.width + w2, this.height + h3);
            };
            Bounds2.fromClientRect = function(context, clientRect) {
              return new Bounds2(clientRect.left + context.windowBounds.left, clientRect.top + context.windowBounds.top, clientRect.width, clientRect.height);
            };
            Bounds2.fromDOMRectList = function(context, domRectList) {
              var domRect = Array.from(domRectList).find(function(rect) {
                return rect.width !== 0;
              });
              return domRect ? new Bounds2(domRect.left + context.windowBounds.left, domRect.top + context.windowBounds.top, domRect.width, domRect.height) : Bounds2.EMPTY;
            };
            Bounds2.EMPTY = new Bounds2(0, 0, 0, 0);
            return Bounds2;
          })()
        );
        var parseBounds = function(context, node) {
          return Bounds.fromClientRect(context, node.getBoundingClientRect());
        };
        var parseDocumentSize = function(document2) {
          var body = document2.body;
          var documentElement = document2.documentElement;
          if (!body || !documentElement) {
            throw new Error("Unable to get document size");
          }
          var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
          var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
          return new Bounds(0, 0, width, height);
        };
        var toCodePoints$1 = function(str) {
          var codePoints = [];
          var i7 = 0;
          var length = str.length;
          while (i7 < length) {
            var value = str.charCodeAt(i7++);
            if (value >= 55296 && value <= 56319 && i7 < length) {
              var extra = str.charCodeAt(i7++);
              if ((extra & 64512) === 56320) {
                codePoints.push(((value & 1023) << 10) + (extra & 1023) + 65536);
              } else {
                codePoints.push(value);
                i7--;
              }
            } else {
              codePoints.push(value);
            }
          }
          return codePoints;
        };
        var fromCodePoint$1 = function() {
          var codePoints = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            codePoints[_i] = arguments[_i];
          }
          if (String.fromCodePoint) {
            return String.fromCodePoint.apply(String, codePoints);
          }
          var length = codePoints.length;
          if (!length) {
            return "";
          }
          var codeUnits = [];
          var index = -1;
          var result = "";
          while (++index < length) {
            var codePoint = codePoints[index];
            if (codePoint <= 65535) {
              codeUnits.push(codePoint);
            } else {
              codePoint -= 65536;
              codeUnits.push((codePoint >> 10) + 55296, codePoint % 1024 + 56320);
            }
            if (index + 1 === length || codeUnits.length > 16384) {
              result += String.fromCharCode.apply(String, codeUnits);
              codeUnits.length = 0;
            }
          }
          return result;
        };
        var chars$2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var lookup$2 = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
        for (var i$2 = 0; i$2 < chars$2.length; i$2++) {
          lookup$2[chars$2.charCodeAt(i$2)] = i$2;
        }
        var chars$1$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var lookup$1$1 = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
        for (var i$1$1 = 0; i$1$1 < chars$1$1.length; i$1$1++) {
          lookup$1$1[chars$1$1.charCodeAt(i$1$1)] = i$1$1;
        }
        var decode$1 = function(base642) {
          var bufferLength = base642.length * 0.75, len = base642.length, i7, p3 = 0, encoded1, encoded2, encoded3, encoded4;
          if (base642[base642.length - 1] === "=") {
            bufferLength--;
            if (base642[base642.length - 2] === "=") {
              bufferLength--;
            }
          }
          var buffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined" && typeof Uint8Array.prototype.slice !== "undefined" ? new ArrayBuffer(bufferLength) : new Array(bufferLength);
          var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
          for (i7 = 0; i7 < len; i7 += 4) {
            encoded1 = lookup$1$1[base642.charCodeAt(i7)];
            encoded2 = lookup$1$1[base642.charCodeAt(i7 + 1)];
            encoded3 = lookup$1$1[base642.charCodeAt(i7 + 2)];
            encoded4 = lookup$1$1[base642.charCodeAt(i7 + 3)];
            bytes[p3++] = encoded1 << 2 | encoded2 >> 4;
            bytes[p3++] = (encoded2 & 15) << 4 | encoded3 >> 2;
            bytes[p3++] = (encoded3 & 3) << 6 | encoded4 & 63;
          }
          return buffer;
        };
        var polyUint16Array$1 = function(buffer) {
          var length = buffer.length;
          var bytes = [];
          for (var i7 = 0; i7 < length; i7 += 2) {
            bytes.push(buffer[i7 + 1] << 8 | buffer[i7]);
          }
          return bytes;
        };
        var polyUint32Array$1 = function(buffer) {
          var length = buffer.length;
          var bytes = [];
          for (var i7 = 0; i7 < length; i7 += 4) {
            bytes.push(buffer[i7 + 3] << 24 | buffer[i7 + 2] << 16 | buffer[i7 + 1] << 8 | buffer[i7]);
          }
          return bytes;
        };
        var UTRIE2_SHIFT_2$1 = 5;
        var UTRIE2_SHIFT_1$1 = 6 + 5;
        var UTRIE2_INDEX_SHIFT$1 = 2;
        var UTRIE2_SHIFT_1_2$1 = UTRIE2_SHIFT_1$1 - UTRIE2_SHIFT_2$1;
        var UTRIE2_LSCP_INDEX_2_OFFSET$1 = 65536 >> UTRIE2_SHIFT_2$1;
        var UTRIE2_DATA_BLOCK_LENGTH$1 = 1 << UTRIE2_SHIFT_2$1;
        var UTRIE2_DATA_MASK$1 = UTRIE2_DATA_BLOCK_LENGTH$1 - 1;
        var UTRIE2_LSCP_INDEX_2_LENGTH$1 = 1024 >> UTRIE2_SHIFT_2$1;
        var UTRIE2_INDEX_2_BMP_LENGTH$1 = UTRIE2_LSCP_INDEX_2_OFFSET$1 + UTRIE2_LSCP_INDEX_2_LENGTH$1;
        var UTRIE2_UTF8_2B_INDEX_2_OFFSET$1 = UTRIE2_INDEX_2_BMP_LENGTH$1;
        var UTRIE2_UTF8_2B_INDEX_2_LENGTH$1 = 2048 >> 6;
        var UTRIE2_INDEX_1_OFFSET$1 = UTRIE2_UTF8_2B_INDEX_2_OFFSET$1 + UTRIE2_UTF8_2B_INDEX_2_LENGTH$1;
        var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1 = 65536 >> UTRIE2_SHIFT_1$1;
        var UTRIE2_INDEX_2_BLOCK_LENGTH$1 = 1 << UTRIE2_SHIFT_1_2$1;
        var UTRIE2_INDEX_2_MASK$1 = UTRIE2_INDEX_2_BLOCK_LENGTH$1 - 1;
        var slice16$1 = function(view, start, end) {
          if (view.slice) {
            return view.slice(start, end);
          }
          return new Uint16Array(Array.prototype.slice.call(view, start, end));
        };
        var slice32$1 = function(view, start, end) {
          if (view.slice) {
            return view.slice(start, end);
          }
          return new Uint32Array(Array.prototype.slice.call(view, start, end));
        };
        var createTrieFromBase64$1 = function(base642, _byteLength) {
          var buffer = decode$1(base642);
          var view32 = Array.isArray(buffer) ? polyUint32Array$1(buffer) : new Uint32Array(buffer);
          var view16 = Array.isArray(buffer) ? polyUint16Array$1(buffer) : new Uint16Array(buffer);
          var headerLength = 24;
          var index = slice16$1(view16, headerLength / 2, view32[4] / 2);
          var data = view32[5] === 2 ? slice16$1(view16, (headerLength + view32[4]) / 2) : slice32$1(view32, Math.ceil((headerLength + view32[4]) / 4));
          return new Trie$1(view32[0], view32[1], view32[2], view32[3], index, data);
        };
        var Trie$1 = (
          /** @class */
          (function() {
            function Trie2(initialValue, errorValue, highStart, highValueIndex, index, data) {
              this.initialValue = initialValue;
              this.errorValue = errorValue;
              this.highStart = highStart;
              this.highValueIndex = highValueIndex;
              this.index = index;
              this.data = data;
            }
            Trie2.prototype.get = function(codePoint) {
              var ix;
              if (codePoint >= 0) {
                if (codePoint < 55296 || codePoint > 56319 && codePoint <= 65535) {
                  ix = this.index[codePoint >> UTRIE2_SHIFT_2$1];
                  ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
                  return this.data[ix];
                }
                if (codePoint <= 65535) {
                  ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET$1 + (codePoint - 55296 >> UTRIE2_SHIFT_2$1)];
                  ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
                  return this.data[ix];
                }
                if (codePoint < this.highStart) {
                  ix = UTRIE2_INDEX_1_OFFSET$1 - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1 + (codePoint >> UTRIE2_SHIFT_1$1);
                  ix = this.index[ix];
                  ix += codePoint >> UTRIE2_SHIFT_2$1 & UTRIE2_INDEX_2_MASK$1;
                  ix = this.index[ix];
                  ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
                  return this.data[ix];
                }
                if (codePoint <= 1114111) {
                  return this.data[this.highValueIndex];
                }
              }
              return this.errorValue;
            };
            return Trie2;
          })()
        );
        var chars$3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var lookup$3 = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
        for (var i$3 = 0; i$3 < chars$3.length; i$3++) {
          lookup$3[chars$3.charCodeAt(i$3)] = i$3;
        }
        var base64$1 = "KwAAAAAAAAAACA4AUD0AADAgAAACAAAAAAAIABAAGABAAEgAUABYAGAAaABgAGgAYgBqAF8AZwBgAGgAcQB5AHUAfQCFAI0AlQCdAKIAqgCyALoAYABoAGAAaABgAGgAwgDKAGAAaADGAM4A0wDbAOEA6QDxAPkAAQEJAQ8BFwF1AH0AHAEkASwBNAE6AUIBQQFJAVEBWQFhAWgBcAF4ATAAgAGGAY4BlQGXAZ8BpwGvAbUBvQHFAc0B0wHbAeMB6wHxAfkBAQIJAvEBEQIZAiECKQIxAjgCQAJGAk4CVgJeAmQCbAJ0AnwCgQKJApECmQKgAqgCsAK4ArwCxAIwAMwC0wLbAjAA4wLrAvMC+AIAAwcDDwMwABcDHQMlAy0DNQN1AD0DQQNJA0kDSQNRA1EDVwNZA1kDdQB1AGEDdQBpA20DdQN1AHsDdQCBA4kDkQN1AHUAmQOhA3UAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AKYDrgN1AHUAtgO+A8YDzgPWAxcD3gPjA+sD8wN1AHUA+wMDBAkEdQANBBUEHQQlBCoEFwMyBDgEYABABBcDSARQBFgEYARoBDAAcAQzAXgEgASIBJAEdQCXBHUAnwSnBK4EtgS6BMIEyAR1AHUAdQB1AHUAdQCVANAEYABgAGAAYABgAGAAYABgANgEYADcBOQEYADsBPQE/AQEBQwFFAUcBSQFLAU0BWQEPAVEBUsFUwVbBWAAYgVgAGoFcgV6BYIFigWRBWAAmQWfBaYFYABgAGAAYABgAKoFYACxBbAFuQW6BcEFwQXHBcEFwQXPBdMF2wXjBeoF8gX6BQIGCgYSBhoGIgYqBjIGOgZgAD4GRgZMBmAAUwZaBmAAYABgAGAAYABgAGAAYABgAGAAYABgAGIGYABpBnAGYABgAGAAYABgAGAAYABgAGAAYAB4Bn8GhQZgAGAAYAB1AHcDFQSLBmAAYABgAJMGdQA9A3UAmwajBqsGqwaVALMGuwbDBjAAywbSBtIG1QbSBtIG0gbSBtIG0gbdBuMG6wbzBvsGAwcLBxMHAwcbByMHJwcsBywHMQcsB9IGOAdAB0gHTgfSBkgHVgfSBtIG0gbSBtIG0gbSBtIG0gbSBiwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdgAGAALAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdbB2MHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB2kH0gZwB64EdQB1AHUAdQB1AHUAdQB1AHUHfQdgAIUHjQd1AHUAlQedB2AAYAClB6sHYACzB7YHvgfGB3UAzgfWBzMB3gfmB1EB7gf1B/0HlQENAQUIDQh1ABUIHQglCBcDLQg1CD0IRQhNCEEDUwh1AHUAdQBbCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIcAh3CHoIMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIgggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAALAcsBywHLAcsBywHLAcsBywHLAcsB4oILAcsB44I0gaWCJ4Ipgh1AHUAqgiyCHUAdQB1AHUAdQB1AHUAdQB1AHUAtwh8AXUAvwh1AMUIyQjRCNkI4AjoCHUAdQB1AO4I9gj+CAYJDgkTCS0HGwkjCYIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiAAIAAAAFAAYABgAGIAXwBgAHEAdQBFAJUAogCyAKAAYABgAEIA4ABGANMA4QDxAMEBDwE1AFwBLAE6AQEBUQF4QkhCmEKoQrhCgAHIQsAB0MLAAcABwAHAAeDC6ABoAHDCwMMAAcABwAHAAdDDGMMAAcAB6MM4wwjDWMNow3jDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEjDqABWw6bDqABpg6gAaABoAHcDvwOPA+gAaABfA/8DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DpcPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB9cPKwkyCToJMAB1AHUAdQBCCUoJTQl1AFUJXAljCWcJawkwADAAMAAwAHMJdQB2CX4JdQCECYoJjgmWCXUAngkwAGAAYABxAHUApgn3A64JtAl1ALkJdQDACTAAMAAwADAAdQB1AHUAdQB1AHUAdQB1AHUAowYNBMUIMAAwADAAMADICcsJ0wnZCRUE4QkwAOkJ8An4CTAAMAB1AAAKvwh1AAgKDwoXCh8KdQAwACcKLgp1ADYKqAmICT4KRgowADAAdQB1AE4KMAB1AFYKdQBeCnUAZQowADAAMAAwADAAMAAwADAAMAAVBHUAbQowADAAdQC5CXUKMAAwAHwBxAijBogEMgF9CoQKiASMCpQKmgqIBKIKqgquCogEDQG2Cr4KxgrLCjAAMADTCtsKCgHjCusK8Qr5CgELMAAwADAAMAB1AIsECQsRC3UANAEZCzAAMAAwADAAMAB1ACELKQswAHUANAExCzkLdQBBC0kLMABRC1kLMAAwADAAMAAwADAAdQBhCzAAMAAwAGAAYABpC3ELdwt/CzAAMACHC4sLkwubC58Lpwt1AK4Ltgt1APsDMAAwADAAMAAwADAAMAAwAL4LwwvLC9IL1wvdCzAAMADlC+kL8Qv5C/8LSQswADAAMAAwADAAMAAwADAAMAAHDDAAMAAwADAAMAAODBYMHgx1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1ACYMMAAwADAAdQB1AHUALgx1AHUAdQB1AHUAdQA2DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AD4MdQBGDHUAdQB1AHUAdQB1AEkMdQB1AHUAdQB1AFAMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQBYDHUAdQB1AF8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUA+wMVBGcMMAAwAHwBbwx1AHcMfwyHDI8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAYABgAJcMMAAwADAAdQB1AJ8MlQClDDAAMACtDCwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB7UMLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AA0EMAC9DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAsBywHLAcsBywHLAcsBywHLQcwAMEMyAwsBywHLAcsBywHLAcsBywHLAcsBywHzAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1ANQM2QzhDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMABgAGAAYABgAGAAYABgAOkMYADxDGAA+AwADQYNYABhCWAAYAAODTAAMAAwADAAFg1gAGAAHg37AzAAMAAwADAAYABgACYNYAAsDTQNPA1gAEMNPg1LDWAAYABgAGAAYABgAGAAYABgAGAAUg1aDYsGVglhDV0NcQBnDW0NdQ15DWAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAlQCBDZUAiA2PDZcNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAnw2nDTAAMAAwADAAMAAwAHUArw23DTAAMAAwADAAMAAwADAAMAAwADAAMAB1AL8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQDHDTAAYABgAM8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA1w11ANwNMAAwAD0B5A0wADAAMAAwADAAMADsDfQN/A0EDgwOFA4wABsOMAAwADAAMAAwADAAMAAwANIG0gbSBtIG0gbSBtIG0gYjDigOwQUuDsEFMw7SBjoO0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGQg5KDlIOVg7SBtIGXg5lDm0OdQ7SBtIGfQ6EDooOjQ6UDtIGmg6hDtIG0gaoDqwO0ga0DrwO0gZgAGAAYADEDmAAYAAkBtIGzA5gANIOYADaDokO0gbSBt8O5w7SBu8O0gb1DvwO0gZgAGAAxA7SBtIG0gbSBtIGYABgAGAAYAAED2AAsAUMD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHJA8sBywHLAcsBywHLAccDywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywPLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAc0D9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHPA/SBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gYUD0QPlQCVAJUAMAAwADAAMACVAJUAlQCVAJUAlQCVAEwPMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA//8EAAQABAAEAAQABAAEAAQABAANAAMAAQABAAIABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQACgATABcAHgAbABoAHgAXABYAEgAeABsAGAAPABgAHABLAEsASwBLAEsASwBLAEsASwBLABgAGAAeAB4AHgATAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAGwASAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWAA0AEQAeAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAFAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJABYAGgAbABsAGwAeAB0AHQAeAE8AFwAeAA0AHgAeABoAGwBPAE8ADgBQAB0AHQAdAE8ATwAXAE8ATwBPABYAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwBWAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsABAAbABsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEAA0ADQBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABABQACsAKwArACsAKwArACsAKwAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUAAaABoAUABQAFAAUABQAEwAHgAbAFAAHgAEACsAKwAEAAQABAArAFAAUABQAFAAUABQACsAKwArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQACsAUABQACsAKwAEACsABAAEAAQABAAEACsAKwArACsABAAEACsAKwAEAAQABAArACsAKwAEACsAKwArACsAKwArACsAUABQAFAAUAArAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAAQABABQAFAAUAAEAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAArACsAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AGwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAKwArACsAKwArAAQABAAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAAQAUAArAFAAUABQAFAAUABQACsAKwArAFAAUABQACsAUABQAFAAUAArACsAKwBQAFAAKwBQACsAUABQACsAKwArAFAAUAArACsAKwBQAFAAUAArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAArACsAKwAEAAQABAArAAQABAAEAAQAKwArAFAAKwArACsAKwArACsABAArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAHgAeAB4AHgAeAB4AGwAeACsAKwArACsAKwAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAUABQAFAAKwArACsAKwArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwAOAFAAUABQAFAAUABQAFAAHgBQAAQABAAEAA4AUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAKwArAAQAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAKwArACsAKwArACsAUAArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAXABcAFwAXABcACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAXAArAFwAXABcAFwAXABcAFwAXABcAFwAKgBcAFwAKgAqACoAKgAqACoAKgAqACoAXAArACsAXABcAFwAXABcACsAXAArACoAKgAqACoAKgAqACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwBcAFwAXABcAFAADgAOAA4ADgAeAA4ADgAJAA4ADgANAAkAEwATABMAEwATAAkAHgATAB4AHgAeAAQABAAeAB4AHgAeAB4AHgBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAADQAEAB4ABAAeAAQAFgARABYAEQAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAAQABAAEAAQADQAEAAQAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAA0ADQAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeACsAHgAeAA4ADgANAA4AHgAeAB4AHgAeAAkACQArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgBcAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4AHgAeAB4AXABcAFwAXABcAFwAKgAqACoAKgBcAFwAXABcACoAKgAqAFwAKgAqACoAXABcACoAKgAqACoAKgAqACoAXABcAFwAKgAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwAKgBLAEsASwBLAEsASwBLAEsASwBLACoAKgAqACoAKgAqAFAAUABQAFAAUABQACsAUAArACsAKwArACsAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAKwBQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsABAAEAAQAHgANAB4AHgAeAB4AHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUAArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWABEAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAANAA0AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUAArAAQABAArACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAA0ADQAVAFwADQAeAA0AGwBcACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwAeAB4AEwATAA0ADQAOAB4AEwATAB4ABAAEAAQACQArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAHgArACsAKwATABMASwBLAEsASwBLAEsASwBLAEsASwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAXABcAFwAXABcACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXAArACsAKwAqACoAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsAHgAeAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKwArAAQASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACoAKgAqACoAKgAqACoAXAAqACoAKgAqACoAKgArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABABQAFAAUABQAFAAUABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgANAA0ADQANAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwAeAB4AHgAeAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArAA0ADQANAA0ADQBLAEsASwBLAEsASwBLAEsASwBLACsAKwArAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUAAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAAQAUABQAFAAUABQAFAABABQAFAABAAEAAQAUAArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQACsAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQACsAKwAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQACsAHgAeAB4AHgAeAB4AHgAOAB4AKwANAA0ADQANAA0ADQANAAkADQANAA0ACAAEAAsABAAEAA0ACQANAA0ADAAdAB0AHgAXABcAFgAXABcAFwAWABcAHQAdAB4AHgAUABQAFAANAAEAAQAEAAQABAAEAAQACQAaABoAGgAaABoAGgAaABoAHgAXABcAHQAVABUAHgAeAB4AHgAeAB4AGAAWABEAFQAVABUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ADQAeAA0ADQANAA0AHgANAA0ADQAHAB4AHgAeAB4AKwAEAAQABAAEAAQABAAEAAQABAAEAFAAUAArACsATwBQAFAAUABQAFAAHgAeAB4AFgARAE8AUABPAE8ATwBPAFAAUABQAFAAUAAeAB4AHgAWABEAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArABsAGwAbABsAGwAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGgAbABsAGwAbABoAGwAbABoAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAFAAGgAeAB0AHgBQAB4AGgAeAB4AHgAeAB4AHgAeAB4AHgBPAB4AUAAbAB4AHgBQAFAAUABQAFAAHgAeAB4AHQAdAB4AUAAeAFAAHgBQAB4AUABPAFAAUAAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgBQAFAAUABQAE8ATwBQAFAAUABQAFAATwBQAFAATwBQAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAUABQAFAATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABPAB4AHgArACsAKwArAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAdAB4AHgAeAB0AHQAeAB4AHQAeAB4AHgAdAB4AHQAbABsAHgAdAB4AHgAeAB4AHQAeAB4AHQAdAB0AHQAeAB4AHQAeAB0AHgAdAB0AHQAdAB0AHQAeAB0AHgAeAB4AHgAeAB0AHQAdAB0AHgAeAB4AHgAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB0AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAdAB0AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHQAdAB0AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHQAdAB4AHgAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AJQAlAB0AHQAlAB4AJQAlACUAIAAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAeAB0AJQAdAB0AHgAdAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAdAB0AHQAdACUAHgAlACUAJQAdACUAJQAdAB0AHQAlACUAHQAdACUAHQAdACUAJQAlAB4AHQAeAB4AHgAeAB0AHQAlAB0AHQAdAB0AHQAdACUAJQAlACUAJQAdACUAJQAgACUAHQAdACUAJQAlACUAJQAlACUAJQAeAB4AHgAlACUAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AFwAXABcAFwAXABcAHgATABMAJQAeAB4AHgAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARABYAEQAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANAA0AHgANAB4ADQANAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwAlACUAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACsAKwArACsAKwArACsAKwArACsAKwArAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBPAE8ATwBPAE8ATwBPAE8AJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeAAQAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUABQAAQAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAUABQAFAAUABQAAQABAAEACsABAAEACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAKwBQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAA0ADQANAA0ADQANAA0ADQAeACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAArACsAKwArAFAAUABQAFAAUAANAA0ADQANAA0ADQAUACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQANAA0ADQANAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAANACsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAB4AHgAeAB4AHgArACsAKwArACsAKwAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANAFAABAAEAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAEAAQABAAEAB4ABAAEAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsABAAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLAA0ADQArAB4ABABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUAAeAFAAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAAEAAQADgANAA0AEwATAB4AHgAeAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAFAAUABQAFAABAAEACsAKwAEAA0ADQAeAFAAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcAFwADQANAA0AKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQAKwAEAAQAKwArAAQABAAEAAQAUAAEAFAABAAEAA0ADQANACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABABQAA4AUAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANAFAADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAaABoAGgAaAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAJAAkACQAJAAkACQAJABYAEQArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AHgAeACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAARwBHABUARwAJACsAKwArACsAKwArACsAKwArACsAKwAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAKwArACsAKwArACsAKwArACsAKwArACsAKwBRAFEAUQBRACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAHgAEAAQADQAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAeAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQAHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAKwArAFAAKwArAFAAUAArACsAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAHgAeAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeACsAKwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4ABAAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAHgAeAA0ADQANAA0AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArAAQABAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwBQAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArABsAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAB4AHgAeAB4ABAAEAAQABAAEAAQABABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArABYAFgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAGgBQAFAAUAAaAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUAArACsAKwArACsAKwBQACsAKwArACsAUAArAFAAKwBQACsAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUAArAFAAKwBQACsAUAArAFAAUAArAFAAKwArAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAKwBQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeACUAJQAlAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAHgAlACUAJQAlACUAIAAgACAAJQAlACAAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACEAIQAhACEAIQAlACUAIAAgACUAJQAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAlACUAJQAlACAAIAAgACUAIAAgACAAJQAlACUAJQAlACUAJQAgACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAlAB4AJQAeACUAJQAlACUAJQAgACUAJQAlACUAHgAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACAAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABcAFwAXABUAFQAVAB4AHgAeAB4AJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAgACUAJQAgACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAIAAgACUAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACAAIAAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACAAIAAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAA==";
        var LETTER_NUMBER_MODIFIER = 50;
        var BK = 1;
        var CR$1 = 2;
        var LF$1 = 3;
        var CM = 4;
        var NL = 5;
        var WJ = 7;
        var ZW = 8;
        var GL = 9;
        var SP = 10;
        var ZWJ$1 = 11;
        var B2 = 12;
        var BA = 13;
        var BB = 14;
        var HY = 15;
        var CB = 16;
        var CL = 17;
        var CP = 18;
        var EX = 19;
        var IN = 20;
        var NS = 21;
        var OP = 22;
        var QU = 23;
        var IS = 24;
        var NU = 25;
        var PO = 26;
        var PR = 27;
        var SY = 28;
        var AI = 29;
        var AL = 30;
        var CJ = 31;
        var EB = 32;
        var EM = 33;
        var H2 = 34;
        var H3 = 35;
        var HL = 36;
        var ID = 37;
        var JL = 38;
        var JV = 39;
        var JT = 40;
        var RI$1 = 41;
        var SA = 42;
        var XX = 43;
        var ea_OP = [9001, 65288];
        var BREAK_MANDATORY = "!";
        var BREAK_NOT_ALLOWED$1 = "\xD7";
        var BREAK_ALLOWED$1 = "\xF7";
        var UnicodeTrie$1 = createTrieFromBase64$1(base64$1);
        var ALPHABETICS = [AL, HL];
        var HARD_LINE_BREAKS = [BK, CR$1, LF$1, NL];
        var SPACE$1 = [SP, ZW];
        var PREFIX_POSTFIX = [PR, PO];
        var LINE_BREAKS = HARD_LINE_BREAKS.concat(SPACE$1);
        var KOREAN_SYLLABLE_BLOCK = [JL, JV, JT, H2, H3];
        var HYPHEN = [HY, BA];
        var codePointsToCharacterClasses = function(codePoints, lineBreak2) {
          if (lineBreak2 === void 0) {
            lineBreak2 = "strict";
          }
          var types = [];
          var indices = [];
          var categories = [];
          codePoints.forEach(function(codePoint, index) {
            var classType = UnicodeTrie$1.get(codePoint);
            if (classType > LETTER_NUMBER_MODIFIER) {
              categories.push(true);
              classType -= LETTER_NUMBER_MODIFIER;
            } else {
              categories.push(false);
            }
            if (["normal", "auto", "loose"].indexOf(lineBreak2) !== -1) {
              if ([8208, 8211, 12316, 12448].indexOf(codePoint) !== -1) {
                indices.push(index);
                return types.push(CB);
              }
            }
            if (classType === CM || classType === ZWJ$1) {
              if (index === 0) {
                indices.push(index);
                return types.push(AL);
              }
              var prev = types[index - 1];
              if (LINE_BREAKS.indexOf(prev) === -1) {
                indices.push(indices[index - 1]);
                return types.push(prev);
              }
              indices.push(index);
              return types.push(AL);
            }
            indices.push(index);
            if (classType === CJ) {
              return types.push(lineBreak2 === "strict" ? NS : ID);
            }
            if (classType === SA) {
              return types.push(AL);
            }
            if (classType === AI) {
              return types.push(AL);
            }
            if (classType === XX) {
              if (codePoint >= 131072 && codePoint <= 196605 || codePoint >= 196608 && codePoint <= 262141) {
                return types.push(ID);
              } else {
                return types.push(AL);
              }
            }
            types.push(classType);
          });
          return [indices, types, categories];
        };
        var isAdjacentWithSpaceIgnored = function(a4, b3, currentIndex, classTypes) {
          var current = classTypes[currentIndex];
          if (Array.isArray(a4) ? a4.indexOf(current) !== -1 : a4 === current) {
            var i7 = currentIndex;
            while (i7 <= classTypes.length) {
              i7++;
              var next = classTypes[i7];
              if (next === b3) {
                return true;
              }
              if (next !== SP) {
                break;
              }
            }
          }
          if (current === SP) {
            var i7 = currentIndex;
            while (i7 > 0) {
              i7--;
              var prev = classTypes[i7];
              if (Array.isArray(a4) ? a4.indexOf(prev) !== -1 : a4 === prev) {
                var n5 = currentIndex;
                while (n5 <= classTypes.length) {
                  n5++;
                  var next = classTypes[n5];
                  if (next === b3) {
                    return true;
                  }
                  if (next !== SP) {
                    break;
                  }
                }
              }
              if (prev !== SP) {
                break;
              }
            }
          }
          return false;
        };
        var previousNonSpaceClassType = function(currentIndex, classTypes) {
          var i7 = currentIndex;
          while (i7 >= 0) {
            var type = classTypes[i7];
            if (type === SP) {
              i7--;
            } else {
              return type;
            }
          }
          return 0;
        };
        var _lineBreakAtIndex = function(codePoints, classTypes, indicies, index, forbiddenBreaks) {
          if (indicies[index] === 0) {
            return BREAK_NOT_ALLOWED$1;
          }
          var currentIndex = index - 1;
          if (Array.isArray(forbiddenBreaks) && forbiddenBreaks[currentIndex] === true) {
            return BREAK_NOT_ALLOWED$1;
          }
          var beforeIndex = currentIndex - 1;
          var afterIndex = currentIndex + 1;
          var current = classTypes[currentIndex];
          var before = beforeIndex >= 0 ? classTypes[beforeIndex] : 0;
          var next = classTypes[afterIndex];
          if (current === CR$1 && next === LF$1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (HARD_LINE_BREAKS.indexOf(current) !== -1) {
            return BREAK_MANDATORY;
          }
          if (HARD_LINE_BREAKS.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (SPACE$1.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (previousNonSpaceClassType(currentIndex, classTypes) === ZW) {
            return BREAK_ALLOWED$1;
          }
          if (UnicodeTrie$1.get(codePoints[currentIndex]) === ZWJ$1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if ((current === EB || current === EM) && UnicodeTrie$1.get(codePoints[afterIndex]) === ZWJ$1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (current === WJ || next === WJ) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (current === GL) {
            return BREAK_NOT_ALLOWED$1;
          }
          if ([SP, BA, HY].indexOf(current) === -1 && next === GL) {
            return BREAK_NOT_ALLOWED$1;
          }
          if ([CL, CP, EX, IS, SY].indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (previousNonSpaceClassType(currentIndex, classTypes) === OP) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (isAdjacentWithSpaceIgnored(QU, OP, currentIndex, classTypes)) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (isAdjacentWithSpaceIgnored([CL, CP], NS, currentIndex, classTypes)) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (isAdjacentWithSpaceIgnored(B2, B2, currentIndex, classTypes)) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (current === SP) {
            return BREAK_ALLOWED$1;
          }
          if (current === QU || next === QU) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (next === CB || current === CB) {
            return BREAK_ALLOWED$1;
          }
          if ([BA, HY, NS].indexOf(next) !== -1 || current === BB) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (before === HL && HYPHEN.indexOf(current) !== -1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (current === SY && next === HL) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (next === IN) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (ALPHABETICS.indexOf(next) !== -1 && current === NU || ALPHABETICS.indexOf(current) !== -1 && next === NU) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (current === PR && [ID, EB, EM].indexOf(next) !== -1 || [ID, EB, EM].indexOf(current) !== -1 && next === PO) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (ALPHABETICS.indexOf(current) !== -1 && PREFIX_POSTFIX.indexOf(next) !== -1 || PREFIX_POSTFIX.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (
            // (PR | PO) × ( OP | HY )? NU
            [PR, PO].indexOf(current) !== -1 && (next === NU || [OP, HY].indexOf(next) !== -1 && classTypes[afterIndex + 1] === NU) || // ( OP | HY ) × NU
            [OP, HY].indexOf(current) !== -1 && next === NU || // NU ×	(NU | SY | IS)
            current === NU && [NU, SY, IS].indexOf(next) !== -1
          ) {
            return BREAK_NOT_ALLOWED$1;
          }
          if ([NU, SY, IS, CL, CP].indexOf(next) !== -1) {
            var prevIndex = currentIndex;
            while (prevIndex >= 0) {
              var type = classTypes[prevIndex];
              if (type === NU) {
                return BREAK_NOT_ALLOWED$1;
              } else if ([SY, IS].indexOf(type) !== -1) {
                prevIndex--;
              } else {
                break;
              }
            }
          }
          if ([PR, PO].indexOf(next) !== -1) {
            var prevIndex = [CL, CP].indexOf(current) !== -1 ? beforeIndex : currentIndex;
            while (prevIndex >= 0) {
              var type = classTypes[prevIndex];
              if (type === NU) {
                return BREAK_NOT_ALLOWED$1;
              } else if ([SY, IS].indexOf(type) !== -1) {
                prevIndex--;
              } else {
                break;
              }
            }
          }
          if (JL === current && [JL, JV, H2, H3].indexOf(next) !== -1 || [JV, H2].indexOf(current) !== -1 && [JV, JT].indexOf(next) !== -1 || [JT, H3].indexOf(current) !== -1 && next === JT) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (KOREAN_SYLLABLE_BLOCK.indexOf(current) !== -1 && [IN, PO].indexOf(next) !== -1 || KOREAN_SYLLABLE_BLOCK.indexOf(next) !== -1 && current === PR) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (ALPHABETICS.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (current === IS && ALPHABETICS.indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (ALPHABETICS.concat(NU).indexOf(current) !== -1 && next === OP && ea_OP.indexOf(codePoints[afterIndex]) === -1 || ALPHABETICS.concat(NU).indexOf(next) !== -1 && current === CP) {
            return BREAK_NOT_ALLOWED$1;
          }
          if (current === RI$1 && next === RI$1) {
            var i7 = indicies[currentIndex];
            var count = 1;
            while (i7 > 0) {
              i7--;
              if (classTypes[i7] === RI$1) {
                count++;
              } else {
                break;
              }
            }
            if (count % 2 !== 0) {
              return BREAK_NOT_ALLOWED$1;
            }
          }
          if (current === EB && next === EM) {
            return BREAK_NOT_ALLOWED$1;
          }
          return BREAK_ALLOWED$1;
        };
        var cssFormattedClasses = function(codePoints, options) {
          if (!options) {
            options = { lineBreak: "normal", wordBreak: "normal" };
          }
          var _a = codePointsToCharacterClasses(codePoints, options.lineBreak), indicies = _a[0], classTypes = _a[1], isLetterNumber = _a[2];
          if (options.wordBreak === "break-all" || options.wordBreak === "break-word") {
            classTypes = classTypes.map(function(type) {
              return [NU, AL, SA].indexOf(type) !== -1 ? ID : type;
            });
          }
          var forbiddenBreakpoints = options.wordBreak === "keep-all" ? isLetterNumber.map(function(letterNumber, i7) {
            return letterNumber && codePoints[i7] >= 19968 && codePoints[i7] <= 40959;
          }) : void 0;
          return [indicies, classTypes, forbiddenBreakpoints];
        };
        var Break = (
          /** @class */
          (function() {
            function Break2(codePoints, lineBreak2, start, end) {
              this.codePoints = codePoints;
              this.required = lineBreak2 === BREAK_MANDATORY;
              this.start = start;
              this.end = end;
            }
            Break2.prototype.slice = function() {
              return fromCodePoint$1.apply(void 0, this.codePoints.slice(this.start, this.end));
            };
            return Break2;
          })()
        );
        var LineBreaker = function(str, options) {
          var codePoints = toCodePoints$1(str);
          var _a = cssFormattedClasses(codePoints, options), indicies = _a[0], classTypes = _a[1], forbiddenBreakpoints = _a[2];
          var length = codePoints.length;
          var lastEnd = 0;
          var nextIndex = 0;
          return {
            next: function() {
              if (nextIndex >= length) {
                return { done: true, value: null };
              }
              var lineBreak2 = BREAK_NOT_ALLOWED$1;
              while (nextIndex < length && (lineBreak2 = _lineBreakAtIndex(codePoints, classTypes, indicies, ++nextIndex, forbiddenBreakpoints)) === BREAK_NOT_ALLOWED$1) {
              }
              if (lineBreak2 !== BREAK_NOT_ALLOWED$1 || nextIndex === length) {
                var value = new Break(codePoints, lineBreak2, lastEnd, nextIndex);
                lastEnd = nextIndex;
                return { value, done: false };
              }
              return { done: true, value: null };
            }
          };
        };
        var FLAG_UNRESTRICTED = 1 << 0;
        var FLAG_ID = 1 << 1;
        var FLAG_INTEGER = 1 << 2;
        var FLAG_NUMBER = 1 << 3;
        var LINE_FEED = 10;
        var SOLIDUS = 47;
        var REVERSE_SOLIDUS = 92;
        var CHARACTER_TABULATION = 9;
        var SPACE = 32;
        var QUOTATION_MARK = 34;
        var EQUALS_SIGN = 61;
        var NUMBER_SIGN = 35;
        var DOLLAR_SIGN = 36;
        var PERCENTAGE_SIGN = 37;
        var APOSTROPHE = 39;
        var LEFT_PARENTHESIS = 40;
        var RIGHT_PARENTHESIS = 41;
        var LOW_LINE = 95;
        var HYPHEN_MINUS = 45;
        var EXCLAMATION_MARK = 33;
        var LESS_THAN_SIGN = 60;
        var GREATER_THAN_SIGN = 62;
        var COMMERCIAL_AT = 64;
        var LEFT_SQUARE_BRACKET = 91;
        var RIGHT_SQUARE_BRACKET = 93;
        var CIRCUMFLEX_ACCENT = 61;
        var LEFT_CURLY_BRACKET = 123;
        var QUESTION_MARK = 63;
        var RIGHT_CURLY_BRACKET = 125;
        var VERTICAL_LINE = 124;
        var TILDE = 126;
        var CONTROL = 128;
        var REPLACEMENT_CHARACTER = 65533;
        var ASTERISK = 42;
        var PLUS_SIGN = 43;
        var COMMA = 44;
        var COLON = 58;
        var SEMICOLON = 59;
        var FULL_STOP = 46;
        var NULL = 0;
        var BACKSPACE = 8;
        var LINE_TABULATION = 11;
        var SHIFT_OUT = 14;
        var INFORMATION_SEPARATOR_ONE = 31;
        var DELETE = 127;
        var EOF = -1;
        var ZERO = 48;
        var a3 = 97;
        var e7 = 101;
        var f3 = 102;
        var u3 = 117;
        var z2 = 122;
        var A2 = 65;
        var E2 = 69;
        var F = 70;
        var U = 85;
        var Z2 = 90;
        var isDigit = function(codePoint) {
          return codePoint >= ZERO && codePoint <= 57;
        };
        var isSurrogateCodePoint = function(codePoint) {
          return codePoint >= 55296 && codePoint <= 57343;
        };
        var isHex = function(codePoint) {
          return isDigit(codePoint) || codePoint >= A2 && codePoint <= F || codePoint >= a3 && codePoint <= f3;
        };
        var isLowerCaseLetter = function(codePoint) {
          return codePoint >= a3 && codePoint <= z2;
        };
        var isUpperCaseLetter = function(codePoint) {
          return codePoint >= A2 && codePoint <= Z2;
        };
        var isLetter = function(codePoint) {
          return isLowerCaseLetter(codePoint) || isUpperCaseLetter(codePoint);
        };
        var isNonASCIICodePoint = function(codePoint) {
          return codePoint >= CONTROL;
        };
        var isWhiteSpace = function(codePoint) {
          return codePoint === LINE_FEED || codePoint === CHARACTER_TABULATION || codePoint === SPACE;
        };
        var isNameStartCodePoint = function(codePoint) {
          return isLetter(codePoint) || isNonASCIICodePoint(codePoint) || codePoint === LOW_LINE;
        };
        var isNameCodePoint = function(codePoint) {
          return isNameStartCodePoint(codePoint) || isDigit(codePoint) || codePoint === HYPHEN_MINUS;
        };
        var isNonPrintableCodePoint = function(codePoint) {
          return codePoint >= NULL && codePoint <= BACKSPACE || codePoint === LINE_TABULATION || codePoint >= SHIFT_OUT && codePoint <= INFORMATION_SEPARATOR_ONE || codePoint === DELETE;
        };
        var isValidEscape = function(c1, c22) {
          if (c1 !== REVERSE_SOLIDUS) {
            return false;
          }
          return c22 !== LINE_FEED;
        };
        var isIdentifierStart = function(c1, c22, c32) {
          if (c1 === HYPHEN_MINUS) {
            return isNameStartCodePoint(c22) || isValidEscape(c22, c32);
          } else if (isNameStartCodePoint(c1)) {
            return true;
          } else if (c1 === REVERSE_SOLIDUS && isValidEscape(c1, c22)) {
            return true;
          }
          return false;
        };
        var isNumberStart = function(c1, c22, c32) {
          if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
            if (isDigit(c22)) {
              return true;
            }
            return c22 === FULL_STOP && isDigit(c32);
          }
          if (c1 === FULL_STOP) {
            return isDigit(c22);
          }
          return isDigit(c1);
        };
        var stringToNumber = function(codePoints) {
          var c4 = 0;
          var sign = 1;
          if (codePoints[c4] === PLUS_SIGN || codePoints[c4] === HYPHEN_MINUS) {
            if (codePoints[c4] === HYPHEN_MINUS) {
              sign = -1;
            }
            c4++;
          }
          var integers = [];
          while (isDigit(codePoints[c4])) {
            integers.push(codePoints[c4++]);
          }
          var int = integers.length ? parseInt(fromCodePoint$1.apply(void 0, integers), 10) : 0;
          if (codePoints[c4] === FULL_STOP) {
            c4++;
          }
          var fraction = [];
          while (isDigit(codePoints[c4])) {
            fraction.push(codePoints[c4++]);
          }
          var fracd = fraction.length;
          var frac = fracd ? parseInt(fromCodePoint$1.apply(void 0, fraction), 10) : 0;
          if (codePoints[c4] === E2 || codePoints[c4] === e7) {
            c4++;
          }
          var expsign = 1;
          if (codePoints[c4] === PLUS_SIGN || codePoints[c4] === HYPHEN_MINUS) {
            if (codePoints[c4] === HYPHEN_MINUS) {
              expsign = -1;
            }
            c4++;
          }
          var exponent = [];
          while (isDigit(codePoints[c4])) {
            exponent.push(codePoints[c4++]);
          }
          var exp = exponent.length ? parseInt(fromCodePoint$1.apply(void 0, exponent), 10) : 0;
          return sign * (int + frac * Math.pow(10, -fracd)) * Math.pow(10, expsign * exp);
        };
        var LEFT_PARENTHESIS_TOKEN = {
          type: 2
          /* LEFT_PARENTHESIS_TOKEN */
        };
        var RIGHT_PARENTHESIS_TOKEN = {
          type: 3
          /* RIGHT_PARENTHESIS_TOKEN */
        };
        var COMMA_TOKEN = {
          type: 4
          /* COMMA_TOKEN */
        };
        var SUFFIX_MATCH_TOKEN = {
          type: 13
          /* SUFFIX_MATCH_TOKEN */
        };
        var PREFIX_MATCH_TOKEN = {
          type: 8
          /* PREFIX_MATCH_TOKEN */
        };
        var COLUMN_TOKEN = {
          type: 21
          /* COLUMN_TOKEN */
        };
        var DASH_MATCH_TOKEN = {
          type: 9
          /* DASH_MATCH_TOKEN */
        };
        var INCLUDE_MATCH_TOKEN = {
          type: 10
          /* INCLUDE_MATCH_TOKEN */
        };
        var LEFT_CURLY_BRACKET_TOKEN = {
          type: 11
          /* LEFT_CURLY_BRACKET_TOKEN */
        };
        var RIGHT_CURLY_BRACKET_TOKEN = {
          type: 12
          /* RIGHT_CURLY_BRACKET_TOKEN */
        };
        var SUBSTRING_MATCH_TOKEN = {
          type: 14
          /* SUBSTRING_MATCH_TOKEN */
        };
        var BAD_URL_TOKEN = {
          type: 23
          /* BAD_URL_TOKEN */
        };
        var BAD_STRING_TOKEN = {
          type: 1
          /* BAD_STRING_TOKEN */
        };
        var CDO_TOKEN = {
          type: 25
          /* CDO_TOKEN */
        };
        var CDC_TOKEN = {
          type: 24
          /* CDC_TOKEN */
        };
        var COLON_TOKEN = {
          type: 26
          /* COLON_TOKEN */
        };
        var SEMICOLON_TOKEN = {
          type: 27
          /* SEMICOLON_TOKEN */
        };
        var LEFT_SQUARE_BRACKET_TOKEN = {
          type: 28
          /* LEFT_SQUARE_BRACKET_TOKEN */
        };
        var RIGHT_SQUARE_BRACKET_TOKEN = {
          type: 29
          /* RIGHT_SQUARE_BRACKET_TOKEN */
        };
        var WHITESPACE_TOKEN = {
          type: 31
          /* WHITESPACE_TOKEN */
        };
        var EOF_TOKEN = {
          type: 32
          /* EOF_TOKEN */
        };
        var Tokenizer = (
          /** @class */
          (function() {
            function Tokenizer2() {
              this._value = [];
            }
            Tokenizer2.prototype.write = function(chunk) {
              this._value = this._value.concat(toCodePoints$1(chunk));
            };
            Tokenizer2.prototype.read = function() {
              var tokens = [];
              var token = this.consumeToken();
              while (token !== EOF_TOKEN) {
                tokens.push(token);
                token = this.consumeToken();
              }
              return tokens;
            };
            Tokenizer2.prototype.consumeToken = function() {
              var codePoint = this.consumeCodePoint();
              switch (codePoint) {
                case QUOTATION_MARK:
                  return this.consumeStringToken(QUOTATION_MARK);
                case NUMBER_SIGN:
                  var c1 = this.peekCodePoint(0);
                  var c22 = this.peekCodePoint(1);
                  var c32 = this.peekCodePoint(2);
                  if (isNameCodePoint(c1) || isValidEscape(c22, c32)) {
                    var flags = isIdentifierStart(c1, c22, c32) ? FLAG_ID : FLAG_UNRESTRICTED;
                    var value = this.consumeName();
                    return { type: 5, value, flags };
                  }
                  break;
                case DOLLAR_SIGN:
                  if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return SUFFIX_MATCH_TOKEN;
                  }
                  break;
                case APOSTROPHE:
                  return this.consumeStringToken(APOSTROPHE);
                case LEFT_PARENTHESIS:
                  return LEFT_PARENTHESIS_TOKEN;
                case RIGHT_PARENTHESIS:
                  return RIGHT_PARENTHESIS_TOKEN;
                case ASTERISK:
                  if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return SUBSTRING_MATCH_TOKEN;
                  }
                  break;
                case PLUS_SIGN:
                  if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeNumericToken();
                  }
                  break;
                case COMMA:
                  return COMMA_TOKEN;
                case HYPHEN_MINUS:
                  var e1 = codePoint;
                  var e22 = this.peekCodePoint(0);
                  var e32 = this.peekCodePoint(1);
                  if (isNumberStart(e1, e22, e32)) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeNumericToken();
                  }
                  if (isIdentifierStart(e1, e22, e32)) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeIdentLikeToken();
                  }
                  if (e22 === HYPHEN_MINUS && e32 === GREATER_THAN_SIGN) {
                    this.consumeCodePoint();
                    this.consumeCodePoint();
                    return CDC_TOKEN;
                  }
                  break;
                case FULL_STOP:
                  if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeNumericToken();
                  }
                  break;
                case SOLIDUS:
                  if (this.peekCodePoint(0) === ASTERISK) {
                    this.consumeCodePoint();
                    while (true) {
                      var c4 = this.consumeCodePoint();
                      if (c4 === ASTERISK) {
                        c4 = this.consumeCodePoint();
                        if (c4 === SOLIDUS) {
                          return this.consumeToken();
                        }
                      }
                      if (c4 === EOF) {
                        return this.consumeToken();
                      }
                    }
                  }
                  break;
                case COLON:
                  return COLON_TOKEN;
                case SEMICOLON:
                  return SEMICOLON_TOKEN;
                case LESS_THAN_SIGN:
                  if (this.peekCodePoint(0) === EXCLAMATION_MARK && this.peekCodePoint(1) === HYPHEN_MINUS && this.peekCodePoint(2) === HYPHEN_MINUS) {
                    this.consumeCodePoint();
                    this.consumeCodePoint();
                    return CDO_TOKEN;
                  }
                  break;
                case COMMERCIAL_AT:
                  var a1 = this.peekCodePoint(0);
                  var a22 = this.peekCodePoint(1);
                  var a32 = this.peekCodePoint(2);
                  if (isIdentifierStart(a1, a22, a32)) {
                    var value = this.consumeName();
                    return { type: 7, value };
                  }
                  break;
                case LEFT_SQUARE_BRACKET:
                  return LEFT_SQUARE_BRACKET_TOKEN;
                case REVERSE_SOLIDUS:
                  if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeIdentLikeToken();
                  }
                  break;
                case RIGHT_SQUARE_BRACKET:
                  return RIGHT_SQUARE_BRACKET_TOKEN;
                case CIRCUMFLEX_ACCENT:
                  if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return PREFIX_MATCH_TOKEN;
                  }
                  break;
                case LEFT_CURLY_BRACKET:
                  return LEFT_CURLY_BRACKET_TOKEN;
                case RIGHT_CURLY_BRACKET:
                  return RIGHT_CURLY_BRACKET_TOKEN;
                case u3:
                case U:
                  var u1 = this.peekCodePoint(0);
                  var u22 = this.peekCodePoint(1);
                  if (u1 === PLUS_SIGN && (isHex(u22) || u22 === QUESTION_MARK)) {
                    this.consumeCodePoint();
                    this.consumeUnicodeRangeToken();
                  }
                  this.reconsumeCodePoint(codePoint);
                  return this.consumeIdentLikeToken();
                case VERTICAL_LINE:
                  if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return DASH_MATCH_TOKEN;
                  }
                  if (this.peekCodePoint(0) === VERTICAL_LINE) {
                    this.consumeCodePoint();
                    return COLUMN_TOKEN;
                  }
                  break;
                case TILDE:
                  if (this.peekCodePoint(0) === EQUALS_SIGN) {
                    this.consumeCodePoint();
                    return INCLUDE_MATCH_TOKEN;
                  }
                  break;
                case EOF:
                  return EOF_TOKEN;
              }
              if (isWhiteSpace(codePoint)) {
                this.consumeWhiteSpace();
                return WHITESPACE_TOKEN;
              }
              if (isDigit(codePoint)) {
                this.reconsumeCodePoint(codePoint);
                return this.consumeNumericToken();
              }
              if (isNameStartCodePoint(codePoint)) {
                this.reconsumeCodePoint(codePoint);
                return this.consumeIdentLikeToken();
              }
              return { type: 6, value: fromCodePoint$1(codePoint) };
            };
            Tokenizer2.prototype.consumeCodePoint = function() {
              var value = this._value.shift();
              return typeof value === "undefined" ? -1 : value;
            };
            Tokenizer2.prototype.reconsumeCodePoint = function(codePoint) {
              this._value.unshift(codePoint);
            };
            Tokenizer2.prototype.peekCodePoint = function(delta) {
              if (delta >= this._value.length) {
                return -1;
              }
              return this._value[delta];
            };
            Tokenizer2.prototype.consumeUnicodeRangeToken = function() {
              var digits = [];
              var codePoint = this.consumeCodePoint();
              while (isHex(codePoint) && digits.length < 6) {
                digits.push(codePoint);
                codePoint = this.consumeCodePoint();
              }
              var questionMarks = false;
              while (codePoint === QUESTION_MARK && digits.length < 6) {
                digits.push(codePoint);
                codePoint = this.consumeCodePoint();
                questionMarks = true;
              }
              if (questionMarks) {
                var start_1 = parseInt(fromCodePoint$1.apply(void 0, digits.map(function(digit) {
                  return digit === QUESTION_MARK ? ZERO : digit;
                })), 16);
                var end = parseInt(fromCodePoint$1.apply(void 0, digits.map(function(digit) {
                  return digit === QUESTION_MARK ? F : digit;
                })), 16);
                return { type: 30, start: start_1, end };
              }
              var start = parseInt(fromCodePoint$1.apply(void 0, digits), 16);
              if (this.peekCodePoint(0) === HYPHEN_MINUS && isHex(this.peekCodePoint(1))) {
                this.consumeCodePoint();
                codePoint = this.consumeCodePoint();
                var endDigits = [];
                while (isHex(codePoint) && endDigits.length < 6) {
                  endDigits.push(codePoint);
                  codePoint = this.consumeCodePoint();
                }
                var end = parseInt(fromCodePoint$1.apply(void 0, endDigits), 16);
                return { type: 30, start, end };
              } else {
                return { type: 30, start, end: start };
              }
            };
            Tokenizer2.prototype.consumeIdentLikeToken = function() {
              var value = this.consumeName();
              if (value.toLowerCase() === "url" && this.peekCodePoint(0) === LEFT_PARENTHESIS) {
                this.consumeCodePoint();
                return this.consumeUrlToken();
              } else if (this.peekCodePoint(0) === LEFT_PARENTHESIS) {
                this.consumeCodePoint();
                return { type: 19, value };
              }
              return { type: 20, value };
            };
            Tokenizer2.prototype.consumeUrlToken = function() {
              var value = [];
              this.consumeWhiteSpace();
              if (this.peekCodePoint(0) === EOF) {
                return { type: 22, value: "" };
              }
              var next = this.peekCodePoint(0);
              if (next === APOSTROPHE || next === QUOTATION_MARK) {
                var stringToken = this.consumeStringToken(this.consumeCodePoint());
                if (stringToken.type === 0) {
                  this.consumeWhiteSpace();
                  if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                    this.consumeCodePoint();
                    return { type: 22, value: stringToken.value };
                  }
                }
                this.consumeBadUrlRemnants();
                return BAD_URL_TOKEN;
              }
              while (true) {
                var codePoint = this.consumeCodePoint();
                if (codePoint === EOF || codePoint === RIGHT_PARENTHESIS) {
                  return { type: 22, value: fromCodePoint$1.apply(void 0, value) };
                } else if (isWhiteSpace(codePoint)) {
                  this.consumeWhiteSpace();
                  if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                    this.consumeCodePoint();
                    return { type: 22, value: fromCodePoint$1.apply(void 0, value) };
                  }
                  this.consumeBadUrlRemnants();
                  return BAD_URL_TOKEN;
                } else if (codePoint === QUOTATION_MARK || codePoint === APOSTROPHE || codePoint === LEFT_PARENTHESIS || isNonPrintableCodePoint(codePoint)) {
                  this.consumeBadUrlRemnants();
                  return BAD_URL_TOKEN;
                } else if (codePoint === REVERSE_SOLIDUS) {
                  if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                    value.push(this.consumeEscapedCodePoint());
                  } else {
                    this.consumeBadUrlRemnants();
                    return BAD_URL_TOKEN;
                  }
                } else {
                  value.push(codePoint);
                }
              }
            };
            Tokenizer2.prototype.consumeWhiteSpace = function() {
              while (isWhiteSpace(this.peekCodePoint(0))) {
                this.consumeCodePoint();
              }
            };
            Tokenizer2.prototype.consumeBadUrlRemnants = function() {
              while (true) {
                var codePoint = this.consumeCodePoint();
                if (codePoint === RIGHT_PARENTHESIS || codePoint === EOF) {
                  return;
                }
                if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                  this.consumeEscapedCodePoint();
                }
              }
            };
            Tokenizer2.prototype.consumeStringSlice = function(count) {
              var SLICE_STACK_SIZE = 5e4;
              var value = "";
              while (count > 0) {
                var amount = Math.min(SLICE_STACK_SIZE, count);
                value += fromCodePoint$1.apply(void 0, this._value.splice(0, amount));
                count -= amount;
              }
              this._value.shift();
              return value;
            };
            Tokenizer2.prototype.consumeStringToken = function(endingCodePoint) {
              var value = "";
              var i7 = 0;
              do {
                var codePoint = this._value[i7];
                if (codePoint === EOF || codePoint === void 0 || codePoint === endingCodePoint) {
                  value += this.consumeStringSlice(i7);
                  return { type: 0, value };
                }
                if (codePoint === LINE_FEED) {
                  this._value.splice(0, i7);
                  return BAD_STRING_TOKEN;
                }
                if (codePoint === REVERSE_SOLIDUS) {
                  var next = this._value[i7 + 1];
                  if (next !== EOF && next !== void 0) {
                    if (next === LINE_FEED) {
                      value += this.consumeStringSlice(i7);
                      i7 = -1;
                      this._value.shift();
                    } else if (isValidEscape(codePoint, next)) {
                      value += this.consumeStringSlice(i7);
                      value += fromCodePoint$1(this.consumeEscapedCodePoint());
                      i7 = -1;
                    }
                  }
                }
                i7++;
              } while (true);
            };
            Tokenizer2.prototype.consumeNumber = function() {
              var repr = [];
              var type = FLAG_INTEGER;
              var c1 = this.peekCodePoint(0);
              if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
                repr.push(this.consumeCodePoint());
              }
              while (isDigit(this.peekCodePoint(0))) {
                repr.push(this.consumeCodePoint());
              }
              c1 = this.peekCodePoint(0);
              var c22 = this.peekCodePoint(1);
              if (c1 === FULL_STOP && isDigit(c22)) {
                repr.push(this.consumeCodePoint(), this.consumeCodePoint());
                type = FLAG_NUMBER;
                while (isDigit(this.peekCodePoint(0))) {
                  repr.push(this.consumeCodePoint());
                }
              }
              c1 = this.peekCodePoint(0);
              c22 = this.peekCodePoint(1);
              var c32 = this.peekCodePoint(2);
              if ((c1 === E2 || c1 === e7) && ((c22 === PLUS_SIGN || c22 === HYPHEN_MINUS) && isDigit(c32) || isDigit(c22))) {
                repr.push(this.consumeCodePoint(), this.consumeCodePoint());
                type = FLAG_NUMBER;
                while (isDigit(this.peekCodePoint(0))) {
                  repr.push(this.consumeCodePoint());
                }
              }
              return [stringToNumber(repr), type];
            };
            Tokenizer2.prototype.consumeNumericToken = function() {
              var _a = this.consumeNumber(), number = _a[0], flags = _a[1];
              var c1 = this.peekCodePoint(0);
              var c22 = this.peekCodePoint(1);
              var c32 = this.peekCodePoint(2);
              if (isIdentifierStart(c1, c22, c32)) {
                var unit = this.consumeName();
                return { type: 15, number, flags, unit };
              }
              if (c1 === PERCENTAGE_SIGN) {
                this.consumeCodePoint();
                return { type: 16, number, flags };
              }
              return { type: 17, number, flags };
            };
            Tokenizer2.prototype.consumeEscapedCodePoint = function() {
              var codePoint = this.consumeCodePoint();
              if (isHex(codePoint)) {
                var hex = fromCodePoint$1(codePoint);
                while (isHex(this.peekCodePoint(0)) && hex.length < 6) {
                  hex += fromCodePoint$1(this.consumeCodePoint());
                }
                if (isWhiteSpace(this.peekCodePoint(0))) {
                  this.consumeCodePoint();
                }
                var hexCodePoint = parseInt(hex, 16);
                if (hexCodePoint === 0 || isSurrogateCodePoint(hexCodePoint) || hexCodePoint > 1114111) {
                  return REPLACEMENT_CHARACTER;
                }
                return hexCodePoint;
              }
              if (codePoint === EOF) {
                return REPLACEMENT_CHARACTER;
              }
              return codePoint;
            };
            Tokenizer2.prototype.consumeName = function() {
              var result = "";
              while (true) {
                var codePoint = this.consumeCodePoint();
                if (isNameCodePoint(codePoint)) {
                  result += fromCodePoint$1(codePoint);
                } else if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                  result += fromCodePoint$1(this.consumeEscapedCodePoint());
                } else {
                  this.reconsumeCodePoint(codePoint);
                  return result;
                }
              }
            };
            return Tokenizer2;
          })()
        );
        var Parser = (
          /** @class */
          (function() {
            function Parser2(tokens) {
              this._tokens = tokens;
            }
            Parser2.create = function(value) {
              var tokenizer = new Tokenizer();
              tokenizer.write(value);
              return new Parser2(tokenizer.read());
            };
            Parser2.parseValue = function(value) {
              return Parser2.create(value).parseComponentValue();
            };
            Parser2.parseValues = function(value) {
              return Parser2.create(value).parseComponentValues();
            };
            Parser2.prototype.parseComponentValue = function() {
              var token = this.consumeToken();
              while (token.type === 31) {
                token = this.consumeToken();
              }
              if (token.type === 32) {
                throw new SyntaxError("Error parsing CSS component value, unexpected EOF");
              }
              this.reconsumeToken(token);
              var value = this.consumeComponentValue();
              do {
                token = this.consumeToken();
              } while (token.type === 31);
              if (token.type === 32) {
                return value;
              }
              throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one");
            };
            Parser2.prototype.parseComponentValues = function() {
              var values = [];
              while (true) {
                var value = this.consumeComponentValue();
                if (value.type === 32) {
                  return values;
                }
                values.push(value);
                values.push();
              }
            };
            Parser2.prototype.consumeComponentValue = function() {
              var token = this.consumeToken();
              switch (token.type) {
                case 11:
                case 28:
                case 2:
                  return this.consumeSimpleBlock(token.type);
                case 19:
                  return this.consumeFunction(token);
              }
              return token;
            };
            Parser2.prototype.consumeSimpleBlock = function(type) {
              var block = { type, values: [] };
              var token = this.consumeToken();
              while (true) {
                if (token.type === 32 || isEndingTokenFor(token, type)) {
                  return block;
                }
                this.reconsumeToken(token);
                block.values.push(this.consumeComponentValue());
                token = this.consumeToken();
              }
            };
            Parser2.prototype.consumeFunction = function(functionToken) {
              var cssFunction = {
                name: functionToken.value,
                values: [],
                type: 18
                /* FUNCTION */
              };
              while (true) {
                var token = this.consumeToken();
                if (token.type === 32 || token.type === 3) {
                  return cssFunction;
                }
                this.reconsumeToken(token);
                cssFunction.values.push(this.consumeComponentValue());
              }
            };
            Parser2.prototype.consumeToken = function() {
              var token = this._tokens.shift();
              return typeof token === "undefined" ? EOF_TOKEN : token;
            };
            Parser2.prototype.reconsumeToken = function(token) {
              this._tokens.unshift(token);
            };
            return Parser2;
          })()
        );
        var isDimensionToken = function(token) {
          return token.type === 15;
        };
        var isNumberToken = function(token) {
          return token.type === 17;
        };
        var isIdentToken = function(token) {
          return token.type === 20;
        };
        var isStringToken = function(token) {
          return token.type === 0;
        };
        var isIdentWithValue = function(token, value) {
          return isIdentToken(token) && token.value === value;
        };
        var nonWhiteSpace = function(token) {
          return token.type !== 31;
        };
        var nonFunctionArgSeparator = function(token) {
          return token.type !== 31 && token.type !== 4;
        };
        var parseFunctionArgs = function(tokens) {
          var args = [];
          var arg = [];
          tokens.forEach(function(token) {
            if (token.type === 4) {
              if (arg.length === 0) {
                throw new Error("Error parsing function args, zero tokens for arg");
              }
              args.push(arg);
              arg = [];
              return;
            }
            if (token.type !== 31) {
              arg.push(token);
            }
          });
          if (arg.length) {
            args.push(arg);
          }
          return args;
        };
        var isEndingTokenFor = function(token, type) {
          if (type === 11 && token.type === 12) {
            return true;
          }
          if (type === 28 && token.type === 29) {
            return true;
          }
          return type === 2 && token.type === 3;
        };
        var isLength = function(token) {
          return token.type === 17 || token.type === 15;
        };
        var isLengthPercentage = function(token) {
          return token.type === 16 || isLength(token);
        };
        var parseLengthPercentageTuple = function(tokens) {
          return tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
        };
        var ZERO_LENGTH = {
          type: 17,
          number: 0,
          flags: FLAG_INTEGER
        };
        var FIFTY_PERCENT = {
          type: 16,
          number: 50,
          flags: FLAG_INTEGER
        };
        var HUNDRED_PERCENT = {
          type: 16,
          number: 100,
          flags: FLAG_INTEGER
        };
        var getAbsoluteValueForTuple = function(tuple, width, height) {
          var x2 = tuple[0], y3 = tuple[1];
          return [getAbsoluteValue(x2, width), getAbsoluteValue(typeof y3 !== "undefined" ? y3 : x2, height)];
        };
        var getAbsoluteValue = function(token, parent) {
          if (token.type === 16) {
            return token.number / 100 * parent;
          }
          if (isDimensionToken(token)) {
            switch (token.unit) {
              case "rem":
              case "em":
                return 16 * token.number;
              // TODO use correct font-size
              case "px":
              default:
                return token.number;
            }
          }
          return token.number;
        };
        var DEG = "deg";
        var GRAD = "grad";
        var RAD = "rad";
        var TURN = "turn";
        var angle = {
          name: "angle",
          parse: function(_context, value) {
            if (value.type === 15) {
              switch (value.unit) {
                case DEG:
                  return Math.PI * value.number / 180;
                case GRAD:
                  return Math.PI / 200 * value.number;
                case RAD:
                  return value.number;
                case TURN:
                  return Math.PI * 2 * value.number;
              }
            }
            throw new Error("Unsupported angle type");
          }
        };
        var isAngle = function(value) {
          if (value.type === 15) {
            if (value.unit === DEG || value.unit === GRAD || value.unit === RAD || value.unit === TURN) {
              return true;
            }
          }
          return false;
        };
        var parseNamedSide = function(tokens) {
          var sideOrCorner = tokens.filter(isIdentToken).map(function(ident) {
            return ident.value;
          }).join(" ");
          switch (sideOrCorner) {
            case "to bottom right":
            case "to right bottom":
            case "left top":
            case "top left":
              return [ZERO_LENGTH, ZERO_LENGTH];
            case "to top":
            case "bottom":
              return deg(0);
            case "to bottom left":
            case "to left bottom":
            case "right top":
            case "top right":
              return [ZERO_LENGTH, HUNDRED_PERCENT];
            case "to right":
            case "left":
              return deg(90);
            case "to top left":
            case "to left top":
            case "right bottom":
            case "bottom right":
              return [HUNDRED_PERCENT, HUNDRED_PERCENT];
            case "to bottom":
            case "top":
              return deg(180);
            case "to top right":
            case "to right top":
            case "left bottom":
            case "bottom left":
              return [HUNDRED_PERCENT, ZERO_LENGTH];
            case "to left":
            case "right":
              return deg(270);
          }
          return 0;
        };
        var deg = function(deg2) {
          return Math.PI * deg2 / 180;
        };
        var color$1 = {
          name: "color",
          parse: function(context, value) {
            if (value.type === 18) {
              var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];
              if (typeof colorFunction === "undefined") {
                throw new Error('Attempting to parse an unsupported color function "' + value.name + '"');
              }
              return colorFunction(context, value.values);
            }
            if (value.type === 5) {
              if (value.value.length === 3) {
                var r6 = value.value.substring(0, 1);
                var g2 = value.value.substring(1, 2);
                var b3 = value.value.substring(2, 3);
                return pack(parseInt(r6 + r6, 16), parseInt(g2 + g2, 16), parseInt(b3 + b3, 16), 1);
              }
              if (value.value.length === 4) {
                var r6 = value.value.substring(0, 1);
                var g2 = value.value.substring(1, 2);
                var b3 = value.value.substring(2, 3);
                var a4 = value.value.substring(3, 4);
                return pack(parseInt(r6 + r6, 16), parseInt(g2 + g2, 16), parseInt(b3 + b3, 16), parseInt(a4 + a4, 16) / 255);
              }
              if (value.value.length === 6) {
                var r6 = value.value.substring(0, 2);
                var g2 = value.value.substring(2, 4);
                var b3 = value.value.substring(4, 6);
                return pack(parseInt(r6, 16), parseInt(g2, 16), parseInt(b3, 16), 1);
              }
              if (value.value.length === 8) {
                var r6 = value.value.substring(0, 2);
                var g2 = value.value.substring(2, 4);
                var b3 = value.value.substring(4, 6);
                var a4 = value.value.substring(6, 8);
                return pack(parseInt(r6, 16), parseInt(g2, 16), parseInt(b3, 16), parseInt(a4, 16) / 255);
              }
            }
            if (value.type === 20) {
              var namedColor = COLORS[value.value.toUpperCase()];
              if (typeof namedColor !== "undefined") {
                return namedColor;
              }
            }
            return COLORS.TRANSPARENT;
          }
        };
        var isTransparent = function(color2) {
          return (255 & color2) === 0;
        };
        var asString = function(color2) {
          var alpha = 255 & color2;
          var blue = 255 & color2 >> 8;
          var green = 255 & color2 >> 16;
          var red = 255 & color2 >> 24;
          return alpha < 255 ? "rgba(" + red + "," + green + "," + blue + "," + alpha / 255 + ")" : "rgb(" + red + "," + green + "," + blue + ")";
        };
        var pack = function(r6, g2, b3, a4) {
          return (r6 << 24 | g2 << 16 | b3 << 8 | Math.round(a4 * 255) << 0) >>> 0;
        };
        var getTokenColorValue = function(token, i7) {
          if (token.type === 17) {
            return token.number;
          }
          if (token.type === 16) {
            var max = i7 === 3 ? 1 : 255;
            return i7 === 3 ? token.number / 100 * max : Math.round(token.number / 100 * max);
          }
          return 0;
        };
        var rgb = function(_context, args) {
          var tokens = args.filter(nonFunctionArgSeparator);
          if (tokens.length === 3) {
            var _a = tokens.map(getTokenColorValue), r6 = _a[0], g2 = _a[1], b3 = _a[2];
            return pack(r6, g2, b3, 1);
          }
          if (tokens.length === 4) {
            var _b = tokens.map(getTokenColorValue), r6 = _b[0], g2 = _b[1], b3 = _b[2], a4 = _b[3];
            return pack(r6, g2, b3, a4);
          }
          return 0;
        };
        function hue2rgb(t1, t22, hue) {
          if (hue < 0) {
            hue += 1;
          }
          if (hue >= 1) {
            hue -= 1;
          }
          if (hue < 1 / 6) {
            return (t22 - t1) * hue * 6 + t1;
          } else if (hue < 1 / 2) {
            return t22;
          } else if (hue < 2 / 3) {
            return (t22 - t1) * 6 * (2 / 3 - hue) + t1;
          } else {
            return t1;
          }
        }
        var hsl = function(context, args) {
          var tokens = args.filter(nonFunctionArgSeparator);
          var hue = tokens[0], saturation = tokens[1], lightness = tokens[2], alpha = tokens[3];
          var h3 = (hue.type === 17 ? deg(hue.number) : angle.parse(context, hue)) / (Math.PI * 2);
          var s4 = isLengthPercentage(saturation) ? saturation.number / 100 : 0;
          var l3 = isLengthPercentage(lightness) ? lightness.number / 100 : 0;
          var a4 = typeof alpha !== "undefined" && isLengthPercentage(alpha) ? getAbsoluteValue(alpha, 1) : 1;
          if (s4 === 0) {
            return pack(l3 * 255, l3 * 255, l3 * 255, 1);
          }
          var t22 = l3 <= 0.5 ? l3 * (s4 + 1) : l3 + s4 - l3 * s4;
          var t1 = l3 * 2 - t22;
          var r6 = hue2rgb(t1, t22, h3 + 1 / 3);
          var g2 = hue2rgb(t1, t22, h3);
          var b3 = hue2rgb(t1, t22, h3 - 1 / 3);
          return pack(r6 * 255, g2 * 255, b3 * 255, a4);
        };
        var SUPPORTED_COLOR_FUNCTIONS = {
          hsl,
          hsla: hsl,
          rgb,
          rgba: rgb
        };
        var parseColor = function(context, value) {
          return color$1.parse(context, Parser.create(value).parseComponentValue());
        };
        var COLORS = {
          ALICEBLUE: 4042850303,
          ANTIQUEWHITE: 4209760255,
          AQUA: 16777215,
          AQUAMARINE: 2147472639,
          AZURE: 4043309055,
          BEIGE: 4126530815,
          BISQUE: 4293182719,
          BLACK: 255,
          BLANCHEDALMOND: 4293643775,
          BLUE: 65535,
          BLUEVIOLET: 2318131967,
          BROWN: 2771004159,
          BURLYWOOD: 3736635391,
          CADETBLUE: 1604231423,
          CHARTREUSE: 2147418367,
          CHOCOLATE: 3530104575,
          CORAL: 4286533887,
          CORNFLOWERBLUE: 1687547391,
          CORNSILK: 4294499583,
          CRIMSON: 3692313855,
          CYAN: 16777215,
          DARKBLUE: 35839,
          DARKCYAN: 9145343,
          DARKGOLDENROD: 3095837695,
          DARKGRAY: 2846468607,
          DARKGREEN: 6553855,
          DARKGREY: 2846468607,
          DARKKHAKI: 3182914559,
          DARKMAGENTA: 2332068863,
          DARKOLIVEGREEN: 1433087999,
          DARKORANGE: 4287365375,
          DARKORCHID: 2570243327,
          DARKRED: 2332033279,
          DARKSALMON: 3918953215,
          DARKSEAGREEN: 2411499519,
          DARKSLATEBLUE: 1211993087,
          DARKSLATEGRAY: 793726975,
          DARKSLATEGREY: 793726975,
          DARKTURQUOISE: 13554175,
          DARKVIOLET: 2483082239,
          DEEPPINK: 4279538687,
          DEEPSKYBLUE: 12582911,
          DIMGRAY: 1768516095,
          DIMGREY: 1768516095,
          DODGERBLUE: 512819199,
          FIREBRICK: 2988581631,
          FLORALWHITE: 4294635775,
          FORESTGREEN: 579543807,
          FUCHSIA: 4278255615,
          GAINSBORO: 3705462015,
          GHOSTWHITE: 4177068031,
          GOLD: 4292280575,
          GOLDENROD: 3668254975,
          GRAY: 2155905279,
          GREEN: 8388863,
          GREENYELLOW: 2919182335,
          GREY: 2155905279,
          HONEYDEW: 4043305215,
          HOTPINK: 4285117695,
          INDIANRED: 3445382399,
          INDIGO: 1258324735,
          IVORY: 4294963455,
          KHAKI: 4041641215,
          LAVENDER: 3873897215,
          LAVENDERBLUSH: 4293981695,
          LAWNGREEN: 2096890111,
          LEMONCHIFFON: 4294626815,
          LIGHTBLUE: 2916673279,
          LIGHTCORAL: 4034953471,
          LIGHTCYAN: 3774873599,
          LIGHTGOLDENRODYELLOW: 4210742015,
          LIGHTGRAY: 3553874943,
          LIGHTGREEN: 2431553791,
          LIGHTGREY: 3553874943,
          LIGHTPINK: 4290167295,
          LIGHTSALMON: 4288707327,
          LIGHTSEAGREEN: 548580095,
          LIGHTSKYBLUE: 2278488831,
          LIGHTSLATEGRAY: 2005441023,
          LIGHTSLATEGREY: 2005441023,
          LIGHTSTEELBLUE: 2965692159,
          LIGHTYELLOW: 4294959359,
          LIME: 16711935,
          LIMEGREEN: 852308735,
          LINEN: 4210091775,
          MAGENTA: 4278255615,
          MAROON: 2147483903,
          MEDIUMAQUAMARINE: 1724754687,
          MEDIUMBLUE: 52735,
          MEDIUMORCHID: 3126187007,
          MEDIUMPURPLE: 2473647103,
          MEDIUMSEAGREEN: 1018393087,
          MEDIUMSLATEBLUE: 2070474495,
          MEDIUMSPRINGGREEN: 16423679,
          MEDIUMTURQUOISE: 1221709055,
          MEDIUMVIOLETRED: 3340076543,
          MIDNIGHTBLUE: 421097727,
          MINTCREAM: 4127193855,
          MISTYROSE: 4293190143,
          MOCCASIN: 4293178879,
          NAVAJOWHITE: 4292783615,
          NAVY: 33023,
          OLDLACE: 4260751103,
          OLIVE: 2155872511,
          OLIVEDRAB: 1804477439,
          ORANGE: 4289003775,
          ORANGERED: 4282712319,
          ORCHID: 3664828159,
          PALEGOLDENROD: 4008225535,
          PALEGREEN: 2566625535,
          PALETURQUOISE: 2951671551,
          PALEVIOLETRED: 3681588223,
          PAPAYAWHIP: 4293907967,
          PEACHPUFF: 4292524543,
          PERU: 3448061951,
          PINK: 4290825215,
          PLUM: 3718307327,
          POWDERBLUE: 2967529215,
          PURPLE: 2147516671,
          REBECCAPURPLE: 1714657791,
          RED: 4278190335,
          ROSYBROWN: 3163525119,
          ROYALBLUE: 1097458175,
          SADDLEBROWN: 2336560127,
          SALMON: 4202722047,
          SANDYBROWN: 4104413439,
          SEAGREEN: 780883967,
          SEASHELL: 4294307583,
          SIENNA: 2689740287,
          SILVER: 3233857791,
          SKYBLUE: 2278484991,
          SLATEBLUE: 1784335871,
          SLATEGRAY: 1887473919,
          SLATEGREY: 1887473919,
          SNOW: 4294638335,
          SPRINGGREEN: 16744447,
          STEELBLUE: 1182971135,
          TAN: 3535047935,
          TEAL: 8421631,
          THISTLE: 3636451583,
          TOMATO: 4284696575,
          TRANSPARENT: 0,
          TURQUOISE: 1088475391,
          VIOLET: 4001558271,
          WHEAT: 4125012991,
          WHITE: 4294967295,
          WHITESMOKE: 4126537215,
          YELLOW: 4294902015,
          YELLOWGREEN: 2597139199
        };
        var backgroundClip = {
          name: "background-clip",
          initialValue: "border-box",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            return tokens.map(function(token) {
              if (isIdentToken(token)) {
                switch (token.value) {
                  case "padding-box":
                    return 1;
                  case "content-box":
                    return 2;
                }
              }
              return 0;
            });
          }
        };
        var backgroundColor = {
          name: "background-color",
          initialValue: "transparent",
          prefix: false,
          type: 3,
          format: "color"
        };
        var parseColorStop = function(context, args) {
          var color2 = color$1.parse(context, args[0]);
          var stop = args[1];
          return stop && isLengthPercentage(stop) ? { color: color2, stop } : { color: color2, stop: null };
        };
        var processColorStops = function(stops, lineLength) {
          var first = stops[0];
          var last = stops[stops.length - 1];
          if (first.stop === null) {
            first.stop = ZERO_LENGTH;
          }
          if (last.stop === null) {
            last.stop = HUNDRED_PERCENT;
          }
          var processStops = [];
          var previous = 0;
          for (var i7 = 0; i7 < stops.length; i7++) {
            var stop_1 = stops[i7].stop;
            if (stop_1 !== null) {
              var absoluteValue = getAbsoluteValue(stop_1, lineLength);
              if (absoluteValue > previous) {
                processStops.push(absoluteValue);
              } else {
                processStops.push(previous);
              }
              previous = absoluteValue;
            } else {
              processStops.push(null);
            }
          }
          var gapBegin = null;
          for (var i7 = 0; i7 < processStops.length; i7++) {
            var stop_2 = processStops[i7];
            if (stop_2 === null) {
              if (gapBegin === null) {
                gapBegin = i7;
              }
            } else if (gapBegin !== null) {
              var gapLength = i7 - gapBegin;
              var beforeGap = processStops[gapBegin - 1];
              var gapValue = (stop_2 - beforeGap) / (gapLength + 1);
              for (var g2 = 1; g2 <= gapLength; g2++) {
                processStops[gapBegin + g2 - 1] = gapValue * g2;
              }
              gapBegin = null;
            }
          }
          return stops.map(function(_a, i8) {
            var color2 = _a.color;
            return { color: color2, stop: Math.max(Math.min(1, processStops[i8] / lineLength), 0) };
          });
        };
        var getAngleFromCorner = function(corner, width, height) {
          var centerX = width / 2;
          var centerY = height / 2;
          var x2 = getAbsoluteValue(corner[0], width) - centerX;
          var y3 = centerY - getAbsoluteValue(corner[1], height);
          return (Math.atan2(y3, x2) + Math.PI * 2) % (Math.PI * 2);
        };
        var calculateGradientDirection = function(angle2, width, height) {
          var radian = typeof angle2 === "number" ? angle2 : getAngleFromCorner(angle2, width, height);
          var lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
          var halfWidth = width / 2;
          var halfHeight = height / 2;
          var halfLineLength = lineLength / 2;
          var yDiff = Math.sin(radian - Math.PI / 2) * halfLineLength;
          var xDiff = Math.cos(radian - Math.PI / 2) * halfLineLength;
          return [lineLength, halfWidth - xDiff, halfWidth + xDiff, halfHeight - yDiff, halfHeight + yDiff];
        };
        var distance = function(a4, b3) {
          return Math.sqrt(a4 * a4 + b3 * b3);
        };
        var findCorner = function(width, height, x2, y3, closest) {
          var corners = [
            [0, 0],
            [0, height],
            [width, 0],
            [width, height]
          ];
          return corners.reduce(function(stat, corner) {
            var cx = corner[0], cy = corner[1];
            var d3 = distance(x2 - cx, y3 - cy);
            if (closest ? d3 < stat.optimumDistance : d3 > stat.optimumDistance) {
              return {
                optimumCorner: corner,
                optimumDistance: d3
              };
            }
            return stat;
          }, {
            optimumDistance: closest ? Infinity : -Infinity,
            optimumCorner: null
          }).optimumCorner;
        };
        var calculateRadius = function(gradient, x2, y3, width, height) {
          var rx = 0;
          var ry = 0;
          switch (gradient.size) {
            case 0:
              if (gradient.shape === 0) {
                rx = ry = Math.min(Math.abs(x2), Math.abs(x2 - width), Math.abs(y3), Math.abs(y3 - height));
              } else if (gradient.shape === 1) {
                rx = Math.min(Math.abs(x2), Math.abs(x2 - width));
                ry = Math.min(Math.abs(y3), Math.abs(y3 - height));
              }
              break;
            case 2:
              if (gradient.shape === 0) {
                rx = ry = Math.min(distance(x2, y3), distance(x2, y3 - height), distance(x2 - width, y3), distance(x2 - width, y3 - height));
              } else if (gradient.shape === 1) {
                var c4 = Math.min(Math.abs(y3), Math.abs(y3 - height)) / Math.min(Math.abs(x2), Math.abs(x2 - width));
                var _a = findCorner(width, height, x2, y3, true), cx = _a[0], cy = _a[1];
                rx = distance(cx - x2, (cy - y3) / c4);
                ry = c4 * rx;
              }
              break;
            case 1:
              if (gradient.shape === 0) {
                rx = ry = Math.max(Math.abs(x2), Math.abs(x2 - width), Math.abs(y3), Math.abs(y3 - height));
              } else if (gradient.shape === 1) {
                rx = Math.max(Math.abs(x2), Math.abs(x2 - width));
                ry = Math.max(Math.abs(y3), Math.abs(y3 - height));
              }
              break;
            case 3:
              if (gradient.shape === 0) {
                rx = ry = Math.max(distance(x2, y3), distance(x2, y3 - height), distance(x2 - width, y3), distance(x2 - width, y3 - height));
              } else if (gradient.shape === 1) {
                var c4 = Math.max(Math.abs(y3), Math.abs(y3 - height)) / Math.max(Math.abs(x2), Math.abs(x2 - width));
                var _b = findCorner(width, height, x2, y3, false), cx = _b[0], cy = _b[1];
                rx = distance(cx - x2, (cy - y3) / c4);
                ry = c4 * rx;
              }
              break;
          }
          if (Array.isArray(gradient.size)) {
            rx = getAbsoluteValue(gradient.size[0], width);
            ry = gradient.size.length === 2 ? getAbsoluteValue(gradient.size[1], height) : rx;
          }
          return [rx, ry];
        };
        var linearGradient = function(context, tokens) {
          var angle$1 = deg(180);
          var stops = [];
          parseFunctionArgs(tokens).forEach(function(arg, i7) {
            if (i7 === 0) {
              var firstToken = arg[0];
              if (firstToken.type === 20 && firstToken.value === "to") {
                angle$1 = parseNamedSide(arg);
                return;
              } else if (isAngle(firstToken)) {
                angle$1 = angle.parse(context, firstToken);
                return;
              }
            }
            var colorStop = parseColorStop(context, arg);
            stops.push(colorStop);
          });
          return {
            angle: angle$1,
            stops,
            type: 1
            /* LINEAR_GRADIENT */
          };
        };
        var prefixLinearGradient = function(context, tokens) {
          var angle$1 = deg(180);
          var stops = [];
          parseFunctionArgs(tokens).forEach(function(arg, i7) {
            if (i7 === 0) {
              var firstToken = arg[0];
              if (firstToken.type === 20 && ["top", "left", "right", "bottom"].indexOf(firstToken.value) !== -1) {
                angle$1 = parseNamedSide(arg);
                return;
              } else if (isAngle(firstToken)) {
                angle$1 = (angle.parse(context, firstToken) + deg(270)) % deg(360);
                return;
              }
            }
            var colorStop = parseColorStop(context, arg);
            stops.push(colorStop);
          });
          return {
            angle: angle$1,
            stops,
            type: 1
            /* LINEAR_GRADIENT */
          };
        };
        var webkitGradient = function(context, tokens) {
          var angle2 = deg(180);
          var stops = [];
          var type = 1;
          var shape = 0;
          var size = 3;
          var position2 = [];
          parseFunctionArgs(tokens).forEach(function(arg, i7) {
            var firstToken = arg[0];
            if (i7 === 0) {
              if (isIdentToken(firstToken) && firstToken.value === "linear") {
                type = 1;
                return;
              } else if (isIdentToken(firstToken) && firstToken.value === "radial") {
                type = 2;
                return;
              }
            }
            if (firstToken.type === 18) {
              if (firstToken.name === "from") {
                var color2 = color$1.parse(context, firstToken.values[0]);
                stops.push({ stop: ZERO_LENGTH, color: color2 });
              } else if (firstToken.name === "to") {
                var color2 = color$1.parse(context, firstToken.values[0]);
                stops.push({ stop: HUNDRED_PERCENT, color: color2 });
              } else if (firstToken.name === "color-stop") {
                var values = firstToken.values.filter(nonFunctionArgSeparator);
                if (values.length === 2) {
                  var color2 = color$1.parse(context, values[1]);
                  var stop_1 = values[0];
                  if (isNumberToken(stop_1)) {
                    stops.push({
                      stop: { type: 16, number: stop_1.number * 100, flags: stop_1.flags },
                      color: color2
                    });
                  }
                }
              }
            }
          });
          return type === 1 ? {
            angle: (angle2 + deg(180)) % deg(360),
            stops,
            type
          } : { size, shape, stops, position: position2, type };
        };
        var CLOSEST_SIDE = "closest-side";
        var FARTHEST_SIDE = "farthest-side";
        var CLOSEST_CORNER = "closest-corner";
        var FARTHEST_CORNER = "farthest-corner";
        var CIRCLE = "circle";
        var ELLIPSE = "ellipse";
        var COVER = "cover";
        var CONTAIN = "contain";
        var radialGradient = function(context, tokens) {
          var shape = 0;
          var size = 3;
          var stops = [];
          var position2 = [];
          parseFunctionArgs(tokens).forEach(function(arg, i7) {
            var isColorStop = true;
            if (i7 === 0) {
              var isAtPosition_1 = false;
              isColorStop = arg.reduce(function(acc, token) {
                if (isAtPosition_1) {
                  if (isIdentToken(token)) {
                    switch (token.value) {
                      case "center":
                        position2.push(FIFTY_PERCENT);
                        return acc;
                      case "top":
                      case "left":
                        position2.push(ZERO_LENGTH);
                        return acc;
                      case "right":
                      case "bottom":
                        position2.push(HUNDRED_PERCENT);
                        return acc;
                    }
                  } else if (isLengthPercentage(token) || isLength(token)) {
                    position2.push(token);
                  }
                } else if (isIdentToken(token)) {
                  switch (token.value) {
                    case CIRCLE:
                      shape = 0;
                      return false;
                    case ELLIPSE:
                      shape = 1;
                      return false;
                    case "at":
                      isAtPosition_1 = true;
                      return false;
                    case CLOSEST_SIDE:
                      size = 0;
                      return false;
                    case COVER:
                    case FARTHEST_SIDE:
                      size = 1;
                      return false;
                    case CONTAIN:
                    case CLOSEST_CORNER:
                      size = 2;
                      return false;
                    case FARTHEST_CORNER:
                      size = 3;
                      return false;
                  }
                } else if (isLength(token) || isLengthPercentage(token)) {
                  if (!Array.isArray(size)) {
                    size = [];
                  }
                  size.push(token);
                  return false;
                }
                return acc;
              }, isColorStop);
            }
            if (isColorStop) {
              var colorStop = parseColorStop(context, arg);
              stops.push(colorStop);
            }
          });
          return {
            size,
            shape,
            stops,
            position: position2,
            type: 2
            /* RADIAL_GRADIENT */
          };
        };
        var prefixRadialGradient = function(context, tokens) {
          var shape = 0;
          var size = 3;
          var stops = [];
          var position2 = [];
          parseFunctionArgs(tokens).forEach(function(arg, i7) {
            var isColorStop = true;
            if (i7 === 0) {
              isColorStop = arg.reduce(function(acc, token) {
                if (isIdentToken(token)) {
                  switch (token.value) {
                    case "center":
                      position2.push(FIFTY_PERCENT);
                      return false;
                    case "top":
                    case "left":
                      position2.push(ZERO_LENGTH);
                      return false;
                    case "right":
                    case "bottom":
                      position2.push(HUNDRED_PERCENT);
                      return false;
                  }
                } else if (isLengthPercentage(token) || isLength(token)) {
                  position2.push(token);
                  return false;
                }
                return acc;
              }, isColorStop);
            } else if (i7 === 1) {
              isColorStop = arg.reduce(function(acc, token) {
                if (isIdentToken(token)) {
                  switch (token.value) {
                    case CIRCLE:
                      shape = 0;
                      return false;
                    case ELLIPSE:
                      shape = 1;
                      return false;
                    case CONTAIN:
                    case CLOSEST_SIDE:
                      size = 0;
                      return false;
                    case FARTHEST_SIDE:
                      size = 1;
                      return false;
                    case CLOSEST_CORNER:
                      size = 2;
                      return false;
                    case COVER:
                    case FARTHEST_CORNER:
                      size = 3;
                      return false;
                  }
                } else if (isLength(token) || isLengthPercentage(token)) {
                  if (!Array.isArray(size)) {
                    size = [];
                  }
                  size.push(token);
                  return false;
                }
                return acc;
              }, isColorStop);
            }
            if (isColorStop) {
              var colorStop = parseColorStop(context, arg);
              stops.push(colorStop);
            }
          });
          return {
            size,
            shape,
            stops,
            position: position2,
            type: 2
            /* RADIAL_GRADIENT */
          };
        };
        var isLinearGradient = function(background) {
          return background.type === 1;
        };
        var isRadialGradient = function(background) {
          return background.type === 2;
        };
        var image = {
          name: "image",
          parse: function(context, value) {
            if (value.type === 22) {
              var image_1 = {
                url: value.value,
                type: 0
                /* URL */
              };
              context.cache.addImage(value.value);
              return image_1;
            }
            if (value.type === 18) {
              var imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];
              if (typeof imageFunction === "undefined") {
                throw new Error('Attempting to parse an unsupported image function "' + value.name + '"');
              }
              return imageFunction(context, value.values);
            }
            throw new Error("Unsupported image type " + value.type);
          }
        };
        function isSupportedImage(value) {
          return !(value.type === 20 && value.value === "none") && (value.type !== 18 || !!SUPPORTED_IMAGE_FUNCTIONS[value.name]);
        }
        var SUPPORTED_IMAGE_FUNCTIONS = {
          "linear-gradient": linearGradient,
          "-moz-linear-gradient": prefixLinearGradient,
          "-ms-linear-gradient": prefixLinearGradient,
          "-o-linear-gradient": prefixLinearGradient,
          "-webkit-linear-gradient": prefixLinearGradient,
          "radial-gradient": radialGradient,
          "-moz-radial-gradient": prefixRadialGradient,
          "-ms-radial-gradient": prefixRadialGradient,
          "-o-radial-gradient": prefixRadialGradient,
          "-webkit-radial-gradient": prefixRadialGradient,
          "-webkit-gradient": webkitGradient
        };
        var backgroundImage = {
          name: "background-image",
          initialValue: "none",
          type: 1,
          prefix: false,
          parse: function(context, tokens) {
            if (tokens.length === 0) {
              return [];
            }
            var first = tokens[0];
            if (first.type === 20 && first.value === "none") {
              return [];
            }
            return tokens.filter(function(value) {
              return nonFunctionArgSeparator(value) && isSupportedImage(value);
            }).map(function(value) {
              return image.parse(context, value);
            });
          }
        };
        var backgroundOrigin = {
          name: "background-origin",
          initialValue: "border-box",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            return tokens.map(function(token) {
              if (isIdentToken(token)) {
                switch (token.value) {
                  case "padding-box":
                    return 1;
                  case "content-box":
                    return 2;
                }
              }
              return 0;
            });
          }
        };
        var backgroundPosition = {
          name: "background-position",
          initialValue: "0% 0%",
          type: 1,
          prefix: false,
          parse: function(_context, tokens) {
            return parseFunctionArgs(tokens).map(function(values) {
              return values.filter(isLengthPercentage);
            }).map(parseLengthPercentageTuple);
          }
        };
        var backgroundRepeat = {
          name: "background-repeat",
          initialValue: "repeat",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            return parseFunctionArgs(tokens).map(function(values) {
              return values.filter(isIdentToken).map(function(token) {
                return token.value;
              }).join(" ");
            }).map(parseBackgroundRepeat);
          }
        };
        var parseBackgroundRepeat = function(value) {
          switch (value) {
            case "no-repeat":
              return 1;
            case "repeat-x":
            case "repeat no-repeat":
              return 2;
            case "repeat-y":
            case "no-repeat repeat":
              return 3;
            case "repeat":
            default:
              return 0;
          }
        };
        var BACKGROUND_SIZE;
        (function(BACKGROUND_SIZE2) {
          BACKGROUND_SIZE2["AUTO"] = "auto";
          BACKGROUND_SIZE2["CONTAIN"] = "contain";
          BACKGROUND_SIZE2["COVER"] = "cover";
        })(BACKGROUND_SIZE || (BACKGROUND_SIZE = {}));
        var backgroundSize = {
          name: "background-size",
          initialValue: "0",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            return parseFunctionArgs(tokens).map(function(values) {
              return values.filter(isBackgroundSizeInfoToken);
            });
          }
        };
        var isBackgroundSizeInfoToken = function(value) {
          return isIdentToken(value) || isLengthPercentage(value);
        };
        var borderColorForSide = function(side) {
          return {
            name: "border-" + side + "-color",
            initialValue: "transparent",
            prefix: false,
            type: 3,
            format: "color"
          };
        };
        var borderTopColor = borderColorForSide("top");
        var borderRightColor = borderColorForSide("right");
        var borderBottomColor = borderColorForSide("bottom");
        var borderLeftColor = borderColorForSide("left");
        var borderRadiusForSide = function(side) {
          return {
            name: "border-radius-" + side,
            initialValue: "0 0",
            prefix: false,
            type: 1,
            parse: function(_context, tokens) {
              return parseLengthPercentageTuple(tokens.filter(isLengthPercentage));
            }
          };
        };
        var borderTopLeftRadius = borderRadiusForSide("top-left");
        var borderTopRightRadius = borderRadiusForSide("top-right");
        var borderBottomRightRadius = borderRadiusForSide("bottom-right");
        var borderBottomLeftRadius = borderRadiusForSide("bottom-left");
        var borderStyleForSide = function(side) {
          return {
            name: "border-" + side + "-style",
            initialValue: "solid",
            prefix: false,
            type: 2,
            parse: function(_context, style) {
              switch (style) {
                case "none":
                  return 0;
                case "dashed":
                  return 2;
                case "dotted":
                  return 3;
                case "double":
                  return 4;
              }
              return 1;
            }
          };
        };
        var borderTopStyle = borderStyleForSide("top");
        var borderRightStyle = borderStyleForSide("right");
        var borderBottomStyle = borderStyleForSide("bottom");
        var borderLeftStyle = borderStyleForSide("left");
        var borderWidthForSide = function(side) {
          return {
            name: "border-" + side + "-width",
            initialValue: "0",
            type: 0,
            prefix: false,
            parse: function(_context, token) {
              if (isDimensionToken(token)) {
                return token.number;
              }
              return 0;
            }
          };
        };
        var borderTopWidth = borderWidthForSide("top");
        var borderRightWidth = borderWidthForSide("right");
        var borderBottomWidth = borderWidthForSide("bottom");
        var borderLeftWidth = borderWidthForSide("left");
        var color = {
          name: "color",
          initialValue: "transparent",
          prefix: false,
          type: 3,
          format: "color"
        };
        var direction = {
          name: "direction",
          initialValue: "ltr",
          prefix: false,
          type: 2,
          parse: function(_context, direction2) {
            switch (direction2) {
              case "rtl":
                return 1;
              case "ltr":
              default:
                return 0;
            }
          }
        };
        var display = {
          name: "display",
          initialValue: "inline-block",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            return tokens.filter(isIdentToken).reduce(
              function(bit, token) {
                return bit | parseDisplayValue(token.value);
              },
              0
              /* NONE */
            );
          }
        };
        var parseDisplayValue = function(display2) {
          switch (display2) {
            case "block":
            case "-webkit-box":
              return 2;
            case "inline":
              return 4;
            case "run-in":
              return 8;
            case "flow":
              return 16;
            case "flow-root":
              return 32;
            case "table":
              return 64;
            case "flex":
            case "-webkit-flex":
              return 128;
            case "grid":
            case "-ms-grid":
              return 256;
            case "ruby":
              return 512;
            case "subgrid":
              return 1024;
            case "list-item":
              return 2048;
            case "table-row-group":
              return 4096;
            case "table-header-group":
              return 8192;
            case "table-footer-group":
              return 16384;
            case "table-row":
              return 32768;
            case "table-cell":
              return 65536;
            case "table-column-group":
              return 131072;
            case "table-column":
              return 262144;
            case "table-caption":
              return 524288;
            case "ruby-base":
              return 1048576;
            case "ruby-text":
              return 2097152;
            case "ruby-base-container":
              return 4194304;
            case "ruby-text-container":
              return 8388608;
            case "contents":
              return 16777216;
            case "inline-block":
              return 33554432;
            case "inline-list-item":
              return 67108864;
            case "inline-table":
              return 134217728;
            case "inline-flex":
              return 268435456;
            case "inline-grid":
              return 536870912;
          }
          return 0;
        };
        var float = {
          name: "float",
          initialValue: "none",
          prefix: false,
          type: 2,
          parse: function(_context, float2) {
            switch (float2) {
              case "left":
                return 1;
              case "right":
                return 2;
              case "inline-start":
                return 3;
              case "inline-end":
                return 4;
            }
            return 0;
          }
        };
        var letterSpacing = {
          name: "letter-spacing",
          initialValue: "0",
          prefix: false,
          type: 0,
          parse: function(_context, token) {
            if (token.type === 20 && token.value === "normal") {
              return 0;
            }
            if (token.type === 17) {
              return token.number;
            }
            if (token.type === 15) {
              return token.number;
            }
            return 0;
          }
        };
        var LINE_BREAK;
        (function(LINE_BREAK2) {
          LINE_BREAK2["NORMAL"] = "normal";
          LINE_BREAK2["STRICT"] = "strict";
        })(LINE_BREAK || (LINE_BREAK = {}));
        var lineBreak = {
          name: "line-break",
          initialValue: "normal",
          prefix: false,
          type: 2,
          parse: function(_context, lineBreak2) {
            switch (lineBreak2) {
              case "strict":
                return LINE_BREAK.STRICT;
              case "normal":
              default:
                return LINE_BREAK.NORMAL;
            }
          }
        };
        var lineHeight = {
          name: "line-height",
          initialValue: "normal",
          prefix: false,
          type: 4
          /* TOKEN_VALUE */
        };
        var computeLineHeight = function(token, fontSize2) {
          if (isIdentToken(token) && token.value === "normal") {
            return 1.2 * fontSize2;
          } else if (token.type === 17) {
            return fontSize2 * token.number;
          } else if (isLengthPercentage(token)) {
            return getAbsoluteValue(token, fontSize2);
          }
          return fontSize2;
        };
        var listStyleImage = {
          name: "list-style-image",
          initialValue: "none",
          type: 0,
          prefix: false,
          parse: function(context, token) {
            if (token.type === 20 && token.value === "none") {
              return null;
            }
            return image.parse(context, token);
          }
        };
        var listStylePosition = {
          name: "list-style-position",
          initialValue: "outside",
          prefix: false,
          type: 2,
          parse: function(_context, position2) {
            switch (position2) {
              case "inside":
                return 0;
              case "outside":
              default:
                return 1;
            }
          }
        };
        var listStyleType = {
          name: "list-style-type",
          initialValue: "none",
          prefix: false,
          type: 2,
          parse: function(_context, type) {
            switch (type) {
              case "disc":
                return 0;
              case "circle":
                return 1;
              case "square":
                return 2;
              case "decimal":
                return 3;
              case "cjk-decimal":
                return 4;
              case "decimal-leading-zero":
                return 5;
              case "lower-roman":
                return 6;
              case "upper-roman":
                return 7;
              case "lower-greek":
                return 8;
              case "lower-alpha":
                return 9;
              case "upper-alpha":
                return 10;
              case "arabic-indic":
                return 11;
              case "armenian":
                return 12;
              case "bengali":
                return 13;
              case "cambodian":
                return 14;
              case "cjk-earthly-branch":
                return 15;
              case "cjk-heavenly-stem":
                return 16;
              case "cjk-ideographic":
                return 17;
              case "devanagari":
                return 18;
              case "ethiopic-numeric":
                return 19;
              case "georgian":
                return 20;
              case "gujarati":
                return 21;
              case "gurmukhi":
                return 22;
              case "hebrew":
                return 22;
              case "hiragana":
                return 23;
              case "hiragana-iroha":
                return 24;
              case "japanese-formal":
                return 25;
              case "japanese-informal":
                return 26;
              case "kannada":
                return 27;
              case "katakana":
                return 28;
              case "katakana-iroha":
                return 29;
              case "khmer":
                return 30;
              case "korean-hangul-formal":
                return 31;
              case "korean-hanja-formal":
                return 32;
              case "korean-hanja-informal":
                return 33;
              case "lao":
                return 34;
              case "lower-armenian":
                return 35;
              case "malayalam":
                return 36;
              case "mongolian":
                return 37;
              case "myanmar":
                return 38;
              case "oriya":
                return 39;
              case "persian":
                return 40;
              case "simp-chinese-formal":
                return 41;
              case "simp-chinese-informal":
                return 42;
              case "tamil":
                return 43;
              case "telugu":
                return 44;
              case "thai":
                return 45;
              case "tibetan":
                return 46;
              case "trad-chinese-formal":
                return 47;
              case "trad-chinese-informal":
                return 48;
              case "upper-armenian":
                return 49;
              case "disclosure-open":
                return 50;
              case "disclosure-closed":
                return 51;
              case "none":
              default:
                return -1;
            }
          }
        };
        var marginForSide = function(side) {
          return {
            name: "margin-" + side,
            initialValue: "0",
            prefix: false,
            type: 4
            /* TOKEN_VALUE */
          };
        };
        var marginTop = marginForSide("top");
        var marginRight = marginForSide("right");
        var marginBottom = marginForSide("bottom");
        var marginLeft = marginForSide("left");
        var overflow = {
          name: "overflow",
          initialValue: "visible",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            return tokens.filter(isIdentToken).map(function(overflow2) {
              switch (overflow2.value) {
                case "hidden":
                  return 1;
                case "scroll":
                  return 2;
                case "clip":
                  return 3;
                case "auto":
                  return 4;
                case "visible":
                default:
                  return 0;
              }
            });
          }
        };
        var overflowWrap = {
          name: "overflow-wrap",
          initialValue: "normal",
          prefix: false,
          type: 2,
          parse: function(_context, overflow2) {
            switch (overflow2) {
              case "break-word":
                return "break-word";
              case "normal":
              default:
                return "normal";
            }
          }
        };
        var paddingForSide = function(side) {
          return {
            name: "padding-" + side,
            initialValue: "0",
            prefix: false,
            type: 3,
            format: "length-percentage"
          };
        };
        var paddingTop = paddingForSide("top");
        var paddingRight = paddingForSide("right");
        var paddingBottom = paddingForSide("bottom");
        var paddingLeft = paddingForSide("left");
        var textAlign = {
          name: "text-align",
          initialValue: "left",
          prefix: false,
          type: 2,
          parse: function(_context, textAlign2) {
            switch (textAlign2) {
              case "right":
                return 2;
              case "center":
              case "justify":
                return 1;
              case "left":
              default:
                return 0;
            }
          }
        };
        var position = {
          name: "position",
          initialValue: "static",
          prefix: false,
          type: 2,
          parse: function(_context, position2) {
            switch (position2) {
              case "relative":
                return 1;
              case "absolute":
                return 2;
              case "fixed":
                return 3;
              case "sticky":
                return 4;
            }
            return 0;
          }
        };
        var textShadow = {
          name: "text-shadow",
          initialValue: "none",
          type: 1,
          prefix: false,
          parse: function(context, tokens) {
            if (tokens.length === 1 && isIdentWithValue(tokens[0], "none")) {
              return [];
            }
            return parseFunctionArgs(tokens).map(function(values) {
              var shadow = {
                color: COLORS.TRANSPARENT,
                offsetX: ZERO_LENGTH,
                offsetY: ZERO_LENGTH,
                blur: ZERO_LENGTH
              };
              var c4 = 0;
              for (var i7 = 0; i7 < values.length; i7++) {
                var token = values[i7];
                if (isLength(token)) {
                  if (c4 === 0) {
                    shadow.offsetX = token;
                  } else if (c4 === 1) {
                    shadow.offsetY = token;
                  } else {
                    shadow.blur = token;
                  }
                  c4++;
                } else {
                  shadow.color = color$1.parse(context, token);
                }
              }
              return shadow;
            });
          }
        };
        var textTransform = {
          name: "text-transform",
          initialValue: "none",
          prefix: false,
          type: 2,
          parse: function(_context, textTransform2) {
            switch (textTransform2) {
              case "uppercase":
                return 2;
              case "lowercase":
                return 1;
              case "capitalize":
                return 3;
            }
            return 0;
          }
        };
        var transform$1 = {
          name: "transform",
          initialValue: "none",
          prefix: true,
          type: 0,
          parse: function(_context, token) {
            if (token.type === 20 && token.value === "none") {
              return null;
            }
            if (token.type === 18) {
              var transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
              if (typeof transformFunction === "undefined") {
                throw new Error('Attempting to parse an unsupported transform function "' + token.name + '"');
              }
              return transformFunction(token.values);
            }
            return null;
          }
        };
        var matrix = function(args) {
          var values = args.filter(function(arg) {
            return arg.type === 17;
          }).map(function(arg) {
            return arg.number;
          });
          return values.length === 6 ? values : null;
        };
        var matrix3d = function(args) {
          var values = args.filter(function(arg) {
            return arg.type === 17;
          }).map(function(arg) {
            return arg.number;
          });
          var a1 = values[0], b1 = values[1];
          values[2];
          values[3];
          var a22 = values[4], b22 = values[5];
          values[6];
          values[7];
          values[8];
          values[9];
          values[10];
          values[11];
          var a4 = values[12], b4 = values[13];
          values[14];
          values[15];
          return values.length === 16 ? [a1, b1, a22, b22, a4, b4] : null;
        };
        var SUPPORTED_TRANSFORM_FUNCTIONS = {
          matrix,
          matrix3d
        };
        var DEFAULT_VALUE = {
          type: 16,
          number: 50,
          flags: FLAG_INTEGER
        };
        var DEFAULT = [DEFAULT_VALUE, DEFAULT_VALUE];
        var transformOrigin = {
          name: "transform-origin",
          initialValue: "50% 50%",
          prefix: true,
          type: 1,
          parse: function(_context, tokens) {
            var origins = tokens.filter(isLengthPercentage);
            if (origins.length !== 2) {
              return DEFAULT;
            }
            return [origins[0], origins[1]];
          }
        };
        var visibility = {
          name: "visible",
          initialValue: "none",
          prefix: false,
          type: 2,
          parse: function(_context, visibility2) {
            switch (visibility2) {
              case "hidden":
                return 1;
              case "collapse":
                return 2;
              case "visible":
              default:
                return 0;
            }
          }
        };
        var WORD_BREAK;
        (function(WORD_BREAK2) {
          WORD_BREAK2["NORMAL"] = "normal";
          WORD_BREAK2["BREAK_ALL"] = "break-all";
          WORD_BREAK2["KEEP_ALL"] = "keep-all";
        })(WORD_BREAK || (WORD_BREAK = {}));
        var wordBreak = {
          name: "word-break",
          initialValue: "normal",
          prefix: false,
          type: 2,
          parse: function(_context, wordBreak2) {
            switch (wordBreak2) {
              case "break-all":
                return WORD_BREAK.BREAK_ALL;
              case "keep-all":
                return WORD_BREAK.KEEP_ALL;
              case "normal":
              default:
                return WORD_BREAK.NORMAL;
            }
          }
        };
        var zIndex = {
          name: "z-index",
          initialValue: "auto",
          prefix: false,
          type: 0,
          parse: function(_context, token) {
            if (token.type === 20) {
              return { auto: true, order: 0 };
            }
            if (isNumberToken(token)) {
              return { auto: false, order: token.number };
            }
            throw new Error("Invalid z-index number parsed");
          }
        };
        var time = {
          name: "time",
          parse: function(_context, value) {
            if (value.type === 15) {
              switch (value.unit.toLowerCase()) {
                case "s":
                  return 1e3 * value.number;
                case "ms":
                  return value.number;
              }
            }
            throw new Error("Unsupported time type");
          }
        };
        var opacity = {
          name: "opacity",
          initialValue: "1",
          type: 0,
          prefix: false,
          parse: function(_context, token) {
            if (isNumberToken(token)) {
              return token.number;
            }
            return 1;
          }
        };
        var textDecorationColor = {
          name: "text-decoration-color",
          initialValue: "transparent",
          prefix: false,
          type: 3,
          format: "color"
        };
        var textDecorationLine = {
          name: "text-decoration-line",
          initialValue: "none",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            return tokens.filter(isIdentToken).map(function(token) {
              switch (token.value) {
                case "underline":
                  return 1;
                case "overline":
                  return 2;
                case "line-through":
                  return 3;
                case "none":
                  return 4;
              }
              return 0;
            }).filter(function(line) {
              return line !== 0;
            });
          }
        };
        var fontFamily = {
          name: "font-family",
          initialValue: "",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            var accumulator = [];
            var results = [];
            tokens.forEach(function(token) {
              switch (token.type) {
                case 20:
                case 0:
                  accumulator.push(token.value);
                  break;
                case 17:
                  accumulator.push(token.number.toString());
                  break;
                case 4:
                  results.push(accumulator.join(" "));
                  accumulator.length = 0;
                  break;
              }
            });
            if (accumulator.length) {
              results.push(accumulator.join(" "));
            }
            return results.map(function(result) {
              return result.indexOf(" ") === -1 ? result : "'" + result + "'";
            });
          }
        };
        var fontSize = {
          name: "font-size",
          initialValue: "0",
          prefix: false,
          type: 3,
          format: "length"
        };
        var fontWeight = {
          name: "font-weight",
          initialValue: "normal",
          type: 0,
          prefix: false,
          parse: function(_context, token) {
            if (isNumberToken(token)) {
              return token.number;
            }
            if (isIdentToken(token)) {
              switch (token.value) {
                case "bold":
                  return 700;
                case "normal":
                default:
                  return 400;
              }
            }
            return 400;
          }
        };
        var fontVariant = {
          name: "font-variant",
          initialValue: "none",
          type: 1,
          prefix: false,
          parse: function(_context, tokens) {
            return tokens.filter(isIdentToken).map(function(token) {
              return token.value;
            });
          }
        };
        var fontStyle = {
          name: "font-style",
          initialValue: "normal",
          prefix: false,
          type: 2,
          parse: function(_context, overflow2) {
            switch (overflow2) {
              case "oblique":
                return "oblique";
              case "italic":
                return "italic";
              case "normal":
              default:
                return "normal";
            }
          }
        };
        var contains = function(bit, value) {
          return (bit & value) !== 0;
        };
        var content = {
          name: "content",
          initialValue: "none",
          type: 1,
          prefix: false,
          parse: function(_context, tokens) {
            if (tokens.length === 0) {
              return [];
            }
            var first = tokens[0];
            if (first.type === 20 && first.value === "none") {
              return [];
            }
            return tokens;
          }
        };
        var counterIncrement = {
          name: "counter-increment",
          initialValue: "none",
          prefix: true,
          type: 1,
          parse: function(_context, tokens) {
            if (tokens.length === 0) {
              return null;
            }
            var first = tokens[0];
            if (first.type === 20 && first.value === "none") {
              return null;
            }
            var increments = [];
            var filtered = tokens.filter(nonWhiteSpace);
            for (var i7 = 0; i7 < filtered.length; i7++) {
              var counter = filtered[i7];
              var next = filtered[i7 + 1];
              if (counter.type === 20) {
                var increment = next && isNumberToken(next) ? next.number : 1;
                increments.push({ counter: counter.value, increment });
              }
            }
            return increments;
          }
        };
        var counterReset = {
          name: "counter-reset",
          initialValue: "none",
          prefix: true,
          type: 1,
          parse: function(_context, tokens) {
            if (tokens.length === 0) {
              return [];
            }
            var resets = [];
            var filtered = tokens.filter(nonWhiteSpace);
            for (var i7 = 0; i7 < filtered.length; i7++) {
              var counter = filtered[i7];
              var next = filtered[i7 + 1];
              if (isIdentToken(counter) && counter.value !== "none") {
                var reset = next && isNumberToken(next) ? next.number : 0;
                resets.push({ counter: counter.value, reset });
              }
            }
            return resets;
          }
        };
        var duration = {
          name: "duration",
          initialValue: "0s",
          prefix: false,
          type: 1,
          parse: function(context, tokens) {
            return tokens.filter(isDimensionToken).map(function(token) {
              return time.parse(context, token);
            });
          }
        };
        var quotes = {
          name: "quotes",
          initialValue: "none",
          prefix: true,
          type: 1,
          parse: function(_context, tokens) {
            if (tokens.length === 0) {
              return null;
            }
            var first = tokens[0];
            if (first.type === 20 && first.value === "none") {
              return null;
            }
            var quotes2 = [];
            var filtered = tokens.filter(isStringToken);
            if (filtered.length % 2 !== 0) {
              return null;
            }
            for (var i7 = 0; i7 < filtered.length; i7 += 2) {
              var open_1 = filtered[i7].value;
              var close_1 = filtered[i7 + 1].value;
              quotes2.push({ open: open_1, close: close_1 });
            }
            return quotes2;
          }
        };
        var getQuote = function(quotes2, depth, open) {
          if (!quotes2) {
            return "";
          }
          var quote = quotes2[Math.min(depth, quotes2.length - 1)];
          if (!quote) {
            return "";
          }
          return open ? quote.open : quote.close;
        };
        var boxShadow = {
          name: "box-shadow",
          initialValue: "none",
          type: 1,
          prefix: false,
          parse: function(context, tokens) {
            if (tokens.length === 1 && isIdentWithValue(tokens[0], "none")) {
              return [];
            }
            return parseFunctionArgs(tokens).map(function(values) {
              var shadow = {
                color: 255,
                offsetX: ZERO_LENGTH,
                offsetY: ZERO_LENGTH,
                blur: ZERO_LENGTH,
                spread: ZERO_LENGTH,
                inset: false
              };
              var c4 = 0;
              for (var i7 = 0; i7 < values.length; i7++) {
                var token = values[i7];
                if (isIdentWithValue(token, "inset")) {
                  shadow.inset = true;
                } else if (isLength(token)) {
                  if (c4 === 0) {
                    shadow.offsetX = token;
                  } else if (c4 === 1) {
                    shadow.offsetY = token;
                  } else if (c4 === 2) {
                    shadow.blur = token;
                  } else {
                    shadow.spread = token;
                  }
                  c4++;
                } else {
                  shadow.color = color$1.parse(context, token);
                }
              }
              return shadow;
            });
          }
        };
        var paintOrder = {
          name: "paint-order",
          initialValue: "normal",
          prefix: false,
          type: 1,
          parse: function(_context, tokens) {
            var DEFAULT_VALUE2 = [
              0,
              1,
              2
              /* MARKERS */
            ];
            var layers = [];
            tokens.filter(isIdentToken).forEach(function(token) {
              switch (token.value) {
                case "stroke":
                  layers.push(
                    1
                    /* STROKE */
                  );
                  break;
                case "fill":
                  layers.push(
                    0
                    /* FILL */
                  );
                  break;
                case "markers":
                  layers.push(
                    2
                    /* MARKERS */
                  );
                  break;
              }
            });
            DEFAULT_VALUE2.forEach(function(value) {
              if (layers.indexOf(value) === -1) {
                layers.push(value);
              }
            });
            return layers;
          }
        };
        var webkitTextStrokeColor = {
          name: "-webkit-text-stroke-color",
          initialValue: "currentcolor",
          prefix: false,
          type: 3,
          format: "color"
        };
        var webkitTextStrokeWidth = {
          name: "-webkit-text-stroke-width",
          initialValue: "0",
          type: 0,
          prefix: false,
          parse: function(_context, token) {
            if (isDimensionToken(token)) {
              return token.number;
            }
            return 0;
          }
        };
        var CSSParsedDeclaration = (
          /** @class */
          (function() {
            function CSSParsedDeclaration2(context, declaration) {
              var _a, _b;
              this.animationDuration = parse(context, duration, declaration.animationDuration);
              this.backgroundClip = parse(context, backgroundClip, declaration.backgroundClip);
              this.backgroundColor = parse(context, backgroundColor, declaration.backgroundColor);
              this.backgroundImage = parse(context, backgroundImage, declaration.backgroundImage);
              this.backgroundOrigin = parse(context, backgroundOrigin, declaration.backgroundOrigin);
              this.backgroundPosition = parse(context, backgroundPosition, declaration.backgroundPosition);
              this.backgroundRepeat = parse(context, backgroundRepeat, declaration.backgroundRepeat);
              this.backgroundSize = parse(context, backgroundSize, declaration.backgroundSize);
              this.borderTopColor = parse(context, borderTopColor, declaration.borderTopColor);
              this.borderRightColor = parse(context, borderRightColor, declaration.borderRightColor);
              this.borderBottomColor = parse(context, borderBottomColor, declaration.borderBottomColor);
              this.borderLeftColor = parse(context, borderLeftColor, declaration.borderLeftColor);
              this.borderTopLeftRadius = parse(context, borderTopLeftRadius, declaration.borderTopLeftRadius);
              this.borderTopRightRadius = parse(context, borderTopRightRadius, declaration.borderTopRightRadius);
              this.borderBottomRightRadius = parse(context, borderBottomRightRadius, declaration.borderBottomRightRadius);
              this.borderBottomLeftRadius = parse(context, borderBottomLeftRadius, declaration.borderBottomLeftRadius);
              this.borderTopStyle = parse(context, borderTopStyle, declaration.borderTopStyle);
              this.borderRightStyle = parse(context, borderRightStyle, declaration.borderRightStyle);
              this.borderBottomStyle = parse(context, borderBottomStyle, declaration.borderBottomStyle);
              this.borderLeftStyle = parse(context, borderLeftStyle, declaration.borderLeftStyle);
              this.borderTopWidth = parse(context, borderTopWidth, declaration.borderTopWidth);
              this.borderRightWidth = parse(context, borderRightWidth, declaration.borderRightWidth);
              this.borderBottomWidth = parse(context, borderBottomWidth, declaration.borderBottomWidth);
              this.borderLeftWidth = parse(context, borderLeftWidth, declaration.borderLeftWidth);
              this.boxShadow = parse(context, boxShadow, declaration.boxShadow);
              this.color = parse(context, color, declaration.color);
              this.direction = parse(context, direction, declaration.direction);
              this.display = parse(context, display, declaration.display);
              this.float = parse(context, float, declaration.cssFloat);
              this.fontFamily = parse(context, fontFamily, declaration.fontFamily);
              this.fontSize = parse(context, fontSize, declaration.fontSize);
              this.fontStyle = parse(context, fontStyle, declaration.fontStyle);
              this.fontVariant = parse(context, fontVariant, declaration.fontVariant);
              this.fontWeight = parse(context, fontWeight, declaration.fontWeight);
              this.letterSpacing = parse(context, letterSpacing, declaration.letterSpacing);
              this.lineBreak = parse(context, lineBreak, declaration.lineBreak);
              this.lineHeight = parse(context, lineHeight, declaration.lineHeight);
              this.listStyleImage = parse(context, listStyleImage, declaration.listStyleImage);
              this.listStylePosition = parse(context, listStylePosition, declaration.listStylePosition);
              this.listStyleType = parse(context, listStyleType, declaration.listStyleType);
              this.marginTop = parse(context, marginTop, declaration.marginTop);
              this.marginRight = parse(context, marginRight, declaration.marginRight);
              this.marginBottom = parse(context, marginBottom, declaration.marginBottom);
              this.marginLeft = parse(context, marginLeft, declaration.marginLeft);
              this.opacity = parse(context, opacity, declaration.opacity);
              var overflowTuple = parse(context, overflow, declaration.overflow);
              this.overflowX = overflowTuple[0];
              this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
              this.overflowWrap = parse(context, overflowWrap, declaration.overflowWrap);
              this.paddingTop = parse(context, paddingTop, declaration.paddingTop);
              this.paddingRight = parse(context, paddingRight, declaration.paddingRight);
              this.paddingBottom = parse(context, paddingBottom, declaration.paddingBottom);
              this.paddingLeft = parse(context, paddingLeft, declaration.paddingLeft);
              this.paintOrder = parse(context, paintOrder, declaration.paintOrder);
              this.position = parse(context, position, declaration.position);
              this.textAlign = parse(context, textAlign, declaration.textAlign);
              this.textDecorationColor = parse(context, textDecorationColor, (_a = declaration.textDecorationColor) !== null && _a !== void 0 ? _a : declaration.color);
              this.textDecorationLine = parse(context, textDecorationLine, (_b = declaration.textDecorationLine) !== null && _b !== void 0 ? _b : declaration.textDecoration);
              this.textShadow = parse(context, textShadow, declaration.textShadow);
              this.textTransform = parse(context, textTransform, declaration.textTransform);
              this.transform = parse(context, transform$1, declaration.transform);
              this.transformOrigin = parse(context, transformOrigin, declaration.transformOrigin);
              this.visibility = parse(context, visibility, declaration.visibility);
              this.webkitTextStrokeColor = parse(context, webkitTextStrokeColor, declaration.webkitTextStrokeColor);
              this.webkitTextStrokeWidth = parse(context, webkitTextStrokeWidth, declaration.webkitTextStrokeWidth);
              this.wordBreak = parse(context, wordBreak, declaration.wordBreak);
              this.zIndex = parse(context, zIndex, declaration.zIndex);
            }
            CSSParsedDeclaration2.prototype.isVisible = function() {
              return this.display > 0 && this.opacity > 0 && this.visibility === 0;
            };
            CSSParsedDeclaration2.prototype.isTransparent = function() {
              return isTransparent(this.backgroundColor);
            };
            CSSParsedDeclaration2.prototype.isTransformed = function() {
              return this.transform !== null;
            };
            CSSParsedDeclaration2.prototype.isPositioned = function() {
              return this.position !== 0;
            };
            CSSParsedDeclaration2.prototype.isPositionedWithZIndex = function() {
              return this.isPositioned() && !this.zIndex.auto;
            };
            CSSParsedDeclaration2.prototype.isFloating = function() {
              return this.float !== 0;
            };
            CSSParsedDeclaration2.prototype.isInlineLevel = function() {
              return contains(
                this.display,
                4
                /* INLINE */
              ) || contains(
                this.display,
                33554432
                /* INLINE_BLOCK */
              ) || contains(
                this.display,
                268435456
                /* INLINE_FLEX */
              ) || contains(
                this.display,
                536870912
                /* INLINE_GRID */
              ) || contains(
                this.display,
                67108864
                /* INLINE_LIST_ITEM */
              ) || contains(
                this.display,
                134217728
                /* INLINE_TABLE */
              );
            };
            return CSSParsedDeclaration2;
          })()
        );
        var CSSParsedPseudoDeclaration = (
          /** @class */
          /* @__PURE__ */ (function() {
            function CSSParsedPseudoDeclaration2(context, declaration) {
              this.content = parse(context, content, declaration.content);
              this.quotes = parse(context, quotes, declaration.quotes);
            }
            return CSSParsedPseudoDeclaration2;
          })()
        );
        var CSSParsedCounterDeclaration = (
          /** @class */
          /* @__PURE__ */ (function() {
            function CSSParsedCounterDeclaration2(context, declaration) {
              this.counterIncrement = parse(context, counterIncrement, declaration.counterIncrement);
              this.counterReset = parse(context, counterReset, declaration.counterReset);
            }
            return CSSParsedCounterDeclaration2;
          })()
        );
        var parse = function(context, descriptor, style) {
          var tokenizer = new Tokenizer();
          var value = style !== null && typeof style !== "undefined" ? style.toString() : descriptor.initialValue;
          tokenizer.write(value);
          var parser = new Parser(tokenizer.read());
          switch (descriptor.type) {
            case 2:
              var token = parser.parseComponentValue();
              return descriptor.parse(context, isIdentToken(token) ? token.value : descriptor.initialValue);
            case 0:
              return descriptor.parse(context, parser.parseComponentValue());
            case 1:
              return descriptor.parse(context, parser.parseComponentValues());
            case 4:
              return parser.parseComponentValue();
            case 3:
              switch (descriptor.format) {
                case "angle":
                  return angle.parse(context, parser.parseComponentValue());
                case "color":
                  return color$1.parse(context, parser.parseComponentValue());
                case "image":
                  return image.parse(context, parser.parseComponentValue());
                case "length":
                  var length_1 = parser.parseComponentValue();
                  return isLength(length_1) ? length_1 : ZERO_LENGTH;
                case "length-percentage":
                  var value_1 = parser.parseComponentValue();
                  return isLengthPercentage(value_1) ? value_1 : ZERO_LENGTH;
                case "time":
                  return time.parse(context, parser.parseComponentValue());
              }
              break;
          }
        };
        var elementDebuggerAttribute = "data-html2canvas-debug";
        var getElementDebugType = function(element) {
          var attribute = element.getAttribute(elementDebuggerAttribute);
          switch (attribute) {
            case "all":
              return 1;
            case "clone":
              return 2;
            case "parse":
              return 3;
            case "render":
              return 4;
            default:
              return 0;
          }
        };
        var isDebugging = function(element, type) {
          var elementType = getElementDebugType(element);
          return elementType === 1 || type === elementType;
        };
        var ElementContainer = (
          /** @class */
          /* @__PURE__ */ (function() {
            function ElementContainer2(context, element) {
              this.context = context;
              this.textNodes = [];
              this.elements = [];
              this.flags = 0;
              if (isDebugging(
                element,
                3
                /* PARSE */
              )) {
                debugger;
              }
              this.styles = new CSSParsedDeclaration(context, window.getComputedStyle(element, null));
              if (isHTMLElementNode(element)) {
                if (this.styles.animationDuration.some(function(duration2) {
                  return duration2 > 0;
                })) {
                  element.style.animationDuration = "0s";
                }
                if (this.styles.transform !== null) {
                  element.style.transform = "none";
                }
              }
              this.bounds = parseBounds(this.context, element);
              if (isDebugging(
                element,
                4
                /* RENDER */
              )) {
                this.flags |= 16;
              }
            }
            return ElementContainer2;
          })()
        );
        var base64 = "AAAAAAAAAAAAEA4AGBkAAFAaAAACAAAAAAAIABAAGAAwADgACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAAQABIAEQATAAIABAACAAQAAgAEAAIABAAVABcAAgAEAAIABAACAAQAGAAaABwAHgAgACIAI4AlgAIABAAmwCjAKgAsAC2AL4AvQDFAMoA0gBPAVYBWgEIAAgACACMANoAYgFkAWwBdAF8AX0BhQGNAZUBlgGeAaMBlQGWAasBswF8AbsBwwF0AcsBYwHTAQgA2wG/AOMBdAF8AekB8QF0AfkB+wHiAHQBfAEIAAMC5gQIAAsCEgIIAAgAFgIeAggAIgIpAggAMQI5AkACygEIAAgASAJQAlgCYAIIAAgACAAKBQoFCgUTBRMFGQUrBSsFCAAIAAgACAAIAAgACAAIAAgACABdAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABoAmgCrwGvAQgAbgJ2AggAHgEIAAgACADnAXsCCAAIAAgAgwIIAAgACAAIAAgACACKAggAkQKZAggAPADJAAgAoQKkAqwCsgK6AsICCADJAggA0AIIAAgACAAIANYC3gIIAAgACAAIAAgACABAAOYCCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAkASoB+QIEAAgACAA8AEMCCABCBQgACABJBVAFCAAIAAgACAAIAAgACAAIAAgACABTBVoFCAAIAFoFCABfBWUFCAAIAAgACAAIAAgAbQUIAAgACAAIAAgACABzBXsFfQWFBYoFigWKBZEFigWKBYoFmAWfBaYFrgWxBbkFCAAIAAgACAAIAAgACAAIAAgACAAIAMEFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAMgFCADQBQgACAAIAAgACAAIAAgACAAIAAgACAAIAO4CCAAIAAgAiQAIAAgACABAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAD0AggACAD8AggACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIANYFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAMDvwAIAAgAJAIIAAgACAAIAAgACAAIAAgACwMTAwgACAB9BOsEGwMjAwgAKwMyAwsFYgE3A/MEPwMIAEUDTQNRAwgAWQOsAGEDCAAIAAgACAAIAAgACABpAzQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFIQUoBSwFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABtAwgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABMAEwACAAIAAgACAAIABgACAAIAAgACAC/AAgACAAyAQgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACAAIAAwAAgACAAIAAgACAAIAAgACAAIAAAARABIAAgACAAIABQASAAIAAgAIABwAEAAjgCIABsAqAC2AL0AigDQAtwC+IJIQqVAZUBWQqVAZUBlQGVAZUBlQGrC5UBlQGVAZUBlQGVAZUBlQGVAXsKlQGVAbAK6wsrDGUMpQzlDJUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAfAKAAuZA64AtwCJALoC6ADwAAgAuACgA/oEpgO6AqsD+AAIAAgAswMIAAgACAAIAIkAuwP5AfsBwwPLAwgACAAIAAgACADRA9kDCAAIAOED6QMIAAgACAAIAAgACADuA/YDCAAIAP4DyQAIAAgABgQIAAgAXQAOBAgACAAIAAgACAAIABMECAAIAAgACAAIAAgACAD8AAQBCAAIAAgAGgQiBCoECAExBAgAEAEIAAgACAAIAAgACAAIAAgACAAIAAgACAA4BAgACABABEYECAAIAAgATAQYAQgAVAQIAAgACAAIAAgACAAIAAgACAAIAFoECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAOQEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAB+BAcACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAEABhgSMBAgACAAIAAgAlAQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAwAEAAQABAADAAMAAwADAAQABAAEAAQABAAEAAQABHATAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAdQMIAAgACAAIAAgACAAIAMkACAAIAAgAfQMIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACFA4kDCAAIAAgACAAIAOcBCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAIcDCAAIAAgACAAIAAgACAAIAAgACAAIAJEDCAAIAAgACADFAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABgBAgAZgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAbAQCBXIECAAIAHkECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABAAJwEQACjBKoEsgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAC6BMIECAAIAAgACAAIAAgACABmBAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAxwQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAGYECAAIAAgAzgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBd0FXwUIAOIF6gXxBYoF3gT5BQAGCAaKBYoFigWKBYoFigWKBYoFigWKBYoFigXWBIoFigWKBYoFigWKBYoFigWKBYsFEAaKBYoFigWKBYoFigWKBRQGCACKBYoFigWKBQgACAAIANEECAAIABgGigUgBggAJgYIAC4GMwaKBYoF0wQ3Bj4GigWKBYoFigWKBYoFigWKBYoFigWKBYoFigUIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWLBf///////wQABAAEAAQABAAEAAQABAAEAAQAAwAEAAQAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAQADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUAAAAFAAUAAAAFAAUAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAQAAAAUABQAFAAUABQAFAAAAAAAFAAUAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAFAAUAAQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAAABwAHAAcAAAAHAAcABwAFAAEAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAcABwAFAAUAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAQABAAAAAAAAAAAAAAAFAAUABQAFAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAHAAcAAAAHAAcAAAAAAAUABQAHAAUAAQAHAAEABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwABAAUABQAFAAUAAAAAAAAAAAAAAAEAAQABAAEAAQABAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABQANAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAABQAHAAUABQAFAAAAAAAAAAcABQAFAAUABQAFAAQABAAEAAQABAAEAAQABAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUAAAAFAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAUAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAcABwAFAAcABwAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUABwAHAAUABQAFAAUAAAAAAAcABwAAAAAABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAAAAAAAAAAABQAFAAAAAAAFAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAFAAUABQAFAAUAAAAFAAUABwAAAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABwAFAAUABQAFAAAAAAAHAAcAAAAAAAcABwAFAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAAAAAAAAAHAAcABwAAAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAUABQAFAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAHAAcABQAHAAcAAAAFAAcABwAAAAcABwAFAAUAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAFAAcABwAFAAUABQAAAAUAAAAHAAcABwAHAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAHAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUAAAAFAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAUAAAAFAAUAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABwAFAAUABQAFAAUABQAAAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABQAFAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAFAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAHAAUABQAFAAUABQAFAAUABwAHAAcABwAHAAcABwAHAAUABwAHAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABwAHAAcABwAFAAUABwAHAAcAAAAAAAAAAAAHAAcABQAHAAcABwAHAAcABwAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAUABQAFAAUABQAFAAUAAAAFAAAABQAAAAAABQAFAAUABQAFAAUABQAFAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAUABQAFAAUABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABwAFAAcABwAHAAcABwAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAUABQAFAAUABwAHAAUABQAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABQAFAAcABwAHAAUABwAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAcABQAFAAUABQAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAAAAAABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAAAAAAAAAFAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAUABQAHAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAFAAUABQAFAAcABwAFAAUABwAHAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAcABwAFAAUABwAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABQAAAAAABQAFAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAcABwAAAAAAAAAAAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAcABwAFAAcABwAAAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAFAAUABQAAAAUABQAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABwAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAHAAcABQAHAAUABQAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAAABwAHAAAAAAAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAFAAUABwAFAAcABwAFAAcABQAFAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAAAAAABwAHAAcABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAFAAcABwAFAAUABQAFAAUABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAUABQAFAAcABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABQAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAAAAAAFAAUABwAHAAcABwAFAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAHAAUABQAFAAUABQAFAAUABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAABQAAAAUABQAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAHAAcAAAAFAAUAAAAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABQAFAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAABQAFAAUABQAFAAUABQAAAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAFAAUABQAFAAUADgAOAA4ADgAOAA4ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAMAAwADAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAAAAAAAAAAAAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAAAAAAAAAAAAsADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwACwAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAADgAOAA4AAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAAAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4AAAAOAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAAAAAAAAAAAA4AAAAOAAAAAAAAAAAADgAOAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAA=";
        var chars$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var lookup$1 = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
        for (var i$1 = 0; i$1 < chars$1.length; i$1++) {
          lookup$1[chars$1.charCodeAt(i$1)] = i$1;
        }
        var decode = function(base642) {
          var bufferLength = base642.length * 0.75, len = base642.length, i7, p3 = 0, encoded1, encoded2, encoded3, encoded4;
          if (base642[base642.length - 1] === "=") {
            bufferLength--;
            if (base642[base642.length - 2] === "=") {
              bufferLength--;
            }
          }
          var buffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined" && typeof Uint8Array.prototype.slice !== "undefined" ? new ArrayBuffer(bufferLength) : new Array(bufferLength);
          var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
          for (i7 = 0; i7 < len; i7 += 4) {
            encoded1 = lookup$1[base642.charCodeAt(i7)];
            encoded2 = lookup$1[base642.charCodeAt(i7 + 1)];
            encoded3 = lookup$1[base642.charCodeAt(i7 + 2)];
            encoded4 = lookup$1[base642.charCodeAt(i7 + 3)];
            bytes[p3++] = encoded1 << 2 | encoded2 >> 4;
            bytes[p3++] = (encoded2 & 15) << 4 | encoded3 >> 2;
            bytes[p3++] = (encoded3 & 3) << 6 | encoded4 & 63;
          }
          return buffer;
        };
        var polyUint16Array = function(buffer) {
          var length = buffer.length;
          var bytes = [];
          for (var i7 = 0; i7 < length; i7 += 2) {
            bytes.push(buffer[i7 + 1] << 8 | buffer[i7]);
          }
          return bytes;
        };
        var polyUint32Array = function(buffer) {
          var length = buffer.length;
          var bytes = [];
          for (var i7 = 0; i7 < length; i7 += 4) {
            bytes.push(buffer[i7 + 3] << 24 | buffer[i7 + 2] << 16 | buffer[i7 + 1] << 8 | buffer[i7]);
          }
          return bytes;
        };
        var UTRIE2_SHIFT_2 = 5;
        var UTRIE2_SHIFT_1 = 6 + 5;
        var UTRIE2_INDEX_SHIFT = 2;
        var UTRIE2_SHIFT_1_2 = UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2;
        var UTRIE2_LSCP_INDEX_2_OFFSET = 65536 >> UTRIE2_SHIFT_2;
        var UTRIE2_DATA_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_2;
        var UTRIE2_DATA_MASK = UTRIE2_DATA_BLOCK_LENGTH - 1;
        var UTRIE2_LSCP_INDEX_2_LENGTH = 1024 >> UTRIE2_SHIFT_2;
        var UTRIE2_INDEX_2_BMP_LENGTH = UTRIE2_LSCP_INDEX_2_OFFSET + UTRIE2_LSCP_INDEX_2_LENGTH;
        var UTRIE2_UTF8_2B_INDEX_2_OFFSET = UTRIE2_INDEX_2_BMP_LENGTH;
        var UTRIE2_UTF8_2B_INDEX_2_LENGTH = 2048 >> 6;
        var UTRIE2_INDEX_1_OFFSET = UTRIE2_UTF8_2B_INDEX_2_OFFSET + UTRIE2_UTF8_2B_INDEX_2_LENGTH;
        var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 65536 >> UTRIE2_SHIFT_1;
        var UTRIE2_INDEX_2_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_1_2;
        var UTRIE2_INDEX_2_MASK = UTRIE2_INDEX_2_BLOCK_LENGTH - 1;
        var slice16 = function(view, start, end) {
          if (view.slice) {
            return view.slice(start, end);
          }
          return new Uint16Array(Array.prototype.slice.call(view, start, end));
        };
        var slice32 = function(view, start, end) {
          if (view.slice) {
            return view.slice(start, end);
          }
          return new Uint32Array(Array.prototype.slice.call(view, start, end));
        };
        var createTrieFromBase64 = function(base642, _byteLength) {
          var buffer = decode(base642);
          var view32 = Array.isArray(buffer) ? polyUint32Array(buffer) : new Uint32Array(buffer);
          var view16 = Array.isArray(buffer) ? polyUint16Array(buffer) : new Uint16Array(buffer);
          var headerLength = 24;
          var index = slice16(view16, headerLength / 2, view32[4] / 2);
          var data = view32[5] === 2 ? slice16(view16, (headerLength + view32[4]) / 2) : slice32(view32, Math.ceil((headerLength + view32[4]) / 4));
          return new Trie(view32[0], view32[1], view32[2], view32[3], index, data);
        };
        var Trie = (
          /** @class */
          (function() {
            function Trie2(initialValue, errorValue, highStart, highValueIndex, index, data) {
              this.initialValue = initialValue;
              this.errorValue = errorValue;
              this.highStart = highStart;
              this.highValueIndex = highValueIndex;
              this.index = index;
              this.data = data;
            }
            Trie2.prototype.get = function(codePoint) {
              var ix;
              if (codePoint >= 0) {
                if (codePoint < 55296 || codePoint > 56319 && codePoint <= 65535) {
                  ix = this.index[codePoint >> UTRIE2_SHIFT_2];
                  ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                  return this.data[ix];
                }
                if (codePoint <= 65535) {
                  ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET + (codePoint - 55296 >> UTRIE2_SHIFT_2)];
                  ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                  return this.data[ix];
                }
                if (codePoint < this.highStart) {
                  ix = UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> UTRIE2_SHIFT_1);
                  ix = this.index[ix];
                  ix += codePoint >> UTRIE2_SHIFT_2 & UTRIE2_INDEX_2_MASK;
                  ix = this.index[ix];
                  ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                  return this.data[ix];
                }
                if (codePoint <= 1114111) {
                  return this.data[this.highValueIndex];
                }
              }
              return this.errorValue;
            };
            return Trie2;
          })()
        );
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
        for (var i6 = 0; i6 < chars.length; i6++) {
          lookup[chars.charCodeAt(i6)] = i6;
        }
        var Prepend = 1;
        var CR = 2;
        var LF = 3;
        var Control = 4;
        var Extend = 5;
        var SpacingMark = 7;
        var L2 = 8;
        var V2 = 9;
        var T2 = 10;
        var LV = 11;
        var LVT = 12;
        var ZWJ = 13;
        var Extended_Pictographic = 14;
        var RI = 15;
        var toCodePoints = function(str) {
          var codePoints = [];
          var i7 = 0;
          var length = str.length;
          while (i7 < length) {
            var value = str.charCodeAt(i7++);
            if (value >= 55296 && value <= 56319 && i7 < length) {
              var extra = str.charCodeAt(i7++);
              if ((extra & 64512) === 56320) {
                codePoints.push(((value & 1023) << 10) + (extra & 1023) + 65536);
              } else {
                codePoints.push(value);
                i7--;
              }
            } else {
              codePoints.push(value);
            }
          }
          return codePoints;
        };
        var fromCodePoint = function() {
          var codePoints = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            codePoints[_i] = arguments[_i];
          }
          if (String.fromCodePoint) {
            return String.fromCodePoint.apply(String, codePoints);
          }
          var length = codePoints.length;
          if (!length) {
            return "";
          }
          var codeUnits = [];
          var index = -1;
          var result = "";
          while (++index < length) {
            var codePoint = codePoints[index];
            if (codePoint <= 65535) {
              codeUnits.push(codePoint);
            } else {
              codePoint -= 65536;
              codeUnits.push((codePoint >> 10) + 55296, codePoint % 1024 + 56320);
            }
            if (index + 1 === length || codeUnits.length > 16384) {
              result += String.fromCharCode.apply(String, codeUnits);
              codeUnits.length = 0;
            }
          }
          return result;
        };
        var UnicodeTrie = createTrieFromBase64(base64);
        var BREAK_NOT_ALLOWED = "\xD7";
        var BREAK_ALLOWED = "\xF7";
        var codePointToClass = function(codePoint) {
          return UnicodeTrie.get(codePoint);
        };
        var _graphemeBreakAtIndex = function(_codePoints, classTypes, index) {
          var prevIndex = index - 2;
          var prev = classTypes[prevIndex];
          var current = classTypes[index - 1];
          var next = classTypes[index];
          if (current === CR && next === LF) {
            return BREAK_NOT_ALLOWED;
          }
          if (current === CR || current === LF || current === Control) {
            return BREAK_ALLOWED;
          }
          if (next === CR || next === LF || next === Control) {
            return BREAK_ALLOWED;
          }
          if (current === L2 && [L2, V2, LV, LVT].indexOf(next) !== -1) {
            return BREAK_NOT_ALLOWED;
          }
          if ((current === LV || current === V2) && (next === V2 || next === T2)) {
            return BREAK_NOT_ALLOWED;
          }
          if ((current === LVT || current === T2) && next === T2) {
            return BREAK_NOT_ALLOWED;
          }
          if (next === ZWJ || next === Extend) {
            return BREAK_NOT_ALLOWED;
          }
          if (next === SpacingMark) {
            return BREAK_NOT_ALLOWED;
          }
          if (current === Prepend) {
            return BREAK_NOT_ALLOWED;
          }
          if (current === ZWJ && next === Extended_Pictographic) {
            while (prev === Extend) {
              prev = classTypes[--prevIndex];
            }
            if (prev === Extended_Pictographic) {
              return BREAK_NOT_ALLOWED;
            }
          }
          if (current === RI && next === RI) {
            var countRI = 0;
            while (prev === RI) {
              countRI++;
              prev = classTypes[--prevIndex];
            }
            if (countRI % 2 === 0) {
              return BREAK_NOT_ALLOWED;
            }
          }
          return BREAK_ALLOWED;
        };
        var GraphemeBreaker = function(str) {
          var codePoints = toCodePoints(str);
          var length = codePoints.length;
          var index = 0;
          var lastEnd = 0;
          var classTypes = codePoints.map(codePointToClass);
          return {
            next: function() {
              if (index >= length) {
                return { done: true, value: null };
              }
              var graphemeBreak = BREAK_NOT_ALLOWED;
              while (index < length && (graphemeBreak = _graphemeBreakAtIndex(codePoints, classTypes, ++index)) === BREAK_NOT_ALLOWED) {
              }
              if (graphemeBreak !== BREAK_NOT_ALLOWED || index === length) {
                var value = fromCodePoint.apply(null, codePoints.slice(lastEnd, index));
                lastEnd = index;
                return { value, done: false };
              }
              return { done: true, value: null };
            }
          };
        };
        var splitGraphemes = function(str) {
          var breaker = GraphemeBreaker(str);
          var graphemes = [];
          var bk;
          while (!(bk = breaker.next()).done) {
            if (bk.value) {
              graphemes.push(bk.value.slice());
            }
          }
          return graphemes;
        };
        var testRangeBounds = function(document2) {
          var TEST_HEIGHT = 123;
          if (document2.createRange) {
            var range = document2.createRange();
            if (range.getBoundingClientRect) {
              var testElement = document2.createElement("boundtest");
              testElement.style.height = TEST_HEIGHT + "px";
              testElement.style.display = "block";
              document2.body.appendChild(testElement);
              range.selectNode(testElement);
              var rangeBounds = range.getBoundingClientRect();
              var rangeHeight = Math.round(rangeBounds.height);
              document2.body.removeChild(testElement);
              if (rangeHeight === TEST_HEIGHT) {
                return true;
              }
            }
          }
          return false;
        };
        var testIOSLineBreak = function(document2) {
          var testElement = document2.createElement("boundtest");
          testElement.style.width = "50px";
          testElement.style.display = "block";
          testElement.style.fontSize = "12px";
          testElement.style.letterSpacing = "0px";
          testElement.style.wordSpacing = "0px";
          document2.body.appendChild(testElement);
          var range = document2.createRange();
          testElement.innerHTML = typeof "".repeat === "function" ? "&#128104;".repeat(10) : "";
          var node = testElement.firstChild;
          var textList = toCodePoints$1(node.data).map(function(i7) {
            return fromCodePoint$1(i7);
          });
          var offset = 0;
          var prev = {};
          var supports = textList.every(function(text, i7) {
            range.setStart(node, offset);
            range.setEnd(node, offset + text.length);
            var rect = range.getBoundingClientRect();
            offset += text.length;
            var boundAhead = rect.x > prev.x || rect.y > prev.y;
            prev = rect;
            if (i7 === 0) {
              return true;
            }
            return boundAhead;
          });
          document2.body.removeChild(testElement);
          return supports;
        };
        var testCORS = function() {
          return typeof new Image().crossOrigin !== "undefined";
        };
        var testResponseType = function() {
          return typeof new XMLHttpRequest().responseType === "string";
        };
        var testSVG = function(document2) {
          var img = new Image();
          var canvas = document2.createElement("canvas");
          var ctx = canvas.getContext("2d");
          if (!ctx) {
            return false;
          }
          img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
          try {
            ctx.drawImage(img, 0, 0);
            canvas.toDataURL();
          } catch (e8) {
            return false;
          }
          return true;
        };
        var isGreenPixel = function(data) {
          return data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
        };
        var testForeignObject = function(document2) {
          var canvas = document2.createElement("canvas");
          var size = 100;
          canvas.width = size;
          canvas.height = size;
          var ctx = canvas.getContext("2d");
          if (!ctx) {
            return Promise.reject(false);
          }
          ctx.fillStyle = "rgb(0, 255, 0)";
          ctx.fillRect(0, 0, size, size);
          var img = new Image();
          var greenImageSrc = canvas.toDataURL();
          img.src = greenImageSrc;
          var svg = createForeignObjectSVG(size, size, 0, 0, img);
          ctx.fillStyle = "red";
          ctx.fillRect(0, 0, size, size);
          return loadSerializedSVG$1(svg).then(function(img2) {
            ctx.drawImage(img2, 0, 0);
            var data = ctx.getImageData(0, 0, size, size).data;
            ctx.fillStyle = "red";
            ctx.fillRect(0, 0, size, size);
            var node = document2.createElement("div");
            node.style.backgroundImage = "url(" + greenImageSrc + ")";
            node.style.height = size + "px";
            return isGreenPixel(data) ? loadSerializedSVG$1(createForeignObjectSVG(size, size, 0, 0, node)) : Promise.reject(false);
          }).then(function(img2) {
            ctx.drawImage(img2, 0, 0);
            return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
          }).catch(function() {
            return false;
          });
        };
        var createForeignObjectSVG = function(width, height, x2, y3, node) {
          var xmlns = "http://www.w3.org/2000/svg";
          var svg = document.createElementNS(xmlns, "svg");
          var foreignObject = document.createElementNS(xmlns, "foreignObject");
          svg.setAttributeNS(null, "width", width.toString());
          svg.setAttributeNS(null, "height", height.toString());
          foreignObject.setAttributeNS(null, "width", "100%");
          foreignObject.setAttributeNS(null, "height", "100%");
          foreignObject.setAttributeNS(null, "x", x2.toString());
          foreignObject.setAttributeNS(null, "y", y3.toString());
          foreignObject.setAttributeNS(null, "externalResourcesRequired", "true");
          svg.appendChild(foreignObject);
          foreignObject.appendChild(node);
          return svg;
        };
        var loadSerializedSVG$1 = function(svg) {
          return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() {
              return resolve(img);
            };
            img.onerror = reject;
            img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
          });
        };
        var FEATURES = {
          get SUPPORT_RANGE_BOUNDS() {
            var value = testRangeBounds(document);
            Object.defineProperty(FEATURES, "SUPPORT_RANGE_BOUNDS", { value });
            return value;
          },
          get SUPPORT_WORD_BREAKING() {
            var value = FEATURES.SUPPORT_RANGE_BOUNDS && testIOSLineBreak(document);
            Object.defineProperty(FEATURES, "SUPPORT_WORD_BREAKING", { value });
            return value;
          },
          get SUPPORT_SVG_DRAWING() {
            var value = testSVG(document);
            Object.defineProperty(FEATURES, "SUPPORT_SVG_DRAWING", { value });
            return value;
          },
          get SUPPORT_FOREIGNOBJECT_DRAWING() {
            var value = typeof Array.from === "function" && typeof window.fetch === "function" ? testForeignObject(document) : Promise.resolve(false);
            Object.defineProperty(FEATURES, "SUPPORT_FOREIGNOBJECT_DRAWING", { value });
            return value;
          },
          get SUPPORT_CORS_IMAGES() {
            var value = testCORS();
            Object.defineProperty(FEATURES, "SUPPORT_CORS_IMAGES", { value });
            return value;
          },
          get SUPPORT_RESPONSE_TYPE() {
            var value = testResponseType();
            Object.defineProperty(FEATURES, "SUPPORT_RESPONSE_TYPE", { value });
            return value;
          },
          get SUPPORT_CORS_XHR() {
            var value = "withCredentials" in new XMLHttpRequest();
            Object.defineProperty(FEATURES, "SUPPORT_CORS_XHR", { value });
            return value;
          },
          get SUPPORT_NATIVE_TEXT_SEGMENTATION() {
            var value = !!(typeof Intl !== "undefined" && Intl.Segmenter);
            Object.defineProperty(FEATURES, "SUPPORT_NATIVE_TEXT_SEGMENTATION", { value });
            return value;
          }
        };
        var TextBounds = (
          /** @class */
          /* @__PURE__ */ (function() {
            function TextBounds2(text, bounds) {
              this.text = text;
              this.bounds = bounds;
            }
            return TextBounds2;
          })()
        );
        var parseTextBounds = function(context, value, styles3, node) {
          var textList = breakText(value, styles3);
          var textBounds = [];
          var offset = 0;
          textList.forEach(function(text) {
            if (styles3.textDecorationLine.length || text.trim().length > 0) {
              if (FEATURES.SUPPORT_RANGE_BOUNDS) {
                var clientRects = createRange(node, offset, text.length).getClientRects();
                if (clientRects.length > 1) {
                  var subSegments = segmentGraphemes(text);
                  var subOffset_1 = 0;
                  subSegments.forEach(function(subSegment) {
                    textBounds.push(new TextBounds(subSegment, Bounds.fromDOMRectList(context, createRange(node, subOffset_1 + offset, subSegment.length).getClientRects())));
                    subOffset_1 += subSegment.length;
                  });
                } else {
                  textBounds.push(new TextBounds(text, Bounds.fromDOMRectList(context, clientRects)));
                }
              } else {
                var replacementNode = node.splitText(text.length);
                textBounds.push(new TextBounds(text, getWrapperBounds(context, node)));
                node = replacementNode;
              }
            } else if (!FEATURES.SUPPORT_RANGE_BOUNDS) {
              node = node.splitText(text.length);
            }
            offset += text.length;
          });
          return textBounds;
        };
        var getWrapperBounds = function(context, node) {
          var ownerDocument = node.ownerDocument;
          if (ownerDocument) {
            var wrapper = ownerDocument.createElement("html2canvaswrapper");
            wrapper.appendChild(node.cloneNode(true));
            var parentNode = node.parentNode;
            if (parentNode) {
              parentNode.replaceChild(wrapper, node);
              var bounds = parseBounds(context, wrapper);
              if (wrapper.firstChild) {
                parentNode.replaceChild(wrapper.firstChild, wrapper);
              }
              return bounds;
            }
          }
          return Bounds.EMPTY;
        };
        var createRange = function(node, offset, length) {
          var ownerDocument = node.ownerDocument;
          if (!ownerDocument) {
            throw new Error("Node has no owner document");
          }
          var range = ownerDocument.createRange();
          range.setStart(node, offset);
          range.setEnd(node, offset + length);
          return range;
        };
        var segmentGraphemes = function(value) {
          if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
            var segmenter = new Intl.Segmenter(void 0, { granularity: "grapheme" });
            return Array.from(segmenter.segment(value)).map(function(segment) {
              return segment.segment;
            });
          }
          return splitGraphemes(value);
        };
        var segmentWords = function(value, styles3) {
          if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
            var segmenter = new Intl.Segmenter(void 0, {
              granularity: "word"
            });
            return Array.from(segmenter.segment(value)).map(function(segment) {
              return segment.segment;
            });
          }
          return breakWords(value, styles3);
        };
        var breakText = function(value, styles3) {
          return styles3.letterSpacing !== 0 ? segmentGraphemes(value) : segmentWords(value, styles3);
        };
        var wordSeparators = [32, 160, 4961, 65792, 65793, 4153, 4241];
        var breakWords = function(str, styles3) {
          var breaker = LineBreaker(str, {
            lineBreak: styles3.lineBreak,
            wordBreak: styles3.overflowWrap === "break-word" ? "break-word" : styles3.wordBreak
          });
          var words = [];
          var bk;
          var _loop_1 = function() {
            if (bk.value) {
              var value = bk.value.slice();
              var codePoints = toCodePoints$1(value);
              var word_1 = "";
              codePoints.forEach(function(codePoint) {
                if (wordSeparators.indexOf(codePoint) === -1) {
                  word_1 += fromCodePoint$1(codePoint);
                } else {
                  if (word_1.length) {
                    words.push(word_1);
                  }
                  words.push(fromCodePoint$1(codePoint));
                  word_1 = "";
                }
              });
              if (word_1.length) {
                words.push(word_1);
              }
            }
          };
          while (!(bk = breaker.next()).done) {
            _loop_1();
          }
          return words;
        };
        var TextContainer = (
          /** @class */
          /* @__PURE__ */ (function() {
            function TextContainer2(context, node, styles3) {
              this.text = transform(node.data, styles3.textTransform);
              this.textBounds = parseTextBounds(context, this.text, styles3, node);
            }
            return TextContainer2;
          })()
        );
        var transform = function(text, transform2) {
          switch (transform2) {
            case 1:
              return text.toLowerCase();
            case 3:
              return text.replace(CAPITALIZE, capitalize);
            case 2:
              return text.toUpperCase();
            default:
              return text;
          }
        };
        var CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;
        var capitalize = function(m2, p1, p22) {
          if (m2.length > 0) {
            return p1 + p22.toUpperCase();
          }
          return m2;
        };
        var ImageElementContainer = (
          /** @class */
          (function(_super) {
            __extends(ImageElementContainer2, _super);
            function ImageElementContainer2(context, img) {
              var _this = _super.call(this, context, img) || this;
              _this.src = img.currentSrc || img.src;
              _this.intrinsicWidth = img.naturalWidth;
              _this.intrinsicHeight = img.naturalHeight;
              _this.context.cache.addImage(_this.src);
              return _this;
            }
            return ImageElementContainer2;
          })(ElementContainer)
        );
        var CanvasElementContainer = (
          /** @class */
          (function(_super) {
            __extends(CanvasElementContainer2, _super);
            function CanvasElementContainer2(context, canvas) {
              var _this = _super.call(this, context, canvas) || this;
              _this.canvas = canvas;
              _this.intrinsicWidth = canvas.width;
              _this.intrinsicHeight = canvas.height;
              return _this;
            }
            return CanvasElementContainer2;
          })(ElementContainer)
        );
        var SVGElementContainer = (
          /** @class */
          (function(_super) {
            __extends(SVGElementContainer2, _super);
            function SVGElementContainer2(context, img) {
              var _this = _super.call(this, context, img) || this;
              var s4 = new XMLSerializer();
              var bounds = parseBounds(context, img);
              img.setAttribute("width", bounds.width + "px");
              img.setAttribute("height", bounds.height + "px");
              _this.svg = "data:image/svg+xml," + encodeURIComponent(s4.serializeToString(img));
              _this.intrinsicWidth = img.width.baseVal.value;
              _this.intrinsicHeight = img.height.baseVal.value;
              _this.context.cache.addImage(_this.svg);
              return _this;
            }
            return SVGElementContainer2;
          })(ElementContainer)
        );
        var LIElementContainer = (
          /** @class */
          (function(_super) {
            __extends(LIElementContainer2, _super);
            function LIElementContainer2(context, element) {
              var _this = _super.call(this, context, element) || this;
              _this.value = element.value;
              return _this;
            }
            return LIElementContainer2;
          })(ElementContainer)
        );
        var OLElementContainer = (
          /** @class */
          (function(_super) {
            __extends(OLElementContainer2, _super);
            function OLElementContainer2(context, element) {
              var _this = _super.call(this, context, element) || this;
              _this.start = element.start;
              _this.reversed = typeof element.reversed === "boolean" && element.reversed === true;
              return _this;
            }
            return OLElementContainer2;
          })(ElementContainer)
        );
        var CHECKBOX_BORDER_RADIUS = [
          {
            type: 15,
            flags: 0,
            unit: "px",
            number: 3
          }
        ];
        var RADIO_BORDER_RADIUS = [
          {
            type: 16,
            flags: 0,
            number: 50
          }
        ];
        var reformatInputBounds = function(bounds) {
          if (bounds.width > bounds.height) {
            return new Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
          } else if (bounds.width < bounds.height) {
            return new Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
          }
          return bounds;
        };
        var getInputValue = function(node) {
          var value = node.type === PASSWORD ? new Array(node.value.length + 1).join("\u2022") : node.value;
          return value.length === 0 ? node.placeholder || "" : value;
        };
        var CHECKBOX = "checkbox";
        var RADIO = "radio";
        var PASSWORD = "password";
        var INPUT_COLOR = 707406591;
        var InputElementContainer = (
          /** @class */
          (function(_super) {
            __extends(InputElementContainer2, _super);
            function InputElementContainer2(context, input) {
              var _this = _super.call(this, context, input) || this;
              _this.type = input.type.toLowerCase();
              _this.checked = input.checked;
              _this.value = getInputValue(input);
              if (_this.type === CHECKBOX || _this.type === RADIO) {
                _this.styles.backgroundColor = 3739148031;
                _this.styles.borderTopColor = _this.styles.borderRightColor = _this.styles.borderBottomColor = _this.styles.borderLeftColor = 2779096575;
                _this.styles.borderTopWidth = _this.styles.borderRightWidth = _this.styles.borderBottomWidth = _this.styles.borderLeftWidth = 1;
                _this.styles.borderTopStyle = _this.styles.borderRightStyle = _this.styles.borderBottomStyle = _this.styles.borderLeftStyle = 1;
                _this.styles.backgroundClip = [
                  0
                  /* BORDER_BOX */
                ];
                _this.styles.backgroundOrigin = [
                  0
                  /* BORDER_BOX */
                ];
                _this.bounds = reformatInputBounds(_this.bounds);
              }
              switch (_this.type) {
                case CHECKBOX:
                  _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = CHECKBOX_BORDER_RADIUS;
                  break;
                case RADIO:
                  _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = RADIO_BORDER_RADIUS;
                  break;
              }
              return _this;
            }
            return InputElementContainer2;
          })(ElementContainer)
        );
        var SelectElementContainer = (
          /** @class */
          (function(_super) {
            __extends(SelectElementContainer2, _super);
            function SelectElementContainer2(context, element) {
              var _this = _super.call(this, context, element) || this;
              var option = element.options[element.selectedIndex || 0];
              _this.value = option ? option.text || "" : "";
              return _this;
            }
            return SelectElementContainer2;
          })(ElementContainer)
        );
        var TextareaElementContainer = (
          /** @class */
          (function(_super) {
            __extends(TextareaElementContainer2, _super);
            function TextareaElementContainer2(context, element) {
              var _this = _super.call(this, context, element) || this;
              _this.value = element.value;
              return _this;
            }
            return TextareaElementContainer2;
          })(ElementContainer)
        );
        var IFrameElementContainer = (
          /** @class */
          (function(_super) {
            __extends(IFrameElementContainer2, _super);
            function IFrameElementContainer2(context, iframe) {
              var _this = _super.call(this, context, iframe) || this;
              _this.src = iframe.src;
              _this.width = parseInt(iframe.width, 10) || 0;
              _this.height = parseInt(iframe.height, 10) || 0;
              _this.backgroundColor = _this.styles.backgroundColor;
              try {
                if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.documentElement) {
                  _this.tree = parseTree(context, iframe.contentWindow.document.documentElement);
                  var documentBackgroundColor = iframe.contentWindow.document.documentElement ? parseColor(context, getComputedStyle(iframe.contentWindow.document.documentElement).backgroundColor) : COLORS.TRANSPARENT;
                  var bodyBackgroundColor = iframe.contentWindow.document.body ? parseColor(context, getComputedStyle(iframe.contentWindow.document.body).backgroundColor) : COLORS.TRANSPARENT;
                  _this.backgroundColor = isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? _this.styles.backgroundColor : bodyBackgroundColor : documentBackgroundColor;
                }
              } catch (e8) {
              }
              return _this;
            }
            return IFrameElementContainer2;
          })(ElementContainer)
        );
        var LIST_OWNERS = ["OL", "UL", "MENU"];
        var parseNodeTree = function(context, node, parent, root) {
          for (var childNode = node.firstChild, nextNode = void 0; childNode; childNode = nextNode) {
            nextNode = childNode.nextSibling;
            if (isTextNode(childNode) && childNode.data.trim().length > 0) {
              parent.textNodes.push(new TextContainer(context, childNode, parent.styles));
            } else if (isElementNode(childNode)) {
              if (isSlotElement(childNode) && childNode.assignedNodes) {
                childNode.assignedNodes().forEach(function(childNode2) {
                  return parseNodeTree(context, childNode2, parent, root);
                });
              } else {
                var container = createContainer(context, childNode);
                if (container.styles.isVisible()) {
                  if (createsRealStackingContext(childNode, container, root)) {
                    container.flags |= 4;
                  } else if (createsStackingContext(container.styles)) {
                    container.flags |= 2;
                  }
                  if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                    container.flags |= 8;
                  }
                  parent.elements.push(container);
                  childNode.slot;
                  if (childNode.shadowRoot) {
                    parseNodeTree(context, childNode.shadowRoot, container, root);
                  } else if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
                    parseNodeTree(context, childNode, container, root);
                  }
                }
              }
            }
          }
        };
        var createContainer = function(context, element) {
          if (isImageElement(element)) {
            return new ImageElementContainer(context, element);
          }
          if (isCanvasElement(element)) {
            return new CanvasElementContainer(context, element);
          }
          if (isSVGElement(element)) {
            return new SVGElementContainer(context, element);
          }
          if (isLIElement(element)) {
            return new LIElementContainer(context, element);
          }
          if (isOLElement(element)) {
            return new OLElementContainer(context, element);
          }
          if (isInputElement(element)) {
            return new InputElementContainer(context, element);
          }
          if (isSelectElement(element)) {
            return new SelectElementContainer(context, element);
          }
          if (isTextareaElement(element)) {
            return new TextareaElementContainer(context, element);
          }
          if (isIFrameElement(element)) {
            return new IFrameElementContainer(context, element);
          }
          return new ElementContainer(context, element);
        };
        var parseTree = function(context, element) {
          var container = createContainer(context, element);
          container.flags |= 4;
          parseNodeTree(context, element, container, container);
          return container;
        };
        var createsRealStackingContext = function(node, container, root) {
          return container.styles.isPositionedWithZIndex() || container.styles.opacity < 1 || container.styles.isTransformed() || isBodyElement(node) && root.styles.isTransparent();
        };
        var createsStackingContext = function(styles3) {
          return styles3.isPositioned() || styles3.isFloating();
        };
        var isTextNode = function(node) {
          return node.nodeType === Node.TEXT_NODE;
        };
        var isElementNode = function(node) {
          return node.nodeType === Node.ELEMENT_NODE;
        };
        var isHTMLElementNode = function(node) {
          return isElementNode(node) && typeof node.style !== "undefined" && !isSVGElementNode(node);
        };
        var isSVGElementNode = function(element) {
          return typeof element.className === "object";
        };
        var isLIElement = function(node) {
          return node.tagName === "LI";
        };
        var isOLElement = function(node) {
          return node.tagName === "OL";
        };
        var isInputElement = function(node) {
          return node.tagName === "INPUT";
        };
        var isHTMLElement = function(node) {
          return node.tagName === "HTML";
        };
        var isSVGElement = function(node) {
          return node.tagName === "svg";
        };
        var isBodyElement = function(node) {
          return node.tagName === "BODY";
        };
        var isCanvasElement = function(node) {
          return node.tagName === "CANVAS";
        };
        var isVideoElement = function(node) {
          return node.tagName === "VIDEO";
        };
        var isImageElement = function(node) {
          return node.tagName === "IMG";
        };
        var isIFrameElement = function(node) {
          return node.tagName === "IFRAME";
        };
        var isStyleElement = function(node) {
          return node.tagName === "STYLE";
        };
        var isScriptElement = function(node) {
          return node.tagName === "SCRIPT";
        };
        var isTextareaElement = function(node) {
          return node.tagName === "TEXTAREA";
        };
        var isSelectElement = function(node) {
          return node.tagName === "SELECT";
        };
        var isSlotElement = function(node) {
          return node.tagName === "SLOT";
        };
        var isCustomElement = function(node) {
          return node.tagName.indexOf("-") > 0;
        };
        var CounterState = (
          /** @class */
          (function() {
            function CounterState2() {
              this.counters = {};
            }
            CounterState2.prototype.getCounterValue = function(name) {
              var counter = this.counters[name];
              if (counter && counter.length) {
                return counter[counter.length - 1];
              }
              return 1;
            };
            CounterState2.prototype.getCounterValues = function(name) {
              var counter = this.counters[name];
              return counter ? counter : [];
            };
            CounterState2.prototype.pop = function(counters) {
              var _this = this;
              counters.forEach(function(counter) {
                return _this.counters[counter].pop();
              });
            };
            CounterState2.prototype.parse = function(style) {
              var _this = this;
              var counterIncrement2 = style.counterIncrement;
              var counterReset2 = style.counterReset;
              var canReset = true;
              if (counterIncrement2 !== null) {
                counterIncrement2.forEach(function(entry) {
                  var counter = _this.counters[entry.counter];
                  if (counter && entry.increment !== 0) {
                    canReset = false;
                    if (!counter.length) {
                      counter.push(1);
                    }
                    counter[Math.max(0, counter.length - 1)] += entry.increment;
                  }
                });
              }
              var counterNames = [];
              if (canReset) {
                counterReset2.forEach(function(entry) {
                  var counter = _this.counters[entry.counter];
                  counterNames.push(entry.counter);
                  if (!counter) {
                    counter = _this.counters[entry.counter] = [];
                  }
                  counter.push(entry.reset);
                });
              }
              return counterNames;
            };
            return CounterState2;
          })()
        );
        var ROMAN_UPPER = {
          integers: [1e3, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
          values: ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
        };
        var ARMENIAN = {
          integers: [
            9e3,
            8e3,
            7e3,
            6e3,
            5e3,
            4e3,
            3e3,
            2e3,
            1e3,
            900,
            800,
            700,
            600,
            500,
            400,
            300,
            200,
            100,
            90,
            80,
            70,
            60,
            50,
            40,
            30,
            20,
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1
          ],
          values: [
            "\u0554",
            "\u0553",
            "\u0552",
            "\u0551",
            "\u0550",
            "\u054F",
            "\u054E",
            "\u054D",
            "\u054C",
            "\u054B",
            "\u054A",
            "\u0549",
            "\u0548",
            "\u0547",
            "\u0546",
            "\u0545",
            "\u0544",
            "\u0543",
            "\u0542",
            "\u0541",
            "\u0540",
            "\u053F",
            "\u053E",
            "\u053D",
            "\u053C",
            "\u053B",
            "\u053A",
            "\u0539",
            "\u0538",
            "\u0537",
            "\u0536",
            "\u0535",
            "\u0534",
            "\u0533",
            "\u0532",
            "\u0531"
          ]
        };
        var HEBREW = {
          integers: [
            1e4,
            9e3,
            8e3,
            7e3,
            6e3,
            5e3,
            4e3,
            3e3,
            2e3,
            1e3,
            400,
            300,
            200,
            100,
            90,
            80,
            70,
            60,
            50,
            40,
            30,
            20,
            19,
            18,
            17,
            16,
            15,
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1
          ],
          values: [
            "\u05D9\u05F3",
            "\u05D8\u05F3",
            "\u05D7\u05F3",
            "\u05D6\u05F3",
            "\u05D5\u05F3",
            "\u05D4\u05F3",
            "\u05D3\u05F3",
            "\u05D2\u05F3",
            "\u05D1\u05F3",
            "\u05D0\u05F3",
            "\u05EA",
            "\u05E9",
            "\u05E8",
            "\u05E7",
            "\u05E6",
            "\u05E4",
            "\u05E2",
            "\u05E1",
            "\u05E0",
            "\u05DE",
            "\u05DC",
            "\u05DB",
            "\u05D9\u05D8",
            "\u05D9\u05D7",
            "\u05D9\u05D6",
            "\u05D8\u05D6",
            "\u05D8\u05D5",
            "\u05D9",
            "\u05D8",
            "\u05D7",
            "\u05D6",
            "\u05D5",
            "\u05D4",
            "\u05D3",
            "\u05D2",
            "\u05D1",
            "\u05D0"
          ]
        };
        var GEORGIAN = {
          integers: [
            1e4,
            9e3,
            8e3,
            7e3,
            6e3,
            5e3,
            4e3,
            3e3,
            2e3,
            1e3,
            900,
            800,
            700,
            600,
            500,
            400,
            300,
            200,
            100,
            90,
            80,
            70,
            60,
            50,
            40,
            30,
            20,
            10,
            9,
            8,
            7,
            6,
            5,
            4,
            3,
            2,
            1
          ],
          values: [
            "\u10F5",
            "\u10F0",
            "\u10EF",
            "\u10F4",
            "\u10EE",
            "\u10ED",
            "\u10EC",
            "\u10EB",
            "\u10EA",
            "\u10E9",
            "\u10E8",
            "\u10E7",
            "\u10E6",
            "\u10E5",
            "\u10E4",
            "\u10F3",
            "\u10E2",
            "\u10E1",
            "\u10E0",
            "\u10DF",
            "\u10DE",
            "\u10DD",
            "\u10F2",
            "\u10DC",
            "\u10DB",
            "\u10DA",
            "\u10D9",
            "\u10D8",
            "\u10D7",
            "\u10F1",
            "\u10D6",
            "\u10D5",
            "\u10D4",
            "\u10D3",
            "\u10D2",
            "\u10D1",
            "\u10D0"
          ]
        };
        var createAdditiveCounter = function(value, min, max, symbols, fallback, suffix) {
          if (value < min || value > max) {
            return createCounterText(value, fallback, suffix.length > 0);
          }
          return symbols.integers.reduce(function(string, integer, index) {
            while (value >= integer) {
              value -= integer;
              string += symbols.values[index];
            }
            return string;
          }, "") + suffix;
        };
        var createCounterStyleWithSymbolResolver = function(value, codePointRangeLength, isNumeric, resolver) {
          var string = "";
          do {
            if (!isNumeric) {
              value--;
            }
            string = resolver(value) + string;
            value /= codePointRangeLength;
          } while (value * codePointRangeLength >= codePointRangeLength);
          return string;
        };
        var createCounterStyleFromRange = function(value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) {
          var codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;
          return (value < 0 ? "-" : "") + (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, function(codePoint) {
            return fromCodePoint$1(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart);
          }) + suffix);
        };
        var createCounterStyleFromSymbols = function(value, symbols, suffix) {
          if (suffix === void 0) {
            suffix = ". ";
          }
          var codePointRangeLength = symbols.length;
          return createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, function(codePoint) {
            return symbols[Math.floor(codePoint % codePointRangeLength)];
          }) + suffix;
        };
        var CJK_ZEROS = 1 << 0;
        var CJK_TEN_COEFFICIENTS = 1 << 1;
        var CJK_TEN_HIGH_COEFFICIENTS = 1 << 2;
        var CJK_HUNDRED_COEFFICIENTS = 1 << 3;
        var createCJKCounter = function(value, numbers, multipliers, negativeSign, suffix, flags) {
          if (value < -9999 || value > 9999) {
            return createCounterText(value, 4, suffix.length > 0);
          }
          var tmp = Math.abs(value);
          var string = suffix;
          if (tmp === 0) {
            return numbers[0] + string;
          }
          for (var digit = 0; tmp > 0 && digit <= 4; digit++) {
            var coefficient = tmp % 10;
            if (coefficient === 0 && contains(flags, CJK_ZEROS) && string !== "") {
              string = numbers[coefficient] + string;
            } else if (coefficient > 1 || coefficient === 1 && digit === 0 || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_COEFFICIENTS) || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100 || coefficient === 1 && digit > 1 && contains(flags, CJK_HUNDRED_COEFFICIENTS)) {
              string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : "") + string;
            } else if (coefficient === 1 && digit > 0) {
              string = multipliers[digit - 1] + string;
            }
            tmp = Math.floor(tmp / 10);
          }
          return (value < 0 ? negativeSign : "") + string;
        };
        var CHINESE_INFORMAL_MULTIPLIERS = "\u5341\u767E\u5343\u842C";
        var CHINESE_FORMAL_MULTIPLIERS = "\u62FE\u4F70\u4EDF\u842C";
        var JAPANESE_NEGATIVE = "\u30DE\u30A4\u30CA\u30B9";
        var KOREAN_NEGATIVE = "\uB9C8\uC774\uB108\uC2A4";
        var createCounterText = function(value, type, appendSuffix) {
          var defaultSuffix = appendSuffix ? ". " : "";
          var cjkSuffix = appendSuffix ? "\u3001" : "";
          var koreanSuffix = appendSuffix ? ", " : "";
          var spaceSuffix = appendSuffix ? " " : "";
          switch (type) {
            case 0:
              return "\u2022" + spaceSuffix;
            case 1:
              return "\u25E6" + spaceSuffix;
            case 2:
              return "\u25FE" + spaceSuffix;
            case 5:
              var string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
              return string.length < 4 ? "0" + string : string;
            case 4:
              return createCounterStyleFromSymbols(value, "\u3007\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D", cjkSuffix);
            case 6:
              return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3, defaultSuffix).toLowerCase();
            case 7:
              return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3, defaultSuffix);
            case 8:
              return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);
            case 9:
              return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);
            case 10:
              return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);
            case 11:
              return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);
            case 12:
            case 49:
              return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3, defaultSuffix);
            case 35:
              return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3, defaultSuffix).toLowerCase();
            case 13:
              return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);
            case 14:
            case 30:
              return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);
            case 15:
              return createCounterStyleFromSymbols(value, "\u5B50\u4E11\u5BC5\u536F\u8FB0\u5DF3\u5348\u672A\u7533\u9149\u620C\u4EA5", cjkSuffix);
            case 16:
              return createCounterStyleFromSymbols(value, "\u7532\u4E59\u4E19\u4E01\u620A\u5DF1\u5E9A\u8F9B\u58EC\u7678", cjkSuffix);
            case 17:
            case 48:
              return createCJKCounter(value, "\u96F6\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D", CHINESE_INFORMAL_MULTIPLIERS, "\u8CA0", cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case 47:
              return createCJKCounter(value, "\u96F6\u58F9\u8CB3\u53C3\u8086\u4F0D\u9678\u67D2\u634C\u7396", CHINESE_FORMAL_MULTIPLIERS, "\u8CA0", cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case 42:
              return createCJKCounter(value, "\u96F6\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D", CHINESE_INFORMAL_MULTIPLIERS, "\u8D1F", cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case 41:
              return createCJKCounter(value, "\u96F6\u58F9\u8D30\u53C1\u8086\u4F0D\u9646\u67D2\u634C\u7396", CHINESE_FORMAL_MULTIPLIERS, "\u8D1F", cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
            case 26:
              return createCJKCounter(value, "\u3007\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D", "\u5341\u767E\u5343\u4E07", JAPANESE_NEGATIVE, cjkSuffix, 0);
            case 25:
              return createCJKCounter(value, "\u96F6\u58F1\u5F10\u53C2\u56DB\u4F0D\u516D\u4E03\u516B\u4E5D", "\u62FE\u767E\u5343\u4E07", JAPANESE_NEGATIVE, cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
            case 31:
              return createCJKCounter(value, "\uC601\uC77C\uC774\uC0BC\uC0AC\uC624\uC721\uCE60\uD314\uAD6C", "\uC2ED\uBC31\uCC9C\uB9CC", KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
            case 33:
              return createCJKCounter(value, "\u96F6\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D", "\u5341\u767E\u5343\u842C", KOREAN_NEGATIVE, koreanSuffix, 0);
            case 32:
              return createCJKCounter(value, "\u96F6\u58F9\u8CB3\u53C3\u56DB\u4E94\u516D\u4E03\u516B\u4E5D", "\u62FE\u767E\u5343", KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
            case 18:
              return createCounterStyleFromRange(value, 2406, 2415, true, defaultSuffix);
            case 20:
              return createAdditiveCounter(value, 1, 19999, GEORGIAN, 3, defaultSuffix);
            case 21:
              return createCounterStyleFromRange(value, 2790, 2799, true, defaultSuffix);
            case 22:
              return createCounterStyleFromRange(value, 2662, 2671, true, defaultSuffix);
            case 22:
              return createAdditiveCounter(value, 1, 10999, HEBREW, 3, defaultSuffix);
            case 23:
              return createCounterStyleFromSymbols(value, "\u3042\u3044\u3046\u3048\u304A\u304B\u304D\u304F\u3051\u3053\u3055\u3057\u3059\u305B\u305D\u305F\u3061\u3064\u3066\u3068\u306A\u306B\u306C\u306D\u306E\u306F\u3072\u3075\u3078\u307B\u307E\u307F\u3080\u3081\u3082\u3084\u3086\u3088\u3089\u308A\u308B\u308C\u308D\u308F\u3090\u3091\u3092\u3093");
            case 24:
              return createCounterStyleFromSymbols(value, "\u3044\u308D\u306F\u306B\u307B\u3078\u3068\u3061\u308A\u306C\u308B\u3092\u308F\u304B\u3088\u305F\u308C\u305D\u3064\u306D\u306A\u3089\u3080\u3046\u3090\u306E\u304A\u304F\u3084\u307E\u3051\u3075\u3053\u3048\u3066\u3042\u3055\u304D\u3086\u3081\u307F\u3057\u3091\u3072\u3082\u305B\u3059");
            case 27:
              return createCounterStyleFromRange(value, 3302, 3311, true, defaultSuffix);
            case 28:
              return createCounterStyleFromSymbols(value, "\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D2\u30D5\u30D8\u30DB\u30DE\u30DF\u30E0\u30E1\u30E2\u30E4\u30E6\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30EF\u30F0\u30F1\u30F2\u30F3", cjkSuffix);
            case 29:
              return createCounterStyleFromSymbols(value, "\u30A4\u30ED\u30CF\u30CB\u30DB\u30D8\u30C8\u30C1\u30EA\u30CC\u30EB\u30F2\u30EF\u30AB\u30E8\u30BF\u30EC\u30BD\u30C4\u30CD\u30CA\u30E9\u30E0\u30A6\u30F0\u30CE\u30AA\u30AF\u30E4\u30DE\u30B1\u30D5\u30B3\u30A8\u30C6\u30A2\u30B5\u30AD\u30E6\u30E1\u30DF\u30B7\u30F1\u30D2\u30E2\u30BB\u30B9", cjkSuffix);
            case 34:
              return createCounterStyleFromRange(value, 3792, 3801, true, defaultSuffix);
            case 37:
              return createCounterStyleFromRange(value, 6160, 6169, true, defaultSuffix);
            case 38:
              return createCounterStyleFromRange(value, 4160, 4169, true, defaultSuffix);
            case 39:
              return createCounterStyleFromRange(value, 2918, 2927, true, defaultSuffix);
            case 40:
              return createCounterStyleFromRange(value, 1776, 1785, true, defaultSuffix);
            case 43:
              return createCounterStyleFromRange(value, 3046, 3055, true, defaultSuffix);
            case 44:
              return createCounterStyleFromRange(value, 3174, 3183, true, defaultSuffix);
            case 45:
              return createCounterStyleFromRange(value, 3664, 3673, true, defaultSuffix);
            case 46:
              return createCounterStyleFromRange(value, 3872, 3881, true, defaultSuffix);
            case 3:
            default:
              return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
          }
        };
        var IGNORE_ATTRIBUTE = "data-html2canvas-ignore";
        var DocumentCloner = (
          /** @class */
          (function() {
            function DocumentCloner2(context, element, options) {
              this.context = context;
              this.options = options;
              this.scrolledElements = [];
              this.referenceElement = element;
              this.counters = new CounterState();
              this.quoteDepth = 0;
              if (!element.ownerDocument) {
                throw new Error("Cloned element does not have an owner document");
              }
              this.documentElement = this.cloneNode(element.ownerDocument.documentElement, false);
            }
            DocumentCloner2.prototype.toIFrame = function(ownerDocument, windowSize) {
              var _this = this;
              var iframe = createIFrameContainer(ownerDocument, windowSize);
              if (!iframe.contentWindow) {
                return Promise.reject("Unable to find iframe window");
              }
              var scrollX = ownerDocument.defaultView.pageXOffset;
              var scrollY = ownerDocument.defaultView.pageYOffset;
              var cloneWindow = iframe.contentWindow;
              var documentClone = cloneWindow.document;
              var iframeLoad = iframeLoader(iframe).then(function() {
                return __awaiter(_this, void 0, void 0, function() {
                  var onclone, referenceElement;
                  return __generator(this, function(_a) {
                    switch (_a.label) {
                      case 0:
                        this.scrolledElements.forEach(restoreNodeScroll);
                        if (cloneWindow) {
                          cloneWindow.scrollTo(windowSize.left, windowSize.top);
                          if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                            this.context.logger.warn("Unable to restore scroll position for cloned document");
                            this.context.windowBounds = this.context.windowBounds.add(cloneWindow.scrollX - windowSize.left, cloneWindow.scrollY - windowSize.top, 0, 0);
                          }
                        }
                        onclone = this.options.onclone;
                        referenceElement = this.clonedReferenceElement;
                        if (typeof referenceElement === "undefined") {
                          return [2, Promise.reject("Error finding the " + this.referenceElement.nodeName + " in the cloned document")];
                        }
                        if (!(documentClone.fonts && documentClone.fonts.ready)) return [3, 2];
                        return [4, documentClone.fonts.ready];
                      case 1:
                        _a.sent();
                        _a.label = 2;
                      case 2:
                        if (!/(AppleWebKit)/g.test(navigator.userAgent)) return [3, 4];
                        return [4, imagesReady(documentClone)];
                      case 3:
                        _a.sent();
                        _a.label = 4;
                      case 4:
                        if (typeof onclone === "function") {
                          return [2, Promise.resolve().then(function() {
                            return onclone(documentClone, referenceElement);
                          }).then(function() {
                            return iframe;
                          })];
                        }
                        return [2, iframe];
                    }
                  });
                });
              });
              documentClone.open();
              documentClone.write(serializeDoctype(document.doctype) + "<html></html>");
              restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
              documentClone.replaceChild(documentClone.adoptNode(this.documentElement), documentClone.documentElement);
              documentClone.close();
              return iframeLoad;
            };
            DocumentCloner2.prototype.createElementClone = function(node) {
              if (isDebugging(
                node,
                2
                /* CLONE */
              )) {
                debugger;
              }
              if (isCanvasElement(node)) {
                return this.createCanvasClone(node);
              }
              if (isVideoElement(node)) {
                return this.createVideoClone(node);
              }
              if (isStyleElement(node)) {
                return this.createStyleClone(node);
              }
              var clone = node.cloneNode(false);
              if (isImageElement(clone)) {
                if (isImageElement(node) && node.currentSrc && node.currentSrc !== node.src) {
                  clone.src = node.currentSrc;
                  clone.srcset = "";
                }
                if (clone.loading === "lazy") {
                  clone.loading = "eager";
                }
              }
              if (isCustomElement(clone)) {
                return this.createCustomElementClone(clone);
              }
              return clone;
            };
            DocumentCloner2.prototype.createCustomElementClone = function(node) {
              var clone = document.createElement("html2canvascustomelement");
              copyCSSStyles(node.style, clone);
              return clone;
            };
            DocumentCloner2.prototype.createStyleClone = function(node) {
              try {
                var sheet = node.sheet;
                if (sheet && sheet.cssRules) {
                  var css = [].slice.call(sheet.cssRules, 0).reduce(function(css2, rule) {
                    if (rule && typeof rule.cssText === "string") {
                      return css2 + rule.cssText;
                    }
                    return css2;
                  }, "");
                  var style = node.cloneNode(false);
                  style.textContent = css;
                  return style;
                }
              } catch (e8) {
                this.context.logger.error("Unable to access cssRules property", e8);
                if (e8.name !== "SecurityError") {
                  throw e8;
                }
              }
              return node.cloneNode(false);
            };
            DocumentCloner2.prototype.createCanvasClone = function(canvas) {
              var _a;
              if (this.options.inlineImages && canvas.ownerDocument) {
                var img = canvas.ownerDocument.createElement("img");
                try {
                  img.src = canvas.toDataURL();
                  return img;
                } catch (e8) {
                  this.context.logger.info("Unable to inline canvas contents, canvas is tainted", canvas);
                }
              }
              var clonedCanvas = canvas.cloneNode(false);
              try {
                clonedCanvas.width = canvas.width;
                clonedCanvas.height = canvas.height;
                var ctx = canvas.getContext("2d");
                var clonedCtx = clonedCanvas.getContext("2d");
                if (clonedCtx) {
                  if (!this.options.allowTaint && ctx) {
                    clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                  } else {
                    var gl = (_a = canvas.getContext("webgl2")) !== null && _a !== void 0 ? _a : canvas.getContext("webgl");
                    if (gl) {
                      var attribs = gl.getContextAttributes();
                      if ((attribs === null || attribs === void 0 ? void 0 : attribs.preserveDrawingBuffer) === false) {
                        this.context.logger.warn("Unable to clone WebGL context as it has preserveDrawingBuffer=false", canvas);
                      }
                    }
                    clonedCtx.drawImage(canvas, 0, 0);
                  }
                }
                return clonedCanvas;
              } catch (e8) {
                this.context.logger.info("Unable to clone canvas as it is tainted", canvas);
              }
              return clonedCanvas;
            };
            DocumentCloner2.prototype.createVideoClone = function(video) {
              var canvas = video.ownerDocument.createElement("canvas");
              canvas.width = video.offsetWidth;
              canvas.height = video.offsetHeight;
              var ctx = canvas.getContext("2d");
              try {
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  if (!this.options.allowTaint) {
                    ctx.getImageData(0, 0, canvas.width, canvas.height);
                  }
                }
                return canvas;
              } catch (e8) {
                this.context.logger.info("Unable to clone video as it is tainted", video);
              }
              var blankCanvas = video.ownerDocument.createElement("canvas");
              blankCanvas.width = video.offsetWidth;
              blankCanvas.height = video.offsetHeight;
              return blankCanvas;
            };
            DocumentCloner2.prototype.appendChildNode = function(clone, child, copyStyles) {
              if (!isElementNode(child) || !isScriptElement(child) && !child.hasAttribute(IGNORE_ATTRIBUTE) && (typeof this.options.ignoreElements !== "function" || !this.options.ignoreElements(child))) {
                if (!this.options.copyStyles || !isElementNode(child) || !isStyleElement(child)) {
                  clone.appendChild(this.cloneNode(child, copyStyles));
                }
              }
            };
            DocumentCloner2.prototype.cloneChildNodes = function(node, clone, copyStyles) {
              var _this = this;
              for (var child = node.shadowRoot ? node.shadowRoot.firstChild : node.firstChild; child; child = child.nextSibling) {
                if (isElementNode(child) && isSlotElement(child) && typeof child.assignedNodes === "function") {
                  var assignedNodes = child.assignedNodes();
                  if (assignedNodes.length) {
                    assignedNodes.forEach(function(assignedNode) {
                      return _this.appendChildNode(clone, assignedNode, copyStyles);
                    });
                  }
                } else {
                  this.appendChildNode(clone, child, copyStyles);
                }
              }
            };
            DocumentCloner2.prototype.cloneNode = function(node, copyStyles) {
              if (isTextNode(node)) {
                return document.createTextNode(node.data);
              }
              if (!node.ownerDocument) {
                return node.cloneNode(false);
              }
              var window2 = node.ownerDocument.defaultView;
              if (window2 && isElementNode(node) && (isHTMLElementNode(node) || isSVGElementNode(node))) {
                var clone = this.createElementClone(node);
                clone.style.transitionProperty = "none";
                var style = window2.getComputedStyle(node);
                var styleBefore = window2.getComputedStyle(node, ":before");
                var styleAfter = window2.getComputedStyle(node, ":after");
                if (this.referenceElement === node && isHTMLElementNode(clone)) {
                  this.clonedReferenceElement = clone;
                }
                if (isBodyElement(clone)) {
                  createPseudoHideStyles(clone);
                }
                var counters = this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
                var before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);
                if (isCustomElement(node)) {
                  copyStyles = true;
                }
                if (!isVideoElement(node)) {
                  this.cloneChildNodes(node, clone, copyStyles);
                }
                if (before) {
                  clone.insertBefore(before, clone.firstChild);
                }
                var after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
                if (after) {
                  clone.appendChild(after);
                }
                this.counters.pop(counters);
                if (style && (this.options.copyStyles || isSVGElementNode(node)) && !isIFrameElement(node) || copyStyles) {
                  copyCSSStyles(style, clone);
                }
                if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
                  this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
                }
                if ((isTextareaElement(node) || isSelectElement(node)) && (isTextareaElement(clone) || isSelectElement(clone))) {
                  clone.value = node.value;
                }
                return clone;
              }
              return node.cloneNode(false);
            };
            DocumentCloner2.prototype.resolvePseudoContent = function(node, clone, style, pseudoElt) {
              var _this = this;
              if (!style) {
                return;
              }
              var value = style.content;
              var document2 = clone.ownerDocument;
              if (!document2 || !value || value === "none" || value === "-moz-alt-content" || style.display === "none") {
                return;
              }
              this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
              var declaration = new CSSParsedPseudoDeclaration(this.context, style);
              var anonymousReplacedElement = document2.createElement("html2canvaspseudoelement");
              copyCSSStyles(style, anonymousReplacedElement);
              declaration.content.forEach(function(token) {
                if (token.type === 0) {
                  anonymousReplacedElement.appendChild(document2.createTextNode(token.value));
                } else if (token.type === 22) {
                  var img = document2.createElement("img");
                  img.src = token.value;
                  img.style.opacity = "1";
                  anonymousReplacedElement.appendChild(img);
                } else if (token.type === 18) {
                  if (token.name === "attr") {
                    var attr = token.values.filter(isIdentToken);
                    if (attr.length) {
                      anonymousReplacedElement.appendChild(document2.createTextNode(node.getAttribute(attr[0].value) || ""));
                    }
                  } else if (token.name === "counter") {
                    var _a = token.values.filter(nonFunctionArgSeparator), counter = _a[0], counterStyle = _a[1];
                    if (counter && isIdentToken(counter)) {
                      var counterState = _this.counters.getCounterValue(counter.value);
                      var counterType = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(_this.context, counterStyle.value) : 3;
                      anonymousReplacedElement.appendChild(document2.createTextNode(createCounterText(counterState, counterType, false)));
                    }
                  } else if (token.name === "counters") {
                    var _b = token.values.filter(nonFunctionArgSeparator), counter = _b[0], delim = _b[1], counterStyle = _b[2];
                    if (counter && isIdentToken(counter)) {
                      var counterStates = _this.counters.getCounterValues(counter.value);
                      var counterType_1 = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(_this.context, counterStyle.value) : 3;
                      var separator = delim && delim.type === 0 ? delim.value : "";
                      var text = counterStates.map(function(value2) {
                        return createCounterText(value2, counterType_1, false);
                      }).join(separator);
                      anonymousReplacedElement.appendChild(document2.createTextNode(text));
                    }
                  } else ;
                } else if (token.type === 20) {
                  switch (token.value) {
                    case "open-quote":
                      anonymousReplacedElement.appendChild(document2.createTextNode(getQuote(declaration.quotes, _this.quoteDepth++, true)));
                      break;
                    case "close-quote":
                      anonymousReplacedElement.appendChild(document2.createTextNode(getQuote(declaration.quotes, --_this.quoteDepth, false)));
                      break;
                    default:
                      anonymousReplacedElement.appendChild(document2.createTextNode(token.value));
                  }
                }
              });
              anonymousReplacedElement.className = PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
              var newClassName = pseudoElt === PseudoElementType.BEFORE ? " " + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE : " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
              if (isSVGElementNode(clone)) {
                clone.className.baseValue += newClassName;
              } else {
                clone.className += newClassName;
              }
              return anonymousReplacedElement;
            };
            DocumentCloner2.destroy = function(container) {
              if (container.parentNode) {
                container.parentNode.removeChild(container);
                return true;
              }
              return false;
            };
            return DocumentCloner2;
          })()
        );
        var PseudoElementType;
        (function(PseudoElementType2) {
          PseudoElementType2[PseudoElementType2["BEFORE"] = 0] = "BEFORE";
          PseudoElementType2[PseudoElementType2["AFTER"] = 1] = "AFTER";
        })(PseudoElementType || (PseudoElementType = {}));
        var createIFrameContainer = function(ownerDocument, bounds) {
          var cloneIframeContainer = ownerDocument.createElement("iframe");
          cloneIframeContainer.className = "html2canvas-container";
          cloneIframeContainer.style.visibility = "hidden";
          cloneIframeContainer.style.position = "fixed";
          cloneIframeContainer.style.left = "-10000px";
          cloneIframeContainer.style.top = "0px";
          cloneIframeContainer.style.border = "0";
          cloneIframeContainer.width = bounds.width.toString();
          cloneIframeContainer.height = bounds.height.toString();
          cloneIframeContainer.scrolling = "no";
          cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, "true");
          ownerDocument.body.appendChild(cloneIframeContainer);
          return cloneIframeContainer;
        };
        var imageReady = function(img) {
          return new Promise(function(resolve) {
            if (img.complete) {
              resolve();
              return;
            }
            if (!img.src) {
              resolve();
              return;
            }
            img.onload = resolve;
            img.onerror = resolve;
          });
        };
        var imagesReady = function(document2) {
          return Promise.all([].slice.call(document2.images, 0).map(imageReady));
        };
        var iframeLoader = function(iframe) {
          return new Promise(function(resolve, reject) {
            var cloneWindow = iframe.contentWindow;
            if (!cloneWindow) {
              return reject("No window assigned for iframe");
            }
            var documentClone = cloneWindow.document;
            cloneWindow.onload = iframe.onload = function() {
              cloneWindow.onload = iframe.onload = null;
              var interval = setInterval(function() {
                if (documentClone.body.childNodes.length > 0 && documentClone.readyState === "complete") {
                  clearInterval(interval);
                  resolve(iframe);
                }
              }, 50);
            };
          });
        };
        var ignoredStyleProperties = [
          "all",
          "d",
          "content"
          // Safari shows pseudoelements if content is set
        ];
        var copyCSSStyles = function(style, target) {
          for (var i7 = style.length - 1; i7 >= 0; i7--) {
            var property = style.item(i7);
            if (ignoredStyleProperties.indexOf(property) === -1) {
              target.style.setProperty(property, style.getPropertyValue(property));
            }
          }
          return target;
        };
        var serializeDoctype = function(doctype) {
          var str = "";
          if (doctype) {
            str += "<!DOCTYPE ";
            if (doctype.name) {
              str += doctype.name;
            }
            if (doctype.internalSubset) {
              str += doctype.internalSubset;
            }
            if (doctype.publicId) {
              str += '"' + doctype.publicId + '"';
            }
            if (doctype.systemId) {
              str += '"' + doctype.systemId + '"';
            }
            str += ">";
          }
          return str;
        };
        var restoreOwnerScroll = function(ownerDocument, x2, y3) {
          if (ownerDocument && ownerDocument.defaultView && (x2 !== ownerDocument.defaultView.pageXOffset || y3 !== ownerDocument.defaultView.pageYOffset)) {
            ownerDocument.defaultView.scrollTo(x2, y3);
          }
        };
        var restoreNodeScroll = function(_a) {
          var element = _a[0], x2 = _a[1], y3 = _a[2];
          element.scrollLeft = x2;
          element.scrollTop = y3;
        };
        var PSEUDO_BEFORE = ":before";
        var PSEUDO_AFTER = ":after";
        var PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = "___html2canvas___pseudoelement_before";
        var PSEUDO_HIDE_ELEMENT_CLASS_AFTER = "___html2canvas___pseudoelement_after";
        var PSEUDO_HIDE_ELEMENT_STYLE = '{\n    content: "" !important;\n    display: none !important;\n}';
        var createPseudoHideStyles = function(body) {
          createStyles(body, "." + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + PSEUDO_BEFORE + PSEUDO_HIDE_ELEMENT_STYLE + "\n         ." + PSEUDO_HIDE_ELEMENT_CLASS_AFTER + PSEUDO_AFTER + PSEUDO_HIDE_ELEMENT_STYLE);
        };
        var createStyles = function(body, styles3) {
          var document2 = body.ownerDocument;
          if (document2) {
            var style = document2.createElement("style");
            style.textContent = styles3;
            body.appendChild(style);
          }
        };
        var CacheStorage = (
          /** @class */
          (function() {
            function CacheStorage2() {
            }
            CacheStorage2.getOrigin = function(url) {
              var link = CacheStorage2._link;
              if (!link) {
                return "about:blank";
              }
              link.href = url;
              link.href = link.href;
              return link.protocol + link.hostname + link.port;
            };
            CacheStorage2.isSameOrigin = function(src) {
              return CacheStorage2.getOrigin(src) === CacheStorage2._origin;
            };
            CacheStorage2.setContext = function(window2) {
              CacheStorage2._link = window2.document.createElement("a");
              CacheStorage2._origin = CacheStorage2.getOrigin(window2.location.href);
            };
            CacheStorage2._origin = "about:blank";
            return CacheStorage2;
          })()
        );
        var Cache = (
          /** @class */
          (function() {
            function Cache2(context, _options) {
              this.context = context;
              this._options = _options;
              this._cache = {};
            }
            Cache2.prototype.addImage = function(src) {
              var result = Promise.resolve();
              if (this.has(src)) {
                return result;
              }
              if (isBlobImage(src) || isRenderable(src)) {
                (this._cache[src] = this.loadImage(src)).catch(function() {
                });
                return result;
              }
              return result;
            };
            Cache2.prototype.match = function(src) {
              return this._cache[src];
            };
            Cache2.prototype.loadImage = function(key) {
              return __awaiter(this, void 0, void 0, function() {
                var isSameOrigin, useCORS, useProxy, src;
                var _this = this;
                return __generator(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      isSameOrigin = CacheStorage.isSameOrigin(key);
                      useCORS = !isInlineImage(key) && this._options.useCORS === true && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
                      useProxy = !isInlineImage(key) && !isSameOrigin && !isBlobImage(key) && typeof this._options.proxy === "string" && FEATURES.SUPPORT_CORS_XHR && !useCORS;
                      if (!isSameOrigin && this._options.allowTaint === false && !isInlineImage(key) && !isBlobImage(key) && !useProxy && !useCORS) {
                        return [
                          2
                          /*return*/
                        ];
                      }
                      src = key;
                      if (!useProxy) return [3, 2];
                      return [4, this.proxy(src)];
                    case 1:
                      src = _a.sent();
                      _a.label = 2;
                    case 2:
                      this.context.logger.debug("Added image " + key.substring(0, 256));
                      return [4, new Promise(function(resolve, reject) {
                        var img = new Image();
                        img.onload = function() {
                          return resolve(img);
                        };
                        img.onerror = reject;
                        if (isInlineBase64Image(src) || useCORS) {
                          img.crossOrigin = "anonymous";
                        }
                        img.src = src;
                        if (img.complete === true) {
                          setTimeout(function() {
                            return resolve(img);
                          }, 500);
                        }
                        if (_this._options.imageTimeout > 0) {
                          setTimeout(function() {
                            return reject("Timed out (" + _this._options.imageTimeout + "ms) loading image");
                          }, _this._options.imageTimeout);
                        }
                      })];
                    case 3:
                      return [2, _a.sent()];
                  }
                });
              });
            };
            Cache2.prototype.has = function(key) {
              return typeof this._cache[key] !== "undefined";
            };
            Cache2.prototype.keys = function() {
              return Promise.resolve(Object.keys(this._cache));
            };
            Cache2.prototype.proxy = function(src) {
              var _this = this;
              var proxy = this._options.proxy;
              if (!proxy) {
                throw new Error("No proxy defined");
              }
              var key = src.substring(0, 256);
              return new Promise(function(resolve, reject) {
                var responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? "blob" : "text";
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                  if (xhr.status === 200) {
                    if (responseType === "text") {
                      resolve(xhr.response);
                    } else {
                      var reader_1 = new FileReader();
                      reader_1.addEventListener("load", function() {
                        return resolve(reader_1.result);
                      }, false);
                      reader_1.addEventListener("error", function(e8) {
                        return reject(e8);
                      }, false);
                      reader_1.readAsDataURL(xhr.response);
                    }
                  } else {
                    reject("Failed to proxy resource " + key + " with status code " + xhr.status);
                  }
                };
                xhr.onerror = reject;
                var queryString = proxy.indexOf("?") > -1 ? "&" : "?";
                xhr.open("GET", "" + proxy + queryString + "url=" + encodeURIComponent(src) + "&responseType=" + responseType);
                if (responseType !== "text" && xhr instanceof XMLHttpRequest) {
                  xhr.responseType = responseType;
                }
                if (_this._options.imageTimeout) {
                  var timeout_1 = _this._options.imageTimeout;
                  xhr.timeout = timeout_1;
                  xhr.ontimeout = function() {
                    return reject("Timed out (" + timeout_1 + "ms) proxying " + key);
                  };
                }
                xhr.send();
              });
            };
            return Cache2;
          })()
        );
        var INLINE_SVG = /^data:image\/svg\+xml/i;
        var INLINE_BASE64 = /^data:image\/.*;base64,/i;
        var INLINE_IMG = /^data:image\/.*/i;
        var isRenderable = function(src) {
          return FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src);
        };
        var isInlineImage = function(src) {
          return INLINE_IMG.test(src);
        };
        var isInlineBase64Image = function(src) {
          return INLINE_BASE64.test(src);
        };
        var isBlobImage = function(src) {
          return src.substr(0, 4) === "blob";
        };
        var isSVG = function(src) {
          return src.substr(-3).toLowerCase() === "svg" || INLINE_SVG.test(src);
        };
        var Vector = (
          /** @class */
          (function() {
            function Vector2(x2, y3) {
              this.type = 0;
              this.x = x2;
              this.y = y3;
            }
            Vector2.prototype.add = function(deltaX, deltaY) {
              return new Vector2(this.x + deltaX, this.y + deltaY);
            };
            return Vector2;
          })()
        );
        var lerp = function(a4, b3, t4) {
          return new Vector(a4.x + (b3.x - a4.x) * t4, a4.y + (b3.y - a4.y) * t4);
        };
        var BezierCurve = (
          /** @class */
          (function() {
            function BezierCurve2(start, startControl, endControl, end) {
              this.type = 1;
              this.start = start;
              this.startControl = startControl;
              this.endControl = endControl;
              this.end = end;
            }
            BezierCurve2.prototype.subdivide = function(t4, firstHalf) {
              var ab = lerp(this.start, this.startControl, t4);
              var bc = lerp(this.startControl, this.endControl, t4);
              var cd = lerp(this.endControl, this.end, t4);
              var abbc = lerp(ab, bc, t4);
              var bccd = lerp(bc, cd, t4);
              var dest = lerp(abbc, bccd, t4);
              return firstHalf ? new BezierCurve2(this.start, ab, abbc, dest) : new BezierCurve2(dest, bccd, cd, this.end);
            };
            BezierCurve2.prototype.add = function(deltaX, deltaY) {
              return new BezierCurve2(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
            };
            BezierCurve2.prototype.reverse = function() {
              return new BezierCurve2(this.end, this.endControl, this.startControl, this.start);
            };
            return BezierCurve2;
          })()
        );
        var isBezierCurve = function(path) {
          return path.type === 1;
        };
        var BoundCurves = (
          /** @class */
          /* @__PURE__ */ (function() {
            function BoundCurves2(element) {
              var styles3 = element.styles;
              var bounds = element.bounds;
              var _a = getAbsoluteValueForTuple(styles3.borderTopLeftRadius, bounds.width, bounds.height), tlh = _a[0], tlv = _a[1];
              var _b = getAbsoluteValueForTuple(styles3.borderTopRightRadius, bounds.width, bounds.height), trh = _b[0], trv = _b[1];
              var _c = getAbsoluteValueForTuple(styles3.borderBottomRightRadius, bounds.width, bounds.height), brh = _c[0], brv = _c[1];
              var _d = getAbsoluteValueForTuple(styles3.borderBottomLeftRadius, bounds.width, bounds.height), blh = _d[0], blv = _d[1];
              var factors = [];
              factors.push((tlh + trh) / bounds.width);
              factors.push((blh + brh) / bounds.width);
              factors.push((tlv + blv) / bounds.height);
              factors.push((trv + brv) / bounds.height);
              var maxFactor = Math.max.apply(Math, factors);
              if (maxFactor > 1) {
                tlh /= maxFactor;
                tlv /= maxFactor;
                trh /= maxFactor;
                trv /= maxFactor;
                brh /= maxFactor;
                brv /= maxFactor;
                blh /= maxFactor;
                blv /= maxFactor;
              }
              var topWidth = bounds.width - trh;
              var rightHeight = bounds.height - brv;
              var bottomWidth = bounds.width - brh;
              var leftHeight = bounds.height - blv;
              var borderTopWidth2 = styles3.borderTopWidth;
              var borderRightWidth2 = styles3.borderRightWidth;
              var borderBottomWidth2 = styles3.borderBottomWidth;
              var borderLeftWidth2 = styles3.borderLeftWidth;
              var paddingTop2 = getAbsoluteValue(styles3.paddingTop, element.bounds.width);
              var paddingRight2 = getAbsoluteValue(styles3.paddingRight, element.bounds.width);
              var paddingBottom2 = getAbsoluteValue(styles3.paddingBottom, element.bounds.width);
              var paddingLeft2 = getAbsoluteValue(styles3.paddingLeft, element.bounds.width);
              this.topLeftBorderDoubleOuterBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 / 3, bounds.top + borderTopWidth2 / 3, tlh - borderLeftWidth2 / 3, tlv - borderTopWidth2 / 3, CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth2 / 3, bounds.top + borderTopWidth2 / 3);
              this.topRightBorderDoubleOuterBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth2 / 3, trh - borderRightWidth2 / 3, trv - borderTopWidth2 / 3, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2 / 3, bounds.top + borderTopWidth2 / 3);
              this.bottomRightBorderDoubleOuterBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth2 / 3, brv - borderBottomWidth2 / 3, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2 / 3, bounds.top + bounds.height - borderBottomWidth2 / 3);
              this.bottomLeftBorderDoubleOuterBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 / 3, bounds.top + leftHeight, blh - borderLeftWidth2 / 3, blv - borderBottomWidth2 / 3, CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth2 / 3, bounds.top + bounds.height - borderBottomWidth2 / 3);
              this.topLeftBorderDoubleInnerBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 * 2 / 3, bounds.top + borderTopWidth2 * 2 / 3, tlh - borderLeftWidth2 * 2 / 3, tlv - borderTopWidth2 * 2 / 3, CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth2 * 2 / 3, bounds.top + borderTopWidth2 * 2 / 3);
              this.topRightBorderDoubleInnerBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth2 * 2 / 3, trh - borderRightWidth2 * 2 / 3, trv - borderTopWidth2 * 2 / 3, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2 * 2 / 3, bounds.top + borderTopWidth2 * 2 / 3);
              this.bottomRightBorderDoubleInnerBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth2 * 2 / 3, brv - borderBottomWidth2 * 2 / 3, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2 * 2 / 3, bounds.top + bounds.height - borderBottomWidth2 * 2 / 3);
              this.bottomLeftBorderDoubleInnerBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 * 2 / 3, bounds.top + leftHeight, blh - borderLeftWidth2 * 2 / 3, blv - borderBottomWidth2 * 2 / 3, CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth2 * 2 / 3, bounds.top + bounds.height - borderBottomWidth2 * 2 / 3);
              this.topLeftBorderStroke = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 / 2, bounds.top + borderTopWidth2 / 2, tlh - borderLeftWidth2 / 2, tlv - borderTopWidth2 / 2, CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth2 / 2, bounds.top + borderTopWidth2 / 2);
              this.topRightBorderStroke = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth2 / 2, trh - borderRightWidth2 / 2, trv - borderTopWidth2 / 2, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2 / 2, bounds.top + borderTopWidth2 / 2);
              this.bottomRightBorderStroke = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth2 / 2, brv - borderBottomWidth2 / 2, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2 / 2, bounds.top + bounds.height - borderBottomWidth2 / 2);
              this.bottomLeftBorderStroke = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 / 2, bounds.top + leftHeight, blh - borderLeftWidth2 / 2, blv - borderBottomWidth2 / 2, CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth2 / 2, bounds.top + bounds.height - borderBottomWidth2 / 2);
              this.topLeftBorderBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT) : new Vector(bounds.left, bounds.top);
              this.topRightBorderBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width, bounds.top);
              this.bottomRightBorderBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
              this.bottomLeftBorderBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT) : new Vector(bounds.left, bounds.top + bounds.height);
              this.topLeftPaddingBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2, bounds.top + borderTopWidth2, Math.max(0, tlh - borderLeftWidth2), Math.max(0, tlv - borderTopWidth2), CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth2, bounds.top + borderTopWidth2);
              this.topRightPaddingBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width - borderRightWidth2), bounds.top + borderTopWidth2, topWidth > bounds.width + borderRightWidth2 ? 0 : Math.max(0, trh - borderRightWidth2), Math.max(0, trv - borderTopWidth2), CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2, bounds.top + borderTopWidth2);
              this.bottomRightPaddingBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth2), bounds.top + Math.min(rightHeight, bounds.height - borderBottomWidth2), Math.max(0, brh - borderRightWidth2), Math.max(0, brv - borderBottomWidth2), CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth2, bounds.top + bounds.height - borderBottomWidth2);
              this.bottomLeftPaddingBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2, bounds.top + Math.min(leftHeight, bounds.height - borderBottomWidth2), Math.max(0, blh - borderLeftWidth2), Math.max(0, blv - borderBottomWidth2), CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth2, bounds.top + bounds.height - borderBottomWidth2);
              this.topLeftContentBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 + paddingLeft2, bounds.top + borderTopWidth2 + paddingTop2, Math.max(0, tlh - (borderLeftWidth2 + paddingLeft2)), Math.max(0, tlv - (borderTopWidth2 + paddingTop2)), CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth2 + paddingLeft2, bounds.top + borderTopWidth2 + paddingTop2);
              this.topRightContentBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth2 + paddingLeft2), bounds.top + borderTopWidth2 + paddingTop2, topWidth > bounds.width + borderLeftWidth2 + paddingLeft2 ? 0 : trh - borderLeftWidth2 + paddingLeft2, trv - (borderTopWidth2 + paddingTop2), CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - (borderRightWidth2 + paddingRight2), bounds.top + borderTopWidth2 + paddingTop2);
              this.bottomRightContentBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth2 + paddingLeft2)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth2 + paddingTop2), Math.max(0, brh - (borderRightWidth2 + paddingRight2)), brv - (borderBottomWidth2 + paddingBottom2), CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - (borderRightWidth2 + paddingRight2), bounds.top + bounds.height - (borderBottomWidth2 + paddingBottom2));
              this.bottomLeftContentBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth2 + paddingLeft2, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth2 + paddingLeft2)), blv - (borderBottomWidth2 + paddingBottom2), CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth2 + paddingLeft2, bounds.top + bounds.height - (borderBottomWidth2 + paddingBottom2));
            }
            return BoundCurves2;
          })()
        );
        var CORNER;
        (function(CORNER2) {
          CORNER2[CORNER2["TOP_LEFT"] = 0] = "TOP_LEFT";
          CORNER2[CORNER2["TOP_RIGHT"] = 1] = "TOP_RIGHT";
          CORNER2[CORNER2["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
          CORNER2[CORNER2["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
        })(CORNER || (CORNER = {}));
        var getCurvePoints = function(x2, y3, r1, r22, position2) {
          var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
          var ox = r1 * kappa;
          var oy = r22 * kappa;
          var xm = x2 + r1;
          var ym = y3 + r22;
          switch (position2) {
            case CORNER.TOP_LEFT:
              return new BezierCurve(new Vector(x2, ym), new Vector(x2, ym - oy), new Vector(xm - ox, y3), new Vector(xm, y3));
            case CORNER.TOP_RIGHT:
              return new BezierCurve(new Vector(x2, y3), new Vector(x2 + ox, y3), new Vector(xm, ym - oy), new Vector(xm, ym));
            case CORNER.BOTTOM_RIGHT:
              return new BezierCurve(new Vector(xm, y3), new Vector(xm, y3 + oy), new Vector(x2 + ox, ym), new Vector(x2, ym));
            case CORNER.BOTTOM_LEFT:
            default:
              return new BezierCurve(new Vector(xm, ym), new Vector(xm - ox, ym), new Vector(x2, y3 + oy), new Vector(x2, y3));
          }
        };
        var calculateBorderBoxPath = function(curves) {
          return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
        };
        var calculateContentBoxPath = function(curves) {
          return [
            curves.topLeftContentBox,
            curves.topRightContentBox,
            curves.bottomRightContentBox,
            curves.bottomLeftContentBox
          ];
        };
        var calculatePaddingBoxPath = function(curves) {
          return [
            curves.topLeftPaddingBox,
            curves.topRightPaddingBox,
            curves.bottomRightPaddingBox,
            curves.bottomLeftPaddingBox
          ];
        };
        var TransformEffect = (
          /** @class */
          /* @__PURE__ */ (function() {
            function TransformEffect2(offsetX, offsetY, matrix2) {
              this.offsetX = offsetX;
              this.offsetY = offsetY;
              this.matrix = matrix2;
              this.type = 0;
              this.target = 2 | 4;
            }
            return TransformEffect2;
          })()
        );
        var ClipEffect = (
          /** @class */
          /* @__PURE__ */ (function() {
            function ClipEffect2(path, target) {
              this.path = path;
              this.target = target;
              this.type = 1;
            }
            return ClipEffect2;
          })()
        );
        var OpacityEffect = (
          /** @class */
          /* @__PURE__ */ (function() {
            function OpacityEffect2(opacity2) {
              this.opacity = opacity2;
              this.type = 2;
              this.target = 2 | 4;
            }
            return OpacityEffect2;
          })()
        );
        var isTransformEffect = function(effect) {
          return effect.type === 0;
        };
        var isClipEffect = function(effect) {
          return effect.type === 1;
        };
        var isOpacityEffect = function(effect) {
          return effect.type === 2;
        };
        var equalPath = function(a4, b3) {
          if (a4.length === b3.length) {
            return a4.some(function(v2, i7) {
              return v2 === b3[i7];
            });
          }
          return false;
        };
        var transformPath = function(path, deltaX, deltaY, deltaW, deltaH) {
          return path.map(function(point, index) {
            switch (index) {
              case 0:
                return point.add(deltaX, deltaY);
              case 1:
                return point.add(deltaX + deltaW, deltaY);
              case 2:
                return point.add(deltaX + deltaW, deltaY + deltaH);
              case 3:
                return point.add(deltaX, deltaY + deltaH);
            }
            return point;
          });
        };
        var StackingContext = (
          /** @class */
          /* @__PURE__ */ (function() {
            function StackingContext2(container) {
              this.element = container;
              this.inlineLevel = [];
              this.nonInlineLevel = [];
              this.negativeZIndex = [];
              this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
              this.positiveZIndex = [];
              this.nonPositionedFloats = [];
              this.nonPositionedInlineLevel = [];
            }
            return StackingContext2;
          })()
        );
        var ElementPaint = (
          /** @class */
          (function() {
            function ElementPaint2(container, parent) {
              this.container = container;
              this.parent = parent;
              this.effects = [];
              this.curves = new BoundCurves(this.container);
              if (this.container.styles.opacity < 1) {
                this.effects.push(new OpacityEffect(this.container.styles.opacity));
              }
              if (this.container.styles.transform !== null) {
                var offsetX = this.container.bounds.left + this.container.styles.transformOrigin[0].number;
                var offsetY = this.container.bounds.top + this.container.styles.transformOrigin[1].number;
                var matrix2 = this.container.styles.transform;
                this.effects.push(new TransformEffect(offsetX, offsetY, matrix2));
              }
              if (this.container.styles.overflowX !== 0) {
                var borderBox = calculateBorderBoxPath(this.curves);
                var paddingBox2 = calculatePaddingBoxPath(this.curves);
                if (equalPath(borderBox, paddingBox2)) {
                  this.effects.push(new ClipEffect(
                    borderBox,
                    2 | 4
                    /* CONTENT */
                  ));
                } else {
                  this.effects.push(new ClipEffect(
                    borderBox,
                    2
                    /* BACKGROUND_BORDERS */
                  ));
                  this.effects.push(new ClipEffect(
                    paddingBox2,
                    4
                    /* CONTENT */
                  ));
                }
              }
            }
            ElementPaint2.prototype.getEffects = function(target) {
              var inFlow = [
                2,
                3
                /* FIXED */
              ].indexOf(this.container.styles.position) === -1;
              var parent = this.parent;
              var effects = this.effects.slice(0);
              while (parent) {
                var croplessEffects = parent.effects.filter(function(effect) {
                  return !isClipEffect(effect);
                });
                if (inFlow || parent.container.styles.position !== 0 || !parent.parent) {
                  effects.unshift.apply(effects, croplessEffects);
                  inFlow = [
                    2,
                    3
                    /* FIXED */
                  ].indexOf(parent.container.styles.position) === -1;
                  if (parent.container.styles.overflowX !== 0) {
                    var borderBox = calculateBorderBoxPath(parent.curves);
                    var paddingBox2 = calculatePaddingBoxPath(parent.curves);
                    if (!equalPath(borderBox, paddingBox2)) {
                      effects.unshift(new ClipEffect(
                        paddingBox2,
                        2 | 4
                        /* CONTENT */
                      ));
                    }
                  }
                } else {
                  effects.unshift.apply(effects, croplessEffects);
                }
                parent = parent.parent;
              }
              return effects.filter(function(effect) {
                return contains(effect.target, target);
              });
            };
            return ElementPaint2;
          })()
        );
        var parseStackTree = function(parent, stackingContext, realStackingContext, listItems) {
          parent.container.elements.forEach(function(child) {
            var treatAsRealStackingContext = contains(
              child.flags,
              4
              /* CREATES_REAL_STACKING_CONTEXT */
            );
            var createsStackingContext2 = contains(
              child.flags,
              2
              /* CREATES_STACKING_CONTEXT */
            );
            var paintContainer = new ElementPaint(child, parent);
            if (contains(
              child.styles.display,
              2048
              /* LIST_ITEM */
            )) {
              listItems.push(paintContainer);
            }
            var listOwnerItems = contains(
              child.flags,
              8
              /* IS_LIST_OWNER */
            ) ? [] : listItems;
            if (treatAsRealStackingContext || createsStackingContext2) {
              var parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
              var stack = new StackingContext(paintContainer);
              if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
                var order_1 = child.styles.zIndex.order;
                if (order_1 < 0) {
                  var index_1 = 0;
                  parentStack.negativeZIndex.some(function(current, i7) {
                    if (order_1 > current.element.container.styles.zIndex.order) {
                      index_1 = i7;
                      return false;
                    } else if (index_1 > 0) {
                      return true;
                    }
                    return false;
                  });
                  parentStack.negativeZIndex.splice(index_1, 0, stack);
                } else if (order_1 > 0) {
                  var index_2 = 0;
                  parentStack.positiveZIndex.some(function(current, i7) {
                    if (order_1 >= current.element.container.styles.zIndex.order) {
                      index_2 = i7 + 1;
                      return false;
                    } else if (index_2 > 0) {
                      return true;
                    }
                    return false;
                  });
                  parentStack.positiveZIndex.splice(index_2, 0, stack);
                } else {
                  parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                }
              } else {
                if (child.styles.isFloating()) {
                  parentStack.nonPositionedFloats.push(stack);
                } else {
                  parentStack.nonPositionedInlineLevel.push(stack);
                }
              }
              parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
            } else {
              if (child.styles.isInlineLevel()) {
                stackingContext.inlineLevel.push(paintContainer);
              } else {
                stackingContext.nonInlineLevel.push(paintContainer);
              }
              parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
            }
            if (contains(
              child.flags,
              8
              /* IS_LIST_OWNER */
            )) {
              processListItems(child, listOwnerItems);
            }
          });
        };
        var processListItems = function(owner, elements) {
          var numbering = owner instanceof OLElementContainer ? owner.start : 1;
          var reversed = owner instanceof OLElementContainer ? owner.reversed : false;
          for (var i7 = 0; i7 < elements.length; i7++) {
            var item = elements[i7];
            if (item.container instanceof LIElementContainer && typeof item.container.value === "number" && item.container.value !== 0) {
              numbering = item.container.value;
            }
            item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);
            numbering += reversed ? -1 : 1;
          }
        };
        var parseStackingContexts = function(container) {
          var paintContainer = new ElementPaint(container, null);
          var root = new StackingContext(paintContainer);
          var listItems = [];
          parseStackTree(paintContainer, root, root, listItems);
          processListItems(paintContainer.container, listItems);
          return root;
        };
        var parsePathForBorder = function(curves, borderSide) {
          switch (borderSide) {
            case 0:
              return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftPaddingBox, curves.topRightBorderBox, curves.topRightPaddingBox);
            case 1:
              return createPathFromCurves(curves.topRightBorderBox, curves.topRightPaddingBox, curves.bottomRightBorderBox, curves.bottomRightPaddingBox);
            case 2:
              return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox);
            case 3:
            default:
              return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox, curves.topLeftBorderBox, curves.topLeftPaddingBox);
          }
        };
        var parsePathForBorderDoubleOuter = function(curves, borderSide) {
          switch (borderSide) {
            case 0:
              return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox, curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox);
            case 1:
              return createPathFromCurves(curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox, curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox);
            case 2:
              return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox, curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox);
            case 3:
            default:
              return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox, curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox);
          }
        };
        var parsePathForBorderDoubleInner = function(curves, borderSide) {
          switch (borderSide) {
            case 0:
              return createPathFromCurves(curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox, curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox);
            case 1:
              return createPathFromCurves(curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox, curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox);
            case 2:
              return createPathFromCurves(curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox);
            case 3:
            default:
              return createPathFromCurves(curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox, curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox);
          }
        };
        var parsePathForBorderStroke = function(curves, borderSide) {
          switch (borderSide) {
            case 0:
              return createStrokePathFromCurves(curves.topLeftBorderStroke, curves.topRightBorderStroke);
            case 1:
              return createStrokePathFromCurves(curves.topRightBorderStroke, curves.bottomRightBorderStroke);
            case 2:
              return createStrokePathFromCurves(curves.bottomRightBorderStroke, curves.bottomLeftBorderStroke);
            case 3:
            default:
              return createStrokePathFromCurves(curves.bottomLeftBorderStroke, curves.topLeftBorderStroke);
          }
        };
        var createStrokePathFromCurves = function(outer1, outer2) {
          var path = [];
          if (isBezierCurve(outer1)) {
            path.push(outer1.subdivide(0.5, false));
          } else {
            path.push(outer1);
          }
          if (isBezierCurve(outer2)) {
            path.push(outer2.subdivide(0.5, true));
          } else {
            path.push(outer2);
          }
          return path;
        };
        var createPathFromCurves = function(outer1, inner1, outer2, inner2) {
          var path = [];
          if (isBezierCurve(outer1)) {
            path.push(outer1.subdivide(0.5, false));
          } else {
            path.push(outer1);
          }
          if (isBezierCurve(outer2)) {
            path.push(outer2.subdivide(0.5, true));
          } else {
            path.push(outer2);
          }
          if (isBezierCurve(inner2)) {
            path.push(inner2.subdivide(0.5, true).reverse());
          } else {
            path.push(inner2);
          }
          if (isBezierCurve(inner1)) {
            path.push(inner1.subdivide(0.5, false).reverse());
          } else {
            path.push(inner1);
          }
          return path;
        };
        var paddingBox = function(element) {
          var bounds = element.bounds;
          var styles3 = element.styles;
          return bounds.add(styles3.borderLeftWidth, styles3.borderTopWidth, -(styles3.borderRightWidth + styles3.borderLeftWidth), -(styles3.borderTopWidth + styles3.borderBottomWidth));
        };
        var contentBox = function(element) {
          var styles3 = element.styles;
          var bounds = element.bounds;
          var paddingLeft2 = getAbsoluteValue(styles3.paddingLeft, bounds.width);
          var paddingRight2 = getAbsoluteValue(styles3.paddingRight, bounds.width);
          var paddingTop2 = getAbsoluteValue(styles3.paddingTop, bounds.width);
          var paddingBottom2 = getAbsoluteValue(styles3.paddingBottom, bounds.width);
          return bounds.add(paddingLeft2 + styles3.borderLeftWidth, paddingTop2 + styles3.borderTopWidth, -(styles3.borderRightWidth + styles3.borderLeftWidth + paddingLeft2 + paddingRight2), -(styles3.borderTopWidth + styles3.borderBottomWidth + paddingTop2 + paddingBottom2));
        };
        var calculateBackgroundPositioningArea = function(backgroundOrigin2, element) {
          if (backgroundOrigin2 === 0) {
            return element.bounds;
          }
          if (backgroundOrigin2 === 2) {
            return contentBox(element);
          }
          return paddingBox(element);
        };
        var calculateBackgroundPaintingArea = function(backgroundClip2, element) {
          if (backgroundClip2 === 0) {
            return element.bounds;
          }
          if (backgroundClip2 === 2) {
            return contentBox(element);
          }
          return paddingBox(element);
        };
        var calculateBackgroundRendering = function(container, index, intrinsicSize) {
          var backgroundPositioningArea = calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
          var backgroundPaintingArea = calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
          var backgroundImageSize = calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
          var sizeWidth = backgroundImageSize[0], sizeHeight = backgroundImageSize[1];
          var position2 = getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
          var path = calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position2, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
          var offsetX = Math.round(backgroundPositioningArea.left + position2[0]);
          var offsetY = Math.round(backgroundPositioningArea.top + position2[1]);
          return [path, offsetX, offsetY, sizeWidth, sizeHeight];
        };
        var isAuto = function(token) {
          return isIdentToken(token) && token.value === BACKGROUND_SIZE.AUTO;
        };
        var hasIntrinsicValue = function(value) {
          return typeof value === "number";
        };
        var calculateBackgroundSize = function(size, _a, bounds) {
          var intrinsicWidth = _a[0], intrinsicHeight = _a[1], intrinsicProportion = _a[2];
          var first = size[0], second = size[1];
          if (!first) {
            return [0, 0];
          }
          if (isLengthPercentage(first) && second && isLengthPercentage(second)) {
            return [getAbsoluteValue(first, bounds.width), getAbsoluteValue(second, bounds.height)];
          }
          var hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);
          if (isIdentToken(first) && (first.value === BACKGROUND_SIZE.CONTAIN || first.value === BACKGROUND_SIZE.COVER)) {
            if (hasIntrinsicValue(intrinsicProportion)) {
              var targetRatio = bounds.width / bounds.height;
              return targetRatio < intrinsicProportion !== (first.value === BACKGROUND_SIZE.COVER) ? [bounds.width, bounds.width / intrinsicProportion] : [bounds.height * intrinsicProportion, bounds.height];
            }
            return [bounds.width, bounds.height];
          }
          var hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
          var hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
          var hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight;
          if (isAuto(first) && (!second || isAuto(second))) {
            if (hasIntrinsicWidth && hasIntrinsicHeight) {
              return [intrinsicWidth, intrinsicHeight];
            }
            if (!hasIntrinsicProportion && !hasIntrinsicDimensions) {
              return [bounds.width, bounds.height];
            }
            if (hasIntrinsicDimensions && hasIntrinsicProportion) {
              var width_1 = hasIntrinsicWidth ? intrinsicWidth : intrinsicHeight * intrinsicProportion;
              var height_1 = hasIntrinsicHeight ? intrinsicHeight : intrinsicWidth / intrinsicProportion;
              return [width_1, height_1];
            }
            var width_2 = hasIntrinsicWidth ? intrinsicWidth : bounds.width;
            var height_2 = hasIntrinsicHeight ? intrinsicHeight : bounds.height;
            return [width_2, height_2];
          }
          if (hasIntrinsicProportion) {
            var width_3 = 0;
            var height_3 = 0;
            if (isLengthPercentage(first)) {
              width_3 = getAbsoluteValue(first, bounds.width);
            } else if (isLengthPercentage(second)) {
              height_3 = getAbsoluteValue(second, bounds.height);
            }
            if (isAuto(first)) {
              width_3 = height_3 * intrinsicProportion;
            } else if (!second || isAuto(second)) {
              height_3 = width_3 / intrinsicProportion;
            }
            return [width_3, height_3];
          }
          var width = null;
          var height = null;
          if (isLengthPercentage(first)) {
            width = getAbsoluteValue(first, bounds.width);
          } else if (second && isLengthPercentage(second)) {
            height = getAbsoluteValue(second, bounds.height);
          }
          if (width !== null && (!second || isAuto(second))) {
            height = hasIntrinsicWidth && hasIntrinsicHeight ? width / intrinsicWidth * intrinsicHeight : bounds.height;
          }
          if (height !== null && isAuto(first)) {
            width = hasIntrinsicWidth && hasIntrinsicHeight ? height / intrinsicHeight * intrinsicWidth : bounds.width;
          }
          if (width !== null && height !== null) {
            return [width, height];
          }
          throw new Error("Unable to calculate background-size for element");
        };
        var getBackgroundValueForIndex = function(values, index) {
          var value = values[index];
          if (typeof value === "undefined") {
            return values[0];
          }
          return value;
        };
        var calculateBackgroundRepeatPath = function(repeat, _a, _b, backgroundPositioningArea, backgroundPaintingArea) {
          var x2 = _a[0], y3 = _a[1];
          var width = _b[0], height = _b[1];
          switch (repeat) {
            case 2:
              return [
                new Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y3)),
                new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y3)),
                new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y3)),
                new Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y3))
              ];
            case 3:
              return [
                new Vector(Math.round(backgroundPositioningArea.left + x2), Math.round(backgroundPositioningArea.top)),
                new Vector(Math.round(backgroundPositioningArea.left + x2 + width), Math.round(backgroundPositioningArea.top)),
                new Vector(Math.round(backgroundPositioningArea.left + x2 + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)),
                new Vector(Math.round(backgroundPositioningArea.left + x2), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top))
              ];
            case 1:
              return [
                new Vector(Math.round(backgroundPositioningArea.left + x2), Math.round(backgroundPositioningArea.top + y3)),
                new Vector(Math.round(backgroundPositioningArea.left + x2 + width), Math.round(backgroundPositioningArea.top + y3)),
                new Vector(Math.round(backgroundPositioningArea.left + x2 + width), Math.round(backgroundPositioningArea.top + y3 + height)),
                new Vector(Math.round(backgroundPositioningArea.left + x2), Math.round(backgroundPositioningArea.top + y3 + height))
              ];
            default:
              return [
                new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)),
                new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)),
                new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)),
                new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top))
              ];
          }
        };
        var SMALL_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        var SAMPLE_TEXT = "Hidden Text";
        var FontMetrics = (
          /** @class */
          (function() {
            function FontMetrics2(document2) {
              this._data = {};
              this._document = document2;
            }
            FontMetrics2.prototype.parseMetrics = function(fontFamily2, fontSize2) {
              var container = this._document.createElement("div");
              var img = this._document.createElement("img");
              var span = this._document.createElement("span");
              var body = this._document.body;
              container.style.visibility = "hidden";
              container.style.fontFamily = fontFamily2;
              container.style.fontSize = fontSize2;
              container.style.margin = "0";
              container.style.padding = "0";
              container.style.whiteSpace = "nowrap";
              body.appendChild(container);
              img.src = SMALL_IMAGE;
              img.width = 1;
              img.height = 1;
              img.style.margin = "0";
              img.style.padding = "0";
              img.style.verticalAlign = "baseline";
              span.style.fontFamily = fontFamily2;
              span.style.fontSize = fontSize2;
              span.style.margin = "0";
              span.style.padding = "0";
              span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
              container.appendChild(span);
              container.appendChild(img);
              var baseline = img.offsetTop - span.offsetTop + 2;
              container.removeChild(span);
              container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
              container.style.lineHeight = "normal";
              img.style.verticalAlign = "super";
              var middle = img.offsetTop - container.offsetTop + 2;
              body.removeChild(container);
              return { baseline, middle };
            };
            FontMetrics2.prototype.getMetrics = function(fontFamily2, fontSize2) {
              var key = fontFamily2 + " " + fontSize2;
              if (typeof this._data[key] === "undefined") {
                this._data[key] = this.parseMetrics(fontFamily2, fontSize2);
              }
              return this._data[key];
            };
            return FontMetrics2;
          })()
        );
        var Renderer = (
          /** @class */
          /* @__PURE__ */ (function() {
            function Renderer2(context, options) {
              this.context = context;
              this.options = options;
            }
            return Renderer2;
          })()
        );
        var MASK_OFFSET = 1e4;
        var CanvasRenderer = (
          /** @class */
          (function(_super) {
            __extends(CanvasRenderer2, _super);
            function CanvasRenderer2(context, options) {
              var _this = _super.call(this, context, options) || this;
              _this._activeEffects = [];
              _this.canvas = options.canvas ? options.canvas : document.createElement("canvas");
              _this.ctx = _this.canvas.getContext("2d");
              if (!options.canvas) {
                _this.canvas.width = Math.floor(options.width * options.scale);
                _this.canvas.height = Math.floor(options.height * options.scale);
                _this.canvas.style.width = options.width + "px";
                _this.canvas.style.height = options.height + "px";
              }
              _this.fontMetrics = new FontMetrics(document);
              _this.ctx.scale(_this.options.scale, _this.options.scale);
              _this.ctx.translate(-options.x, -options.y);
              _this.ctx.textBaseline = "bottom";
              _this._activeEffects = [];
              _this.context.logger.debug("Canvas renderer initialized (" + options.width + "x" + options.height + ") with scale " + options.scale);
              return _this;
            }
            CanvasRenderer2.prototype.applyEffects = function(effects) {
              var _this = this;
              while (this._activeEffects.length) {
                this.popEffect();
              }
              effects.forEach(function(effect) {
                return _this.applyEffect(effect);
              });
            };
            CanvasRenderer2.prototype.applyEffect = function(effect) {
              this.ctx.save();
              if (isOpacityEffect(effect)) {
                this.ctx.globalAlpha = effect.opacity;
              }
              if (isTransformEffect(effect)) {
                this.ctx.translate(effect.offsetX, effect.offsetY);
                this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
                this.ctx.translate(-effect.offsetX, -effect.offsetY);
              }
              if (isClipEffect(effect)) {
                this.path(effect.path);
                this.ctx.clip();
              }
              this._activeEffects.push(effect);
            };
            CanvasRenderer2.prototype.popEffect = function() {
              this._activeEffects.pop();
              this.ctx.restore();
            };
            CanvasRenderer2.prototype.renderStack = function(stack) {
              return __awaiter(this, void 0, void 0, function() {
                var styles3;
                return __generator(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      styles3 = stack.element.container.styles;
                      if (!styles3.isVisible()) return [3, 2];
                      return [4, this.renderStackContent(stack)];
                    case 1:
                      _a.sent();
                      _a.label = 2;
                    case 2:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            };
            CanvasRenderer2.prototype.renderNode = function(paint) {
              return __awaiter(this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      if (contains(
                        paint.container.flags,
                        16
                        /* DEBUG_RENDER */
                      )) {
                        debugger;
                      }
                      if (!paint.container.styles.isVisible()) return [3, 3];
                      return [4, this.renderNodeBackgroundAndBorders(paint)];
                    case 1:
                      _a.sent();
                      return [4, this.renderNodeContent(paint)];
                    case 2:
                      _a.sent();
                      _a.label = 3;
                    case 3:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            };
            CanvasRenderer2.prototype.renderTextWithLetterSpacing = function(text, letterSpacing2, baseline) {
              var _this = this;
              if (letterSpacing2 === 0) {
                this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + baseline);
              } else {
                var letters = segmentGraphemes(text.text);
                letters.reduce(function(left, letter) {
                  _this.ctx.fillText(letter, left, text.bounds.top + baseline);
                  return left + _this.ctx.measureText(letter).width;
                }, text.bounds.left);
              }
            };
            CanvasRenderer2.prototype.createFontStyle = function(styles3) {
              var fontVariant2 = styles3.fontVariant.filter(function(variant) {
                return variant === "normal" || variant === "small-caps";
              }).join("");
              var fontFamily2 = fixIOSSystemFonts(styles3.fontFamily).join(", ");
              var fontSize2 = isDimensionToken(styles3.fontSize) ? "" + styles3.fontSize.number + styles3.fontSize.unit : styles3.fontSize.number + "px";
              return [
                [styles3.fontStyle, fontVariant2, styles3.fontWeight, fontSize2, fontFamily2].join(" "),
                fontFamily2,
                fontSize2
              ];
            };
            CanvasRenderer2.prototype.renderTextNode = function(text, styles3) {
              return __awaiter(this, void 0, void 0, function() {
                var _a, font, fontFamily2, fontSize2, _b, baseline, middle, paintOrder2;
                var _this = this;
                return __generator(this, function(_c) {
                  _a = this.createFontStyle(styles3), font = _a[0], fontFamily2 = _a[1], fontSize2 = _a[2];
                  this.ctx.font = font;
                  this.ctx.direction = styles3.direction === 1 ? "rtl" : "ltr";
                  this.ctx.textAlign = "left";
                  this.ctx.textBaseline = "alphabetic";
                  _b = this.fontMetrics.getMetrics(fontFamily2, fontSize2), baseline = _b.baseline, middle = _b.middle;
                  paintOrder2 = styles3.paintOrder;
                  text.textBounds.forEach(function(text2) {
                    paintOrder2.forEach(function(paintOrderLayer) {
                      switch (paintOrderLayer) {
                        case 0:
                          _this.ctx.fillStyle = asString(styles3.color);
                          _this.renderTextWithLetterSpacing(text2, styles3.letterSpacing, baseline);
                          var textShadows = styles3.textShadow;
                          if (textShadows.length && text2.text.trim().length) {
                            textShadows.slice(0).reverse().forEach(function(textShadow2) {
                              _this.ctx.shadowColor = asString(textShadow2.color);
                              _this.ctx.shadowOffsetX = textShadow2.offsetX.number * _this.options.scale;
                              _this.ctx.shadowOffsetY = textShadow2.offsetY.number * _this.options.scale;
                              _this.ctx.shadowBlur = textShadow2.blur.number;
                              _this.renderTextWithLetterSpacing(text2, styles3.letterSpacing, baseline);
                            });
                            _this.ctx.shadowColor = "";
                            _this.ctx.shadowOffsetX = 0;
                            _this.ctx.shadowOffsetY = 0;
                            _this.ctx.shadowBlur = 0;
                          }
                          if (styles3.textDecorationLine.length) {
                            _this.ctx.fillStyle = asString(styles3.textDecorationColor || styles3.color);
                            styles3.textDecorationLine.forEach(function(textDecorationLine2) {
                              switch (textDecorationLine2) {
                                case 1:
                                  _this.ctx.fillRect(text2.bounds.left, Math.round(text2.bounds.top + baseline), text2.bounds.width, 1);
                                  break;
                                case 2:
                                  _this.ctx.fillRect(text2.bounds.left, Math.round(text2.bounds.top), text2.bounds.width, 1);
                                  break;
                                case 3:
                                  _this.ctx.fillRect(text2.bounds.left, Math.ceil(text2.bounds.top + middle), text2.bounds.width, 1);
                                  break;
                              }
                            });
                          }
                          break;
                        case 1:
                          if (styles3.webkitTextStrokeWidth && text2.text.trim().length) {
                            _this.ctx.strokeStyle = asString(styles3.webkitTextStrokeColor);
                            _this.ctx.lineWidth = styles3.webkitTextStrokeWidth;
                            _this.ctx.lineJoin = !!window.chrome ? "miter" : "round";
                            _this.ctx.strokeText(text2.text, text2.bounds.left, text2.bounds.top + baseline);
                          }
                          _this.ctx.strokeStyle = "";
                          _this.ctx.lineWidth = 0;
                          _this.ctx.lineJoin = "miter";
                          break;
                      }
                    });
                  });
                  return [
                    2
                    /*return*/
                  ];
                });
              });
            };
            CanvasRenderer2.prototype.renderReplacedElement = function(container, curves, image2) {
              if (image2 && container.intrinsicWidth > 0 && container.intrinsicHeight > 0) {
                var box = contentBox(container);
                var path = calculatePaddingBoxPath(curves);
                this.path(path);
                this.ctx.save();
                this.ctx.clip();
                this.ctx.drawImage(image2, 0, 0, container.intrinsicWidth, container.intrinsicHeight, box.left, box.top, box.width, box.height);
                this.ctx.restore();
              }
            };
            CanvasRenderer2.prototype.renderNodeContent = function(paint) {
              return __awaiter(this, void 0, void 0, function() {
                var container, curves, styles3, _i, _a, child, image2, image2, iframeRenderer, canvas, size, _b, fontFamily2, fontSize2, baseline, bounds, x2, textBounds, img, image2, url, fontFamily2, bounds;
                return __generator(this, function(_c) {
                  switch (_c.label) {
                    case 0:
                      this.applyEffects(paint.getEffects(
                        4
                        /* CONTENT */
                      ));
                      container = paint.container;
                      curves = paint.curves;
                      styles3 = container.styles;
                      _i = 0, _a = container.textNodes;
                      _c.label = 1;
                    case 1:
                      if (!(_i < _a.length)) return [3, 4];
                      child = _a[_i];
                      return [4, this.renderTextNode(child, styles3)];
                    case 2:
                      _c.sent();
                      _c.label = 3;
                    case 3:
                      _i++;
                      return [3, 1];
                    case 4:
                      if (!(container instanceof ImageElementContainer)) return [3, 8];
                      _c.label = 5;
                    case 5:
                      _c.trys.push([5, 7, , 8]);
                      return [4, this.context.cache.match(container.src)];
                    case 6:
                      image2 = _c.sent();
                      this.renderReplacedElement(container, curves, image2);
                      return [3, 8];
                    case 7:
                      _c.sent();
                      this.context.logger.error("Error loading image " + container.src);
                      return [3, 8];
                    case 8:
                      if (container instanceof CanvasElementContainer) {
                        this.renderReplacedElement(container, curves, container.canvas);
                      }
                      if (!(container instanceof SVGElementContainer)) return [3, 12];
                      _c.label = 9;
                    case 9:
                      _c.trys.push([9, 11, , 12]);
                      return [4, this.context.cache.match(container.svg)];
                    case 10:
                      image2 = _c.sent();
                      this.renderReplacedElement(container, curves, image2);
                      return [3, 12];
                    case 11:
                      _c.sent();
                      this.context.logger.error("Error loading svg " + container.svg.substring(0, 255));
                      return [3, 12];
                    case 12:
                      if (!(container instanceof IFrameElementContainer && container.tree)) return [3, 14];
                      iframeRenderer = new CanvasRenderer2(this.context, {
                        scale: this.options.scale,
                        backgroundColor: container.backgroundColor,
                        x: 0,
                        y: 0,
                        width: container.width,
                        height: container.height
                      });
                      return [4, iframeRenderer.render(container.tree)];
                    case 13:
                      canvas = _c.sent();
                      if (container.width && container.height) {
                        this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
                      }
                      _c.label = 14;
                    case 14:
                      if (container instanceof InputElementContainer) {
                        size = Math.min(container.bounds.width, container.bounds.height);
                        if (container.type === CHECKBOX) {
                          if (container.checked) {
                            this.ctx.save();
                            this.path([
                              new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                              new Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549),
                              new Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071),
                              new Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649),
                              new Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23),
                              new Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085),
                              new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)
                            ]);
                            this.ctx.fillStyle = asString(INPUT_COLOR);
                            this.ctx.fill();
                            this.ctx.restore();
                          }
                        } else if (container.type === RADIO) {
                          if (container.checked) {
                            this.ctx.save();
                            this.ctx.beginPath();
                            this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                            this.ctx.fillStyle = asString(INPUT_COLOR);
                            this.ctx.fill();
                            this.ctx.restore();
                          }
                        }
                      }
                      if (isTextInputElement(container) && container.value.length) {
                        _b = this.createFontStyle(styles3), fontFamily2 = _b[0], fontSize2 = _b[1];
                        baseline = this.fontMetrics.getMetrics(fontFamily2, fontSize2).baseline;
                        this.ctx.font = fontFamily2;
                        this.ctx.fillStyle = asString(styles3.color);
                        this.ctx.textBaseline = "alphabetic";
                        this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
                        bounds = contentBox(container);
                        x2 = 0;
                        switch (container.styles.textAlign) {
                          case 1:
                            x2 += bounds.width / 2;
                            break;
                          case 2:
                            x2 += bounds.width;
                            break;
                        }
                        textBounds = bounds.add(x2, 0, 0, -bounds.height / 2 + 1);
                        this.ctx.save();
                        this.path([
                          new Vector(bounds.left, bounds.top),
                          new Vector(bounds.left + bounds.width, bounds.top),
                          new Vector(bounds.left + bounds.width, bounds.top + bounds.height),
                          new Vector(bounds.left, bounds.top + bounds.height)
                        ]);
                        this.ctx.clip();
                        this.renderTextWithLetterSpacing(new TextBounds(container.value, textBounds), styles3.letterSpacing, baseline);
                        this.ctx.restore();
                        this.ctx.textBaseline = "alphabetic";
                        this.ctx.textAlign = "left";
                      }
                      if (!contains(
                        container.styles.display,
                        2048
                        /* LIST_ITEM */
                      )) return [3, 20];
                      if (!(container.styles.listStyleImage !== null)) return [3, 19];
                      img = container.styles.listStyleImage;
                      if (!(img.type === 0)) return [3, 18];
                      image2 = void 0;
                      url = img.url;
                      _c.label = 15;
                    case 15:
                      _c.trys.push([15, 17, , 18]);
                      return [4, this.context.cache.match(url)];
                    case 16:
                      image2 = _c.sent();
                      this.ctx.drawImage(image2, container.bounds.left - (image2.width + 10), container.bounds.top);
                      return [3, 18];
                    case 17:
                      _c.sent();
                      this.context.logger.error("Error loading list-style-image " + url);
                      return [3, 18];
                    case 18:
                      return [3, 20];
                    case 19:
                      if (paint.listValue && container.styles.listStyleType !== -1) {
                        fontFamily2 = this.createFontStyle(styles3)[0];
                        this.ctx.font = fontFamily2;
                        this.ctx.fillStyle = asString(styles3.color);
                        this.ctx.textBaseline = "middle";
                        this.ctx.textAlign = "right";
                        bounds = new Bounds(container.bounds.left, container.bounds.top + getAbsoluteValue(container.styles.paddingTop, container.bounds.width), container.bounds.width, computeLineHeight(styles3.lineHeight, styles3.fontSize.number) / 2 + 1);
                        this.renderTextWithLetterSpacing(new TextBounds(paint.listValue, bounds), styles3.letterSpacing, computeLineHeight(styles3.lineHeight, styles3.fontSize.number) / 2 + 2);
                        this.ctx.textBaseline = "bottom";
                        this.ctx.textAlign = "left";
                      }
                      _c.label = 20;
                    case 20:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            };
            CanvasRenderer2.prototype.renderStackContent = function(stack) {
              return __awaiter(this, void 0, void 0, function() {
                var _i, _a, child, _b, _c, child, _d, _e, child, _f, _g, child, _h, _j, child, _k, _l, child, _m, _o, child;
                return __generator(this, function(_p) {
                  switch (_p.label) {
                    case 0:
                      if (contains(
                        stack.element.container.flags,
                        16
                        /* DEBUG_RENDER */
                      )) {
                        debugger;
                      }
                      return [4, this.renderNodeBackgroundAndBorders(stack.element)];
                    case 1:
                      _p.sent();
                      _i = 0, _a = stack.negativeZIndex;
                      _p.label = 2;
                    case 2:
                      if (!(_i < _a.length)) return [3, 5];
                      child = _a[_i];
                      return [4, this.renderStack(child)];
                    case 3:
                      _p.sent();
                      _p.label = 4;
                    case 4:
                      _i++;
                      return [3, 2];
                    case 5:
                      return [4, this.renderNodeContent(stack.element)];
                    case 6:
                      _p.sent();
                      _b = 0, _c = stack.nonInlineLevel;
                      _p.label = 7;
                    case 7:
                      if (!(_b < _c.length)) return [3, 10];
                      child = _c[_b];
                      return [4, this.renderNode(child)];
                    case 8:
                      _p.sent();
                      _p.label = 9;
                    case 9:
                      _b++;
                      return [3, 7];
                    case 10:
                      _d = 0, _e = stack.nonPositionedFloats;
                      _p.label = 11;
                    case 11:
                      if (!(_d < _e.length)) return [3, 14];
                      child = _e[_d];
                      return [4, this.renderStack(child)];
                    case 12:
                      _p.sent();
                      _p.label = 13;
                    case 13:
                      _d++;
                      return [3, 11];
                    case 14:
                      _f = 0, _g = stack.nonPositionedInlineLevel;
                      _p.label = 15;
                    case 15:
                      if (!(_f < _g.length)) return [3, 18];
                      child = _g[_f];
                      return [4, this.renderStack(child)];
                    case 16:
                      _p.sent();
                      _p.label = 17;
                    case 17:
                      _f++;
                      return [3, 15];
                    case 18:
                      _h = 0, _j = stack.inlineLevel;
                      _p.label = 19;
                    case 19:
                      if (!(_h < _j.length)) return [3, 22];
                      child = _j[_h];
                      return [4, this.renderNode(child)];
                    case 20:
                      _p.sent();
                      _p.label = 21;
                    case 21:
                      _h++;
                      return [3, 19];
                    case 22:
                      _k = 0, _l = stack.zeroOrAutoZIndexOrTransformedOrOpacity;
                      _p.label = 23;
                    case 23:
                      if (!(_k < _l.length)) return [3, 26];
                      child = _l[_k];
                      return [4, this.renderStack(child)];
                    case 24:
                      _p.sent();
                      _p.label = 25;
                    case 25:
                      _k++;
                      return [3, 23];
                    case 26:
                      _m = 0, _o = stack.positiveZIndex;
                      _p.label = 27;
                    case 27:
                      if (!(_m < _o.length)) return [3, 30];
                      child = _o[_m];
                      return [4, this.renderStack(child)];
                    case 28:
                      _p.sent();
                      _p.label = 29;
                    case 29:
                      _m++;
                      return [3, 27];
                    case 30:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            };
            CanvasRenderer2.prototype.mask = function(paths) {
              this.ctx.beginPath();
              this.ctx.moveTo(0, 0);
              this.ctx.lineTo(this.canvas.width, 0);
              this.ctx.lineTo(this.canvas.width, this.canvas.height);
              this.ctx.lineTo(0, this.canvas.height);
              this.ctx.lineTo(0, 0);
              this.formatPath(paths.slice(0).reverse());
              this.ctx.closePath();
            };
            CanvasRenderer2.prototype.path = function(paths) {
              this.ctx.beginPath();
              this.formatPath(paths);
              this.ctx.closePath();
            };
            CanvasRenderer2.prototype.formatPath = function(paths) {
              var _this = this;
              paths.forEach(function(point, index) {
                var start = isBezierCurve(point) ? point.start : point;
                if (index === 0) {
                  _this.ctx.moveTo(start.x, start.y);
                } else {
                  _this.ctx.lineTo(start.x, start.y);
                }
                if (isBezierCurve(point)) {
                  _this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
                }
              });
            };
            CanvasRenderer2.prototype.renderRepeat = function(path, pattern, offsetX, offsetY) {
              this.path(path);
              this.ctx.fillStyle = pattern;
              this.ctx.translate(offsetX, offsetY);
              this.ctx.fill();
              this.ctx.translate(-offsetX, -offsetY);
            };
            CanvasRenderer2.prototype.resizeImage = function(image2, width, height) {
              var _a;
              if (image2.width === width && image2.height === height) {
                return image2;
              }
              var ownerDocument = (_a = this.canvas.ownerDocument) !== null && _a !== void 0 ? _a : document;
              var canvas = ownerDocument.createElement("canvas");
              canvas.width = Math.max(1, width);
              canvas.height = Math.max(1, height);
              var ctx = canvas.getContext("2d");
              ctx.drawImage(image2, 0, 0, image2.width, image2.height, 0, 0, width, height);
              return canvas;
            };
            CanvasRenderer2.prototype.renderBackgroundImage = function(container) {
              return __awaiter(this, void 0, void 0, function() {
                var index, _loop_1, this_1, _i, _a, backgroundImage2;
                return __generator(this, function(_b) {
                  switch (_b.label) {
                    case 0:
                      index = container.styles.backgroundImage.length - 1;
                      _loop_1 = function(backgroundImage3) {
                        var image2, url, _c, path, x2, y3, width, height, pattern, _d, path, x2, y3, width, height, _e, lineLength, x0, x1, y0, y1, canvas, ctx, gradient_1, pattern, _f, path, left, top_1, width, height, position2, x2, y3, _g, rx, ry, radialGradient_1, midX, midY, f4, invF;
                        return __generator(this, function(_h) {
                          switch (_h.label) {
                            case 0:
                              if (!(backgroundImage3.type === 0)) return [3, 5];
                              image2 = void 0;
                              url = backgroundImage3.url;
                              _h.label = 1;
                            case 1:
                              _h.trys.push([1, 3, , 4]);
                              return [4, this_1.context.cache.match(url)];
                            case 2:
                              image2 = _h.sent();
                              return [3, 4];
                            case 3:
                              _h.sent();
                              this_1.context.logger.error("Error loading background-image " + url);
                              return [3, 4];
                            case 4:
                              if (image2) {
                                _c = calculateBackgroundRendering(container, index, [
                                  image2.width,
                                  image2.height,
                                  image2.width / image2.height
                                ]), path = _c[0], x2 = _c[1], y3 = _c[2], width = _c[3], height = _c[4];
                                pattern = this_1.ctx.createPattern(this_1.resizeImage(image2, width, height), "repeat");
                                this_1.renderRepeat(path, pattern, x2, y3);
                              }
                              return [3, 6];
                            case 5:
                              if (isLinearGradient(backgroundImage3)) {
                                _d = calculateBackgroundRendering(container, index, [null, null, null]), path = _d[0], x2 = _d[1], y3 = _d[2], width = _d[3], height = _d[4];
                                _e = calculateGradientDirection(backgroundImage3.angle, width, height), lineLength = _e[0], x0 = _e[1], x1 = _e[2], y0 = _e[3], y1 = _e[4];
                                canvas = document.createElement("canvas");
                                canvas.width = width;
                                canvas.height = height;
                                ctx = canvas.getContext("2d");
                                gradient_1 = ctx.createLinearGradient(x0, y0, x1, y1);
                                processColorStops(backgroundImage3.stops, lineLength).forEach(function(colorStop) {
                                  return gradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                });
                                ctx.fillStyle = gradient_1;
                                ctx.fillRect(0, 0, width, height);
                                if (width > 0 && height > 0) {
                                  pattern = this_1.ctx.createPattern(canvas, "repeat");
                                  this_1.renderRepeat(path, pattern, x2, y3);
                                }
                              } else if (isRadialGradient(backgroundImage3)) {
                                _f = calculateBackgroundRendering(container, index, [
                                  null,
                                  null,
                                  null
                                ]), path = _f[0], left = _f[1], top_1 = _f[2], width = _f[3], height = _f[4];
                                position2 = backgroundImage3.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage3.position;
                                x2 = getAbsoluteValue(position2[0], width);
                                y3 = getAbsoluteValue(position2[position2.length - 1], height);
                                _g = calculateRadius(backgroundImage3, x2, y3, width, height), rx = _g[0], ry = _g[1];
                                if (rx > 0 && ry > 0) {
                                  radialGradient_1 = this_1.ctx.createRadialGradient(left + x2, top_1 + y3, 0, left + x2, top_1 + y3, rx);
                                  processColorStops(backgroundImage3.stops, rx * 2).forEach(function(colorStop) {
                                    return radialGradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                  });
                                  this_1.path(path);
                                  this_1.ctx.fillStyle = radialGradient_1;
                                  if (rx !== ry) {
                                    midX = container.bounds.left + 0.5 * container.bounds.width;
                                    midY = container.bounds.top + 0.5 * container.bounds.height;
                                    f4 = ry / rx;
                                    invF = 1 / f4;
                                    this_1.ctx.save();
                                    this_1.ctx.translate(midX, midY);
                                    this_1.ctx.transform(1, 0, 0, f4, 0, 0);
                                    this_1.ctx.translate(-midX, -midY);
                                    this_1.ctx.fillRect(left, invF * (top_1 - midY) + midY, width, height * invF);
                                    this_1.ctx.restore();
                                  } else {
                                    this_1.ctx.fill();
                                  }
                                }
                              }
                              _h.label = 6;
                            case 6:
                              index--;
                              return [
                                2
                                /*return*/
                              ];
                          }
                        });
                      };
                      this_1 = this;
                      _i = 0, _a = container.styles.backgroundImage.slice(0).reverse();
                      _b.label = 1;
                    case 1:
                      if (!(_i < _a.length)) return [3, 4];
                      backgroundImage2 = _a[_i];
                      return [5, _loop_1(backgroundImage2)];
                    case 2:
                      _b.sent();
                      _b.label = 3;
                    case 3:
                      _i++;
                      return [3, 1];
                    case 4:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            };
            CanvasRenderer2.prototype.renderSolidBorder = function(color2, side, curvePoints) {
              return __awaiter(this, void 0, void 0, function() {
                return __generator(this, function(_a) {
                  this.path(parsePathForBorder(curvePoints, side));
                  this.ctx.fillStyle = asString(color2);
                  this.ctx.fill();
                  return [
                    2
                    /*return*/
                  ];
                });
              });
            };
            CanvasRenderer2.prototype.renderDoubleBorder = function(color2, width, side, curvePoints) {
              return __awaiter(this, void 0, void 0, function() {
                var outerPaths, innerPaths;
                return __generator(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      if (!(width < 3)) return [3, 2];
                      return [4, this.renderSolidBorder(color2, side, curvePoints)];
                    case 1:
                      _a.sent();
                      return [
                        2
                        /*return*/
                      ];
                    case 2:
                      outerPaths = parsePathForBorderDoubleOuter(curvePoints, side);
                      this.path(outerPaths);
                      this.ctx.fillStyle = asString(color2);
                      this.ctx.fill();
                      innerPaths = parsePathForBorderDoubleInner(curvePoints, side);
                      this.path(innerPaths);
                      this.ctx.fill();
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            };
            CanvasRenderer2.prototype.renderNodeBackgroundAndBorders = function(paint) {
              return __awaiter(this, void 0, void 0, function() {
                var styles3, hasBackground, borders, backgroundPaintingArea, side, _i, borders_1, border;
                var _this = this;
                return __generator(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      this.applyEffects(paint.getEffects(
                        2
                        /* BACKGROUND_BORDERS */
                      ));
                      styles3 = paint.container.styles;
                      hasBackground = !isTransparent(styles3.backgroundColor) || styles3.backgroundImage.length;
                      borders = [
                        { style: styles3.borderTopStyle, color: styles3.borderTopColor, width: styles3.borderTopWidth },
                        { style: styles3.borderRightStyle, color: styles3.borderRightColor, width: styles3.borderRightWidth },
                        { style: styles3.borderBottomStyle, color: styles3.borderBottomColor, width: styles3.borderBottomWidth },
                        { style: styles3.borderLeftStyle, color: styles3.borderLeftColor, width: styles3.borderLeftWidth }
                      ];
                      backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles3.backgroundClip, 0), paint.curves);
                      if (!(hasBackground || styles3.boxShadow.length)) return [3, 2];
                      this.ctx.save();
                      this.path(backgroundPaintingArea);
                      this.ctx.clip();
                      if (!isTransparent(styles3.backgroundColor)) {
                        this.ctx.fillStyle = asString(styles3.backgroundColor);
                        this.ctx.fill();
                      }
                      return [4, this.renderBackgroundImage(paint.container)];
                    case 1:
                      _a.sent();
                      this.ctx.restore();
                      styles3.boxShadow.slice(0).reverse().forEach(function(shadow) {
                        _this.ctx.save();
                        var borderBoxArea = calculateBorderBoxPath(paint.curves);
                        var maskOffset = shadow.inset ? 0 : MASK_OFFSET;
                        var shadowPaintingArea = transformPath(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));
                        if (shadow.inset) {
                          _this.path(borderBoxArea);
                          _this.ctx.clip();
                          _this.mask(shadowPaintingArea);
                        } else {
                          _this.mask(borderBoxArea);
                          _this.ctx.clip();
                          _this.path(shadowPaintingArea);
                        }
                        _this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
                        _this.ctx.shadowOffsetY = shadow.offsetY.number;
                        _this.ctx.shadowColor = asString(shadow.color);
                        _this.ctx.shadowBlur = shadow.blur.number;
                        _this.ctx.fillStyle = shadow.inset ? asString(shadow.color) : "rgba(0,0,0,1)";
                        _this.ctx.fill();
                        _this.ctx.restore();
                      });
                      _a.label = 2;
                    case 2:
                      side = 0;
                      _i = 0, borders_1 = borders;
                      _a.label = 3;
                    case 3:
                      if (!(_i < borders_1.length)) return [3, 13];
                      border = borders_1[_i];
                      if (!(border.style !== 0 && !isTransparent(border.color) && border.width > 0)) return [3, 11];
                      if (!(border.style === 2)) return [3, 5];
                      return [4, this.renderDashedDottedBorder(
                        border.color,
                        border.width,
                        side,
                        paint.curves,
                        2
                        /* DASHED */
                      )];
                    case 4:
                      _a.sent();
                      return [3, 11];
                    case 5:
                      if (!(border.style === 3)) return [3, 7];
                      return [4, this.renderDashedDottedBorder(
                        border.color,
                        border.width,
                        side,
                        paint.curves,
                        3
                        /* DOTTED */
                      )];
                    case 6:
                      _a.sent();
                      return [3, 11];
                    case 7:
                      if (!(border.style === 4)) return [3, 9];
                      return [4, this.renderDoubleBorder(border.color, border.width, side, paint.curves)];
                    case 8:
                      _a.sent();
                      return [3, 11];
                    case 9:
                      return [4, this.renderSolidBorder(border.color, side, paint.curves)];
                    case 10:
                      _a.sent();
                      _a.label = 11;
                    case 11:
                      side++;
                      _a.label = 12;
                    case 12:
                      _i++;
                      return [3, 3];
                    case 13:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            };
            CanvasRenderer2.prototype.renderDashedDottedBorder = function(color2, width, side, curvePoints, style) {
              return __awaiter(this, void 0, void 0, function() {
                var strokePaths, boxPaths, startX, startY, endX, endY, length, dashLength, spaceLength, useLineDash, multiplier, numberOfDashes, minSpace, maxSpace, path1, path2, path1, path2;
                return __generator(this, function(_a) {
                  this.ctx.save();
                  strokePaths = parsePathForBorderStroke(curvePoints, side);
                  boxPaths = parsePathForBorder(curvePoints, side);
                  if (style === 2) {
                    this.path(boxPaths);
                    this.ctx.clip();
                  }
                  if (isBezierCurve(boxPaths[0])) {
                    startX = boxPaths[0].start.x;
                    startY = boxPaths[0].start.y;
                  } else {
                    startX = boxPaths[0].x;
                    startY = boxPaths[0].y;
                  }
                  if (isBezierCurve(boxPaths[1])) {
                    endX = boxPaths[1].end.x;
                    endY = boxPaths[1].end.y;
                  } else {
                    endX = boxPaths[1].x;
                    endY = boxPaths[1].y;
                  }
                  if (side === 0 || side === 2) {
                    length = Math.abs(startX - endX);
                  } else {
                    length = Math.abs(startY - endY);
                  }
                  this.ctx.beginPath();
                  if (style === 3) {
                    this.formatPath(strokePaths);
                  } else {
                    this.formatPath(boxPaths.slice(0, 2));
                  }
                  dashLength = width < 3 ? width * 3 : width * 2;
                  spaceLength = width < 3 ? width * 2 : width;
                  if (style === 3) {
                    dashLength = width;
                    spaceLength = width;
                  }
                  useLineDash = true;
                  if (length <= dashLength * 2) {
                    useLineDash = false;
                  } else if (length <= dashLength * 2 + spaceLength) {
                    multiplier = length / (2 * dashLength + spaceLength);
                    dashLength *= multiplier;
                    spaceLength *= multiplier;
                  } else {
                    numberOfDashes = Math.floor((length + spaceLength) / (dashLength + spaceLength));
                    minSpace = (length - numberOfDashes * dashLength) / (numberOfDashes - 1);
                    maxSpace = (length - (numberOfDashes + 1) * dashLength) / numberOfDashes;
                    spaceLength = maxSpace <= 0 || Math.abs(spaceLength - minSpace) < Math.abs(spaceLength - maxSpace) ? minSpace : maxSpace;
                  }
                  if (useLineDash) {
                    if (style === 3) {
                      this.ctx.setLineDash([0, dashLength + spaceLength]);
                    } else {
                      this.ctx.setLineDash([dashLength, spaceLength]);
                    }
                  }
                  if (style === 3) {
                    this.ctx.lineCap = "round";
                    this.ctx.lineWidth = width;
                  } else {
                    this.ctx.lineWidth = width * 2 + 1.1;
                  }
                  this.ctx.strokeStyle = asString(color2);
                  this.ctx.stroke();
                  this.ctx.setLineDash([]);
                  if (style === 2) {
                    if (isBezierCurve(boxPaths[0])) {
                      path1 = boxPaths[3];
                      path2 = boxPaths[0];
                      this.ctx.beginPath();
                      this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
                      this.ctx.stroke();
                    }
                    if (isBezierCurve(boxPaths[1])) {
                      path1 = boxPaths[1];
                      path2 = boxPaths[2];
                      this.ctx.beginPath();
                      this.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
                      this.ctx.stroke();
                    }
                  }
                  this.ctx.restore();
                  return [
                    2
                    /*return*/
                  ];
                });
              });
            };
            CanvasRenderer2.prototype.render = function(element) {
              return __awaiter(this, void 0, void 0, function() {
                var stack;
                return __generator(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      if (this.options.backgroundColor) {
                        this.ctx.fillStyle = asString(this.options.backgroundColor);
                        this.ctx.fillRect(this.options.x, this.options.y, this.options.width, this.options.height);
                      }
                      stack = parseStackingContexts(element);
                      return [4, this.renderStack(stack)];
                    case 1:
                      _a.sent();
                      this.applyEffects([]);
                      return [2, this.canvas];
                  }
                });
              });
            };
            return CanvasRenderer2;
          })(Renderer)
        );
        var isTextInputElement = function(container) {
          if (container instanceof TextareaElementContainer) {
            return true;
          } else if (container instanceof SelectElementContainer) {
            return true;
          } else if (container instanceof InputElementContainer && container.type !== RADIO && container.type !== CHECKBOX) {
            return true;
          }
          return false;
        };
        var calculateBackgroundCurvedPaintingArea = function(clip, curves) {
          switch (clip) {
            case 0:
              return calculateBorderBoxPath(curves);
            case 2:
              return calculateContentBoxPath(curves);
            case 1:
            default:
              return calculatePaddingBoxPath(curves);
          }
        };
        var canvasTextAlign = function(textAlign2) {
          switch (textAlign2) {
            case 1:
              return "center";
            case 2:
              return "right";
            case 0:
            default:
              return "left";
          }
        };
        var iOSBrokenFonts = ["-apple-system", "system-ui"];
        var fixIOSSystemFonts = function(fontFamilies) {
          return /iPhone OS 15_(0|1)/.test(window.navigator.userAgent) ? fontFamilies.filter(function(fontFamily2) {
            return iOSBrokenFonts.indexOf(fontFamily2) === -1;
          }) : fontFamilies;
        };
        var ForeignObjectRenderer = (
          /** @class */
          (function(_super) {
            __extends(ForeignObjectRenderer2, _super);
            function ForeignObjectRenderer2(context, options) {
              var _this = _super.call(this, context, options) || this;
              _this.canvas = options.canvas ? options.canvas : document.createElement("canvas");
              _this.ctx = _this.canvas.getContext("2d");
              _this.options = options;
              _this.canvas.width = Math.floor(options.width * options.scale);
              _this.canvas.height = Math.floor(options.height * options.scale);
              _this.canvas.style.width = options.width + "px";
              _this.canvas.style.height = options.height + "px";
              _this.ctx.scale(_this.options.scale, _this.options.scale);
              _this.ctx.translate(-options.x, -options.y);
              _this.context.logger.debug("EXPERIMENTAL ForeignObject renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
              return _this;
            }
            ForeignObjectRenderer2.prototype.render = function(element) {
              return __awaiter(this, void 0, void 0, function() {
                var svg, img;
                return __generator(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      svg = createForeignObjectSVG(this.options.width * this.options.scale, this.options.height * this.options.scale, this.options.scale, this.options.scale, element);
                      return [4, loadSerializedSVG(svg)];
                    case 1:
                      img = _a.sent();
                      if (this.options.backgroundColor) {
                        this.ctx.fillStyle = asString(this.options.backgroundColor);
                        this.ctx.fillRect(0, 0, this.options.width * this.options.scale, this.options.height * this.options.scale);
                      }
                      this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
                      return [2, this.canvas];
                  }
                });
              });
            };
            return ForeignObjectRenderer2;
          })(Renderer)
        );
        var loadSerializedSVG = function(svg) {
          return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() {
              resolve(img);
            };
            img.onerror = reject;
            img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
          });
        };
        var Logger = (
          /** @class */
          (function() {
            function Logger2(_a) {
              var id = _a.id, enabled = _a.enabled;
              this.id = id;
              this.enabled = enabled;
              this.start = Date.now();
            }
            Logger2.prototype.debug = function() {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              if (this.enabled) {
                if (typeof window !== "undefined" && window.console && typeof console.debug === "function") {
                  console.debug.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
                } else {
                  this.info.apply(this, args);
                }
              }
            };
            Logger2.prototype.getTime = function() {
              return Date.now() - this.start;
            };
            Logger2.prototype.info = function() {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              if (this.enabled) {
                if (typeof window !== "undefined" && window.console && typeof console.info === "function") {
                  console.info.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
                }
              }
            };
            Logger2.prototype.warn = function() {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              if (this.enabled) {
                if (typeof window !== "undefined" && window.console && typeof console.warn === "function") {
                  console.warn.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
                } else {
                  this.info.apply(this, args);
                }
              }
            };
            Logger2.prototype.error = function() {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              if (this.enabled) {
                if (typeof window !== "undefined" && window.console && typeof console.error === "function") {
                  console.error.apply(console, __spreadArray([this.id, this.getTime() + "ms"], args));
                } else {
                  this.info.apply(this, args);
                }
              }
            };
            Logger2.instances = {};
            return Logger2;
          })()
        );
        var Context = (
          /** @class */
          (function() {
            function Context2(options, windowBounds) {
              var _a;
              this.windowBounds = windowBounds;
              this.instanceName = "#" + Context2.instanceCount++;
              this.logger = new Logger({ id: this.instanceName, enabled: options.logging });
              this.cache = (_a = options.cache) !== null && _a !== void 0 ? _a : new Cache(this, options);
            }
            Context2.instanceCount = 1;
            return Context2;
          })()
        );
        var html2canvas = function(element, options) {
          if (options === void 0) {
            options = {};
          }
          return renderElement(element, options);
        };
        if (typeof window !== "undefined") {
          CacheStorage.setContext(window);
        }
        var renderElement = function(element, opts) {
          return __awaiter(void 0, void 0, void 0, function() {
            var ownerDocument, defaultView, resourceOptions, contextOptions, windowOptions, windowBounds, context, foreignObjectRendering, cloneOptions, documentCloner, clonedElement, container, _a, width, height, left, top, backgroundColor2, renderOptions, canvas, renderer, root, renderer;
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            return __generator(this, function(_u) {
              switch (_u.label) {
                case 0:
                  if (!element || typeof element !== "object") {
                    return [2, Promise.reject("Invalid element provided as first argument")];
                  }
                  ownerDocument = element.ownerDocument;
                  if (!ownerDocument) {
                    throw new Error("Element is not attached to a Document");
                  }
                  defaultView = ownerDocument.defaultView;
                  if (!defaultView) {
                    throw new Error("Document is not attached to a Window");
                  }
                  resourceOptions = {
                    allowTaint: (_b = opts.allowTaint) !== null && _b !== void 0 ? _b : false,
                    imageTimeout: (_c = opts.imageTimeout) !== null && _c !== void 0 ? _c : 15e3,
                    proxy: opts.proxy,
                    useCORS: (_d = opts.useCORS) !== null && _d !== void 0 ? _d : false
                  };
                  contextOptions = __assign({ logging: (_e = opts.logging) !== null && _e !== void 0 ? _e : true, cache: opts.cache }, resourceOptions);
                  windowOptions = {
                    windowWidth: (_f = opts.windowWidth) !== null && _f !== void 0 ? _f : defaultView.innerWidth,
                    windowHeight: (_g = opts.windowHeight) !== null && _g !== void 0 ? _g : defaultView.innerHeight,
                    scrollX: (_h = opts.scrollX) !== null && _h !== void 0 ? _h : defaultView.pageXOffset,
                    scrollY: (_j = opts.scrollY) !== null && _j !== void 0 ? _j : defaultView.pageYOffset
                  };
                  windowBounds = new Bounds(windowOptions.scrollX, windowOptions.scrollY, windowOptions.windowWidth, windowOptions.windowHeight);
                  context = new Context(contextOptions, windowBounds);
                  foreignObjectRendering = (_k = opts.foreignObjectRendering) !== null && _k !== void 0 ? _k : false;
                  cloneOptions = {
                    allowTaint: (_l = opts.allowTaint) !== null && _l !== void 0 ? _l : false,
                    onclone: opts.onclone,
                    ignoreElements: opts.ignoreElements,
                    inlineImages: foreignObjectRendering,
                    copyStyles: foreignObjectRendering
                  };
                  context.logger.debug("Starting document clone with size " + windowBounds.width + "x" + windowBounds.height + " scrolled to " + -windowBounds.left + "," + -windowBounds.top);
                  documentCloner = new DocumentCloner(context, element, cloneOptions);
                  clonedElement = documentCloner.clonedReferenceElement;
                  if (!clonedElement) {
                    return [2, Promise.reject("Unable to find element in cloned iframe")];
                  }
                  return [4, documentCloner.toIFrame(ownerDocument, windowBounds)];
                case 1:
                  container = _u.sent();
                  _a = isBodyElement(clonedElement) || isHTMLElement(clonedElement) ? parseDocumentSize(clonedElement.ownerDocument) : parseBounds(context, clonedElement), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
                  backgroundColor2 = parseBackgroundColor(context, clonedElement, opts.backgroundColor);
                  renderOptions = {
                    canvas: opts.canvas,
                    backgroundColor: backgroundColor2,
                    scale: (_o = (_m = opts.scale) !== null && _m !== void 0 ? _m : defaultView.devicePixelRatio) !== null && _o !== void 0 ? _o : 1,
                    x: ((_p = opts.x) !== null && _p !== void 0 ? _p : 0) + left,
                    y: ((_q = opts.y) !== null && _q !== void 0 ? _q : 0) + top,
                    width: (_r = opts.width) !== null && _r !== void 0 ? _r : Math.ceil(width),
                    height: (_s = opts.height) !== null && _s !== void 0 ? _s : Math.ceil(height)
                  };
                  if (!foreignObjectRendering) return [3, 3];
                  context.logger.debug("Document cloned, using foreign object rendering");
                  renderer = new ForeignObjectRenderer(context, renderOptions);
                  return [4, renderer.render(clonedElement)];
                case 2:
                  canvas = _u.sent();
                  return [3, 5];
                case 3:
                  context.logger.debug("Document cloned, element located at " + left + "," + top + " with size " + width + "x" + height + " using computed rendering");
                  context.logger.debug("Starting DOM parsing");
                  root = parseTree(context, clonedElement);
                  if (backgroundColor2 === root.styles.backgroundColor) {
                    root.styles.backgroundColor = COLORS.TRANSPARENT;
                  }
                  context.logger.debug("Starting renderer for element at " + renderOptions.x + "," + renderOptions.y + " with size " + renderOptions.width + "x" + renderOptions.height);
                  renderer = new CanvasRenderer(context, renderOptions);
                  return [4, renderer.render(root)];
                case 4:
                  canvas = _u.sent();
                  _u.label = 5;
                case 5:
                  if ((_t = opts.removeContainer) !== null && _t !== void 0 ? _t : true) {
                    if (!DocumentCloner.destroy(container)) {
                      context.logger.error("Cannot detach cloned iframe as it is not in the DOM anymore");
                    }
                  }
                  context.logger.debug("Finished rendering");
                  return [2, canvas];
              }
            });
          });
        };
        var parseBackgroundColor = function(context, element, backgroundColorOverride) {
          var ownerDocument = element.ownerDocument;
          var documentBackgroundColor = ownerDocument.documentElement ? parseColor(context, getComputedStyle(ownerDocument.documentElement).backgroundColor) : COLORS.TRANSPARENT;
          var bodyBackgroundColor = ownerDocument.body ? parseColor(context, getComputedStyle(ownerDocument.body).backgroundColor) : COLORS.TRANSPARENT;
          var defaultBackgroundColor = typeof backgroundColorOverride === "string" ? parseColor(context, backgroundColorOverride) : backgroundColorOverride === null ? COLORS.TRANSPARENT : 4294967295;
          return element === ownerDocument.documentElement ? isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? defaultBackgroundColor : bodyBackgroundColor : documentBackgroundColor : defaultBackgroundColor;
        };
        return html2canvas;
      }));
    }
  });

  // node_modules/@lit/reactive-element/css-tag.js
  var t, e, s, o, n, r, i, S, c;
  var init_css_tag = __esm({
    "node_modules/@lit/reactive-element/css-tag.js"() {
      t = globalThis;
      e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
      s = /* @__PURE__ */ Symbol();
      o = /* @__PURE__ */ new WeakMap();
      n = class {
        constructor(t4, e7, o7) {
          if (this._$cssResult$ = true, o7 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
          this.cssText = t4, this.t = e7;
        }
        get styleSheet() {
          let t4 = this.o;
          const s4 = this.t;
          if (e && void 0 === t4) {
            const e7 = void 0 !== s4 && 1 === s4.length;
            e7 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e7 && o.set(s4, t4));
          }
          return t4;
        }
        toString() {
          return this.cssText;
        }
      };
      r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
      i = (t4, ...e7) => {
        const o7 = 1 === t4.length ? t4[0] : e7.reduce((e8, s4, o8) => e8 + ((t5) => {
          if (true === t5._$cssResult$) return t5.cssText;
          if ("number" == typeof t5) return t5;
          throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s4) + t4[o8 + 1], t4[0]);
        return new n(o7, t4, s);
      };
      S = (s4, o7) => {
        if (e) s4.adoptedStyleSheets = o7.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
        else for (const e7 of o7) {
          const o8 = document.createElement("style"), n5 = t.litNonce;
          void 0 !== n5 && o8.setAttribute("nonce", n5), o8.textContent = e7.cssText, s4.appendChild(o8);
        }
      };
      c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
        let e7 = "";
        for (const s4 of t5.cssRules) e7 += s4.cssText;
        return r(e7);
      })(t4) : t4;
    }
  });

  // node_modules/@lit/reactive-element/reactive-element.js
  var i2, e2, h, r2, o2, n2, a, c2, l, p, d, u, f, b, y;
  var init_reactive_element = __esm({
    "node_modules/@lit/reactive-element/reactive-element.js"() {
      init_css_tag();
      init_css_tag();
      ({ is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object);
      a = globalThis;
      c2 = a.trustedTypes;
      l = c2 ? c2.emptyScript : "";
      p = a.reactiveElementPolyfillSupport;
      d = (t4, s4) => t4;
      u = { toAttribute(t4, s4) {
        switch (s4) {
          case Boolean:
            t4 = t4 ? l : null;
            break;
          case Object:
          case Array:
            t4 = null == t4 ? t4 : JSON.stringify(t4);
        }
        return t4;
      }, fromAttribute(t4, s4) {
        let i6 = t4;
        switch (s4) {
          case Boolean:
            i6 = null !== t4;
            break;
          case Number:
            i6 = null === t4 ? null : Number(t4);
            break;
          case Object:
          case Array:
            try {
              i6 = JSON.parse(t4);
            } catch (t5) {
              i6 = null;
            }
        }
        return i6;
      } };
      f = (t4, s4) => !i2(t4, s4);
      b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
      Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
      y = class extends HTMLElement {
        static addInitializer(t4) {
          this._$Ei(), (this.l ?? (this.l = [])).push(t4);
        }
        static get observedAttributes() {
          return this.finalize(), this._$Eh && [...this._$Eh.keys()];
        }
        static createProperty(t4, s4 = b) {
          if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
            const i6 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i6, s4);
            void 0 !== h3 && e2(this.prototype, t4, h3);
          }
        }
        static getPropertyDescriptor(t4, s4, i6) {
          const { get: e7, set: r6 } = h(this.prototype, t4) ?? { get() {
            return this[s4];
          }, set(t5) {
            this[s4] = t5;
          } };
          return { get: e7, set(s5) {
            const h3 = e7?.call(this);
            r6?.call(this, s5), this.requestUpdate(t4, h3, i6);
          }, configurable: true, enumerable: true };
        }
        static getPropertyOptions(t4) {
          return this.elementProperties.get(t4) ?? b;
        }
        static _$Ei() {
          if (this.hasOwnProperty(d("elementProperties"))) return;
          const t4 = n2(this);
          t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
        }
        static finalize() {
          if (this.hasOwnProperty(d("finalized"))) return;
          if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
            const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
            for (const i6 of s4) this.createProperty(i6, t5[i6]);
          }
          const t4 = this[Symbol.metadata];
          if (null !== t4) {
            const s4 = litPropertyMetadata.get(t4);
            if (void 0 !== s4) for (const [t5, i6] of s4) this.elementProperties.set(t5, i6);
          }
          this._$Eh = /* @__PURE__ */ new Map();
          for (const [t5, s4] of this.elementProperties) {
            const i6 = this._$Eu(t5, s4);
            void 0 !== i6 && this._$Eh.set(i6, t5);
          }
          this.elementStyles = this.finalizeStyles(this.styles);
        }
        static finalizeStyles(s4) {
          const i6 = [];
          if (Array.isArray(s4)) {
            const e7 = new Set(s4.flat(1 / 0).reverse());
            for (const s5 of e7) i6.unshift(c(s5));
          } else void 0 !== s4 && i6.push(c(s4));
          return i6;
        }
        static _$Eu(t4, s4) {
          const i6 = s4.attribute;
          return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
        }
        constructor() {
          super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
        }
        _$Ev() {
          this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
        }
        addController(t4) {
          (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
        }
        removeController(t4) {
          this._$EO?.delete(t4);
        }
        _$E_() {
          const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
          for (const i6 of s4.keys()) this.hasOwnProperty(i6) && (t4.set(i6, this[i6]), delete this[i6]);
          t4.size > 0 && (this._$Ep = t4);
        }
        createRenderRoot() {
          const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
          return S(t4, this.constructor.elementStyles), t4;
        }
        connectedCallback() {
          this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
        }
        enableUpdating(t4) {
        }
        disconnectedCallback() {
          this._$EO?.forEach((t4) => t4.hostDisconnected?.());
        }
        attributeChangedCallback(t4, s4, i6) {
          this._$AK(t4, i6);
        }
        _$ET(t4, s4) {
          const i6 = this.constructor.elementProperties.get(t4), e7 = this.constructor._$Eu(t4, i6);
          if (void 0 !== e7 && true === i6.reflect) {
            const h3 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s4, i6.type);
            this._$Em = t4, null == h3 ? this.removeAttribute(e7) : this.setAttribute(e7, h3), this._$Em = null;
          }
        }
        _$AK(t4, s4) {
          const i6 = this.constructor, e7 = i6._$Eh.get(t4);
          if (void 0 !== e7 && this._$Em !== e7) {
            const t5 = i6.getPropertyOptions(e7), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
            this._$Em = e7;
            const r6 = h3.fromAttribute(s4, t5.type);
            this[e7] = r6 ?? this._$Ej?.get(e7) ?? r6, this._$Em = null;
          }
        }
        requestUpdate(t4, s4, i6, e7 = false, h3) {
          if (void 0 !== t4) {
            const r6 = this.constructor;
            if (false === e7 && (h3 = this[t4]), i6 ?? (i6 = r6.getPropertyOptions(t4)), !((i6.hasChanged ?? f)(h3, s4) || i6.useDefault && i6.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i6)))) return;
            this.C(t4, s4, i6);
          }
          false === this.isUpdatePending && (this._$ES = this._$EP());
        }
        C(t4, s4, { useDefault: i6, reflect: e7, wrapped: h3 }, r6) {
          i6 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i6 || (s4 = void 0), this._$AL.set(t4, s4)), true === e7 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
        }
        async _$EP() {
          this.isUpdatePending = true;
          try {
            await this._$ES;
          } catch (t5) {
            Promise.reject(t5);
          }
          const t4 = this.scheduleUpdate();
          return null != t4 && await t4, !this.isUpdatePending;
        }
        scheduleUpdate() {
          return this.performUpdate();
        }
        performUpdate() {
          if (!this.isUpdatePending) return;
          if (!this.hasUpdated) {
            if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
              for (const [t6, s5] of this._$Ep) this[t6] = s5;
              this._$Ep = void 0;
            }
            const t5 = this.constructor.elementProperties;
            if (t5.size > 0) for (const [s5, i6] of t5) {
              const { wrapped: t6 } = i6, e7 = this[s5];
              true !== t6 || this._$AL.has(s5) || void 0 === e7 || this.C(s5, void 0, i6, e7);
            }
          }
          let t4 = false;
          const s4 = this._$AL;
          try {
            t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
          } catch (s5) {
            throw t4 = false, this._$EM(), s5;
          }
          t4 && this._$AE(s4);
        }
        willUpdate(t4) {
        }
        _$AE(t4) {
          this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
        }
        _$EM() {
          this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
        }
        get updateComplete() {
          return this.getUpdateComplete();
        }
        getUpdateComplete() {
          return this._$ES;
        }
        shouldUpdate(t4) {
          return true;
        }
        update(t4) {
          this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
        }
        updated(t4) {
        }
        firstUpdated(t4) {
        }
      };
      y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");
    }
  });

  // node_modules/lit-html/lit-html.js
  function V(t4, i6) {
    if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== e3 ? e3.createHTML(i6) : i6;
  }
  function M(t4, i6, s4 = t4, e7) {
    if (i6 === E) return i6;
    let h3 = void 0 !== e7 ? s4._$Co?.[e7] : s4._$Cl;
    const o7 = a2(i6) ? void 0 : i6._$litDirective$;
    return h3?.constructor !== o7 && (h3?._$AO?.(false), void 0 === o7 ? h3 = void 0 : (h3 = new o7(t4), h3._$AT(t4, s4, e7)), void 0 !== e7 ? (s4._$Co ?? (s4._$Co = []))[e7] = h3 : s4._$Cl = h3), void 0 !== h3 && (i6 = M(t4, h3._$AS(t4, i6.values), h3, e7)), i6;
  }
  var t2, i3, s2, e3, h2, o3, n3, r3, l2, c3, a2, u2, d2, f2, v, _, m, p2, g, $, y2, x, b2, w, T, E, A, C, P, N, S2, R, k, H, I, L, z, Z, B, D;
  var init_lit_html = __esm({
    "node_modules/lit-html/lit-html.js"() {
      t2 = globalThis;
      i3 = (t4) => t4;
      s2 = t2.trustedTypes;
      e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
      h2 = "$lit$";
      o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
      n3 = "?" + o3;
      r3 = `<${n3}>`;
      l2 = document;
      c3 = () => l2.createComment("");
      a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
      u2 = Array.isArray;
      d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
      f2 = "[ 	\n\f\r]";
      v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
      _ = /-->/g;
      m = />/g;
      p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
      g = /'/g;
      $ = /"/g;
      y2 = /^(?:script|style|textarea|title)$/i;
      x = (t4) => (i6, ...s4) => ({ _$litType$: t4, strings: i6, values: s4 });
      b2 = x(1);
      w = x(2);
      T = x(3);
      E = /* @__PURE__ */ Symbol.for("lit-noChange");
      A = /* @__PURE__ */ Symbol.for("lit-nothing");
      C = /* @__PURE__ */ new WeakMap();
      P = l2.createTreeWalker(l2, 129);
      N = (t4, i6) => {
        const s4 = t4.length - 1, e7 = [];
        let n5, l3 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c4 = v;
        for (let i7 = 0; i7 < s4; i7++) {
          const s5 = t4[i7];
          let a3, u3, d3 = -1, f3 = 0;
          for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
          const x2 = c4 === p2 && t4[i7 + 1].startsWith("/>") ? " " : "";
          l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e7.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i7 : x2);
        }
        return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e7];
      };
      S2 = class _S {
        constructor({ strings: t4, _$litType$: i6 }, e7) {
          let r6;
          this.parts = [];
          let l3 = 0, a3 = 0;
          const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i6);
          if (this.el = _S.createElement(f3, e7), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
            const t5 = this.el.content.firstChild;
            t5.replaceWith(...t5.childNodes);
          }
          for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
            if (1 === r6.nodeType) {
              if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
                const i7 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e8 = /([.?@])?(.*)/.exec(i7);
                d3.push({ type: 1, index: l3, name: e8[2], strings: s4, ctor: "." === e8[1] ? I : "?" === e8[1] ? L : "@" === e8[1] ? z : H }), r6.removeAttribute(t5);
              } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
              if (y2.test(r6.tagName)) {
                const t5 = r6.textContent.split(o3), i7 = t5.length - 1;
                if (i7 > 0) {
                  r6.textContent = s2 ? s2.emptyScript : "";
                  for (let s4 = 0; s4 < i7; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
                  r6.append(t5[i7], c3());
                }
              }
            } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
            else {
              let t5 = -1;
              for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
            }
            l3++;
          }
        }
        static createElement(t4, i6) {
          const s4 = l2.createElement("template");
          return s4.innerHTML = t4, s4;
        }
      };
      R = class {
        constructor(t4, i6) {
          this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i6;
        }
        get parentNode() {
          return this._$AM.parentNode;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        u(t4) {
          const { el: { content: i6 }, parts: s4 } = this._$AD, e7 = (t4?.creationScope ?? l2).importNode(i6, true);
          P.currentNode = e7;
          let h3 = P.nextNode(), o7 = 0, n5 = 0, r6 = s4[0];
          for (; void 0 !== r6; ) {
            if (o7 === r6.index) {
              let i7;
              2 === r6.type ? i7 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i7 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i7 = new Z(h3, this, t4)), this._$AV.push(i7), r6 = s4[++n5];
            }
            o7 !== r6?.index && (h3 = P.nextNode(), o7++);
          }
          return P.currentNode = l2, e7;
        }
        p(t4) {
          let i6 = 0;
          for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i6), i6 += s4.strings.length - 2) : s4._$AI(t4[i6])), i6++;
        }
      };
      k = class _k {
        get _$AU() {
          return this._$AM?._$AU ?? this._$Cv;
        }
        constructor(t4, i6, s4, e7) {
          this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i6, this._$AM = s4, this.options = e7, this._$Cv = e7?.isConnected ?? true;
        }
        get parentNode() {
          let t4 = this._$AA.parentNode;
          const i6 = this._$AM;
          return void 0 !== i6 && 11 === t4?.nodeType && (t4 = i6.parentNode), t4;
        }
        get startNode() {
          return this._$AA;
        }
        get endNode() {
          return this._$AB;
        }
        _$AI(t4, i6 = this) {
          t4 = M(this, t4, i6), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
        }
        O(t4) {
          return this._$AA.parentNode.insertBefore(t4, this._$AB);
        }
        T(t4) {
          this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
        }
        _(t4) {
          this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
        }
        $(t4) {
          const { values: i6, _$litType$: s4 } = t4, e7 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
          if (this._$AH?._$AD === e7) this._$AH.p(i6);
          else {
            const t5 = new R(e7, this), s5 = t5.u(this.options);
            t5.p(i6), this.T(s5), this._$AH = t5;
          }
        }
        _$AC(t4) {
          let i6 = C.get(t4.strings);
          return void 0 === i6 && C.set(t4.strings, i6 = new S2(t4)), i6;
        }
        k(t4) {
          u2(this._$AH) || (this._$AH = [], this._$AR());
          const i6 = this._$AH;
          let s4, e7 = 0;
          for (const h3 of t4) e7 === i6.length ? i6.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i6[e7], s4._$AI(h3), e7++;
          e7 < i6.length && (this._$AR(s4 && s4._$AB.nextSibling, e7), i6.length = e7);
        }
        _$AR(t4 = this._$AA.nextSibling, s4) {
          for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
            const s5 = i3(t4).nextSibling;
            i3(t4).remove(), t4 = s5;
          }
        }
        setConnected(t4) {
          void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
        }
      };
      H = class {
        get tagName() {
          return this.element.tagName;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        constructor(t4, i6, s4, e7, h3) {
          this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i6, this._$AM = e7, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
        }
        _$AI(t4, i6 = this, s4, e7) {
          const h3 = this.strings;
          let o7 = false;
          if (void 0 === h3) t4 = M(this, t4, i6, 0), o7 = !a2(t4) || t4 !== this._$AH && t4 !== E, o7 && (this._$AH = t4);
          else {
            const e8 = t4;
            let n5, r6;
            for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e8[s4 + n5], i6, n5), r6 === E && (r6 = this._$AH[n5]), o7 || (o7 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
          }
          o7 && !e7 && this.j(t4);
        }
        j(t4) {
          t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
        }
      };
      I = class extends H {
        constructor() {
          super(...arguments), this.type = 3;
        }
        j(t4) {
          this.element[this.name] = t4 === A ? void 0 : t4;
        }
      };
      L = class extends H {
        constructor() {
          super(...arguments), this.type = 4;
        }
        j(t4) {
          this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
        }
      };
      z = class extends H {
        constructor(t4, i6, s4, e7, h3) {
          super(t4, i6, s4, e7, h3), this.type = 5;
        }
        _$AI(t4, i6 = this) {
          if ((t4 = M(this, t4, i6, 0) ?? A) === E) return;
          const s4 = this._$AH, e7 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e7);
          e7 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
        }
        handleEvent(t4) {
          "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
        }
      };
      Z = class {
        constructor(t4, i6, s4) {
          this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s4;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        _$AI(t4) {
          M(this, t4);
        }
      };
      B = t2.litHtmlPolyfillSupport;
      B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
      D = (t4, i6, s4) => {
        const e7 = s4?.renderBefore ?? i6;
        let h3 = e7._$litPart$;
        if (void 0 === h3) {
          const t5 = s4?.renderBefore ?? null;
          e7._$litPart$ = h3 = new k(i6.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
        }
        return h3._$AI(t4), h3;
      };
    }
  });

  // node_modules/lit-element/lit-element.js
  var s3, i4, o4;
  var init_lit_element = __esm({
    "node_modules/lit-element/lit-element.js"() {
      init_reactive_element();
      init_reactive_element();
      init_lit_html();
      init_lit_html();
      s3 = globalThis;
      i4 = class extends y {
        constructor() {
          super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
        }
        createRenderRoot() {
          var _a;
          const t4 = super.createRenderRoot();
          return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
        }
        update(t4) {
          const r6 = this.render();
          this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
        }
        connectedCallback() {
          super.connectedCallback(), this._$Do?.setConnected(true);
        }
        disconnectedCallback() {
          super.disconnectedCallback(), this._$Do?.setConnected(false);
        }
        render() {
          return E;
        }
      };
      i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
      o4 = s3.litElementPolyfillSupport;
      o4?.({ LitElement: i4 });
      (s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");
    }
  });

  // node_modules/lit-html/is-server.js
  var init_is_server = __esm({
    "node_modules/lit-html/is-server.js"() {
    }
  });

  // node_modules/lit/index.js
  var init_lit = __esm({
    "node_modules/lit/index.js"() {
      init_reactive_element();
      init_lit_html();
      init_lit_element();
      init_is_server();
    }
  });

  // node_modules/@lit/reactive-element/decorators/custom-element.js
  var init_custom_element = __esm({
    "node_modules/@lit/reactive-element/decorators/custom-element.js"() {
    }
  });

  // node_modules/@lit/reactive-element/decorators/property.js
  function n4(t4) {
    return (e7, o7) => "object" == typeof o7 ? r4(t4, e7, o7) : ((t5, e8, o8) => {
      const r6 = e8.hasOwnProperty(o8);
      return e8.constructor.createProperty(o8, t5), r6 ? Object.getOwnPropertyDescriptor(e8, o8) : void 0;
    })(t4, e7, o7);
  }
  var o5, r4;
  var init_property = __esm({
    "node_modules/@lit/reactive-element/decorators/property.js"() {
      init_reactive_element();
      o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
      r4 = (t4 = o5, e7, r6) => {
        const { kind: n5, metadata: i6 } = r6;
        let s4 = globalThis.litPropertyMetadata.get(i6);
        if (void 0 === s4 && globalThis.litPropertyMetadata.set(i6, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
          const { name: o7 } = r6;
          return { set(r7) {
            const n6 = e7.get.call(this);
            e7.set.call(this, r7), this.requestUpdate(o7, n6, t4, true, r7);
          }, init(e8) {
            return void 0 !== e8 && this.C(o7, void 0, t4, e8), e8;
          } };
        }
        if ("setter" === n5) {
          const { name: o7 } = r6;
          return function(r7) {
            const n6 = this[o7];
            e7.call(this, r7), this.requestUpdate(o7, n6, t4, true, r7);
          };
        }
        throw Error("Unsupported decorator location: " + n5);
      };
    }
  });

  // node_modules/@lit/reactive-element/decorators/state.js
  function r5(r6) {
    return n4({ ...r6, state: true, attribute: false });
  }
  var init_state = __esm({
    "node_modules/@lit/reactive-element/decorators/state.js"() {
      init_property();
    }
  });

  // node_modules/@lit/reactive-element/decorators/event-options.js
  var init_event_options = __esm({
    "node_modules/@lit/reactive-element/decorators/event-options.js"() {
    }
  });

  // node_modules/@lit/reactive-element/decorators/base.js
  var init_base = __esm({
    "node_modules/@lit/reactive-element/decorators/base.js"() {
    }
  });

  // node_modules/@lit/reactive-element/decorators/query.js
  var init_query = __esm({
    "node_modules/@lit/reactive-element/decorators/query.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-all.js
  var init_query_all = __esm({
    "node_modules/@lit/reactive-element/decorators/query-all.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-async.js
  var init_query_async = __esm({
    "node_modules/@lit/reactive-element/decorators/query-async.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-assigned-elements.js
  var init_query_assigned_elements = __esm({
    "node_modules/@lit/reactive-element/decorators/query-assigned-elements.js"() {
      init_base();
    }
  });

  // node_modules/@lit/reactive-element/decorators/query-assigned-nodes.js
  var init_query_assigned_nodes = __esm({
    "node_modules/@lit/reactive-element/decorators/query-assigned-nodes.js"() {
      init_base();
    }
  });

  // node_modules/lit/decorators.js
  var init_decorators = __esm({
    "node_modules/lit/decorators.js"() {
      init_custom_element();
      init_property();
      init_state();
      init_event_options();
      init_query();
      init_query_all();
      init_query_async();
      init_query_assigned_elements();
      init_query_assigned_nodes();
    }
  });

  // node_modules/lit-html/directive.js
  var t3, e5, i5;
  var init_directive = __esm({
    "node_modules/lit-html/directive.js"() {
      t3 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
      e5 = (t4) => (...e7) => ({ _$litDirective$: t4, values: e7 });
      i5 = class {
        constructor(t4) {
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        _$AT(t4, e7, i6) {
          this._$Ct = t4, this._$AM = e7, this._$Ci = i6;
        }
        _$AS(t4, e7) {
          return this.update(t4, e7);
        }
        update(t4, e7) {
          return this.render(...e7);
        }
      };
    }
  });

  // node_modules/lit-html/directives/class-map.js
  var e6;
  var init_class_map = __esm({
    "node_modules/lit-html/directives/class-map.js"() {
      init_lit_html();
      init_directive();
      e6 = e5(class extends i5 {
        constructor(t4) {
          if (super(t4), t4.type !== t3.ATTRIBUTE || "class" !== t4.name || t4.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
        }
        render(t4) {
          return " " + Object.keys(t4).filter((s4) => t4[s4]).join(" ") + " ";
        }
        update(s4, [i6]) {
          if (void 0 === this.st) {
            this.st = /* @__PURE__ */ new Set(), void 0 !== s4.strings && (this.nt = new Set(s4.strings.join(" ").split(/\s/).filter((t4) => "" !== t4)));
            for (const t4 in i6) i6[t4] && !this.nt?.has(t4) && this.st.add(t4);
            return this.render(i6);
          }
          const r6 = s4.element.classList;
          for (const t4 of this.st) t4 in i6 || (r6.remove(t4), this.st.delete(t4));
          for (const t4 in i6) {
            const s5 = !!i6[t4];
            s5 === this.st.has(t4) || this.nt?.has(t4) || (s5 ? (r6.add(t4), this.st.add(t4)) : (r6.remove(t4), this.st.delete(t4)));
          }
          return E;
        }
      });
    }
  });

  // node_modules/lit/directives/class-map.js
  var init_class_map2 = __esm({
    "node_modules/lit/directives/class-map.js"() {
      init_class_map();
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/VscElement.js
  var VERSION, CONFIG_KEY, warn, VscElement, customElement;
  var init_VscElement = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/VscElement.js"() {
      init_lit();
      VERSION = "2.5.1";
      CONFIG_KEY = "__vscodeElements_disableRegistryWarning__";
      warn = (message, componentInstance) => {
        const prefix = "[VSCode Elements] ";
        if (componentInstance) {
          console.warn(`${prefix}${message}
%o`, componentInstance);
        } else {
          console.warn(`${message}
%o`, componentInstance);
        }
      };
      VscElement = class extends i4 {
        /** VSCode Elements version */
        get version() {
          return VERSION;
        }
        warn(message) {
          warn(message, this);
        }
      };
      customElement = (tagName) => {
        return (classOrTarget) => {
          const customElementClass = customElements.get(tagName);
          if (!customElementClass) {
            customElements.define(tagName, classOrTarget);
            return;
          }
          if (CONFIG_KEY in window) {
            return;
          }
          const el = document.createElement(tagName);
          const anotherVersion = el?.version;
          let message = "";
          if (!anotherVersion) {
            message += "is already registered by an unknown custom element handler class.";
          } else if (anotherVersion !== VERSION) {
            message += "is already registered by a different version of VSCode Elements. ";
            message += `This version is "${VERSION}", while the other one is "${anotherVersion}".`;
          } else {
            message += `is already registered by the same version of VSCode Elements (${VERSION}).`;
          }
          warn(`The custom element "${tagName}" ${message}
To suppress this warning, set window.${CONFIG_KEY} to true`);
        };
      };
    }
  });

  // node_modules/lit-html/directives/if-defined.js
  var o6;
  var init_if_defined = __esm({
    "node_modules/lit-html/directives/if-defined.js"() {
      init_lit_html();
      o6 = (o7) => o7 ?? A;
    }
  });

  // node_modules/lit/directives/if-defined.js
  var init_if_defined2 = __esm({
    "node_modules/lit/directives/if-defined.js"() {
      init_if_defined();
    }
  });

  // node_modules/lit/directive.js
  var init_directive2 = __esm({
    "node_modules/lit/directive.js"() {
      init_directive();
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/style-property-map.js
  var StylePropertyMap, stylePropertyMap;
  var init_style_property_map = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/style-property-map.js"() {
      init_lit();
      init_directive2();
      StylePropertyMap = class extends i5 {
        constructor(partInfo) {
          super(partInfo);
          this._prevProperties = {};
          if (partInfo.type !== t3.PROPERTY || partInfo.name !== "style") {
            throw new Error("The `stylePropertyMap` directive must be used in the `style` property");
          }
        }
        update(part, [styleProps]) {
          Object.entries(styleProps).forEach(([key, val]) => {
            if (this._prevProperties[key] !== val) {
              if (key.startsWith("--")) {
                part.element.style.setProperty(key, val);
              } else {
                part.element.style[key] = val;
              }
              this._prevProperties[key] = val;
            }
          });
          return E;
        }
        render(_styleProps) {
          return E;
        }
      };
      stylePropertyMap = e5(StylePropertyMap);
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/default.styles.js
  var default_styles_default;
  var init_default_styles = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/default.styles.js"() {
      init_lit();
      default_styles_default = i`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.styles.js
  var styles, vscode_icon_styles_default;
  var init_vscode_icon_styles = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.styles.js"() {
      init_lit();
      init_default_styles();
      styles = [
        default_styles_default,
        i`
    :host {
      color: var(--vscode-icon-foreground, #cccccc);
      display: inline-block;
    }

    .codicon[class*='codicon-'] {
      display: block;
    }

    .icon,
    .button {
      background-color: transparent;
      display: block;
      padding: 0;
    }

    .button {
      border-color: transparent;
      border-style: solid;
      border-width: 1px;
      border-radius: 5px;
      color: currentColor;
      cursor: pointer;
      padding: 2px;
    }

    .button:hover {
      background-color: var(
        --vscode-toolbar-hoverBackground,
        rgba(90, 93, 94, 0.31)
      );
    }

    .button:active {
      background-color: var(
        --vscode-toolbar-activeBackground,
        rgba(99, 102, 103, 0.31)
      );
    }

    .button:focus {
      outline: none;
    }

    .button:focus-visible {
      border-color: var(--vscode-focusBorder, #0078d4);
    }

    @keyframes icon-spin {
      100% {
        transform: rotate(360deg);
      }
    }

    .spin {
      animation-name: icon-spin;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `
      ];
      vscode_icon_styles_default = styles;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.js
  var __decorate, VscodeIcon_1, VscodeIcon;
  var init_vscode_icon = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-icon/vscode-icon.js"() {
      init_lit();
      init_decorators();
      init_class_map2();
      init_if_defined2();
      init_VscElement();
      init_style_property_map();
      init_vscode_icon_styles();
      __decorate = function(decorators, target, key, desc) {
        var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
        else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
        return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
      };
      VscodeIcon = VscodeIcon_1 = class VscodeIcon2 extends VscElement {
        constructor() {
          super(...arguments);
          this.label = "";
          this.name = "";
          this.size = 16;
          this.spin = false;
          this.spinDuration = 1.5;
          this.actionIcon = false;
          this._onButtonClick = (ev) => {
            this.dispatchEvent(new CustomEvent("vsc-click", { detail: { originalEvent: ev } }));
          };
        }
        connectedCallback() {
          super.connectedCallback();
          const { href, nonce } = this._getStylesheetConfig();
          VscodeIcon_1.stylesheetHref = href;
          VscodeIcon_1.nonce = nonce;
        }
        /**
         * For using web fonts in web components, the font stylesheet must be included
         * twice: on the page and in the web component. This function looks for the
         * font stylesheet on the page and returns the stylesheet URL and the nonce
         * id.
         */
        _getStylesheetConfig() {
          if (typeof document === "undefined") {
            return { nonce: void 0, href: void 0 };
          }
          const linkElement = document.getElementById("vscode-codicon-stylesheet");
          const href = linkElement?.getAttribute("href") || void 0;
          const nonce = linkElement?.nonce || void 0;
          if (!linkElement) {
            let msg = 'To use the Icon component, the codicons.css file must be included in the page with the id "vscode-codicon-stylesheet"! ';
            msg += "See https://vscode-elements.github.io/components/icon/ for more details.";
            this.warn(msg);
          }
          return { nonce, href };
        }
        render() {
          const { stylesheetHref, nonce } = VscodeIcon_1;
          const content = b2`<span
      class=${e6({
            codicon: true,
            ["codicon-" + this.name]: true,
            spin: this.spin
          })}
      .style=${stylePropertyMap({
            animationDuration: String(this.spinDuration) + "s",
            fontSize: this.size + "px",
            height: this.size + "px",
            width: this.size + "px"
          })}
    ></span>`;
          const wrapped = this.actionIcon ? b2` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${content}
        </button>` : b2` <span class="icon" aria-hidden="true" role="presentation"
          >${content}</span
        >`;
          return b2`
      <link
        rel="stylesheet"
        href=${o6(stylesheetHref)}
        nonce=${o6(nonce)}
      />
      ${wrapped}
    `;
        }
      };
      VscodeIcon.styles = vscode_icon_styles_default;
      VscodeIcon.stylesheetHref = "";
      VscodeIcon.nonce = "";
      __decorate([
        n4()
      ], VscodeIcon.prototype, "label", void 0);
      __decorate([
        n4({ type: String })
      ], VscodeIcon.prototype, "name", void 0);
      __decorate([
        n4({ type: Number })
      ], VscodeIcon.prototype, "size", void 0);
      __decorate([
        n4({ type: Boolean, reflect: true })
      ], VscodeIcon.prototype, "spin", void 0);
      __decorate([
        n4({ type: Number, attribute: "spin-duration" })
      ], VscodeIcon.prototype, "spinDuration", void 0);
      __decorate([
        n4({ type: Boolean, reflect: true, attribute: "action-icon" })
      ], VscodeIcon.prototype, "actionIcon", void 0);
      VscodeIcon = VscodeIcon_1 = __decorate([
        customElement("vscode-icon")
      ], VscodeIcon);
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-icon/index.js
  var init_vscode_icon2 = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-icon/index.js"() {
      init_vscode_icon();
    }
  });

  // node_modules/@vscode-elements/elements/dist/includes/helpers.js
  function getDefaultFontStack() {
    if (navigator.userAgent.indexOf("Linux") > -1) {
      return 'system-ui, "Ubuntu", "Droid Sans", sans-serif';
    } else if (navigator.userAgent.indexOf("Mac") > -1) {
      return "-apple-system, BlinkMacSystemFont, sans-serif";
    } else if (navigator.userAgent.indexOf("Windows") > -1) {
      return '"Segoe WPC", "Segoe UI", sans-serif';
    } else {
      return "sans-serif";
    }
  }
  var DEFAULT_LINE_HEIGHT, DEFAULT_FONT_SIZE, INPUT_LINE_HEIGHT_RATIO;
  var init_helpers = __esm({
    "node_modules/@vscode-elements/elements/dist/includes/helpers.js"() {
      DEFAULT_LINE_HEIGHT = 16;
      DEFAULT_FONT_SIZE = 13;
      INPUT_LINE_HEIGHT_RATIO = DEFAULT_LINE_HEIGHT / DEFAULT_FONT_SIZE;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.styles.js
  var defaultFontStack, styles2, vscode_button_styles_default;
  var init_vscode_button_styles = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.styles.js"() {
      init_lit();
      init_default_styles();
      init_helpers();
      defaultFontStack = r(getDefaultFontStack());
      styles2 = [
        default_styles_default,
        i`
    :host {
      cursor: pointer;
      display: inline-block;
      width: auto;
    }

    :host([block]) {
      display: block;
      width: 100%;
    }

    .base {
      align-items: center;
      background-color: var(--vscode-button-background, #0078d4);
      border-bottom-left-radius: var(--vsc-border-left-radius, 4px);
      border-bottom-right-radius: var(--vsc-border-right-radius, 4px);
      border-bottom-width: 1px;
      border-color: var(--vscode-button-border, transparent);
      border-left-width: var(--vsc-border-left-width, 1px);
      border-right-width: var(--vsc-border-right-width, 1px);
      border-style: solid;
      border-top-left-radius: var(--vsc-border-left-radius, 4px);
      border-top-right-radius: var(--vsc-border-right-radius, 4px);
      border-top-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-button-foreground, #ffffff);
      display: flex;
      font-family: var(--vscode-font-family, ${defaultFontStack});
      font-size: var(--vscode-font-size, 13px);
      font-weight: var(--vscode-font-weight, normal);
      height: 100%;
      justify-content: center;
      line-height: 22px;
      overflow: hidden;
      padding: 1px calc(13px + var(--vsc-base-additional-right-padding, 0px))
        1px 13px;
      position: relative;
      user-select: none;
      white-space: nowrap;
      width: 100%;
    }

    :host([block]) .base {
      min-height: 28px;
      text-align: center;
      width: 100%;
    }

    .base:after {
      background-color: var(
        --vscode-button-separator,
        rgba(255, 255, 255, 0.4)
      );
      content: var(--vsc-base-after-content);
      display: var(--vsc-divider-display, none);
      position: absolute;
      right: 0;
      top: 4px;
      bottom: 4px;
      width: 1px;
    }

    :host([secondary]) .base:after {
      background-color: var(--vscode-button-secondaryForeground, #cccccc);
      opacity: 0.4;
    }

    :host([secondary]) .base {
      color: var(--vscode-button-secondaryForeground, #cccccc);
      background-color: var(--vscode-button-secondaryBackground, #313131);
      border-color: var(
        --vscode-button-border,
        var(--vscode-button-secondaryBackground, rgba(255, 255, 255, 0.07))
      );
    }

    :host([disabled]) {
      cursor: default;
      opacity: 0.4;
      pointer-events: none;
    }

    :host(:hover) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
    }

    :host([disabled]:hover) .base {
      background-color: var(--vscode-button-background, #0078d4);
    }

    :host([secondary]:hover) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:hover) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    :host(:focus),
    :host(:active) {
      outline: none;
    }

    :host(:focus) .base {
      background-color: var(--vscode-button-hoverBackground, #026ec1);
      outline: 1px solid var(--vscode-focusBorder, #0078d4);
      outline-offset: 2px;
    }

    :host([disabled]:focus) .base {
      background-color: var(--vscode-button-background, #0078d4);
      outline: 0;
    }

    :host([secondary]:focus) .base {
      background-color: var(--vscode-button-secondaryHoverBackground, #3c3c3c);
    }

    :host([secondary][disabled]:focus) .base {
      background-color: var(--vscode-button-secondaryBackground, #313131);
    }

    ::slotted(*) {
      display: inline-block;
      margin-left: 4px;
      margin-right: 4px;
    }

    ::slotted(*:first-child) {
      margin-left: 0;
    }

    ::slotted(*:last-child) {
      margin-right: 0;
    }

    ::slotted(vscode-icon) {
      color: inherit;
    }

    .content {
      display: flex;
      position: relative;
      width: 100%;
      height: 100%;
      padding: 1px 13px;
    }

    :host(:empty) .base,
    .base.icon-only {
      min-height: 24px;
      min-width: 26px;
      padding: 1px 4px;
    }

    slot {
      align-items: center;
      display: flex;
      height: 100%;
    }

    .has-content-before slot[name='content-before'] {
      margin-right: 4px;
    }

    .has-content-after slot[name='content-after'] {
      margin-left: 4px;
    }

    .icon,
    .icon-after {
      color: inherit;
      display: block;
    }

    :host(:not(:empty)) .icon {
      margin-right: 3px;
    }

    :host(:not(:empty)) .icon-after,
    :host([icon]) .icon-after {
      margin-left: 3px;
    }
  `
      ];
      vscode_button_styles_default = styles2;
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.js
  var __decorate2, VscodeButton;
  var init_vscode_button = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-button/vscode-button.js"() {
      init_lit();
      init_decorators();
      init_class_map2();
      init_VscElement();
      init_vscode_icon2();
      init_vscode_button_styles();
      init_if_defined2();
      __decorate2 = function(decorators, target, key, desc) {
        var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
        else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
        return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
      };
      VscodeButton = class VscodeButton2 extends VscElement {
        get form() {
          return this._internals.form;
        }
        constructor() {
          super();
          this.autofocus = false;
          this.tabIndex = 0;
          this.secondary = false;
          this.block = false;
          this.role = "button";
          this.disabled = false;
          this.icon = "";
          this.iconSpin = false;
          this.iconAfter = "";
          this.iconAfterSpin = false;
          this.focused = false;
          this.name = void 0;
          this.iconOnly = false;
          this.type = "button";
          this.value = "";
          this._prevTabindex = 0;
          this._hasContentBefore = false;
          this._hasContentAfter = false;
          this._handleFocus = () => {
            this.focused = true;
          };
          this._handleBlur = () => {
            this.focused = false;
          };
          this.addEventListener("keydown", this._handleKeyDown.bind(this));
          this.addEventListener("click", this._handleClick.bind(this));
          this._internals = this.attachInternals();
        }
        connectedCallback() {
          super.connectedCallback();
          if (this.autofocus) {
            if (this.tabIndex < 0) {
              this.tabIndex = 0;
            }
            this.updateComplete.then(() => {
              this.focus();
              this.requestUpdate();
            });
          }
          this.addEventListener("focus", this._handleFocus);
          this.addEventListener("blur", this._handleBlur);
        }
        disconnectedCallback() {
          super.disconnectedCallback();
          this.removeEventListener("focus", this._handleFocus);
          this.removeEventListener("blur", this._handleBlur);
        }
        update(changedProperties) {
          super.update(changedProperties);
          if (changedProperties.has("value")) {
            this._internals.setFormValue(this.value);
          }
          if (changedProperties.has("disabled")) {
            if (this.disabled) {
              this._prevTabindex = this.tabIndex;
              this.tabIndex = -1;
            } else {
              this.tabIndex = this._prevTabindex;
            }
          }
        }
        _executeAction() {
          if (this.type === "submit" && this._internals.form) {
            this._internals.form.requestSubmit();
          }
          if (this.type === "reset" && this._internals.form) {
            this._internals.form.reset();
          }
        }
        _handleKeyDown(event) {
          if ((event.key === "Enter" || event.key === " ") && !this.hasAttribute("disabled")) {
            const syntheticClick = new MouseEvent("click", {
              bubbles: true,
              cancelable: true
            });
            syntheticClick.synthetic = true;
            this.dispatchEvent(syntheticClick);
            this._executeAction();
          }
        }
        _handleClick(event) {
          if (event.synthetic) {
            return;
          }
          if (!this.hasAttribute("disabled")) {
            this._executeAction();
          }
        }
        _handleSlotChange(ev) {
          const slot = ev.target;
          if (slot.name === "content-before") {
            this._hasContentBefore = slot.assignedElements().length > 0;
          }
          if (slot.name === "content-after") {
            this._hasContentAfter = slot.assignedElements().length > 0;
          }
        }
        render() {
          const hasIcon = this.icon !== "";
          const hasIconAfter = this.iconAfter !== "";
          const baseClasses = {
            base: true,
            "icon-only": this.iconOnly,
            "has-content-before": this._hasContentBefore,
            "has-content-after": this._hasContentAfter
          };
          const iconElem = hasIcon ? b2`<vscode-icon
          name=${this.icon}
          ?spin=${this.iconSpin}
          spin-duration=${o6(this.iconSpinDuration)}
          class="icon"
        ></vscode-icon>` : A;
          const iconAfterElem = hasIconAfter ? b2`<vscode-icon
          name=${this.iconAfter}
          ?spin=${this.iconAfterSpin}
          spin-duration=${o6(this.iconAfterSpinDuration)}
          class="icon-after"
        ></vscode-icon>` : A;
          return b2`
      <div
        class=${e6(baseClasses)}
        part="base"
        @slotchange=${this._handleSlotChange}
      >
        <slot name="content-before"></slot>
        ${iconElem}
        <slot></slot>
        ${iconAfterElem}
        <slot name="content-after"></slot>
      </div>
    `;
        }
      };
      VscodeButton.styles = vscode_button_styles_default;
      VscodeButton.formAssociated = true;
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "autofocus", void 0);
      __decorate2([
        n4({ type: Number, reflect: true })
      ], VscodeButton.prototype, "tabIndex", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "secondary", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "block", void 0);
      __decorate2([
        n4({ reflect: true })
      ], VscodeButton.prototype, "role", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "disabled", void 0);
      __decorate2([
        n4()
      ], VscodeButton.prototype, "icon", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true, attribute: "icon-spin" })
      ], VscodeButton.prototype, "iconSpin", void 0);
      __decorate2([
        n4({ type: Number, reflect: true, attribute: "icon-spin-duration" })
      ], VscodeButton.prototype, "iconSpinDuration", void 0);
      __decorate2([
        n4({ attribute: "icon-after" })
      ], VscodeButton.prototype, "iconAfter", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true, attribute: "icon-after-spin" })
      ], VscodeButton.prototype, "iconAfterSpin", void 0);
      __decorate2([
        n4({
          type: Number,
          reflect: true,
          attribute: "icon-after-spin-duration"
        })
      ], VscodeButton.prototype, "iconAfterSpinDuration", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true })
      ], VscodeButton.prototype, "focused", void 0);
      __decorate2([
        n4({ type: String, reflect: true })
      ], VscodeButton.prototype, "name", void 0);
      __decorate2([
        n4({ type: Boolean, reflect: true, attribute: "icon-only" })
      ], VscodeButton.prototype, "iconOnly", void 0);
      __decorate2([
        n4({ reflect: true })
      ], VscodeButton.prototype, "type", void 0);
      __decorate2([
        n4()
      ], VscodeButton.prototype, "value", void 0);
      __decorate2([
        r5()
      ], VscodeButton.prototype, "_hasContentBefore", void 0);
      __decorate2([
        r5()
      ], VscodeButton.prototype, "_hasContentAfter", void 0);
      VscodeButton = __decorate2([
        customElement("vscode-button")
      ], VscodeButton);
    }
  });

  // node_modules/@vscode-elements/elements/dist/vscode-button/index.js
  var vscode_button_exports = {};
  __export(vscode_button_exports, {
    VscodeButton: () => VscodeButton
  });
  var init_vscode_button2 = __esm({
    "node_modules/@vscode-elements/elements/dist/vscode-button/index.js"() {
      init_vscode_button();
    }
  });

  // src/webview/shared/buttonConfig.ts
  var BUTTONS = {
    "btn-refresh": {
      id: "btn-refresh",
      label: "\u{1F504} Refresh",
      appearance: "primary"
    },
    "btn-details": {
      id: "btn-details",
      label: "\u{1F916} Details"
    },
    "btn-chart": {
      id: "btn-chart",
      label: "\u{1F4C8} Chart"
    },
    "btn-usage": {
      id: "btn-usage",
      label: "\u{1F4CA} Usage Analysis"
    },
    "btn-diagnostics": {
      id: "btn-diagnostics",
      label: "\u{1F50D} Diagnostics"
    },
    "btn-maturity": {
      id: "btn-maturity",
      label: "\u{1F3AF} Fluency Score"
    },
    "btn-dashboard": {
      id: "btn-dashboard",
      label: "\u{1F4CA} Team Dashboard"
    },
    "btn-level-viewer": {
      id: "btn-level-viewer",
      label: "\u{1F50D} Level Viewer"
    },
    "btn-environmental": {
      id: "btn-environmental",
      label: "\u{1F33F} Environmental Impact"
    }
  };
  function buttonHtml(id) {
    const config = BUTTONS[id];
    if (config.hidden) {
      return "";
    }
    const appearance = config.appearance ? ` appearance="${config.appearance}"` : "";
    return `<vscode-button id="${config.id}"${appearance}>${config.label}</vscode-button>`;
  }

  // src/webview/shared/dataLoader.ts
  function getWindowData(key) {
    if (typeof window === "undefined") {
      return void 0;
    }
    return window[key];
  }

  // src/webview/shared/formatUtils.ts
  var _estimatorsData = getWindowData("__TOKEN_ESTIMATORS__");
  var tokenEstimators = _estimatorsData?.estimators ?? {};
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function markdownToHtml(text) {
    let escaped = escapeHtml(text);
    escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return escaped;
  }
  var STAGE_LABELS = {
    1: "Stage 1: AI Skeptic",
    2: "Stage 2: AI Explorer",
    3: "Stage 3: AI Collaborator",
    4: "Stage 4: AI Strategist"
  };
  var STAGE_DESCRIPTIONS = {
    1: "Rarely uses AI tools or uses only basic features",
    2: "Exploring AI capabilities with occasional use",
    3: "Regular, purposeful use across multiple features",
    4: "Strategic, advanced use leveraging the full AI ecosystem"
  };

  // src/webview/shared/extensionPoints.ts
  function wireExtensionPointButtons(vscodeApi) {
    const buttons = window.__EXTENSION_POINT_BUTTONS__ ?? [];
    if (buttons.length === 0) {
      return;
    }
    const buttonRow = document.querySelector(".button-row");
    if (!buttonRow) {
      return;
    }
    for (const btn of buttons) {
      const el = document.createElement("vscode-button");
      el.id = `ext-point-${btn.id}`;
      el.textContent = btn.label;
      el.addEventListener("click", () => {
        vscodeApi.postMessage({ command: "extensionPointAction", buttonId: btn.id });
      });
      buttonRow.append(el);
    }
  }

  // src/webview/shared/theme.css
  var theme_default = '/**\n * Shared theme variables for all webview panels\n * Uses VS Code theme tokens for automatic light/dark theme support.\n *\n * The "INDUSTRIAL REDUX" high-contrast styling (stark outlines, uppercase\n * navigation, neon stage colors, monospace body) is intentionally scoped to\n * the high-contrast themes only. Normal light/dark themes keep the native\n * VS Code look so the navigation bar and typography stay unobtrusive.\n */\n\n:root {\n	/* VS Code base colors */\n	--bg-primary: var(--vscode-editor-background);\n	--bg-secondary: var(--vscode-sideBar-background);\n	--bg-tertiary: var(--vscode-editorWidget-background);\n	--text-primary: var(--vscode-editor-foreground);\n	--text-secondary: var(--vscode-descriptionForeground);\n	--text-muted: var(--vscode-disabledForeground);\n	--border-color: var(--vscode-panel-border);\n	--border-subtle: var(--vscode-widget-border);\n\n	/* Button colors */\n	--button-bg: var(--vscode-button-background);\n	--button-fg: var(--vscode-button-foreground);\n	--button-hover-bg: var(--vscode-button-hoverBackground);\n	--button-secondary-bg: var(--vscode-button-secondaryBackground);\n	--button-secondary-fg: var(--vscode-button-secondaryForeground);\n	--button-secondary-hover-bg: var(--vscode-button-secondaryHoverBackground);\n\n	/* Input colors */\n	--input-bg: var(--vscode-input-background);\n	--input-fg: var(--vscode-input-foreground);\n	--input-border: var(--vscode-input-border);\n\n	/* List/card colors */\n	--list-hover-bg: var(--vscode-list-hoverBackground);\n	--list-active-bg: var(--vscode-list-activeSelectionBackground);\n	--list-active-fg: var(--vscode-list-activeSelectionForeground);\n	--list-inactive-bg: var(--vscode-list-inactiveSelectionBackground);\n\n	/* Alternating row colors for better readability */\n	--row-alternate-bg: var(--vscode-list-inactiveSelectionBackground);\n\n	/* Badge colors */\n	--badge-bg: var(--vscode-badge-background);\n	--badge-fg: var(--vscode-badge-foreground);\n\n	/* Focus colors */\n	--focus-border: var(--vscode-focusBorder);\n\n	/* Link colors */\n	--link-color: var(--vscode-textLink-foreground);\n	--link-hover-color: var(--vscode-textLink-activeForeground);\n\n	/* Status colors */\n	--error-fg: var(--vscode-errorForeground);\n	--warning-fg: var(--vscode-editorWarning-foreground);\n	--success-fg: var(--vscode-terminal-ansiGreen);\n\n	/* Stage accent colors \u2014 dark theme defaults */\n	--stage-1-color: #93c5fd;\n	--stage-2-color: #a78bfa;\n	--stage-3-color: #3b82f6;\n	--stage-4-color: #22d3ee;\n\n	/* Stage progress pip empty fill */\n	--stage-pip-empty-bg: rgba(128, 128, 128, 0.2);\n\n	/* Semantic muted foreground */\n	--fg-muted: var(--vscode-disabledForeground);\n\n	/* Shadow for cards */\n	--shadow-color: rgb(0, 0, 0, 0.16);\n	--shadow-hover-color: rgb(0, 0, 0, 0.24);\n}\n\n/* Light theme adjustments */\nbody[data-vscode-theme-kind="vscode-light"],\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	--shadow-color: rgb(0, 0, 0, 0.08);\n	--shadow-hover-color: rgb(0, 0, 0, 0.12);\n	/* Stage colors darkened for readable contrast on light backgrounds */\n	--stage-1-color: #1d6fa4;\n	--stage-2-color: #7c3aed;\n	--stage-3-color: #2563eb;\n	--stage-4-color: #0891b2;\n	--stage-pip-empty-bg: rgba(0, 0, 0, 0.12);\n}\n\n/* Default navigation button row \u2014 native look for normal themes */\n.button-row {\n	display: flex;\n	gap: 10px;\n	flex-wrap: wrap;\n}\n\n/* ------------------------------------------------------------------ *\n * High contrast themes \u2014 INDUSTRIAL REDUX\n * Stark outlines, uppercase navigation, neon stage colors, monospace.\n * Everything below is deliberately gated to the high-contrast theme\n * kinds so normal light/dark themes are unaffected.\n * ------------------------------------------------------------------ */\n\nbody[data-vscode-theme-kind="vscode-high-contrast"],\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	/* Base colors \u2014 forced to stark contrasts */\n	--bg-secondary: transparent;\n	--bg-tertiary: transparent;\n	--text-secondary: var(--vscode-foreground);\n	--text-muted: var(--vscode-descriptionForeground);\n	--border-color: var(--vscode-contrastBorder);\n	--border-subtle: var(--vscode-contrastBorder);\n\n	/* Button colors \u2014 high contrast, no subtle grays */\n	--button-bg: var(--vscode-foreground);\n	--button-fg: var(--vscode-editor-background);\n	--button-hover-bg: var(--vscode-editor-background);\n	--button-secondary-bg: transparent;\n	--button-secondary-fg: var(--vscode-foreground);\n	--button-secondary-hover-bg: var(--vscode-foreground);\n\n	/* Input colors */\n	--input-bg: transparent;\n	--input-fg: var(--vscode-foreground);\n	--input-border: var(--vscode-foreground);\n\n	/* List/card colors */\n	--list-hover-bg: var(--vscode-editor-background);\n	--list-active-bg: var(--vscode-foreground);\n	--list-active-fg: var(--vscode-editor-background);\n	--list-inactive-bg: transparent;\n\n	/* Alternating row colors dropped for harsh outlines */\n	--row-alternate-bg: transparent;\n\n	/* Badge colors */\n	--badge-bg: var(--vscode-foreground);\n	--badge-fg: var(--vscode-editor-background);\n\n	/* Focus colors */\n	--focus-border: var(--vscode-foreground);\n\n	/* Link colors */\n	--link-color: var(--vscode-foreground);\n	--link-hover-color: var(--vscode-textLink-activeForeground);\n\n	/* Stage progress pip empty fill */\n	--stage-pip-empty-bg: transparent;\n\n	/* Semantic muted foreground */\n	--fg-muted: var(--vscode-descriptionForeground);\n\n	/* Shadow for cards \u2014 HARD shadows */\n	--shadow-color: var(--vscode-foreground);\n	--shadow-hover-color: var(--vscode-foreground);\n\n	/* Monospace body for the industrial identity */\n	font-family: var(--vscode-editor-font-family), "JetBrains Mono", "Fira Code", monospace;\n}\n\n/* High contrast dark \u2014 stark neon stage colors */\nbody[data-vscode-theme-kind="vscode-high-contrast"] {\n	--stage-1-color: #ff00ff; /* Magenta */\n	--stage-2-color: #00ffff; /* Cyan */\n	--stage-3-color: #ffff00; /* Yellow */\n	--stage-4-color: #00ff00; /* Green */\n}\n\n/* High contrast light \u2014 darkened neon for readable contrast */\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] {\n	--stage-1-color: #d100d1;\n	--stage-2-color: #008787;\n	--stage-3-color: #b5b500;\n	--stage-4-color: #00a300;\n}\n\n/* Industrial navigation tab bar (high contrast only) */\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row {\n	display: flex;\n	gap: 0; /* Force flush blocks */\n	flex-wrap: wrap; /* Let it wrap so no scrollbars appear */\n	border: 3px solid var(--vscode-foreground);\n	background-color: var(--vscode-editor-background);\n	margin-bottom: 2rem;\n	box-shadow: 4px 4px 0 var(--vscode-panel-border);\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > * {\n	flex-grow: 1; /* Stretch to fill */\n	flex-shrink: 1;\n	flex-basis: auto;\n	text-align: center;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button {\n	border-radius: 0 !important;\n	border: none !important;\n	border-right: 2px solid var(--vscode-foreground) !important;\n	font-family: inherit;\n	font-weight: 900;\n	text-transform: uppercase;\n	background-color: var(--vscode-editor-background) !important;\n	color: var(--vscode-foreground) !important;\n	padding: 12px 16px !important;\n	cursor: pointer;\n	box-shadow: none !important;\n	letter-spacing: 1px;\n	transition: transform 0.1s, background-color 0.1s;\n	height: auto !important; /* Override vscode-button strict heights */\n	border-bottom: 3px solid transparent !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button::part(control) {\n	background-color: var(--vscode-editor-background) !important;\n	color: var(--vscode-foreground) !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover::part(control),\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover::part(control) {\n	background-color: var(--vscode-foreground) !important;\n	color: var(--vscode-editor-background) !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row > *:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row > *:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:last-child,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:last-child {\n	border-right: none !important;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row vscode-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast"] .button-row .nav-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row vscode-button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row button:hover,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .button-row .nav-button:hover {\n	background-color: var(--vscode-foreground) !important;\n	color: var(--vscode-editor-background) !important;\n	border-bottom: 3px solid var(--vscode-terminal-ansiCyan) !important; /* Cyber/Industrial accent indicator */\n}\n\n/* Industrial header + title (high contrast only) */\nbody[data-vscode-theme-kind="vscode-high-contrast"] .header,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .header {\n	display: flex;\n	justify-content: space-between;\n	align-items: flex-end;\n	margin-bottom: 2rem;\n	flex-wrap: nowrap;\n	white-space: nowrap;\n	gap: 15px;\n	border-bottom: 4px solid var(--vscode-foreground);\n	padding-bottom: 1rem;\n}\n\nbody[data-vscode-theme-kind="vscode-high-contrast"] .title,\nbody[data-vscode-theme-kind="vscode-high-contrast-light"] .title {\n	font-size: 28px;\n	font-weight: 900;\n	text-transform: uppercase;\n	letter-spacing: 2px;\n	color: var(--vscode-foreground);\n	text-shadow: 2px 2px 0 var(--vscode-panel-border);\n	white-space: nowrap;\n}\n';

  // src/webview/maturity/styles.css
  var styles_default = `* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	background: var(--bg-primary);
	color: var(--text-primary);
	padding: 16px;
	line-height: 1.5;
	min-width: 320px;
}

.container {
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 16px;
	box-shadow: 0 4px 10px var(--shadow-color);
	max-width: 1200px;
	margin: 0 auto;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	margin-bottom: 14px;
	padding-bottom: 4px;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.header-icon {
	font-size: 20px;
}

.header-title {
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary);
	letter-spacing: 0.2px;
}



/* Overall stage banner */
.stage-banner {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 10px;
	padding: 20px 24px;
	margin-bottom: 16px;
	text-align: center;
}

.stage-banner-label {
	font-size: 12px;
	color: var(--text-secondary);
	text-transform: uppercase;
	letter-spacing: 1.5px;
	margin-bottom: 6px;
}

.stage-banner-title {
	font-size: 24px;
	font-weight: 800;
	margin-bottom: 4px;
}

.stage-banner-subtitle {
	font-size: 13px;
	color: var(--text-secondary);
}

/* Stage accent colors \u2014 dark theme defaults */
.stage-1 { color: #93c5fd; }
.stage-2 { color: #a78bfa; }
.stage-3 { color: #3b82f6; }
.stage-4 { color: #22d3ee; }

/* Light theme: darken pale stage colors for readable contrast */
body[data-vscode-theme-kind="vscode-light"] .stage-1,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .stage-1 { color: #1d6fa4 !important; }
body[data-vscode-theme-kind="vscode-light"] .stage-2,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .stage-2 { color: #7c3aed !important; }
body[data-vscode-theme-kind="vscode-light"] .stage-3,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .stage-3 { color: #2563eb !important; }
body[data-vscode-theme-kind="vscode-light"] .stage-4,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .stage-4 { color: #0891b2 !important; }

/* Radar / spider chart container */
.radar-wrapper {
	display: flex;
	gap: 20px;
	margin-bottom: 20px;
	align-items: flex-start;
}

.radar-container {
	flex: 1;
	display: flex;
	justify-content: center;
}

.radar-svg {
	max-width: 650px;
	width: 100%;
	height: auto;
}

/* SVG radar chart elements \u2014 use CSS fill/stroke so theme variables apply */
.radar-svg .radar-label {
	fill: var(--text-primary);
}

.radar-svg .radar-ring-label {
	fill: var(--text-muted);
}

.radar-svg .radar-grid {
	stroke: var(--border-subtle);
}

.radar-svg .radar-dot {
	stroke: var(--bg-primary);
}

/* Legend panel */
.legend-panel {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-subtle);
	border-radius: 8px;
	padding: 16px;
	min-width: 280px;
	max-width: 320px;
	flex-shrink: 0;
}

.legend-title {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 14px;
	padding-bottom: 10px;
	border-bottom: 1px solid var(--border-subtle);
}

.legend-item {
	display: flex;
	gap: 12px;
	margin-bottom: 14px;
	align-items: flex-start;
}

.legend-item:last-child {
	margin-bottom: 0;
}

.legend-dot {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	flex-shrink: 0;
	margin-top: 2px;
	border: 2px solid var(--bg-primary);
}

.stage-1-dot { background: #93c5fd; }
.stage-2-dot { background: #a78bfa; }
.stage-3-dot { background: #3b82f6; }
.stage-4-dot { background: #22d3ee; }

.legend-content {
	flex: 1;
}

.legend-label {
	font-size: 12px;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 2px;
}

.legend-desc {
	font-size: 11px;
	color: var(--text-muted);
	line-height: 1.4;
}

/* Category cards grid */
.category-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	gap: 14px;
	margin-bottom: 16px;
}

.category-card {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-subtle);
	border-radius: 8px;
	padding: 14px;
	box-shadow: 0 2px 6px var(--shadow-color);
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.category-name {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
}

.category-stage-badge {
	font-size: 11px;
	font-weight: 700;
	padding: 3px 10px;
	border-radius: 12px;
	letter-spacing: 0.5px;
}

/* Dark theme badge backgrounds */
.badge-1 {
	background: rgba(147, 197, 253, 0.15);
	color: #93c5fd;
	border: 1px solid rgba(147, 197, 253, 0.4);
}

.badge-2 {
	background: rgba(167, 139, 250, 0.15);
	color: #a78bfa;
	border: 1px solid rgba(167, 139, 250, 0.4);
}

.badge-3 {
	background: rgba(59, 130, 246, 0.15);
	color: #3b82f6;
	border: 1px solid rgba(59, 130, 246, 0.4);
}

.badge-4 {
	background: rgba(34, 211, 238, 0.15);
	color: #22d3ee;
	border: 1px solid rgba(34, 211, 238, 0.4);
}

/* Light theme badge overrides \u2014 use darker text for contrast */
body[data-vscode-theme-kind="vscode-light"] .badge-1,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .badge-1 { color: #1d6fa4; }
body[data-vscode-theme-kind="vscode-light"] .badge-2,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .badge-2 { color: #7c3aed; }
body[data-vscode-theme-kind="vscode-light"] .badge-3,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .badge-3 { color: #2563eb; }
body[data-vscode-theme-kind="vscode-light"] .badge-4,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .badge-4 { color: #0891b2; }

.category-stage-label {
	font-size: 11px;
	color: var(--text-muted);
	margin-bottom: 10px;
}

/* Progress bar for category */
.category-progress {
	background: var(--row-alternate-bg);
	height: 6px;
	border-radius: 3px;
	overflow: hidden;
	margin-bottom: 12px;
}

.category-progress-fill {
	height: 100%;
	border-radius: 3px;
	transition: width 0.4s ease;
}

/* Evidence list */
.evidence-list {
	list-style: none;
	padding: 0;
}

.evidence-item {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 4px 0;
	font-size: 12px;
	color: var(--text-secondary);
}

.evidence-icon {
	flex-shrink: 0;
	width: 16px;
	text-align: center;
}

/* Tips section */
.tips-section {
	background: var(--bg-secondary);
	border: 1px solid var(--border-subtle);
	border-radius: 8px;
	padding: 14px;
	margin-bottom: 16px;
}

.tips-title {
	font-size: 14px;
	font-weight: 700;
	color: var(--text-primary);
	margin-bottom: 10px;
	display: flex;
	align-items: center;
	gap: 6px;
}

.tip-item {
	background: var(--list-hover-bg);
	border: 1px solid var(--border-subtle);
	border-radius: 6px;
	padding: 10px 12px;
	margin-bottom: 8px;
	font-size: 12px;
	color: var(--text-primary);
}

.tip-item strong {
	color: var(--link-color);
}

.tip-item a {
	color: var(--link-color);
	text-decoration: none;
	border-bottom: 1px solid transparent;
	transition: border-color 0.2s ease;
}

.tip-item a:hover {
	border-bottom-color: var(--link-color);
}

/* MCP Discovery Button */
.mcp-discover-btn {
	width: 100%;
	background: var(--button-bg);
	border: 1px solid var(--button-bg);
	color: var(--button-fg);
	padding: 10px 14px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
}

.mcp-discover-btn:hover {
	background: var(--button-hover-bg);
	transform: translateY(-1px);
	box-shadow: 0 4px 8px var(--shadow-color);
}

.mcp-discover-btn:active {
	transform: translateY(0);
}

.dismiss-tips-btn {
	background: transparent;
	border: 1px solid var(--border-subtle);
	color: var(--text-muted);
	padding: 2px 6px;
	border-radius: 4px;
	font-size: 11px;
	cursor: pointer;
	transition: all 0.2s ease;
	line-height: 1;
}

.dismiss-tips-btn:hover {
	background: var(--list-hover-bg);
	border-color: var(--border-color);
	color: var(--text-secondary);
}

.dismiss-tips-btn:active {
	transform: scale(0.95);
}

.info-box {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-subtle);
	border-radius: 6px;
	padding: 12px;
	margin-bottom: 16px;
	font-size: 12px;
	color: var(--text-secondary);
}

.info-box-title {
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 6px;
}

.footer {
	margin-top: 6px;
	padding-top: 12px;
	border-top: 1px solid var(--border-subtle);
	font-size: 11px;
	color: var(--text-muted);
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 16px;
}

.footer-info {
	flex: 1;
}

.reset-tips-btn {
	display: inline-block;
	padding: 4px 10px;
	background: var(--button-secondary-bg);
	border: 1px solid var(--border-color);
	color: var(--button-secondary-fg);
	border-radius: 4px;
	font-size: 10px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
	vertical-align: middle;
}

.reset-tips-btn:hover {
	background: var(--button-secondary-hover-bg);
	transform: translateY(-1px);
	box-shadow: 0 2px 6px var(--shadow-color);
}

.reset-tips-btn:active {
	transform: translateY(0);
}

.inline-action-btn {
	display: inline-block;
	padding: 2px 8px;
	background: var(--button-secondary-bg);
	border: 1px solid var(--border-color);
	color: var(--button-secondary-fg);
	border-radius: 4px;
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
	vertical-align: middle;
}

.inline-action-btn:hover {
	background: var(--button-secondary-hover-bg);
	transform: translateY(-1px);
	box-shadow: 0 2px 6px var(--shadow-color);
}

.inline-action-btn:active {
	transform: translateY(0);
}

/* Beta warning footer */
.beta-footer {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-top: 12px;
	padding: 12px 14px;
	background: rgba(245, 158, 11, 0.1);
	border: 1px solid rgba(245, 158, 11, 0.4);
	border-radius: 6px;
	font-size: 12px;
	color: var(--warning-fg);
}

/* Share to social media section */
.share-section {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 18px;
	margin-top: 16px;
	margin-bottom: 16px;
}

.share-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 8px;
}

.share-icon {
	font-size: 20px;
}

.share-title {
	font-size: 16px;
	font-weight: 700;
	color: var(--text-primary);
}

.share-description {
	font-size: 12px;
	color: var(--text-secondary);
	margin-bottom: 14px;
	line-height: 1.5;
}

.share-buttons {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 10px;
}

.share-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 12px 16px;
	border-radius: 6px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: 1px solid;
	background: var(--button-secondary-bg);
}

.share-btn-icon {
	font-size: 16px;
	flex-shrink: 0;
}

.share-btn-linkedin {
	color: #0a66c2;
	border-color: rgba(10, 102, 194, 0.5);
}

.share-btn-linkedin:hover {
	background: rgba(10, 102, 194, 0.12);
	border-color: #0a66c2;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(10, 102, 194, 0.25);
}

.share-btn-bluesky {
	color: #1285fe;
	border-color: rgba(18, 133, 254, 0.5);
}

.share-btn-bluesky:hover {
	background: rgba(18, 133, 254, 0.12);
	border-color: #1285fe;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(18, 133, 254, 0.25);
}

.share-btn-mastodon {
	color: #6364ff;
	border-color: rgba(99, 100, 255, 0.5);
}

.share-btn-mastodon:hover {
	background: rgba(99, 100, 255, 0.12);
	border-color: #6364ff;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(99, 100, 255, 0.25);
}

.share-btn-download {
	color: #10b981;
	border-color: rgba(16, 185, 129, 0.5);
}

.share-btn-download:hover {
	background: rgba(16, 185, 129, 0.12);
	border-color: #10b981;
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

/* Light theme overrides for share button text colors */
body[data-vscode-theme-kind="vscode-light"] .share-btn-linkedin,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .share-btn-linkedin { color: #0a66c2; }
body[data-vscode-theme-kind="vscode-light"] .share-btn-bluesky,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .share-btn-bluesky { color: #0369a1; }
body[data-vscode-theme-kind="vscode-light"] .share-btn-mastodon,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .share-btn-mastodon { color: #4f46e5; }
body[data-vscode-theme-kind="vscode-light"] .share-btn-download,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .share-btn-download { color: #059669; }

.export-dropdown-container {
	position: relative;
}

.dropdown-arrow {
	font-size: 10px;
	margin-left: 4px;
	transition: transform 0.2s ease;
}

.export-dropdown-menu {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	margin-top: 4px;
	background: var(--bg-secondary);
	border: 1px solid var(--border-color);
	border-radius: 6px;
	box-shadow: 0 4px 12px var(--shadow-color);
	z-index: 1000;
	overflow: hidden;
}

.export-menu-item {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	padding: 12px 16px;
	border: none;
	background: transparent;
	color: var(--text-primary);
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s ease;
	text-align: left;
}

.export-menu-item:hover {
	background: var(--list-hover-bg);
}

.export-menu-item:active {
	background: var(--list-active-bg);
}

.export-menu-icon {
	font-size: 16px;
	flex-shrink: 0;
}

.share-btn:active {
	transform: translateY(0);
}

.beta-footer-icon {
	flex-shrink: 0;
	font-size: 16px;
}

.beta-footer-content {
	flex: 1;
	line-height: 1.5;
}

.beta-link {
	color: var(--warning-fg);
	text-decoration: underline;
}

.beta-link:hover {
	color: var(--warning-fg);
	opacity: 0.8;
}

.share-issue-btn {
	flex-shrink: 0;
	background: rgba(245, 158, 11, 0.1);
	border: 1px solid var(--warning-fg);
	color: var(--warning-fg);
	padding: 6px 14px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.share-issue-btn:hover {
	background: rgba(245, 158, 11, 0.2);
	transform: translateY(-1px);
	box-shadow: 0 4px 8px rgba(245, 158, 11, 0.2);
}

.share-issue-btn:active {
	transform: translateY(0);
}

@media (width <= 768px) {
	.category-grid {
		grid-template-columns: 1fr;
	}

	.radar-wrapper {
		flex-direction: column;
	}

	.legend-panel {
		max-width: 100%;
		min-width: 0;
	}

	/* Allow chart to be larger on small screens since legend is stacked below */
	.radar-svg {
		max-width: 100%;
	}
}

/* Demo mode controls */
.demo-panel {
	background: var(--bg-tertiary);
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 14px;
	margin-bottom: 16px;
}

.demo-panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 10px;
	border-bottom: 1px solid var(--border-subtle);
}

.demo-panel-header.demo-collapsed {
	margin-bottom: 0;
	padding-bottom: 0;
	border-bottom: none;
}

.demo-panel-title {
	font-size: 13px;
	font-weight: 700;
	color: var(--link-color);
	display: flex;
	align-items: center;
	gap: 8px;
}

.demo-expand-btn {
	background: transparent;
	border: none;
	color: var(--link-color);
	font-size: 12px;
	cursor: pointer;
	padding: 2px 4px;
	transition: transform 0.2s ease;
	line-height: 1;
}

.demo-expand-btn:hover {
	color: var(--link-hover-color);
	transform: scale(1.1);
}

.demo-hidden {
	display: none !important;
}

.demo-panel-actions {
	display: flex;
	gap: 8px;
}

.demo-btn {
	padding: 4px 12px;
	border-radius: 4px;
	font-size: 11px;
	font-weight: 600;
	cursor: pointer;
	border: 1px solid;
	transition: all 0.2s ease;
}

.demo-btn-toggle {
	background: var(--button-bg);
	border-color: var(--button-bg);
	color: var(--button-fg);
}

.demo-btn-toggle:hover {
	background: var(--button-hover-bg);
}

.demo-btn-reset {
	background: transparent;
	border-color: var(--border-subtle);
	color: var(--text-muted);
}

.demo-btn-reset:hover {
	background: var(--list-hover-bg);
	border-color: var(--border-color);
	color: var(--text-secondary);
}

.demo-sliders {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.demo-sliders.demo-disabled {
	opacity: 0.45;
	pointer-events: none;
}

.demo-slider-row {
	display: flex;
	align-items: center;
	gap: 12px;
}

.demo-slider-label {
	font-size: 12px;
	color: var(--text-secondary);
	min-width: 160px;
	flex-shrink: 0;
}

.demo-step-group {
	display: flex;
	gap: 0;
	border-radius: 6px;
	overflow: hidden;
	border: 1px solid var(--border-subtle);
}

.demo-step-btn {
	width: 36px;
	height: 28px;
	border: none;
	background: var(--bg-secondary);
	color: var(--text-muted);
	font-size: 12px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.15s ease;
	border-right: 1px solid var(--border-subtle);
}

.demo-step-btn:last-child {
	border-right: none;
}

.demo-step-btn:hover {
	background: var(--list-hover-bg);
	color: var(--text-secondary);
}

.demo-step-active.demo-step-1 { background: rgba(147, 197, 253, 0.2); color: #93c5fd; }
.demo-step-active.demo-step-2 { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
.demo-step-active.demo-step-3 { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.demo-step-active.demo-step-4 { background: rgba(34, 211, 238, 0.2); color: #22d3ee; }

body[data-vscode-theme-kind="vscode-light"] .demo-step-active.demo-step-1,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .demo-step-active.demo-step-1 { color: #1d6fa4; }
body[data-vscode-theme-kind="vscode-light"] .demo-step-active.demo-step-2,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .demo-step-active.demo-step-2 { color: #7c3aed; }
body[data-vscode-theme-kind="vscode-light"] .demo-step-active.demo-step-3,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .demo-step-active.demo-step-3 { color: #2563eb; }
body[data-vscode-theme-kind="vscode-light"] .demo-step-active.demo-step-4,
body[data-vscode-theme-kind="vscode-high-contrast-light"] .demo-step-active.demo-step-4 { color: #0891b2; }

.demo-slider-value {
	font-size: 11px;
	font-weight: 700;
	padding: 2px 8px;
	border-radius: 10px;
	min-width: 180px;
	text-align: center;
	flex-shrink: 0;
}

/* Demo mode card highlight */
.demo-card-highlight {
	border-color: var(--border-color) !important;
	box-shadow: 0 0 0 1px var(--focus-border), 0 2px 8px var(--shadow-color) !important;
}

.demo-card-description {
	font-size: 12px;
	color: var(--text-secondary);
	margin-bottom: 10px;
	font-style: italic;
}

.demo-section-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 6px;
}

`;

  // src/webview/maturity/main.ts
  var CATEGORY_HOOK_MAP = {
    "Customization": "missing-instructions",
    "Context Engineering": "no-context-refs",
    "Tool Usage": "no-mcp-config"
  };
  var vscode = acquireVsCodeApi();
  var initialData = getWindowData("__INITIAL_MATURITY__");
  var demoModeActive = false;
  var demoStageOverrides = [];
  var demoPanelExpanded = false;
  function renderRadarChart(categories, overallStage) {
    const cx = 325, cy = 325, maxR = 150;
    const n5 = categories.length;
    const angleStep = 2 * Math.PI / n5;
    const startAngle = -Math.PI / 2;
    const polyFill = "rgba(88,166,255,0.25)";
    const polyStroke = "#58a6ff";
    const rings = [1, 2, 3, 4].map((level) => {
      const r6 = level / 4 * maxR;
      const points = Array.from({ length: n5 }, (_2, i6) => {
        const angle = startAngle + i6 * angleStep;
        return `${cx + r6 * Math.cos(angle)},${cy + r6 * Math.sin(angle)}`;
      }).join(" ");
      return `<polygon points="${points}" fill="none" class="radar-grid" stroke-width="1" />`;
    }).join("");
    const axes = Array.from({ length: n5 }, (_2, i6) => {
      const angle = startAngle + i6 * angleStep;
      const x2 = cx + maxR * Math.cos(angle);
      const y22 = cy + maxR * Math.sin(angle);
      return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y22}" class="radar-grid" stroke-width="1" />`;
    }).join("");
    const dataPoints = categories.map((cat, i6) => {
      const r6 = cat.stage / 4 * maxR;
      const angle = startAngle + i6 * angleStep;
      return `${cx + r6 * Math.cos(angle)},${cy + r6 * Math.sin(angle)}`;
    }).join(" ");
    const labels = categories.map((cat, i6) => {
      const angle = startAngle + i6 * angleStep;
      const labelR = maxR + 35;
      const x2 = cx + labelR * Math.cos(angle);
      const y3 = cy + labelR * Math.sin(angle);
      let anchor = "middle";
      if (Math.cos(angle) < -0.3) {
        anchor = "end";
      } else if (Math.cos(angle) > 0.3) {
        anchor = "start";
      }
      return `<text x="${x2}" y="${y3}" text-anchor="${anchor}" dominant-baseline="central"
			class="radar-label" font-size="14" font-weight="600">${cat.icon} ${cat.category}</text>`;
    }).join("");
    const dots = categories.map((cat, i6) => {
      const r6 = cat.stage / 4 * maxR;
      const angle = startAngle + i6 * angleStep;
      const x2 = cx + r6 * Math.cos(angle);
      const y3 = cy + r6 * Math.sin(angle);
      return `<circle cx="${x2}" cy="${y3}" r="5" fill="${polyStroke}" class="radar-dot" stroke-width="1.5" />`;
    }).join("");
    const ringLabelNames = ["", "AI Skeptic", "Explorer", "Collaborator", "Strategist"];
    const ringLabels = [1, 2, 3, 4].map((level) => {
      const r6 = level / 4 * maxR;
      return `<text x="${cx + 4}" y="${cy - r6 + 3}" class="radar-ring-label" font-size="9">${ringLabelNames[level]}</text>`;
    }).join("");
    return `<svg viewBox="0 0 650 650" class="radar-svg" xmlns="http://www.w3.org/2000/svg">
		${rings}
		${axes}
		<polygon points="${dataPoints}" fill="${polyFill}" stroke="${polyStroke}" stroke-width="2" />
		${dots}
		${labels}
		${ringLabels}
	</svg>`;
  }
  function stageColor(stage) {
    switch (stage) {
      case 1:
        return "#93c5fd";
      case 2:
        return "#a78bfa";
      case 3:
        return "#3b82f6";
      case 4:
        return "#22d3ee";
      default:
        return "#666";
    }
  }
  function renderDemoControls(categories) {
    const sliders = categories.map((cat, i6) => {
      const currentStage = demoModeActive ? demoStageOverrides[i6] : cat.stage;
      const stageButtons = [1, 2, 3, 4].map(
        (s4) => `<button class="demo-step-btn ${s4 === currentStage ? "demo-step-active" : ""} demo-step-${s4}" data-index="${i6}" data-stage="${s4}">${s4}</button>`
      ).join("");
      return `
			<div class="demo-slider-row">
				<label class="demo-slider-label">${cat.icon} ${escapeHtml(cat.category)}</label>
				<div class="demo-step-group">${stageButtons}</div>
				<span class="demo-slider-value badge-${currentStage}" data-value-index="${i6}">${escapeHtml(STAGE_LABELS[currentStage] || "")}</span>
			</div>
		`;
    }).join("");
    return `
		<div class="demo-panel">
			<div class="demo-panel-header ${demoPanelExpanded ? "" : "demo-collapsed"}">
				<div class="demo-panel-title">
					<button class="demo-expand-btn" id="demo-expand-toggle" title="${demoPanelExpanded ? "Collapse" : "Expand"} Demo Mode Panel">
						${demoPanelExpanded ? "\u25BC" : "\u25B6"}
					</button>
					\u{1F41B} Demo Mode \u2014 Override Spider Chart
				</div>
				<div class="demo-panel-actions ${demoPanelExpanded ? "" : "demo-hidden"}">
					<button class="demo-btn demo-btn-toggle" id="demo-toggle">${demoModeActive ? "\u23F8 Disable Overrides" : "\u25B6 Enable Overrides"}</button>
					<button class="demo-btn demo-btn-reset" id="demo-reset">\u21BA Reset to Actual</button>
				</div>
			</div>
			<div class="demo-sliders ${demoModeActive ? "" : "demo-disabled"} ${demoPanelExpanded ? "" : "demo-hidden"}">
				${sliders}
			</div>
		</div>
	`;
  }
  function wireDemoControls(data) {
    if (demoStageOverrides.length === 0) {
      demoStageOverrides = data.categories.map((c4) => c4.stage);
    }
    document.getElementById("demo-expand-toggle")?.addEventListener("click", () => {
      demoPanelExpanded = !demoPanelExpanded;
      renderLayout(data);
    });
    document.getElementById("demo-toggle")?.addEventListener("click", () => {
      demoModeActive = !demoModeActive;
      renderLayout(data);
    });
    document.getElementById("demo-reset")?.addEventListener("click", () => {
      demoStageOverrides = data.categories.map((c4) => c4.stage);
      demoModeActive = false;
      renderLayout(data);
    });
    document.querySelectorAll(".demo-step-btn").forEach((btn) => {
      btn.addEventListener("click", (e7) => {
        const target = e7.currentTarget;
        const idx = parseInt(target.getAttribute("data-index") || "0", 10);
        const stage = parseInt(target.getAttribute("data-stage") || "1", 10);
        demoStageOverrides[idx] = stage;
        if (demoModeActive) {
          renderLayout(data);
        }
      });
    });
  }
  function buildDemoCategoryCardHtml(cat, catIdx, demoStage, displayStage, progressPct, color, data) {
    const levelData = data.fluencyLevels?.find((l3) => l3.category === cat.category);
    const stageInfo = levelData?.levels.find((l3) => l3.stage === demoStage);
    const thresholdsHtml = stageInfo && stageInfo.thresholds.length > 0 ? stageInfo.thresholds.map(
      (t4) => `<li class="evidence-item"><span class="evidence-icon">\u{1F3AF}</span><span>${escapeHtml(t4)}</span></li>`
    ).join("") : '<li class="evidence-item"><span class="evidence-icon">-</span><span>No thresholds defined</span></li>';
    const tipsHtml = stageInfo && stageInfo.tips.length > 0 ? stageInfo.tips.map((t4) => `<div class="tip-item">${markdownToHtml(t4)}</div>`).join("") : '<div class="tip-item" style="color:#666;">No tips for this stage</div>';
    const description = stageInfo?.description || "";
    return `
    <div class="category-card demo-card-highlight">
      <div class="category-header">
        <span class="category-name">${cat.icon} ${escapeHtml(cat.category)}</span>
        <span class="category-stage-badge badge-${displayStage}">Stage ${displayStage}</span>
      </div>
      <div class="category-stage-label">${escapeHtml(STAGE_LABELS[displayStage] || "Unknown")}</div>
      <div class="demo-card-description">${escapeHtml(description)}</div>
      <div class="category-progress">
        <div class="category-progress-fill" style="width: ${progressPct}%; background: ${color};"></div>
      </div>
      <div class="demo-section-label">\u{1F3AF} Requirements to Reach This Stage</div>
      <ul class="evidence-list">${thresholdsHtml}</ul>
      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #2a2a30;">
        <div class="demo-section-label">\u{1F4A1} Tips</div>
        ${tipsHtml}
      </div>
    </div>`;
  }
  function buildHookReminderButton(category, tipsCount, installedHooks) {
    const hookId = CATEGORY_HOOK_MAP[category];
    if (!hookId || tipsCount === 0) {
      return "";
    }
    const isInstalled = installedHooks.includes(hookId);
    if (isInstalled) {
      return `<div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
      <button class="hook-reminder-btn hook-reminder-active" data-hook-id="${escapeHtml(hookId)}" data-action="uninstallHook" title="Remove session reminder" style="font-size: 11px; padding: 3px 10px; background: transparent; border: 1px solid #58a6ff; color: #58a6ff; border-radius: 4px; cursor: pointer;">\u2713 Reminder active</button>
      <button class="hook-reminder-btn hook-reminder-remove" data-hook-id="${escapeHtml(hookId)}" data-action="uninstallHook" title="Remove session reminder" style="font-size: 10px; background: transparent; border: none; color: #666; cursor: pointer; text-decoration: underline;">remove</button>
    </div>`;
    }
    return `<div style="margin-top: 8px;">
    <button class="hook-reminder-btn" data-hook-id="${escapeHtml(hookId)}" data-action="installHook" title="Install a Copilot hook that reminds you in future sessions" style="font-size: 11px; padding: 3px 10px; background: transparent; border: 1px solid #444; color: #ccc; border-radius: 4px; cursor: pointer;">\u{1F514} Remind me in sessions</button>
  </div>`;
  }
  function buildCategoryCard(cat, catIdx, dismissedTips, useDemoCards, data) {
    const demoStage = demoStageOverrides[catIdx] ?? cat.stage;
    const displayStage = useDemoCards ? demoStage : cat.stage;
    const progressPct = displayStage / 4 * 100;
    const color = stageColor(displayStage);
    if (useDemoCards && data.fluencyLevels) {
      return buildDemoCategoryCardHtml(cat, catIdx, demoStage, displayStage, progressPct, color, data);
    }
    const evidenceHtml = cat.evidence.map(
      (e7) => `<li class="evidence-item"><span class="evidence-icon">&#x2713;</span><span>${escapeHtml(e7)}</span></li>`
    ).join("");
    const tipsHtml = cat.tips.length > 0 ? cat.tips.map((t4) => {
      if (t4.includes("\n")) {
        const lines = t4.split("\n").filter((line) => line.trim());
        const summary = lines[0];
        const hasHeader = lines.length > 1 && lines[1].toLowerCase().includes("top repos");
        if (hasHeader && lines.length > 2) {
          const header = lines[1];
          const listItems = lines.slice(2).map((item) => `<li>${markdownToHtml(item)}</li>`).join("");
          return `<div class="tip-item">${markdownToHtml(summary)}<div style="margin-top: 8px; font-weight: 600; font-size: 11px; color: #999;">${markdownToHtml(header)}</div><ul style="margin: 6px 0 0 0; padding-left: 18px; list-style: disc;">${listItems}</ul></div>`;
        } else {
          return `<div class="tip-item">${lines.map((line) => markdownToHtml(line)).join("<br>")}</div>`;
        }
      } else {
        return `<div class="tip-item">${markdownToHtml(t4)}</div>`;
      }
    }).join("") : `<div class="tip-item" style="color:#666;">No specific suggestions - you're doing great!</div>`;
    const tipsAreDismissed = dismissedTips.includes(cat.category);
    const mcpButton = cat.category === "Tool Usage" ? `
    <div style="margin-top: 10px;">
      <button class="mcp-discover-btn" data-action="searchMcp">\u{1F50D} Discover more MCP Servers in Marketplace</button>
    </div>
  ` : "";
    const hookButton = buildHookReminderButton(cat.category, cat.tips.length, data.installedHooks ?? []);
    return `
    <div class="category-card">
      <div class="category-header">
        <span class="category-name">${cat.icon} ${escapeHtml(cat.category)}</span>
        <span class="category-stage-badge badge-${cat.stage}">Stage ${cat.stage}</span>
      </div>
      <div class="category-stage-label">${escapeHtml(STAGE_LABELS[cat.stage] || "Unknown")}</div>
      <div class="category-progress">
        <div class="category-progress-fill" style="width: ${progressPct}%; background: ${color};"></div>
      </div>
      <ul class="evidence-list">${evidenceHtml || '<li class="evidence-item"><span class="evidence-icon">-</span><span>No significant activity detected</span></li>'}</ul>
      ${!tipsAreDismissed && cat.tips.length > 0 ? `
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #2a2a30;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div style="font-size: 11px; font-weight: 600; color: #f59e0b;">\u{1F4A1} Next steps to level up:</div>
            <button class="dismiss-tips-btn" data-category="${escapeHtml(cat.category)}" title="Dismiss these tips">\u2715</button>
          </div>
          ${tipsHtml}
        </div>
      ` : ""}${hookButton}${mcpButton}</div>`;
  }
  function buildShareSectionHtml() {
    return `
  <div class="share-section">
    <div class="share-header"><span class="share-icon">\u{1F4E2}</span><span class="share-title">Share Your AI Engineering Fluency Score</span></div>
    <div class="share-description">Share your progress with the community and inspire others to level up their AI engineering skills!</div>
    <div class="share-buttons">
      <button id="btn-share-linkedin" class="share-btn share-btn-linkedin"><span class="share-btn-icon">\u{1F4BC}</span><span>Share on LinkedIn</span></button>
      <button id="btn-share-bluesky" class="share-btn share-btn-bluesky"><span class="share-btn-icon">\u{1F98B}</span><span>Share on Bluesky</span></button>
      <button id="btn-share-mastodon" class="share-btn share-btn-mastodon"><span class="share-btn-icon">\u{1F418}</span><span>Share on Mastodon</span></button>
      <div class="export-dropdown-container">
        <button id="btn-export-toggle" class="share-btn share-btn-download"><span class="share-btn-icon">\u{1F4BE}</span><span>Export Fluency Score</span><span class="dropdown-arrow">\u25BC</span></button>
        <div id="export-dropdown" class="export-dropdown-menu" style="display: none;">
          <button class="export-menu-item" data-export-type="png"><span class="export-menu-icon">\u{1F5BC}\uFE0F</span><span>Export as PNG Image</span></button>
          <button class="export-menu-item" data-export-type="pdf"><span class="export-menu-icon">\u{1F4C4}</span><span>Export as PDF Report</span></button>
          <button class="export-menu-item" data-export-type="pptx"><span class="export-menu-icon">\u{1F4CA}</span><span>Export as PowerPoint</span></button>
        </div>
      </div>
    </div>
  </div>`;
  }
  function buildMaturityRootHtml(data, categoryCards, dismissedTips) {
    const categories = demoModeActive ? data.categories.map((c4, i6) => ({ ...c4, stage: demoStageOverrides[i6] ?? c4.stage })) : data.categories;
    const radarStage = demoModeActive ? Math.round(demoStageOverrides.reduce((s4, v2) => s4 + v2, 0) / demoStageOverrides.length) : data.overallStage;
    return `
    <style>${theme_default}</style>
    <style>${styles_default}</style>
    <div class="container">
      <div class="header">
        <div class="header-left">
          <span class="header-icon">\u{1F3AF}</span>
          <span class="header-title">AI Engineering Fluency Score</span>
        </div>
        <div class="button-row">
          ${buttonHtml("btn-refresh")}
          ${buttonHtml("btn-details")}
          ${buttonHtml("btn-chart")}
          ${buttonHtml("btn-usage")}
          ${buttonHtml("btn-environmental")}
          ${buttonHtml("btn-diagnostics")}
          ${data.backendConfigured ? buttonHtml("btn-dashboard") : ""}
        </div>
      </div>
      <div class="info-box">
        <div class="info-box-title">\u{1F4CB} About This Dashboard</div>
        <div>
          This dashboard maps your AI tool usage patterns from the last 30 days to a maturity model with 4 stages across 6 categories.
          It helps you understand which AI capabilities you already use and suggests areas to explore for greater productivity.
          <br><br>
          \u{1F4D6} <a href="https://github.com/rajbos/ai-engineering-fluency/blob/main/docs/FLUENCY-LEVELS.md" class="beta-link">Read the full scoring rules</a> to learn how each category and stage is calculated. <button id="btn-level-viewer-inline" class="inline-action-btn">\u{1F4CA} How is my score calculated?</button>
          <br><br>
          <strong>Note:</strong> Scores are based on data from session log files. Some features (e.g., inline suggestion acceptance) cannot be tracked via logs.
        </div>
      </div>
      <div class="stage-banner">
        <div class="stage-banner-label">Overall AI Engineering Fluency</div>
        <div class="stage-banner-title stage-${data.overallStage}">${escapeHtml(data.overallLabel)}</div>
        <div class="stage-banner-subtitle">${escapeHtml(STAGE_DESCRIPTIONS[data.overallStage] || "")}</div>
      </div>
      ${data.isDebugMode ? renderDemoControls(data.categories) : ""}
      <div class="radar-wrapper">
        <div class="radar-container">
          ${renderRadarChart(categories, radarStage)}
        </div>
        <div class="legend-panel">
          <div class="legend-title">Stage Reference</div>
          <div class="legend-item"><div class="legend-dot stage-1-dot"></div><div class="legend-content"><div class="legend-label">Stage 1: AI Skeptic</div><div class="legend-desc">Rarely uses AI tools or uses only basic features</div></div></div>
          <div class="legend-item"><div class="legend-dot stage-2-dot"></div><div class="legend-content"><div class="legend-label">Stage 2: AI Explorer</div><div class="legend-desc">Exploring AI capabilities with occasional use</div></div></div>
          <div class="legend-item"><div class="legend-dot stage-3-dot"></div><div class="legend-content"><div class="legend-label">Stage 3: AI Collaborator</div><div class="legend-desc">Regular, purposeful use across multiple features</div></div></div>
          <div class="legend-item"><div class="legend-dot stage-4-dot"></div><div class="legend-content"><div class="legend-label">Stage 4: AI Strategist</div><div class="legend-desc">Strategic, advanced use leveraging the full AI ecosystem</div></div></div>
        </div>
      </div>
      <div class="category-grid">${categoryCards}</div>
      <div class="footer">
        <span class="footer-info">Based on last 30 days of activity &middot; Last updated: ${new Date(data.lastUpdated).toLocaleString()} &middot; Updates every 5 minutes</span>
        ${dismissedTips.length > 0 ? `<button id="btn-reset-tips" class="reset-tips-btn" title="Show all dismissed improvement suggestions again">\u{1F504} Reset Dismissed Tips</button>` : ""}
      </div>
      ${buildShareSectionHtml()}
      <div class="beta-footer">
        <span class="beta-footer-icon">\u26A0\uFE0F</span>
        <div class="beta-footer-content"><strong>Beta</strong> \u2014 This screen is still in beta. If you have feedback or suggestions for improvements, please <a href="https://github.com/rajbos/ai-engineering-fluency/issues" class="beta-link">create an issue</a> on the repository.</div>
        <button id="btn-share-issue" class="share-issue-btn">\u{1F4E4} Share to Issue</button>
      </div>
    </div>
  `;
  }
  function handlePngExport() {
    const svgEl = document.querySelector(".radar-svg");
    if (!svgEl) {
      return;
    }
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("width", "1100");
    clone.setAttribute("height", "1100");
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#1b1b1e");
    clone.insertBefore(bg, clone.firstChild);
    const svgData = new XMLSerializer().serializeToString(clone);
    const encodedSvg = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1100;
      canvas.height = 1100;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.drawImage(img, 0, 0, 1100, 1100);
      const dataUrl = canvas.toDataURL("image/png");
      vscode.postMessage({ command: "saveChartImage", data: dataUrl });
    };
    img.onerror = () => {
      vscode.postMessage({ command: "downloadChartImage" });
    };
    img.src = encodedSvg;
  }
  async function handleScreenshotExport(command) {
    const html2canvasModule = await Promise.resolve().then(() => __toESM(require_html2canvas()));
    const html2canvas = html2canvasModule.default ?? html2canvasModule;
    const images = [];
    const stageBanner = document.querySelector(".stage-banner");
    const radarWrapper = document.querySelector(".radar-wrapper");
    const coverContainer = document.createElement("div");
    coverContainer.style.cssText = "position:absolute;left:-9999px;top:0;width:1200px;background:#1b1b1e;padding:24px;border-radius:10px;";
    const titleEl = document.createElement("div");
    titleEl.style.cssText = "text-align:center;margin-bottom:20px;";
    titleEl.innerHTML = `<div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:8px;">AI Engineering Fluency Score</div><div style="font-size:16px;color:#b8b8c8;">Report &middot; ${(/* @__PURE__ */ new Date()).toLocaleDateString()}</div>`;
    coverContainer.appendChild(titleEl);
    if (stageBanner) {
      coverContainer.appendChild(stageBanner.cloneNode(true));
    }
    if (radarWrapper) {
      coverContainer.appendChild(radarWrapper.cloneNode(true));
    }
    document.body.appendChild(coverContainer);
    try {
      const coverCanvas = await html2canvas(coverContainer, { backgroundColor: "#1b1b1e", scale: 2, useCORS: true });
      images.push({ label: "Cover", dataUrl: coverCanvas.toDataURL("image/png") });
    } finally {
      document.body.removeChild(coverContainer);
    }
    const cards = Array.from(document.querySelectorAll(".category-card"));
    for (const card of cards) {
      const wrapper = document.createElement("div");
      wrapper.style.cssText = "position:absolute;left:-9999px;top:0;width:900px;background:#1b1b1e;padding:24px;border-radius:10px;";
      wrapper.appendChild(card.cloneNode(true));
      document.body.appendChild(wrapper);
      try {
        const cardCanvas = await html2canvas(wrapper, { backgroundColor: "#1b1b1e", scale: 2, useCORS: true });
        const nameEl = card.querySelector(".category-name");
        const label = nameEl?.textContent?.trim() || "Category";
        images.push({ label, dataUrl: cardCanvas.toDataURL("image/png") });
      } finally {
        document.body.removeChild(wrapper);
      }
    }
    vscode.postMessage({ command, data: images });
  }
  function wireMaturityNavButtons() {
    document.getElementById("btn-refresh")?.addEventListener("click", () => {
      vscode.postMessage({ command: "refresh" });
    });
    document.getElementById("btn-level-viewer-inline")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showFluencyLevelViewer" });
    });
    document.getElementById("btn-details")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showDetails" });
    });
    document.getElementById("btn-chart")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showChart" });
    });
    document.getElementById("btn-usage")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showUsageAnalysis" });
    });
    document.getElementById("btn-diagnostics")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showDiagnostics" });
    });
    document.getElementById("btn-dashboard")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showDashboard" });
    });
    document.getElementById("btn-environmental")?.addEventListener("click", () => {
      vscode.postMessage({ command: "showEnvironmental" });
    });
    wireExtensionPointButtons(vscode);
  }
  function wireMaturityActionButtons() {
    document.getElementById("btn-share-issue")?.addEventListener("click", () => {
      vscode.postMessage({ command: "shareToIssue" });
    });
    document.querySelector(".mcp-discover-btn")?.addEventListener("click", () => {
      vscode.postMessage({ command: "searchMcpExtensions" });
    });
    document.querySelectorAll(".hook-reminder-btn").forEach((btn) => {
      btn.addEventListener("click", (e7) => {
        const target = e7.currentTarget;
        const hookId = target.getAttribute("data-hook-id");
        const action = target.getAttribute("data-action");
        if (hookId && action) {
          vscode.postMessage({ command: action, hookId });
        }
      });
    });
    document.querySelectorAll(".dismiss-tips-btn").forEach((btn) => {
      btn.addEventListener("click", (e7) => {
        const target = e7.target;
        const category = target.getAttribute("data-category");
        if (category) {
          vscode.postMessage({ command: "dismissTips", category });
        }
      });
    });
    document.getElementById("btn-reset-tips")?.addEventListener("click", () => {
      vscode.postMessage({ command: "resetDismissedTips" });
    });
    document.getElementById("btn-share-linkedin")?.addEventListener("click", () => {
      vscode.postMessage({ command: "shareToLinkedIn" });
    });
    document.getElementById("btn-share-bluesky")?.addEventListener("click", () => {
      vscode.postMessage({ command: "shareToBluesky" });
    });
    document.getElementById("btn-share-mastodon")?.addEventListener("click", () => {
      vscode.postMessage({ command: "shareToMastodon" });
    });
  }
  function wireExportHandlers() {
    const exportToggleBtn = document.getElementById("btn-export-toggle");
    const exportDropdown = document.getElementById("export-dropdown");
    exportToggleBtn?.addEventListener("click", (e7) => {
      e7.stopPropagation();
      if (exportDropdown) {
        const isVisible = exportDropdown.style.display === "block";
        exportDropdown.style.display = isVisible ? "none" : "block";
      }
    });
    document.addEventListener("click", () => {
      if (exportDropdown) {
        exportDropdown.style.display = "none";
      }
    });
    document.querySelectorAll(".export-menu-item").forEach((item) => {
      item.addEventListener("click", (e7) => {
        e7.stopPropagation();
        const target = e7.currentTarget;
        const exportType = target.getAttribute("data-export-type");
        if (exportDropdown) {
          exportDropdown.style.display = "none";
        }
        if (exportType === "png") {
          handlePngExport();
        } else if (exportType === "pdf") {
          void handleScreenshotExport("exportPdf");
        } else if (exportType === "pptx") {
          void handleScreenshotExport("exportPptx");
        }
      });
    });
  }
  function renderLayout(data) {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }
    const dismissedTips = data.dismissedTips || [];
    const useDemoCards = demoModeActive && data.fluencyLevels;
    const categoryCards = data.categories.map(
      (cat, catIdx) => buildCategoryCard(cat, catIdx, dismissedTips, Boolean(useDemoCards), data)
    ).join("");
    root.innerHTML = buildMaturityRootHtml(data, categoryCards, dismissedTips);
    wireMaturityNavButtons();
    wireMaturityActionButtons();
    wireExportHandlers();
    if (data.isDebugMode) {
      wireDemoControls(data);
    }
  }
  async function bootstrap() {
    await Promise.resolve().then(() => (init_vscode_button2(), vscode_button_exports));
    if (!initialData) {
      const root = document.getElementById("root");
      if (root) {
        root.textContent = "No data available.";
      }
      return;
    }
    renderLayout(initialData);
  }
  void bootstrap();
})();
/*! Bundled license information:

html2canvas/dist/html2canvas.js:
  (*!
   * html2canvas 1.4.1 <https://html2canvas.hertzen.com>
   * Copyright (c) 2022 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   *)
  (*! *****************************************************************************
      Copyright (c) Microsoft Corporation.
  
      Permission to use, copy, modify, and/or distribute this software for any
      purpose with or without fee is hereby granted.
  
      THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
      REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
      AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
      INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
      LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
      OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
      PERFORMANCE OF THIS SOFTWARE.
      ***************************************************************************** *)

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=maturity.js.map
