const util = require("./modelUtil");

class GroupMetaData {
    constructor(manGroupNum, womanGroupNum, maxNumOfGroups, ID) {
        this.manGroupNum = manGroupNum;
        this.womanGroupNum = womanGroupNum;
        this.maxNumOfGroups = maxNumOfGroups;
        this.ID = ID;
    }

    static fromDb(rows) {
        return util.modelFromDb(rows, function (row) {
            return new GroupMetaData(row.manGroupNum, row.womanGroupNum, row.maxNumOfGroups, row.ID);
        });
    }

    static keyField() {
        return "ID";
    }

    fields() {
        return util.getObjFields(this);
    }

    updateFields() {
        return util.getObjFields(this, GroupMetaData.keyField());
    }

    static zeroFields() {
        return ["manGroupNum", "womanGroupNum"];
    }

    keyValue() {
        return this.ID;
    }

    values() {
        return util.getObjValues(this);
    }

    updateValues() {
        return util.getObjValues(this, GroupMetaData.keyField());
    }
}

module.exports = GroupMetaData;