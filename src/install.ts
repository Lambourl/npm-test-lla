import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as extract from 'extract-zip';
import * as crypto from 'crypto';
import fetch from 'node-fetch';


export const nxxmPath = path.join(getExtensionPath(), 'bin', 'nxxm');
const downloadPath = path.join(os.tmpdir(), 'nxxm.zip');
const nxxmReleaseUrl='https://api.github.com/repos/nxxm/nxxm/releases/latest';

function install(): Promise<any> {
    return new Promise((resolve, reject) => {
        getNxxmLatestUrl((nxxmUrl: any) => {
            downloadFile(nxxmUrl[os.platform()], downloadPath).then(() => {
                extract(downloadPath, { dir: getExtensionPath() }).then(() => {
                    resolve(null);
                }, (err) => { reject(err); });
            }, (err) => { reject(err); });
        })
    });
}

export function checkInstall(): Thenable<any> {
    if (!nxxmExists(nxxmPath)) {
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
async function downloadFile(nxxm: any, dest: string) {
    const res = await fetch(nxxm.url);
    const fileStream = fs.createWriteStream(dest);
    await new Promise((resolve, reject) => {
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
};

function checksum(str: any, algorithm?: string, encoding?: any) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

function nxxmExists(nxxmPath: string): boolean {
    let path = nxxmPath;
    if (os.platform() === 'win32') {
        path += '.exe';
    }
    return fs.existsSync(path);
}

function getExtensionPath(): string {
    var pjson = require('../package.json');
    return path.join(os.homedir(),'nxxm_npm');
}

async function getNxxmLatestUrl(callback: any) {
    const platform = os.platform().replace('win32', 'windows').replace('darwin', 'macos');
    fetch(nxxmReleaseUrl).then(res => res.json(), () => { callback(null) }).then(data => {
        const release = data.assets.find((x: any) => x.name.toLowerCase().includes(platform));
        let nxxmUrl: any = {};
        nxxmUrl[os.platform()] = {
            url: release.browser_download_url,
            sha1: extractSha1FromReleaseNote(data.body, release.name)
        }
        callback(nxxmUrl);
    })
}

function extractSha1FromReleaseNote(releaseNote: string, releaseName: string) {
    const sha1StringIndex = releaseNote.indexOf(releaseName + ':');
    return releaseNote.substring(sha1StringIndex + releaseName.length + 1, sha1StringIndex + releaseName.length + 1 + 40)
}