"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInstall = exports.nxxmPath = void 0;
const fs = require("fs");
const os = require("os");
const path = require("path");
const extract = require("extract-zip");
const crypto = require("crypto");
const node_fetch_1 = require("node-fetch");
exports.nxxmPath = path.join(getExtensionPath(), 'bin', 'nxxm');
const downloadPath = path.join(os.tmpdir(), 'nxxm.zip');
const nxxmReleaseUrl = 'https://api.github.com/repos/nxxm/nxxm/releases/latest';
function install() {
    return new Promise((resolve, reject) => {
        getNxxmLatestUrl((nxxmUrl) => {
            downloadFile(nxxmUrl[os.platform()], downloadPath).then(() => {
                extract(downloadPath, { dir: getExtensionPath() }).then(() => {
                    resolve(null);
                }, (err) => { reject(err); });
            }, (err) => { reject(err); });
        });
    });
}
function checkInstall() {
    if (!nxxmExists(exports.nxxmPath)) {
        return install().then(() => {
            console.log(`Nxxm is in the process of being installed.`);
        }, (err) => {
            console.log(`An error has occured while installing nxxm: ${err.message}`);
        });
    }
    else {
        return Promise.resolve();
    }
}
exports.checkInstall = checkInstall;
function downloadFile(nxxm, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield node_fetch_1.default(nxxm.url);
        const fileStream = fs.createWriteStream(dest);
        yield new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", reject);
            fileStream.on("finish", () => {
                fs.readFile(dest, function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    checksum(data, 'sha1').toUpperCase() === nxxm.sha1.toUpperCase() ?
                        resolve(null) :
                        reject({ message: 'Bad checksum' });
                });
            });
        });
    });
}
;
function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}
function nxxmExists(nxxmPath) {
    let path = nxxmPath;
    if (os.platform() === 'win32') {
        path += '.exe';
    }
    return fs.existsSync(path);
}
function getExtensionPath() {
    var pjson = require('../package.json');
    return path.join(os.homedir(), 'nxxm_npm');
}
function getNxxmLatestUrl(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const platform = os.platform().replace('win32', 'windows').replace('darwin', 'macos');
        node_fetch_1.default(nxxmReleaseUrl).then(res => res.json(), () => { callback(null); }).then(data => {
            const release = data.assets.find((x) => x.name.toLowerCase().includes(platform));
            let nxxmUrl = {};
            nxxmUrl[os.platform()] = {
                url: release.browser_download_url,
                sha1: extractSha1FromReleaseNote(data.body, release.name)
            };
            callback(nxxmUrl);
        });
    });
}
function extractSha1FromReleaseNote(releaseNote, releaseName) {
    const sha1StringIndex = releaseNote.indexOf(releaseName + ':');
    return releaseNote.substring(sha1StringIndex + releaseName.length + 1, sha1StringIndex + releaseName.length + 1 + 40);
}
//# sourceMappingURL=install.js.map