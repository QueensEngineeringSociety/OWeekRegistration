const util = require("./modelUtil");

class GroupData {
    constructor(wufooEntryId, groupNum) {
        this.wufooEntryId = wufooEntryId;
        this.groupNum = groupNum;
    }

    static fromDb(rows) {
        return util.modelFromDb(rows, function (row) {
            return new GroupData(row.wufooEntryId, row.groupNum);
        });
    }

    static keyField() {
        return "wufooEntryId";
    }

    fields() {
        return util.getObjFields(this);
    }

    updateFields() {
        return util.getObjFields(this, GroupData.keyField());
    }

    keyValue(){
        return this.wufooEntryId;
    }

    values() {
        return util.getObjValues(this);
    }

    updateValues() {
        return util.getObjValues(this, GroupData.keyField());
    }
}

module.exports = GroupData;