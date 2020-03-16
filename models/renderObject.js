const wufooCon = require("../controllers/wufoo/wufooConstants");

class RenderObject {
    constructor(groupNumbers) {
        this.display = {
            operators: wufooCon.operators,
            headings: wufooCon.headings,
            allFields: wufooCon.allFields,
            generalFields: wufooCon.generalFields,
            groupNumbers: groupNumbers
        };
    }

    setTarget(target, isView) {
        this.isView = isView;
        this.target = target;
    }

    setNav(nextPage, prevPage, actionPath) {
        this.nav = {
            nextPage: nextPage,
            prevPage: prevPage,
            actionPath: actionPath
        };
    }

    setInfo(info) {
        this.info = info;
    }
}

module.exports = RenderObject;