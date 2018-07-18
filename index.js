'use strict'

var PluginError = require('plugin-error');
var cssom = require('cssom');
var Buffer = require('safe-buffer').Buffer;
var through = require('through2');


var defaultViewportUnits = ['vw', 'vh', 'vmax', 'vmin'];
var viewportPropName = 'content';
var viewportUnitPrefix = 'viewport-units-buggyfill';


function generatorStyleDeclarations(props) {
    var prop, index = 0, styleDeclarations = {}, length = 0;
    for (prop in props) {
        styleDeclarations[index] = prop;
        styleDeclarations[prop] = props[prop];
        index++;
        length++;
    }
    styleDeclarations.length = length;
    return styleDeclarations;
}


function regeneratorCssText(styleName, styleDeclarations) {
    var cssText = styleName + ' {\n', length = styleDeclarations.length;
    for (var i = 0; i < length; i++) {
        cssText += '    ' + styleDeclarations[i] + ": " + styleDeclarations[styleDeclarations[i]] + ';';
        if (i < length - 1) {
            cssText += '\n';
        }
    }
    cssText += '\n}';
    return cssText;
}

function hasContent(styles) {
    return styles['content'];
}

function isEmpty(array) {
    return !array || array.length === 0;
}

function addStyleProp(style, propName, propValue) {
    style.length = style.length || 0;
    style[style.length] = propName;
    style.length++;
    style[propName] = propValue;
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function getRepxViewportUnit(supportViewports) {
    supportViewports = defaultViewportUnits.filter(function (unit) {
        return supportViewports.some(function (t) {
            return t === unit;
        })
    });
    return new RegExp("\\d(" + supportViewports.join("|") + ")\\b");
}

function extend(source, target) {
    var obj = {}, name;
    for (name in source) {
        if (target[name]) {
            obj[name] = target[name];
        } else {
            obj[name] = source[name];
        }
    }
    return obj;
}

function filterBlackList(selectorText, blackList) {
    var selectorArray, hacksSelectorArray = [], allHack;
    selectorArray = selectorText.split(',');
    selectorArray.forEach(function (selector) {
        var singerSelector = selector;
        var singerSelectorArray = selector.split(' ');
        //select last selector such as (.a .b),only select .b
        if (singerSelectorArray.length > 1) {
            singerSelector = singerSelectorArray[singerSelectorArray.length - 1];
        }
        var isHack = blackList.every(function (black) {
            return singerSelector !== black;
        });
        if (isHack) {
            hacksSelectorArray.push(selector);
        }
    });

    function isAllHack() {
        return hacksSelectorArray.length === selectorArray.length;
    }
    allHack = isAllHack();
    return {
        hacksSelectorArray: hacksSelectorArray,
        allHack: allHack
    }
}


var viewportUnitsBuggyfill = function (options) {

    var defaultOptions = {
        onlyCalc: false,
        viewportUnits: defaultViewportUnits,
        selectorBlackList: []
    }, opts = options || {}, repxViewportUnits;
    opts = extend(defaultOptions, opts);
    repxViewportUnits = getRepxViewportUnit(opts.viewportUnits);
    return through.obj(function (file, enc, cb) {
        var stylesheet;
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-viewport-units', 'Streaming not supported'));
        }

        try {
            var fileContent = file.contents.toString();
            stylesheet = cssom.parse(fileContent);
        } catch (err) {
            this.emit('error', new PluginError('gulp-viewport-units', err.toString()));
        }

        var cssTextArray = [];
        stylesheet.cssRules.forEach(function (rule) {
            var value,
                name, hacks = [],
                styles = rule.style,
                selectorText = rule.selectorText,
                propValue,
                hacksSelectorArray,
                allHack = true;
            if (styles && !hasContent(styles)) {
                if (!isEmpty(opts.selectorBlackList)) {
                    var o = filterBlackList(selectorText, opts.selectorBlackList);
                    hacksSelectorArray = o.hacksSelectorArray;
                    allHack = o.allHack;
                }
                for (var i = 0; i < styles.length; i++) {
                    name = styles[i];
                    value = styles[name];

                    if (opts.onlyCalc && value.indexOf('calc') === -1) {
                        continue;
                    }
                    if (repxViewportUnits.test(value)) {
                        hacks.push(name + ':' + value);
                    }
                }

                if (hacks.length > 0) {
                    hacks.unshift(viewportUnitPrefix);
                    propValue = '"' + hacks.join(';') + '"';
                    if (!allHack) {
                        if (hacksSelectorArray.length > 0) {
                            //Save does not need to be hack styles
                            cssTextArray.push(regeneratorCssText(selectorText, styles));
                            //change style to whitelist style
                            selectorText = hacksSelectorArray.join(',');
                            styles = {};
                            addStyleProp(styles, viewportPropName, propValue);
                        }
                    } else {
                        addStyleProp(styles, viewportPropName, propValue);
                    }
                }
                cssTextArray.push(regeneratorCssText(selectorText, styles));
            }
        });
        file.contents = new Buffer(cssTextArray.join('\n'));
        this.push(file);
        cb();
    })
};

module.exports = viewportUnitsBuggyfill;