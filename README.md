# Jaster Model

## How To Install

```bash
git clone https://github.com/andersondrosa/jaster-model.git
cd jaster-model
npm install
npm test
```

## How To Use

We will use the characters from the game zelda to show the basic features of the jaster-model class

```js
import model from "jaster-model";

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
console.log("link name", link.get("name"));
// Link, no longer Character

// But the character type is still Villager
console.log("link type", link.get("type")); // villager

// Then, let's change the type of the link to warrior 💪🏻
link.put({ type: "warrior 🧝🏼‍♂" });

// And also increase his rupees into 100 😏💎
link.put(state => {
  return { rupees: state.rupees + 100 };
});

// let's see how our character became?
console.log("data", link.getData());

// Now we can save the changes by making the commits
link.commit();

// Now that it has been saved, if something happens to the link
// just restore the data for the last commit

// Oops, some zombie infected the link and changed its name 😱
link.put(({ name }) => ({
  name: `Evil '${name}' 🧟‍♂`
}));

console.log("link name", link.get("name")); // Evil 'Link' 🧟‍♂

// Lets try to restoring removing the latest changes
link.discardChanges();

// Phew.. the link went back to normal 😆🙌🏻
console.log("link name", link.get("name")); // Link

// So, I think we better save it somewhere so we don't lose the link again
let { data, commits } = link.exportData();

// And we can take a look to see if everything is alright
console.log("Link initial data", data);

// And see our first commit too
console.log("Link commits", commits);

//The exported data can reconstruct the link to edit later if we need to,
// however, if you don't need to edit it anymore,
// just get your data in a simple way
console.log("full data", link.getData());

```

## Extending data

What do you think about using the link as a model to create the Zelda princess?

```js
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

// Now just start your adventure game 
console.log("data", zelda.getData());
```
