'use strict'

var PluginError = require('plugin-error');
var cssom = require('cssom');
var Buffer = require('safe-buffer').Buffer;
var through = require('through2');


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

function addStyleProp(style, propName, propValue) {
    style[style.length] = propName;
    style.length++;
    style[propName] = propValue;
}

var viewportUnits = /\d(vw|vh|vmax|vmin)\b/;
var viewportPropName = 'content';
var viewportUnitPrefix = 'viewport-units-buggyfill';
var viewportUnitsBuggyfill = function (data, options, settings) {
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
                selectorText = rule.selectorText, propValue;
            if (styles && !hasContent(styles)) {
                for (var i = 0; i < styles.length; i++) {
                    name = styles[i];
                    value = styles[name];
                    if (viewportUnits.test(value)) {
                        hacks.push(name + ':' + value);
                    }
                }

                if (hacks.length > 0) {
                    hacks.unshift(viewportUnitPrefix);
                    propValue = '"' + hacks.join(';') + '"';
                    addStyleProp(styles, viewportPropName, propValue);
                }
            }
            cssTextArray.push(regeneratorCssText(selectorText, styles));
        });
        file.contents = new Buffer(cssTextArray.join('\n'));
        this.push(file);
        cb();
    })
};

module.exports = viewportUnitsBuggyfill;