import { get, isObject, order, clone, nested, emptyObject } from "./utils.js";
import { merge, diff, sha256 } from "jaster";

function setStartData($this, data) {
  $this.startData = $this.commitData = JSON.stringify(order(data));
  $this.data = JSON.parse($this.startData);
}

function setCommitData($this) {
  $this.commitData = isObject($this.data)
    ? JSON.stringify(order($this.data))
    : "{}";
  $this.dirty = false;
}

export default class {
  //
  constructor(data, commits) {
    //
    this.data = {};
    this.startData = "{}";
    this.commitData = "{}";
    this.undoCommits = [];
    this.commits = [];
    this.dirty = false;

    this.prevData = [];
    this.nextData = [];

    if (data && isObject(data)) {
      setStartData(this, data);
    }

    if (Array.isArray(commits)) {
      this.setCommits(commits, true);
    }
  }

  /**
   * Setando os dados iniciais que serão usados de base caso precise restaurar
   * ou desfazer algum comit, por é necessário usar a base e re mesclar todos
   * os comits sobre a base
   */

  // ===========================================================================

  // GETTERS

  hasCommits() {
    return this.commits.length > 0;
  }

  get(key) {
    return get(key, this.data);
  }

  getCommits() {
    return this.commits.map(row => clone(row));
  }

  getCommitData() {
    if (!this.commitData) {
      return {};
    }
    return JSON.parse(this.commitData);
  }

  discardChanges() {
    //
    this.data = this.getCommitData();

    this.cleanHistoric();
  }

  getData() {
    if (this.data) {
      return order(this.data);
    }
    return {};
  }

  exportData() {
    return {
      data: JSON.parse(this.startData),
      commits: this.getCommits()
    };
  }

  getIntegrity() {
    return sha256(this.commitData);
  }

  getUncommitedData() {
    //
    if (this.dirty == false) {
      return {};
    }

    return order(diff(this.getCommitData(), this.data));
  }

  commitRequired() {
    //
    if (this.dirty == false) {
      return false;
    }

    if (this.commitData == JSON.stringify(this.getData())) {
      this.dirty = false;
    }

    return this.dirty;
  }

  // ===========================================================================
  // ===========================================================================

  // ACTIONS

  setCommits(commits) {
    this.commits = clone(commits);
    this.restore();
  }

  cleanHistoric() {
    this.prevData = [];
    this.nextData = [];
  }

  put(data) {
    //
    if (data instanceof Function) {
      data = data(this.data);
    }

    const info = merge(this.data, data);

    if (!info.unchanged) {
      this.prevData.push(info);
    }

    this.nextData = [];

    this.dirty = true;

    return this;
  }

  rollback(n = 1) {
    //
    for (let i = 0; i < n; i++) {
      const row = this.prevData.pop();

      if (row == undefined) {
        return false;
      }

      this.nextData.push(merge(this.data, row.rollback));

      this.dirty = true;
    }

    return !!this.dirty;
  }

  rollforth(n = 1) {
    //
    for (let i = 0; i < n; i++) {
      const row = this.nextData.pop();

      if (row == undefined) {
        return false;
      }

      this.prevData.push(merge(this.data, row.rollback));

      this.dirty = true;
    }

    return !!this.dirty;
  }

  // ===========================================================================
  // ===========================================================================

  validateIntegrity(fdata) {
    //
    let certified;

    if (fdata.hasOwnProperty("_certified")) {
      certified = fdata._certified;
      fdata._certified = "<hidden>";
    }

    const str_data = JSON.stringify(fdata);

    const hash = sha256(str_data);

    if (certified) {
      fdata._certified = certified;

      if ((certified === hash) == false) {
        throw "Invalid certified " +
          certified +
          ". Valid certified must match " +
          hash;
      }
    }
  }

  commit(message, type = "put") {
    //
    if (this.dirty == false) {
      return false;
    }

    const data = this.getUncommitedData();

    if (emptyObject(data)) {
      this.dirty = false;
      return false;
    }

    const commit = { type, message, data };

    if (!message) {
      delete commit.message;
    }

    this.commits.push(commit);

    const rollback = diff(this.data, this.getCommitData());

    this.undoCommits.push(rollback);

    setCommitData(this);

    return true;
  }

  cleanCommits() {
    //
    this.commits = [];

    this.restore();
  }

  rollbackCommit(levels = 1) {
    //
    this.data = this.getCommitData();

    for (let i = 0; i < levels; i++) {
      this.commits.pop();
      const undo = this.undoCommits.pop();
      merge(this.data, undo);
    }

    setCommitData(this);
  }

  // rollbackCommit(levels) {
  //   //
  //   const commits = [];

  //   levels = this.commits.length - levels;

  //   for (const i in this.commits) {
  //     if (i == levels) {
  //       this.commits = commits;
  //       break;
  //     }

  //     const commit = this.commits[i];

  //     commits.push(commit);
  //   }

  //   this.cleanHistoric();

  //   this.commits = commits;

  //   this.restore();
  // }

  restore() {
    //
    this.data = JSON.parse(this.startData);

    this.undoCommits = this.commits.map(({ data }) => {
      const { rollback } = merge(this.data, data);
      return rollback;
    });

    setCommitData(this);
  }

  // ===========================================================================
  // ===========================================================================
  // ===========================================================================

  // ALIAS

  putn(o) {
    return this.put(nested(o, true));
  }
}
