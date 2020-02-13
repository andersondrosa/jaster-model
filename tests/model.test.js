import Model from "../src";
import { object, rm } from "../src";
import { order, nested, deepNested } from "../src/utils";

function print(o) {
  console.log(JSON.stringify(o, null, 2));
}
//
const data = {
  first: "ok"
};

const $john = new Model(data);

it("Put first data", function() {
  //
  $john.put({
    name: "John",
    age: 30
  });

  expect($john.getData()).toMatchSnapshot();
});

// PUT =======================================================================
it("Put John Doe", function() {
  //
  $john.put(data => ({
    name: data.name + " Doe"
  }));

  expect($john.getData()).toMatchSnapshot();

  expect($john.getUncommitedData()).toMatchSnapshot();
});

// COMMIT ====================================================================
it("First commit", function() {
  //
  $john.commit();

  expect($john.getCommits()).toMatchSnapshot();
});

// PUT =======================================================================
it("Put Jane Doe", function() {
  //
  $john.put({ name: "Jane Doe" });

  expect($john.getData()).toMatchSnapshot();
});

// ROLLBACK ==================================================================
it("Rollback", function() {
  //
  $john.rollback();

  expect($john.getData()).toMatchSnapshot();
});

// ROLLFORTH==================================================================
it("Rollforth", function() {
  //
  $john.rollforth();

  expect($john.getData()).toMatchSnapshot();
});

// PUT =======================================================================
it("Put Mary Doe", function() {
  //
  $john.put({ name: "Mary Doe" });

  expect($john.getData()).toMatchSnapshot();

  expect($john.getUncommitedData()).toMatchSnapshot();
});

// ROLLBACK ==================================================================
it("Rollback Mary Doe", function() {
  //
  $john.rollback();

  expect($john.getData()).toMatchSnapshot();

  expect($john.getUncommitedData()).toMatchSnapshot();
});

// COMMIT ====================================================================
it("Second Commit", function() {
  //
  $john.commit();

  expect($john.getUncommitedData()).toMatchSnapshot();

  expect($john.getCommits()).toMatchSnapshot();

  expect($john.getData()).toMatchSnapshot();
});

// ROLLBACKL COMMIT ==========================================================
it("Rollback second commit", function() {
  //
  $john.rollbackCommit(1);

  expect($john.getCommits()).toMatchSnapshot();

  expect($john.getData()).toMatchSnapshot();

  expect($john.getUncommitedData()).toMatchSnapshot();
});

// ===========================================================
it("Final", function() {
  //
  let commits = $john.getCommits();

  const $mary = new Model(data, commits);

  $mary.put({
    alpha: "foo"
  });

  $mary.commit();

  $mary.put({
    omega: "baz",
    alpha: "bar"
  });

  $mary.commit();

  expect(commits).toMatchSnapshot();

  // print($mary.getCommits());

  expect($mary.getCommits()).toMatchSnapshot();

  $mary.restore();

  // print($mary.getCommits());

  expect($mary.undoCommits).toMatchSnapshot();

  $mary.rollbackCommit();
  expect($mary.undoCommits).toMatchSnapshot();
});

it("Test", function() {
  const $model = new Model({});

  $model.put({
    a: "1"
  });

  $model.commit("commit a:1");

  $model.put({
    b: "1"
  });

  $model.commit("commit b:1");

  $model.put({
    c: "1"
  });

  $model.putn({
    "d.b": "B",
    "d.a": "A"
  });

  $model.commit("commit c:1, d:1");

  $model.put({
    d: {
      ...rm("a"),
      a: "A"
    }
  });

  $model.commit();
  
  $model.rollback();
  $model.rollback();
  $model.rollforth();
  
  $model.commit();
  
  expect($model.getCommits()).toMatchSnapshot()
});
