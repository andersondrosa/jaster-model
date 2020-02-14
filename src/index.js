import model from "./model";
import { isObject, nested, order, hash } from "./utils";

export { isObject, nested, order, hash };

export function object(o) {
  return { "<:new:>": true, ...o };
}
export function rm() {
  return { __rm: [...arguments] };
}

export default model;
