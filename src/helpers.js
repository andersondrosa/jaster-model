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
    path = path.replace(/\[([^\]]+)\]/g, (m, i) => {
      return "." + i;
    });
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
  let keys = path.split(".");

  let pointer = data;

  let _key = keys.pop();

  for (let i in keys) {
    let key = keys[i];

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
