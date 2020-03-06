import Model from "../src";
import { object, rm } from "../src";
import { order, nested, deepNested, hash } from "../src/utils";
import firedata from "../lib/firedata";

// Log data as pretty JSON
const log = (text, o) => console.log(text, JSON.stringify(o, null, 2));

it("README - Link and Zelda", function() {
  //
  const character = {
    name: "Character",
    type: "villager",
    rupees: 30,
    gender: "male"
  };

  const link = new Model(character);

  link.put({
    name: "Link"
  });

  // So to see the link name just run the get function
  // log("link name", link.get("name"));
  expect(link.get("name")).toMatchSnapshot();
  // Link, no longer Character

  // But the character type is still Villager
  // log("link type", link.get("type")); // villager
  expect(link.get("type")).toMatchSnapshot();

  // Then, let's change the type of the link to warrior 💪🏻
  link.put({ type: "warrior 🧝🏼‍♂" });

  // And also increase his rupees into 100 😏💎
  link.put(state => {
    return { rupees: state.rupees + 100 };
  });

  // let's see how our character became?
  // log("data", link.getData());
  expect(link.getData()).toMatchSnapshot();

  // Now we can save the changes by making the commits
  link.commit();

  expect(link.getCommits()).toMatchSnapshot();

  // Now that it has been saved, if something happens to the link
  // just restore the data for the last commit

  // Oops, some zombie infected the link and changed its name 😱
  link.put(({ name }) => ({
    name: `Evil '${name}' 🧟‍♂`
  }));

  // log("link name", link.get("name")); // Evil 'Link' 🧟‍♂
  expect(link.get("name")).toMatchSnapshot();

  // Lets try to restoring removing the latest changes
  link.discardChanges();

  // Phew.. the link went back to normal 😆🙌🏻
  // log("link name", link.get("name")); // Link
  expect(link.get("name")).toMatchSnapshot();

  // So, I think we better save it somewhere so we don't lose the link again
  let { data, commits } = link.exportData();

  // And we can take a look to see if everything is alright
  // log("Link initial data", data);
  expect(data).toMatchSnapshot();

  // And see our first commit too
  // log("Link commits", commits);
  expect(commits).toMatchSnapshot();

  //The exported data can reconstruct the link to edit later if we need to,
  // however, if you don't need to edit it anymore,
  // just get your data in a simple way
  expect(link.getData()).toMatchSnapshot();

  // ===========================================================================

  // What do you think about using the link as a model to create the Zelda princess?

  // So we need to create a simple model based on the saved data
  const zelda = new Model(data, commits);

  // We must then set the princess's values and (of course)
  // multiply her rupees by 20 times
  zelda.put(state => {
    return {
      name: "Zelda",
      type: "princess 🧝🏼‍♀",
      gender: "female",
      rupees: state.rupees * 20,
      // And we can use her crush data here 😏
      wholoves: {
        name: state.name + " ♥",
        type: state.type + " 💪🏻"
      }
    };
  });

  // Then we make commit again
  zelda.commit();

  // console.log(zelda.getCommits());

  // Now just start your adventure game
  // log("data", zelda.getData());
  expect(zelda.getData()).toMatchSnapshot();

  expect(link.exportData()).toMatchSnapshot();

  expect(zelda.exportData()).toMatchSnapshot();

  // ===========================================================================

  zelda.use(firedata);

  zelda.put({
    $set: {
      stage: "zelda"
    },
    "@match:next": {
      xp: "required|gte:12"
    }
  });

  zelda.commit();

  zelda.$submit();

  zelda.put({ xp: 12 });

  zelda.$submit();

  const onChange = (objToWatch, event) => {
    const handler = {
      get(target, property, receiver) {
        event();
        const value = Reflect.get(target, property, receiver);
        if (typeof value === "object") {
          return new Proxy(value, handler);
        }
        return value;
      },
      set(target, property, value) {
        event();
        return Reflect.set(target, property, value);
      },
      deleteProperty(target, property) {
        event();
        return Reflect.deleteProperty(target, property);
      }
    };
    return new Proxy(objToWatch, handler);
  };

  class ninja {
    constructor() {
      this.teste = {
        ninja: "oi"
      };
    }
  }

  const $a = onChange(new ninja(), function name(params) {
    console.log("CHANGE");
  });

  console.log($a instanceof ninja);
});
