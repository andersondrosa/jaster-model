import Model from "../src";

function object(o) {
  return { "<:new:>": true, ...o };
}
function rm() {
  return { __rm: [...arguments] };
}

describe("MODEL", () => {
  //
  it("Should be OK", async function() {
    //

    const extension = {
      original: "ok"
    };

    const $john = new Model(extension);

    $john.put({
      name: "John Doe"
    });

    $john.put(data => ({
      teste: data.name
    }));

    $john.commit(); // ====================

    $john.put({
      name: "NINJA"
    });

    $john.put({
      name: "SAMURAI"
    });

    $john.rollback();
    $john.commit(); // ====================

    // $john.rollforth();

    const commits = $john.getCommits();

    console.log(commits);

    const $mary = new Model(extension, commits);
    $mary.put({
      teste: "ok"
    });
    $mary.commit()
    console.log($mary.getCommits());
    
    console.log($mary.getData())
  });
});
