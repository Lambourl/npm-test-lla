"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const install_1 = require("./install");
install_1.checkInstall().then(() => {
    console.log("nxxm is install here : ", install_1.nxxmPath);
}, (err) => {
    console.log(`An error has occured while installing nxxm: ${err.message}`);
});
//# sourceMappingURL=software.js.map