# Dpc2Flood

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## install
npm install -g @angular/cli
ng new mdbs --style=scss
cd mdbs
npm i --save angular-bootstrap-md chart.js@2.5.0 font-awesome hammerjs

## /angular-cli.json 
"styles": [
  "../node_modules/font-awesome/scss/font-awesome.scss",
  "../node_modules/angular-bootstrap-md/scss/bootstrap/bootstrap.scss",
  "../node_modules/angular-bootstrap-md/scss/mdb-free.scss",
  "styles.scss"
],
"scripts": [
  "../node_modules/chart.js/dist/Chart.js",
  "../node_modules/hammerjs/hammer.min.js"
],

## /tsconfig.json
{
  "compileOnSave": // removed for brevity,
  "compilerOptions": {
    // removed for brevity
  },
  "include": ["node_modules/angular-bootstrap-md/**/*.ts",  "src/**/*.ts"] // add this line
}
