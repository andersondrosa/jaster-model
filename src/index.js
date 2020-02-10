import { get, isObject } from "./helpers.js";
import { merge, diff, sha256 } from "jaster";

export default class {
  //

  constructor(data, commits) {
    //
    this.data;
    this.baseData;
    this.commitData;

    this.state = {
      commits: []
    };

    this.prevData = [];
    this.nextData = [];

    this.undoCommits = [];

    if (isObject(data)) {
      this.setBaseData(data);
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
  setBaseData(data) {
    this.baseData = JSON.stringify(data);
    this.data = JSON.parse(this.baseData);
    // SE commitData for NULL, é para se usar o baseData
    this.commitData = null;
  }

  commitRequired() {
    return this.prevData.length > 0;
  }

  cleanHistoric(data) {
    this.prevData = [];
    this.nextData = [];
  }

  isPristine() {
    return !(this.state.commits.length > 0);
    // return JSON.stringify(this.data) == "{}" && this.prevData.length == 0;
  }

  put(data) {
    //
    if (this.data == null) {
      this.data = data;
      this.registerData();
      return this;
    }

    if (data instanceof Function) {
      data = data(this.data);
    }

    let info = merge(this.data, data);

    if (!info.unchanged) {
      this.prevData.push(info);
    }

    this.nextData = [];

    return this;
  }

  rollback(n = 1) {
    var l = this.prevData.length;

    for (let i = 0; i < n; i++) {
      const row = this.prevData.pop();

      if (row == undefined) {
        return;
      }

      const info = merge(this.data, row.rollback);

      this.nextData.push(info);
    }
  }

  rollforth(n = 1) {
    var l = this.nextData.length;

    for (let i = 0; i < n; i++) {
      const row = this.nextData.pop();

      if (row == undefined) {
        return;
      }

      const info = merge(this.data, row.rollback);

      this.prevData.push(info);
    }
  }

  get(path) {
    return get(path, this.data);
  }

  getPath(data, path) {
    //
    let paths = [];

    if (path) {
      for (const key in data) {
        if (data[key].constructor === Object) {
          paths = paths.concat(this.getPath(data[key], path + "." + key));
          continue;
        }

        paths.push(path + "." + key);
      }

      return paths;
    }

    for (const key in data) {
      if (data[key].constructor === Object) {
        paths = paths.concat(this.getPath(data[key], key));
        continue;
      }

      paths.push(key);
    }

    return paths;
  }

  // ===========================================================================
  // ===========================================================================

  validateIntegrity(fdata) {
    let certified;

    if (fdata.hasOwnProperty("_certified")) {
      certified = fdata._certified;
      fdata._certified = "<hidden>";
    }

    let str_data = JSON.stringify(fdata);

    let hash = sha256(str_data);

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

  getCommits() {
    return this.state.commits;
  }

  commit(message) {
    //
    let commitData = diff(this.getComparisonData(), this.data);

    this.addCommit("PUT", message, commitData);

    return this;
  }

  addCommit(type, message, data) {
    //
    const commit = { type, message, data };

    message == undefined && delete commit.message;

    this.state.commits.push(commit);

    this.cleanHistoric();

    this.registerData();
  }

  cleanCommits() {
    //
    this.state.commits = [];
  }

  async rollbackCommit(levels, cb) {
    //
    let state = this.state;
    let commits = [];

    levels = state.commits.length - levels;

    for (const i in state.commits) {
      if (i == levels) {
        state.commits = commits;
        return;
      }

      const commit = state.commits[i];

      commits.push(commit);
    }

    this.cleanHistoric();

    state.commits = commits;

    await this.restore();

    cb && cb();
  }

  registerData() {
    this.commitData = JSON.stringify(this.data);
  }

  getComparisonData() {
    if (!this._data) {
      this._data = JSON.parse(this.commitData);
    }
    return this._data;
  }

  getData(utils) {
    return JSON.parse(JSON.stringify(this.data));
  }

  async getExtensionData(ext) {
    //
    if (!this.$fdata.dependencyProvider) {
      throw "Dependency Provider must be defined";
    }

    let data = {};

    let fdata = await this.$fdata.loadResource(ext);

    if (fdata._extends) {
      data = await this.getExtensionData(fdata._extends);
    }

    if (fdata._commits) {
      for (let i in fdata._commits) {
        merge(data, fdata._commits[i].data);
      }
    }

    return data;
  }

  async restore() {
    //
    const state = this.state;

    this.data = JSON.parse(this.baseData);

    for (const i in state.commits) {
      //
      const commit = state.commits[i];

      this.undoCommits.push(merge(this.data, commit.data));
    }

    this.registerData();
  }

  commitRequired() {
    //
    let request = { response: false };

    this.emmit("commit-required", [request]);

    return request.response == true;
  }

  setCommits(commits, restore) {
    this.state.commits = commits;
    restore == true && this.restore();
  }
}
