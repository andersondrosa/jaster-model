// import FireData from "";
import { size, isObject } from "../../src/utils";
import { jaster } from "jaster";
import { merge } from "jaster-merge";
import sha1 from "./sha1";

import MatchDir from "./directives/MatchDirective";
import OnDirective from "./directives/OnDirective";
import filters from "./directives/FiltersDirective";
import MapperDirective from "./directives/MapperDirective";

const DIRECTIVES = {
  filters: filters,
  match: MatchDir,
  on: OnDirective,
  map: MapperDirective
};

const getDirectives = (data, path, directives) => {
  //
  let clean_data = !path
    ? {
        _stages: {},
        _certifieds: {}
      }
    : {};

  for (let i in data) {
    if (i.startsWith("@")) {
      let keys = i.substring(1).split(":");

      directives.push({
        key: keys[0],
        meta: keys[1] ? keys[1] : null,
        path: path,
        data: data[i]
      });

      continue;
    }

    if (isObject(data[i])) {
      clean_data[i] = getDirectives(
        data[i],
        path + (path ? "." : "") + i,
        directives
      );

      continue;
    }

    clean_data[i] = data[i];
  }

  return JSON.parse(JSON.stringify(clean_data));
};

const getIntegrity = data => {
  return sha1.hash(JSON.stringify(data, null, 2));
};

const getSettings = (data, key, def) => {
  //
  let settings = data.hasOwnProperty("$set") ? data["$set"] : {};

  if (key === undefined) {
    return settings;
  }

  if (!settings.hasOwnProperty(key)) {
    return def == undefined ? null : def;
  }

  return settings[key];
};

const getDirectivesDefaultStage = data => {
  //
  let directives = getSettings(data, "directives");

  if (directives && directives.hasOwnProperty("default-stage")) {
    return directives["default-stage"];
  }

  return "next";
};

const getStageContents = (data, stage, module) => {
  //
  if (!data._stages) {
    return;
  }

  const sponsors = data._stages[stage];

  if (!sponsors) {
    return [];
  }

  const response = [];

  for (const i in sponsors) {
    //
    const sponsor = sponsors[i];

    if (!sponsor.hasOwnProperty(module)) {
      continue;
    }

    for (const m in sponsor[module]) {
      //
      const row = sponsor[module][m];

      response.push({
        sponsor: i,
        dir: row.dir,
        data: row.data,
        path: row.path
      });
    }
  }

  return response;
};

const match = (data, stage) => {
  //
  if (Array.isArray(stage)) {
    stage.map(stage => match(data, stage));
    return true;
  }

  if (!data._stages) {
    return;
  }

  const sponsors = data._stages[stage];

  if (!sponsors) {
    return true;
  }

  for (var i in sponsors) {
    let sponsor = sponsors[i];

    if (!sponsor.match) {
      continue;
    }

    // -----------------------------------------------------------------------
    // FILTERS

    let filters = [];

    for (let i in sponsor.filters) {
      let _filters = sponsor.filters[i].data;

      for (let key in _filters) {
        if (filters.hasOwnProperty(key)) {
          continue;
        }
        filters[key] = _filters[key];
      }
    }

    // -----------------------------------------------------------------------
    // MATCH

    let $jaster = jaster({
      filters
    });

    for (let i in sponsor.match) {
      let rules = sponsor.match[i].data;
      let _data = data;

      if (sponsor.match[i].path) {
        _data = _data[sponsor.match[i].path];
      }

      let scope = {
        scope: data,
        filters: filters
      };

      // ---------------------------------------------------------------------

      let response;

      try {
        response = $jaster.validate(_data, rules);
      } catch (e) {
        throw e;
      }

      if (!response) {
        throw "Validation Fails: " + $jaster.errors();
      }
    }
  }

  return true;
};

// ===========================================================================
// ===========================================================================

const mapData = (data, stage) => {
  //
  let response = JSON.parse(JSON.stringify(data));

  // GET FILTERS -------------------------------------------------------------

  let _filters = {};

  let filters = getStageContents(data, stage, "filters");

  for (let i in filters) {
    let data = filters[i].data;

    for (let key in data) {
      if (!_filters.hasOwnProperty(key)) {
        _filters[key] = data[key];
      }
    }
  }

  // AUTO MAPPER -------------------------------------------------------------

  let mappers = getStageContents(data, stage, "map");

  let $jaster = jaster({
    filters: _filters
  });

  let schedules = [];

  let result;

  for (let i in mappers) {
    //
    result = $jaster.map(response, mappers[i].data);

    response = result.data;

    merge(response, result.output);
  }

  return response;
};

const map = data => {
  //
  let directives = [];

  let scope = data.hasOwnProperty("$set") ? data["$set"] : {};

  let clean_data = getDirectives(data, "", directives);

  directives = mapDirectives(data, directives);

  let stages = clean_data._stages
    ? JSON.parse(JSON.stringify(clean_data._stages))
    : {};

  let stage_stage = getSettings(data, "stage", "next");

  delete stages["next"];
  delete stages[stage_stage];

  directives = JSON.parse(JSON.stringify(directives));

  merge(stages, directives);

  let response = {
    // doctype: "resource/data",
    // _stage: scope.stage ? scope.stage : "next",
    // engine: "0.1"
  };

  if (stages) {
    response._stages = stages;
  }

  response._certifieds = clean_data._certifieds ? clean_data._certifieds : {};

  response._certifieds[stage_stage] = getIntegrity(data);

  // -------------------------------------------------------------------------

  let mapped_data = mapData(clean_data, stage_stage);

  // throw 'test';

  // -------------------------------------------------------------------------
  // adicionando os modulos à resposta

  for (let module in mapped_data) {
    if (module.startsWith("$") || module.startsWith("_")) {
      continue;
    }
    if (module.match(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/g)) {
      response[module] = mapped_data[module];
    }
  }

  return response;
};

const mapDirectives = (data, directives) => {
  /*
      CONVERSÂO de Diretivas para Actions
      Aqui é executado cara componente de diretiva para cada 
      uma devolver as actions que lhe cabem.
    */
  let current_stage = getSettings(data, "stage");

  if (current_stage == null) {
    let i;
    if (!data.hasOwnProperty("_certifieds")) {
      i = 1;
    } else {
      i = size(data._certifieds) + 1;
    }

    current_stage = "stage-" + i;
  }

  let modules = [];

  for (const i in directives) {
    const row = directives[i];

    if (!DIRECTIVES.hasOwnProperty(row.key)) {
      throw 'Undefined directive "' + row.key + '"';
    }

    let directive = DIRECTIVES[row.key];

    modules.push({
      directive: row.key,
      response: directive.make(row, this)
    });
  }

  let stages = {};

  /**
   * Conversão de Actions para o padrão do "_stages"
   * stage -> sponsor -> action [] -> {scope:"", value:{}}
   * stage: Estagio atual que é executado pelo submit
   * sponsor: estágio anterior, responável por ter adicionado as ações
   * action: função a ser executada na validação ou mapeamento, ex: Match, Filters, Map
   */

  for (let n in modules) {
    let directive = modules[n].directive;

    let response = modules[n].response;

    for (let i in response) {
      let row = response[i];

      let stage_stage = row.stage ? row.stage : getDirectivesDefaultStage(data);

      if (!stages.hasOwnProperty(stage_stage)) {
        stages[stage_stage] = {};
      }

      let stage = stages[stage_stage];

      if (!stage.hasOwnProperty(current_stage)) {
        stage[current_stage] = {};
      }

      let sponsor = stage[current_stage];

      if (!sponsor.hasOwnProperty(row.action)) {
        sponsor[row.action] = [];
      }

      let actions = sponsor[row.action];

      let data = {
        data: row.data
      };

      if (row.action != directive) {
        data.dir = directive;
      }

      if (row.path) {
        data.path = row.path;
      }

      actions.push(data);
    }
  }

  return stages;
};

export { getSettings, match, map };
