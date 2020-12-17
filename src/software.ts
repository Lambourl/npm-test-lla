import { nxxmPath, checkInstall } from './install';
import * as path from 'path';
import * as fs from 'fs';



checkInstall().then(() => { 
   console.log("nxxm is install here : ", nxxmPath)
}, (err) => {
    console.log(`An error has occured while installing nxxm: ${err.message}`);
});