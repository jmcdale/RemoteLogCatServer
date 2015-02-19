var util = require('util');

var LOGCAT_LINE_REGEX = new RegExp("^([A-Z])/([^\\(]+)\\(([^\\)]+)\\): (.*)$", "m");

function LogCatLine(originalLine) {
    if (util.isString(originalLine)) {
        var matches = originalLine.match(LOGCAT_LINE_REGEX);
        this.logLevel = matches[1];
        this.tag = matches[2];
        this.pid = matches[3].trim();
        this.log = matches[4]
    }
}

LogCatLine.prototype.setPidName = function (name) {
    this.pidName = name;
};

// export the class
module.exports = LogCatLine;