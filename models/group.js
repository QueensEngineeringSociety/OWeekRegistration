const util = require("./modelUtil");

class Group {
    constructor(groupNumber, menCount, womenCount, totalCount) {
        this.groupNumber = groupNumber;
        this.menCount = menCount;
        this.womenCount = womenCount;
        this.totalCount = totalCount;
    }

    static fromDb(rows) {
        return util.modelFromDb(rows, function (row) {
            return new Group(row.groupNumber, row.menCount, row.womenCount, row.totalCount);
        });
    }

    static keyField() {
        return "groupNumber";
    }

    fields() {
        return util.getObjFields(this);
    }

    updateFields() {
        return util.getObjFields(this, Group.keyField());
    }

    keyValue() {
        return this.groupNumber;
    }

    values() {
        return util.getObjValues(this);
    }

    updateValues() {
        return util.getObjValues(this, Group.keyField());
    }
}

module.exports = Group;