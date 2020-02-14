"use strict";

export function isObject(o) {
  return o instanceof Object && o.constructor.name == "Object";
}

export function emptyObject(o) {
  for (let i in o) {
    return false;
  }
  return true;
}

export function get(path, data) {
  let keys = path.split(".");

  let pointer = data;

  let _key = keys.pop();

  for (let i in keys) {
    let key = keys[i];

    if (typeof data != "object" || !pointer.hasOwnProperty(key)) {
      return;
    }

    pointer = pointer[key];
  }

  return pointer[_key] ? pointer[_key] : null;
}

export function lget(path, layers) {
  if (typeof layers != "object") {
    return;
  }

  if (path.indexOf("[") > -1) {
    path = path.replace(/\[([^\]]+)\]/g, (m, i) => "." + i);
  }

  let i = path.indexOf(".");

  let root = i == -1 ? path : path.slice(0, i);

  let data;

  for (let i = layers.length - 1; i >= 0; i--) {
    if (layers[i].hasOwnProperty(root)) {
      data = layers[i][root];
      break;
    }
  }

  if (i == -1) {
    return data;
  }

  if (typeof data == "object") {
    return this.get(path.slice(i + 1), data);
  }
}

export function slget(key, layers, def) {
  if (typeof layers != "object") {
    return null;
  }

  for (let i = layers.length - 1; i >= 0; i--) {
    if (layers[i].hasOwnProperty(key)) {
      return layers[i][key];
    }
  }

  return def;
}

export function set(data, path, value) {
  const keys = path.split(".");
  let key;
  let pointer = data;
  let _key = keys.pop();
  for (let i in keys) {
    key = keys[i];
    if (!pointer.hasOwnProperty(key) || !isObject(pointer[key])) {
      pointer[key] = {};
    }
    pointer = pointer[key];
  }
  pointer[_key] = value;
}

export function parsePath(path, key) {
  if (path) {
    path = path.split(".");
  } else {
    path = [];
  }

  let keys = key.split("/");

  let realkey = keys.pop();

  for (let i in keys) {
    if (keys[i] == "root") {
      path = [];
      break;
    }

    if (keys[i] == "..") {
      path.pop();
    }
  }

  path.push(realkey);

  let realpath = path.join(".");

  return realpath;
}

export function size(object) {
  var length = 0;
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      ++length;
    }
  }
  return length;
}

function order(o) {
  const r = Array.isArray(o) ? [] : {};
  let v, k, i;
  const keys = Object.keys(o).sort();
  for (i in keys) {
    k = keys[i];
    v = o[k];
    r[k] = typeof v === "object" && v !== null ? order(v) : v;
  }
  return r;
}

function clone(o) {
  let r, v, k;
  if (typeof o !== "object" || o === null) {
    return o;
  }
  r = Array.isArray(o) ? [] : {};
  for (k in o) {
    v = o[k];
    r[k] = typeof v === "object" && v !== null ? clone(v) : v;
  }
  return r;
}

function nested(o, deep) {
  if (deep) {
    return deepNested(o);
  }
  const r = {};
  for (const k in o) {
    set(r, k, o[k]);
  }
  return r;
}

function deepNested(o) {
  //
  if (Array.isArray(o)) {
    return o.map(v => (v && typeof v == "object" ? deepNested(v) : v));
  }

  let v;
  const r = {};
  for (const k in o) {
    v = o[k];
    set(r, k, v && typeof v == "object" ? deepNested(v) : v);
  }
  return r;
}

export { order, clone, nested };
