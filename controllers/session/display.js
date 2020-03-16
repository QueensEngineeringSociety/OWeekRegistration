const util = require("../controllerUtil");

exports.login = async function (user) {
    if (user) {
        return await execute(false, util.routes.FILTER);
    } else {
        return await execute(true, util.views.LOGIN);
    }
};

async function execute(isView, target) {
    return await util.execute("Could not display login page", isView, target, async () => {
        return {data: {message: ""}};
    });
}