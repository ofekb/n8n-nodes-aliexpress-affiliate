const gulp = require('gulp');
const fs = require('fs');
const path = require('path');

// Define the path for the icons
const ICONS_SRC = 'nodes/AliExpressAffiliate/*.svg';
const ICONS_DEST = 'dist/icons';

// Task to copy the SVG files
gulp.task('build:icons', (done) => {
    if (!fs.existsSync(ICONS_DEST)) {
        fs.mkdirSync(ICONS_DEST, { recursive: true });
    }

    gulp.src(ICONS_SRC)
        .pipe(gulp.dest(ICONS_DEST));

    done();
});

gulp.task('default', gulp.series('build:icons'));