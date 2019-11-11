const fs = require('fs-extra');
const concat = require('concat');    

(async function build() {

    const files =[
        './dist/ngElementComments/main-es5.js',
        './dist/ngElementComments/runtime-es5.js'
    ]
    
    // await fs.ensureDir('../firebase/public')
    await fs.ensureDir('public');
    
    await concat(files, 'public/ng-element-comments.js')
    console.info('Elements created successfully!');

})()