/**
 * This file is the entry point to the application and simply runs the App.
 */
const app = require('./src/app.js')();
console.log('app');
console.dir(app);
app.run();
