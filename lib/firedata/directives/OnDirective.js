'use strict';

module.exports = {

    make(row) {

        let response = []

        for (let i in row.data) {

            let dir = row.data[i];

            response.push({
                action: i,
                stage: row.meta,
                path: row.path,
                data: dir
            });
        }


        return response;

        throw 'No one directives found';
    }
}

