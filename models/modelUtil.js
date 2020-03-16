exports.modelFromDb = function (rows, creatorFunction) {
    let res = [];
    for (let r of rows) {
        res.push(creatorFunction(r));
    }
    if (res.length === 1) {
        return res[0];
    } else {
        return res;
    }
};

exports.getObjFields = function (obj, excludedFields) {
    if (excludedFields && !Array.isArray(excludedFields)) {
        excludedFields = [excludedFields];
    }
    let fields = [];
    for (let prop in obj) {
        if (!excludedFields || !excludedFields.includes(prop)) {
            fields.push(prop);
        }
    }
    return fields;
};

exports.getObjValues = function (obj, excludedFields) {
    if (excludedFields && !Array.isArray(excludedFields)) {
        excludedFields = [excludedFields];
    }
    let values = [];
    for (let prop in obj) {
        if (!excludedFields || !excludedFields.includes(prop)) {
            if (typeof obj[prop] === "object") {
                values.push(JSON.stringify(obj[prop]));
            } else {
                values.push(obj[prop]);
            }
        }
    }
    return values;
};