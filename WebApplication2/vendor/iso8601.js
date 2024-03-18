/**
 * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
 * NON-CONFORMANT EDITION.
 * © 2011 Colin Snover <http://zetafleet.com>
 * Released under MIT license.
 */

// see https://bugs.ecmascript.org/show_bug.cgi?id=112 - ISO8601 handling is inconsistent / incorrect in some ES5 compliant browsers
import { ISO8601RegexString } from './iso8601regex';

(function (Date, undefined) {

    // this modified to not allow 
    Date.ISO8601RegexString = ISO8601RegexString;

    var origParse = Date.parse, numericKeys = [ 1, 4, 5, 6, 10, 11 ];
    var isoRexExp = new RegExp("^" + Date.ISO8601RegexString + "$");

    Date.parse = function (date) {
        var timestamp, struct, minutesOffset = 0;

        //              1 YYYY                 2 MM        3 DD              4 HH     5 mm        6 ss            7 msec         8 Z 9 ±    10 tzHH    11 tzmm
        if ((struct = isoRexExp.exec(date))) {
            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k; (k = numericKeys[i]); ++i) {
                struct[k] = +struct[k] || 0;
            }

            // allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            // allow arbitrary sub-second precision beyond milliseconds
            struct[7] = struct[7] ? + (struct[7] + '00').substr(0, 3) : 0;

            // timestamps without timezone identifiers should be considered local time
            if (struct[8] === undefined && struct[9] === undefined) {
                timestamp = +new Date(struct[1], struct[2], struct[3], struct[4], struct[5], struct[6], struct[7]);
            }
            else {
                if (struct[8] !== 'Z' && struct[9] !== undefined) {
                    minutesOffset = struct[10] * 60 + struct[11];

                    if (struct[9] === '+') {
                        minutesOffset = 0 - minutesOffset;
                    }
                }

                timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
            }
        }
        else {
            timestamp = origParse ? origParse(date) : NaN;
        }

        return timestamp;
    };
}(Date));