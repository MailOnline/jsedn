// Generated by CoffeeScript 1.6.2
(function() {
  var Discard, Iterable, Keyword, List, Map, Prim, Set, StringObj, Symbol, Tag, Tagged, Vector, atPath, encode, encodeHandlers, encodeJson, equals, escapeChar, fs, handle, keywords, kw, lex, parenTypes, parens, read, specialChars, sym, symbols, tagActions, tokenHandlers, type, _ref, _ref1, _ref2, _ref3,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof window === "undefined") {
    type = require("type-component");
  } else {
    type = require("type");
  }

  equals = require("equals");

  Prim = (function() {
    function Prim(val) {
      var x;

      if (type(val) === "array") {
        this.val = (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = val.length; _i < _len; _i++) {
            x = val[_i];
            if (!(x instanceof Discard)) {
              _results.push(x);
            }
          }
          return _results;
        })();
      } else {
        this.val = val;
      }
    }

    Prim.prototype.value = function() {
      return this.val;
    };

    Prim.prototype.toString = function() {
      return JSON.stringify(this.val);
    };

    return Prim;

  })();

  Symbol = (function(_super) {
    __extends(Symbol, _super);

    function Symbol() {
      var args, parts;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          if (args[0] === "/") {
            this.ns = null;
            this.name = "/";
          } else {
            parts = args[0].split("/");
            if (parts.length === 1) {
              this.ns = null;
              this.name = parts[0];
            } else if (parts.length === 2) {
              this.ns = parts[0];
              this.name = parts[1];
            } else {
              throw "Can not have more than 1 forward slash in a symbol";
            }
          }
          break;
        case 2:
          this.ns = args[0];
          this.name = args[1];
      }
      if (this.name.length === 0) {
        throw "Length of Symbol name can not be empty";
      }
      this.val = "" + (this.ns ? "" + this.ns + "/" : "") + this.name;
    }

    Symbol.prototype.toString = function() {
      return this.val;
    };

    Symbol.prototype.ednEncode = function() {
      return this.val;
    };

    Symbol.prototype.jsEncode = function() {
      return this.val;
    };

    Symbol.prototype.jsonEncode = function() {
      return {
        Symbol: this.val
      };
    };

    return Symbol;

  })(Prim);

  Keyword = (function(_super) {
    __extends(Keyword, _super);

    function Keyword() {
      Keyword.__super__.constructor.apply(this, arguments);
      if (this.val[0] !== ":") {
        throw "keyword must start with a :";
      }
    }

    Keyword.prototype.jsonEncode = function() {
      return {
        Keyword: this.val
      };
    };

    return Keyword;

  })(Symbol);

  StringObj = (function(_super) {
    __extends(StringObj, _super);

    function StringObj() {
      _ref = StringObj.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    StringObj.prototype.toString = function() {
      return this.val;
    };

    StringObj.prototype.is = function(test) {
      return this.val === test;
    };

    return StringObj;

  })(Prim);

  Tag = (function() {
    function Tag() {
      var name, namespace, _ref1;

      namespace = arguments[0], name = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      this.namespace = namespace;
      this.name = name;
      if (arguments.length === 1) {
        _ref1 = arguments[0].split('/'), this.namespace = _ref1[0], this.name = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
      }
    }

    Tag.prototype.ns = function() {
      return this.namespace;
    };

    Tag.prototype.dn = function() {
      return [this.namespace].concat(this.name).join('/');
    };

    return Tag;

  })();

  Tagged = (function(_super) {
    __extends(Tagged, _super);

    function Tagged(_tag, _obj) {
      this._tag = _tag;
      this._obj = _obj;
    }

    Tagged.prototype.ednEncode = function() {
      return "\#" + (this.tag().dn()) + " " + (encode(this.obj()));
    };

    Tagged.prototype.jsonEncode = function() {
      return {
        Tagged: [this.tag().dn(), this.obj().jsonEncode != null ? this.obj().jsonEncode() : this.obj()]
      };
    };

    Tagged.prototype.tag = function() {
      return this._tag;
    };

    Tagged.prototype.obj = function() {
      return this._obj;
    };

    return Tagged;

  })(Prim);

  Discard = (function() {
    function Discard() {}

    return Discard;

  })();

  Iterable = (function(_super) {
    __extends(Iterable, _super);

    function Iterable() {
      _ref1 = Iterable.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Iterable.prototype.ednEncode = function() {
      return (this.map(function(i) {
        return encode(i);
      })).join(" ");
    };

    Iterable.prototype.jsonEncode = function() {
      return this.map(function(i) {
        if (i.jsonEncode != null) {
          return i.jsonEncode();
        } else {
          return i;
        }
      });
    };

    Iterable.prototype.jsEncode = function() {
      return this.map(function(i) {
        if (i.jsEncode != null) {
          return i.jsEncode();
        } else {
          return i;
        }
      });
    };

    Iterable.prototype.exists = function(index) {
      return this.val[index] != null;
    };

    Iterable.prototype.each = function(iter) {
      var i, _i, _len, _ref2, _results;

      _ref2 = this.val;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        i = _ref2[_i];
        _results.push(iter(i));
      }
      return _results;
    };

    Iterable.prototype.map = function(iter) {
      return this.each(iter);
    };

    Iterable.prototype.at = function(index) {
      if (this.exists(index)) {
        return this.val[index];
      }
    };

    Iterable.prototype.set = function(index, val) {
      this.val[index] = val;
      return this;
    };

    return Iterable;

  })(Prim);

  List = (function(_super) {
    __extends(List, _super);

    function List() {
      _ref2 = List.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    List.prototype.ednEncode = function() {
      return "(" + (List.__super__.ednEncode.call(this)) + ")";
    };

    List.prototype.jsonEncode = function() {
      return {
        List: List.__super__.jsonEncode.call(this)
      };
    };

    return List;

  })(Iterable);

  Vector = (function(_super) {
    __extends(Vector, _super);

    function Vector() {
      _ref3 = Vector.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Vector.prototype.ednEncode = function() {
      return "[" + (Vector.__super__.ednEncode.call(this)) + "]";
    };

    Vector.prototype.jsonEncode = function() {
      return {
        Vector: Vector.__super__.jsonEncode.call(this)
      };
    };

    return Vector;

  })(Iterable);

  Set = (function(_super) {
    __extends(Set, _super);

    Set.prototype.ednEncode = function() {
      return "\#{" + (Set.__super__.ednEncode.call(this)) + "}";
    };

    Set.prototype.jsonEncode = function() {
      return {
        Set: Set.__super__.jsonEncode.call(this)
      };
    };

    function Set(val) {
      var item, _i, _len;

      Set.__super__.constructor.call(this);
      this.val = [];
      for (_i = 0, _len = val.length; _i < _len; _i++) {
        item = val[_i];
        if (__indexOf.call(this.val, item) >= 0) {
          throw "set not distinct";
        } else {
          this.val.push(item);
        }
      }
    }

    return Set;

  })(Iterable);

  Map = (function() {
    Map.prototype.ednEncode = function() {
      var i;

      return "{" + (((function() {
        var _i, _len, _ref4, _results;

        _ref4 = this.value();
        _results = [];
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          i = _ref4[_i];
          _results.push(encode(i));
        }
        return _results;
      }).call(this)).join(" ")) + "}";
    };

    Map.prototype.jsonEncode = function() {
      var i;

      return {
        Map: (function() {
          var _i, _len, _ref4, _results;

          _ref4 = this.value();
          _results = [];
          for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
            i = _ref4[_i];
            _results.push(i.jsonEncode != null ? i.jsonEncode() : i);
          }
          return _results;
        }).call(this)
      };
    };

    Map.prototype.jsEncode = function() {
      var hashId, i, k, result, _i, _len, _ref4;

      result = {};
      _ref4 = this.keys;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        k = _ref4[i];
        hashId = k.hashId != null ? k.hashId() : k;
        result[hashId] = this.vals[i].jsEncode != null ? this.vals[i].jsEncode() : this.vals[i];
      }
      return result;
    };

    function Map(val) {
      var i, v, _i, _len, _ref4;

      this.val = val != null ? val : [];
      this.keys = [];
      this.vals = [];
      _ref4 = this.val;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        v = _ref4[i];
        if (i % 2 === 0) {
          this.keys.push(v);
        } else {
          this.vals.push(v);
        }
      }
      this.val = false;
    }

    Map.prototype.value = function() {
      var i, result, v, _i, _len, _ref4;

      result = [];
      _ref4 = this.keys;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        v = _ref4[i];
        result.push(v);
        if (this.vals[i] != null) {
          result.push(this.vals[i]);
        }
      }
      return result;
    };

    Map.prototype.exists = function(key) {
      var i, k, _i, _len, _ref4;

      _ref4 = this.keys;
      for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
        k = _ref4[i];
        if (equals(k, key)) {
          return i;
        }
      }
      return void 0;
    };

    Map.prototype.at = function(key) {
      var id;

      if ((id = this.exists(key)) != null) {
        return this.vals[id];
      } else {
        throw "key does not exist";
      }
    };

    Map.prototype.set = function(key, val) {
      var id;

      if ((id = this.exists(key)) != null) {
        this.vals[id] = val;
      } else {
        this.keys.push(key);
        this.vals.push(val);
      }
      return this;
    };

    Map.prototype.map = function(iter) {
      var result;

      result = new Map;
      this.each(function(k, v) {
        return result.set(k, iter(k, v));
      });
      return result;
    };

    Map.prototype.each = function(iter) {
      var k, _i, _len, _ref4, _results;

      _ref4 = this.keys;
      _results = [];
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        k = _ref4[_i];
        _results.push(iter(k, this.at(k)));
      }
      return _results;
    };

    return Map;

  })();

  parens = '()[]{}';

  specialChars = parens + ' \t\n\r,';

  escapeChar = '\\';

  parenTypes = {
    '(': {
      closing: ')',
      "class": List
    },
    '[': {
      closing: ']',
      "class": Vector
    },
    '{': {
      closing: '}',
      "class": Map
    }
  };

  lex = function(string) {
    var c, escaping, in_comment, in_string, list, token, _i, _len;

    list = [];
    token = '';
    for (_i = 0, _len = string.length; _i < _len; _i++) {
      c = string[_i];
      if ((typeof in_string === "undefined" || in_string === null) && c === ";") {
        in_comment = true;
      }
      if (in_comment) {
        if (c === "\n") {
          in_comment = void 0;
          if (token) {
            list.push(token);
            token = '';
          }
        }
        continue;
      }
      if (c === '"' && (typeof escaping === "undefined" || escaping === null)) {
        if (typeof in_string !== "undefined" && in_string !== null) {
          list.push(new StringObj(in_string));
          in_string = void 0;
        } else {
          in_string = '';
        }
        continue;
      }
      if (in_string != null) {
        if (c === escapeChar && (typeof escaping === "undefined" || escaping === null)) {
          escaping = true;
          continue;
        }
        if (escaping != null) {
          escaping = void 0;
        }
        in_string += c;
      } else if (__indexOf.call(specialChars, c) >= 0) {
        if (token) {
          list.push(token);
          token = '';
        }
        if (__indexOf.call(parens, c) >= 0) {
          list.push(c);
        }
      } else {
        if (token === "#_") {
          list.push(token);
          token = '';
        }
        token += c;
      }
    }
    if (token) {
      list.push(token);
    }
    return list;
  };

  read = function(tokens) {
    var read_ahead, result, token1;

    read_ahead = function(token) {
      var L, closeParen, handledToken, paren, tagged;

      if (token === void 0) {
        return;
      }
      if (paren = parenTypes[token]) {
        closeParen = paren.closing;
        L = [];
        while (true) {
          token = tokens.shift();
          if (token === void 0) {
            throw 'unexpected end of list';
          }
          if (token === paren.closing) {
            return new paren["class"](L);
          } else {
            L.push(read_ahead(token));
          }
        }
      } else if (__indexOf.call(")]}", token) >= 0) {
        throw "unexpected " + token;
      } else {
        handledToken = handle(token);
        if (handledToken instanceof Tag) {
          token = tokens.shift();
          if (token === void 0) {
            throw 'was expecting something to follow a tag';
          }
          tagged = new Tagged(handledToken, read_ahead(token));
          if (tagged.tag().dn() === "") {
            if (tagged.obj() instanceof Map) {
              return new Set(tagged.obj().value());
            }
          }
          if (tagged.tag().dn() === "_") {
            return new Discard;
          }
          if (tagActions[tagged.tag().dn()] != null) {
            return tagActions[tagged.tag().dn()].action(tagged.obj());
          }
          return tagged;
        } else {
          return handledToken;
        }
      }
    };
    token1 = tokens.shift();
    if (token1 === void 0) {
      return void 0;
    } else {
      result = read_ahead(token1);
      if (result instanceof Discard) {
        return "";
      }
      return result;
    }
  };

  handle = function(token) {
    var handler, name;

    if (token instanceof StringObj) {
      return token.toString();
    }
    for (name in tokenHandlers) {
      handler = tokenHandlers[name];
      if (handler.pattern.test(token)) {
        return handler.action(token);
      }
    }
    return sym(token);
  };

  tokenHandlers = {
    nil: {
      pattern: /^nil$/,
      action: function(token) {
        return null;
      }
    },
    boolean: {
      pattern: /^true$|^false$/,
      action: function(token) {
        return token === "true";
      }
    },
    character: {
      pattern: /^\\[A-z0-9]$/,
      action: function(token) {
        return token.slice(-1);
      }
    },
    tab: {
      pattern: /^\\tab$/,
      action: function(token) {
        return "\t";
      }
    },
    newLine: {
      pattern: /^\\newline$/,
      action: function(token) {
        return "\n";
      }
    },
    space: {
      pattern: /^\\space$/,
      action: function(token) {
        return " ";
      }
    },
    keyword: {
      pattern: /^[\:\?].*$/,
      action: function(token) {
        return kw(token);
      }
    },
    integer: {
      pattern: /^[\-\+]?[0-9]+N?$/,
      action: function(token) {
        return parseInt(token === "-0" ? "0" : token);
      }
    },
    float: {
      pattern: /^[\-\+]?[0-9]+(\.[0-9]*)?([eE][-+]?[0-9]+)?M?$/,
      action: function(token) {
        return parseFloat(token);
      }
    },
    tagged: {
      pattern: /^#.*$/,
      action: function(token) {
        return new Tag(token.slice(1));
      }
    }
  };

  tagActions = {
    uuid: {
      tag: new Tag("uuid"),
      action: function(obj) {
        return obj;
      }
    },
    inst: {
      tag: new Tag("inst"),
      action: function(obj) {
        return new Date(Date.parse(obj));
      }
    }
  };

  encodeHandlers = {
    array: {
      test: function(obj) {
        return type(obj) === "array";
      },
      action: function(obj) {
        var v;

        return "[" + (((function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            v = obj[_i];
            _results.push(encode(v));
          }
          return _results;
        })()).join(" ")) + "]";
      }
    },
    integer: {
      test: function(obj) {
        return type(obj) === "number" && tokenHandlers.integer.pattern.test(obj);
      },
      action: function(obj) {
        return parseInt(obj);
      }
    },
    float: {
      test: function(obj) {
        return type(obj) === "number" && tokenHandlers.float.pattern.test(obj);
      },
      action: function(obj) {
        return parseFloat(obj);
      }
    },
    string: {
      test: function(obj) {
        return type(obj) === "string";
      },
      action: function(obj) {
        return "\"" + (obj.toString().replace(/"/g, '\\"')) + "\"";
      }
    },
    boolean: {
      test: function(obj) {
        return type(obj) === "boolean";
      },
      action: function(obj) {
        if (obj) {
          return "true";
        } else {
          return "false";
        }
      }
    },
    "null": {
      test: function(obj) {
        return type(obj) === "null";
      },
      action: function(obj) {
        return "nil";
      }
    },
    date: {
      test: function(obj) {
        return type(obj) === "date";
      },
      action: function(obj) {
        return "#inst \"" + (obj.toISOString()) + "\"";
      }
    },
    object: {
      test: function(obj) {
        return type(obj) === "object";
      },
      action: function(obj) {
        var k, result, v;

        result = [];
        for (k in obj) {
          v = obj[k];
          result.push(encode(k));
          result.push(encode(v));
        }
        return "{" + (result.join(" ")) + "}";
      }
    }
  };

  encode = function(obj) {
    var handler, name;

    if ((obj != null ? obj.ednEncode : void 0) != null) {
      return obj.ednEncode();
    }
    for (name in encodeHandlers) {
      handler = encodeHandlers[name];
      if (handler.test(obj)) {
        return handler.action(obj);
      }
    }
    throw "unhandled encoding for " + (JSON.stringify(obj));
  };

  encodeJson = function(obj, prettyPrint) {
    if (obj.jsonEncode != null) {
      return encodeJson(obj.jsonEncode(), prettyPrint);
    }
    if (prettyPrint) {
      return JSON.stringify(obj, null, 4);
    } else {
      return JSON.stringify(obj);
    }
  };

  atPath = function(obj, path) {
    var part, value, _i, _len;

    path = path.trim().replace(/[ ]{2,}/g, ' ').split(' ');
    value = obj;
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      part = path[_i];
      if (part[0] === ":") {
        part = kw(part);
      }
      if (value.exists) {
        if (value.exists(part) != null) {
          value = value.at(part);
        } else {
          throw "Could not find " + part;
        }
      } else {
        throw "Not a composite object";
      }
    }
    return value;
  };

  symbols = {};

  sym = function(val) {
    if (symbols[val] == null) {
      symbols[val] = new Symbol(val);
    }
    return symbols[val];
  };

  keywords = {};

  kw = function(word) {
    if (keywords[word] == null) {
      keywords[word] = new Keyword(word);
    }
    return keywords[word];
  };

  exports.Symbol = Symbol;

  exports.sym = sym;

  exports.Keyword = Keyword;

  exports.kw = kw;

  exports.List = List;

  exports.Vector = Vector;

  exports.Map = Map;

  exports.Set = Set;

  exports.Tag = Tag;

  exports.Tagged = Tagged;

  exports.setTagAction = function(tag, action) {
    return tagActions[tag.dn()] = {
      tag: tag,
      action: action
    };
  };

  exports.setTokenHandler = function(handler, pattern, action) {
    return tokenHandlers[handler] = {
      pattern: pattern,
      action: action
    };
  };

  exports.setTokenPattern = function(handler, pattern) {
    return tokenHandlers[handler].pattern = pattern;
  };

  exports.setTokenAction = function(handler, action) {
    return tokenHandlers[handler].action = action;
  };

  exports.setEncodeHandler = function(handler, test, action) {
    return encodeHandlers[handler] = {
      test: test,
      action: action
    };
  };

  exports.setEncodeTest = function(type, test) {
    return encodeHandlers[type].test = test;
  };

  exports.setEncodeAction = function(type, action) {
    return encodeHandlers[type].action = action;
  };

  exports.parse = function(string) {
    return read(lex(string));
  };

  exports.encode = encode;

  exports.encodeJson = encodeJson;

  exports.atPath = atPath;

  exports.toJS = function(obj) {
    if (obj.jsEncode != null) {
      return obj.jsEncode();
    } else {
      return obj;
    }
  };

  if (typeof window === "undefined") {
    fs = require("fs");
    exports.readFile = function(file, cb) {
      return fs.readFile(file, "utf-8", function(err, data) {
        if (err) {
          throw err;
        }
        return cb(exports.parse(data));
      });
    };
    exports.readFileSync = function(file) {
      return exports.parse(fs.readFileSync(file, "utf-8"));
    };
  }

  exports.compile = function(string) {
    return "return require('jsedn').parse(\"" + (string.replace(/"/g, '\\"').replace(/\n/g, " ").trim()) + "\")";
  };

}).call(this);
