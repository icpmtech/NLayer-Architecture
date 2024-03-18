/**
 * Converted jquery parseJSON extension to work as a normal function. 
 * 
 * ### Original Description
 * jQuery . parseJSON extension (supports ISO & Asp.net date conversion)
 *
 * Version 1.0 (13 Jan 2011)
 *
 * Copyright (c) 2011 Robert Koritnik
 * Licensed under the terms of the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 * ### End of Original Description

 */

import { ISO8601RegexString } from '../vendor/iso8601regex';

declare global {
    interface Window { ScriptEngineMajorVersion?: (() => number) | undefined; }
}

// JSON RegExp
const rvalidchars = /^[\],:{}\s]*$/;
const rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
const rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
const rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

const dateISO = new RegExp("^" + ISO8601RegexString + "$", "i");

// replacer RegExp
const replaceISO = new RegExp("\"" + ISO8601RegexString + "\"", "gi");

const jsonDateConverter = function (key: string, value: any): any {
    if (typeof (value) === "string" && dateISO.test(value)) {
        return new Date(Date.parse(value)); // Let the iso8601.js date conversion library perform the conversion.
    }
    return value;
};

export function customJSONParse(value: string) {
    if (value == null || typeof value !== "string") {
        return null;
    }


    const trimmedData = value.trim();

    const escapedData = trimmedData
        .replace(rvalidescape, "@")
        .replace(rvalidtokens, "]")
        .replace(rvalidbraces, "");

    
    // Make sure the incoming data is actual JSON
    // Logic borrowed from http://json.org/json2.js
    if (rvalidchars.test(escapedData)) {
        return JSON.parse(trimmedData, jsonDateConverter);
    } else {
        throw new Error("Error parsing JSON: " + value);
    }
}