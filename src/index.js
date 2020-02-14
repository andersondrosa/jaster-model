import model from "./model";
import { isObject, nested, order } from "./utils";

export { isObject, nested, order };

export function object(o) {
  return { "<:new:>": true, ...o };
}
export function rm() {
  return { __rm: [...arguments] };
}

export default model;
