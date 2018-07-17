# gulp-viewport-units
A gulp plugin, Automatically append content property for viewport-units-buggyfill.See [viewport-units-buggyfill](https://github.com/rodneyrehm/viewport-units-buggyfill)

# Install

```
npm install gulp-viewport-units --save-dev
```

# Basic Usage

```javascript
'use strict';

const gulp = require('gulp');
const viewportUnits = require('gulp-viewport-units')

gulp.task('css', function () {
    gulp.src('./css/**/*.css')
        .pipe(viewportUnits())
        .pipe(gulp.dest('./css/dist'));
});
```
if only progress calc
```javascript
  gulp.task('css', function () {
      gulp.src('./css/**/*.css')
          .pipe(viewportUnits({onlyCalc:true}))
          .pipe(gulp.dest('./css/dist'));
  });
```
You can choose to deal with the specified viewport units
```javascript
  gulp.task('css', function () {
      gulp.src('./css/**/*.css')
          .pipe(viewportUnits({viewportUnits:['vw']}))
          .pipe(gulp.dest('./css/dist'));
  });
```

You can filter out selectors that do not need to be processed,like blacklist.
```javascript
  gulp.task('css', function () {
      gulp.src('./css/**/*.css')
          .pipe(viewportUnits({selectorBlackList:['.blacklist-1','html']}))
          .pipe(gulp.dest('./css/dist'));
  });
```

before transform:
```css
  .demo {
      width: 20vw;
      height: 20vw;
  }
```
after transform:
```css
  .demo {
      width: 20vw;
      height: 20vw;
      content: "viewport-units-buggyfill;width:20vw;height:20vw";
  }
```

## options
```javascript
 var defalutOptions = {
    onlyCalc: false,                             //if true,only progress calc()
    viewportUnits: ['vw', 'vh', 'vmax', 'vmin'], //viewport units array what viewport units can be progress
    selectorBlackList: []                        //not be progress selector array
 }
```

