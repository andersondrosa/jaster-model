import { nested, order } from "./utils";
const lorem = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "zeta",
  "lambda",
  "pi",
  "sigma",
  "omega",
  "sampi"
]

function getRandom(arr) {
  return arr[rand(arr.length - 1)];
}
function rand(num) {
  return Math.floor(Math.random() * (num + 1));
}

function fakerValue() {
  return getRandom(lorem);
}

function randLine() {
  let line = [];
  const l = rand(4);
  for (let i = 0; i < l; i++) {
    line.push(getRandom(lorem));
  }
  if(line.length == 0) {
    return getRandom(lorem)
  }
  return line.join(".");
}

function reduce(res, values) {
  const num = values.shift();
  if (!(num > 0)) {
    return res;
  }
  let response = {};
  let i = 0;
  for (let key in res) {
    if (i >= num) break;
    i++;
    if (typeof res[key] == "object" && values.length > 0) {
      response[key] = reduce(res[key], values.slice());
    } else {
      response[key] = res[key];
    }
  }
  return response;
}

function faker() {
  //
  let res = {};

  for (let i = 0; i < 100000; i++) {
    res[randLine()] = fakerValue();
    getRandom(lorem);
  }

  res = nested(res);

  const response = {
    alpha: reduce(res.alpha, [3, 2, 5]),
    beta: reduce(res.beta, [3, 2, 5]),
  };

  return response;
}

export default faker;
