import model from "./model";

export function isObject(o) {
  return o instanceof Object && o.constructor.name == "Object";
}

export function object(o) {
  return { "<:new:>": true, ...o };
}
export function rm() {
  return { __rm: [...arguments] };
}

export default model;
