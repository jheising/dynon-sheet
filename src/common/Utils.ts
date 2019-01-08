import "cross-fetch/polyfill";
import {has, isNil} from "lodash";
import * as safeEval from "notevil";
import * as isEqual from "react-fast-compare";
import * as slug from "slug";
import * as stableJSONStringify from "fast-json-stable-stringify";

export interface HTTPRequest {
    url: string;
    method?: string;

    queryParams?: {[paramName:string]:string};
    headers?: {[headerName:string]:string};
    body?: any;
    form?: {[formParamName:string]:string};
}

export interface HTTPResponse {
    url?: string;
    statusCode?: number;
    headers?: { [headerName: string]: any };
    queryParams?: { [paramName: string]: any };
    body?: any;
}

export class Utils {

    static isEqual = isEqual;

    static stableJSONStringify(jsonObject:any):string
    {
        return stableJSONStringify(jsonObject);
    }

    static removeComments(theString:string):string
    {
        return theString.replace(/([^:]|^)\/\/.*?($|[\r\n])/g, "");
    }

    static slugify(theString:string):string
    {
        return slug(theString, {
            lower: true,
            replacement: "_"
        });
    }

    static isScript(scriptString:string):boolean
    {
        try
        {
            // Remove any signal references so it can compile to proper code
            let testScript = scriptString.replace(/{{(.+?)}}/g, "test");

            if(testScript === "test")
            {
                return false;
            }

            testScript = `var test = '';\n${testScript}`;

            // Test the script and see if it works
            Utils.executeScript(
                testScript
            );

            return true;
        }
        catch (e) {
            return false;
        }
    }

    static _isImageCache = {};
    static isImage(urlString:string):Promise<boolean> {

        if (has(Utils._isImageCache, urlString))
        {
            return Promise.resolve(Utils._isImageCache[urlString]);
        }

        return new Promise<boolean>((resolve, reject) => {
            let img = new Image();
            img.onload = function() {
                Utils._isImageCache[urlString] = true;
                resolve(true);
            };
            img.onerror = function() {
                Utils._isImageCache[urlString] = false;
                resolve(false);
            };
            img.src = urlString;
        });
    }

    static isURL(urlString:string):boolean
    {
        try {
            let url = new URL(urlString);
            return !(isNil(url.host) || url.host.length === 0);
        }
        catch (e) {
            return false;
        }
    }

    static executeScript(scriptString:string):any
    {
        return safeEval(scriptString);
    }

    static fetch(request:HTTPRequest): Promise<any> {
        return new Promise<HTTPResponse>((resolve, reject) => {

            let timedOut = false;
            let timeout = setTimeout(() => {
                timedOut = true;
                reject(new Error("Request timed out"));
            }, 15000);

            let signalResponse: HTTPResponse = {};

            fetch(`https://apiproxy.signalpattern.com/fetch/${request.url}`, {
                method: request.method,
                headers: new Headers(request.headers),
                body: request.body
            }).then((response) => {

                if (timedOut) return;
                clearTimeout(timeout);

                signalResponse.url = response.url.replace("https://apiproxy.signalpattern.com/fetch/", "");
                signalResponse.headers = {};

                for (let headerName of response.headers.keys()) {
                    signalResponse.headers[headerName] = response.headers.get(headerName);
                }

                signalResponse.statusCode = response.status;

                return response.text();

            }).then(bodyString => {

                signalResponse.body = bodyString;

                try
                {
                    // Can we convert this to an object?
                    signalResponse.body = JSON.parse(signalResponse.body);
                }
                catch (e) {

                }

                resolve(signalResponse);

            }).catch((error) => {

                if (timedOut) return;
                clearTimeout(timeout);

                reject(error);
            });
        });
    }

    static displayLoadingIndicator(visible:boolean)
    {
        let spinnerElement = document.getElementById("loading-indicator");

        if(visible)
        {
            if(!spinnerElement)
            {
                spinnerElement = document.createElement("DIV");
                spinnerElement.id = "loading-indicator";
                spinnerElement.className = "spinner";
                spinnerElement.innerHTML = `<div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div>`;
                document.body.appendChild(spinnerElement);
            }
        }
        else
        {
            if(spinnerElement)
            {
                spinnerElement.parentElement.removeChild(spinnerElement);
            }
        }
    }
}