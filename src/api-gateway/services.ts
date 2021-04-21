import glob from 'glob';
import fs from 'fs/promises';
import { ServiceInfo, ServiceInfoValue } from '../common/serviceInfo';


/**
 * Finds all the generated info files
 * @returns array of filenames
 */
export function getServiceInfoFilesPaths(): Promise<string[]> {
    return new Promise((resolve,reject) => {
        glob("**/service-info.generated.json", function (err, files) {
            if (err) {
                return reject(err);
            }
            
            return resolve(files);
        });
    });
    
}

export function getServiceInfoFromFile(path: string): Promise<ServiceInfo> {
    return new Promise(async (resolve, reject) => {
        fs.readFile(path, "utf8")
            .then((data) => {
                return resolve(new ServiceInfo(data));
            })
            .catch(err => reject(err));
    })
}

export function getServiceInfoFiles(): Promise<ServiceInfo[]> {
    return new Promise(async (resolve, reject) => {
        const files = await getServiceInfoFilesPaths();
        let serviceInfos = [];

        for (let file of files) {
            const serviceInfo = await getServiceInfoFromFile(file);
            serviceInfos.push(serviceInfo);
        }

        return resolve(serviceInfos);
    });
}