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

