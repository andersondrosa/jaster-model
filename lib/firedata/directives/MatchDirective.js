'use strict';

let Match = {

    make(row, manager) {

        let response = []

        response.push({
            action: row.key,
            stage: row.meta ? row.meta : manager.getDirectivesDefaultStage(),
            path: row.path,
            data: row.data
        });

        return response;
    }
}

module.exports = Match;

