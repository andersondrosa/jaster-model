# Firedata at Master

## How To Install

```bash
git clone https://github.com/andersondrosa/firedata.git
cd firedata
npm install
npm test
```

## How To Use

First of all, we need to create and save a root entity as human

```js
const fdata = new Firedata();

fdata.use(DependencyProvider);

const $base = await fdata.create({
  // Setting current stage as 'human'
  $set: { stage: "human" },
  // Default info data
  type: "animal",
  species: "human",
  gender: "male",
  // Setting rules to next stage 'person'
  "@match:person": {
    name: "required|string",
    age: "required|number"
  }
});

$base.commit("First data commit");

$base.submit("First rule submit");

// Storing the data to extend later
await fdata.store({
  path: "local:human 1.0",
  data: $base.exportData()
});
```

So, we need to extend the saved human data and change the data to meet the rules previously declared

```js
// Extending human data
let $person = await fdata.extends({ from: "local:human 1.0" });

// Setting new data over human data
$person.put({
  // declaring the name of the new stage
  $set: { stage: "person" },
  name: "John Doe",
  age: 30
});

$person.commit();

$person.submit();

const data = await $person.getData();

console.log(JSON.stringify(data, null, 2));
```

## Output response

```json
{
  "_stages": {},
  "_certifieds": {
    "human": "04e7885bbe2a8c1781c0d04db0491583d67147b3e257a9bf0bcc31be0e9efee0",
    "person": "d063e73ae64c02a0ea05b14ba27256bddcc36170aa1f9683f6ec018824384471"
  },
  "type": "animal",
  "species": "human",
  "gender": "male",
  "name": "John Doe",
  "age": 30
}
```

## Extending entity data to third parties to use later

```js
const versioned_data = await $person.exportData();

console.log(versioned_data);
```

That will return on output:

```json
{
  "_doctype": "payload/data",
  "_certified": "878fce10eebd39a7a681ec573e1293e5e85063bcd348f1ed6cddefa6c5e9058d",
  "_engine": "1.0",
  "_extends": {
    "from": "local:human 1.0"
  },
  "_commits": [
    {
      "type": "PUT",
      "data": {
        "$set": {
          "stage": "person"
        },
        "name": "John Doe",
        "age": 30
      }
    },
    {
      "type": "SUBMIT",
      "data": {
        "_stages": {
          "__rm": ["person"]
        },
        "_certifieds": {
          "person": "d063e73ae64c02a0ea05b14ba27256bddcc36170aa1f9683f6ec018824384471"
        },
        "__rm": ["$set"]
      }
    }
  ]
}
```
