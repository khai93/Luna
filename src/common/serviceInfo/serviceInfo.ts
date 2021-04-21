import glob from 'glob';
import fs from 'fs/promises';
import { Name } from '../name';
class ServiceInfoNotValid extends Error {
    constructor(message : string) {
        super(message);

        this.name = this.constructor.name;
        this.stack = new Error().stack;
    }
}

export type ServiceInfoValue = {
    name: Name,
    description: string,
    version: string,
    https: boolean,
    host: URL,
    port: number,
    online: boolean
}

export class ServiceInfo {
    private _value: ServiceInfoValue;

    constructor(info: string | ServiceInfoValue) {
        if (typeof(info) === 'string') {
            this._value = JSON.parse(info);
        } else {
            this._value = info;
        }

        if (!this.isValid) {
            throw new ServiceInfoNotValid("Invalid Service");
        }
    }

    isValid = (): boolean => Object.values(this._value).every(val => typeof(val) === "string" ? val && val.length > 0 : true);

    /**
     * Compares a ServiceInfoValue to the current value to see if they are the same
     * @param comparedServiceInfo the service info to compare to
     * @returns boolean
     */
    sameAs(comparedServiceInfo: ServiceInfo): boolean {
        // Comparing names because names should be unique between services
        return comparedServiceInfo.value.name === this._value.name;
    }


    /**
     * Finds all the generated info files
     * @returns array of filenames
     */
    static getServiceInfoFilesPaths(): Promise<string[]> {
        return new Promise((resolve,reject) => {
            glob("**/service-info.generated.json", function (err, files) {
                if (err) {
                    return reject(err);
                }
                
                return resolve(files);
            });
        });
    }

    static getServiceInfoFromFile(path: string): Promise<ServiceInfo> {
        return new Promise(async (resolve, reject) => {
            fs.readFile(path, "utf8")
                .then((data) => {
                    return resolve(new ServiceInfo(data));
                })
                .catch(err => reject(err));
        })
    }

    static getServiceInfoFiles(): Promise<ServiceInfo[]> {
        return new Promise(async (resolve, reject) => {
            const files = await this.getServiceInfoFilesPaths();
            let serviceInfos = [];
    
            for (let file of files) {
                const serviceInfo = await this.getServiceInfoFromFile(file);
                serviceInfos.push(serviceInfo);
            }
    
            return resolve(serviceInfos);
        });
    }

    get value(): ServiceInfoValue {
        return this._value;
    }
}