import { getSettings, match, map } from "./firedata";
import { diff } from "jaster-merge";

function submit(message) {
  //
  this.commitRequired() && this.commit("Auto commit");

  const data = this.getData();

  match(data, ["ever", getSettings(data, "stage", "next")]);

  this.put(state => diff(state, map(data)));

  this.commit(message, "submit");

  return true;
}

export default {
  install: $model => {
    if ($model.meta("using-firedata")) {
      return;
    }
    $model.meta("using-firedata", true);
    $model.mapActions({
      submit
    });
  }
};
