# Typescript Base Project

This project deals with the _minimal_ setup required for Typescript.  The output should compile for general use anywhere, including in a Lambda environment.

The primary issue with Javascript and Typescript is the management of paths.  To avoid annoying pathing constucts like "../../../blah" or "./src/blah", you must be intentional in how you set up your project.

There are 3 major points of path consideration:

1. **IDE Linting** - Allowing VSCode to find relative paths
2. **Dev/Testing** - Allowing your development framework to find relative paths
3. **Building** - Allowing your compiler and final output to find find relative paths

This tutorial will build a basic Typescript application with the minimal required configuration to enable all 3 pathing considerations.

## Typescript Libraries

You need the following packages to _effectively_ use Typescript:

* **typescript** - The core library
* **ts-node** - Wrapper for Node to run TS files
* **tsconfig-paths** - Allows `ts-node` to find paths during dev/testing
* **tsc-alias** - Cleanup job that fixes relative paths in your final, compiled product
* **@types/node** - Basic Typescript definitions of the Node runtime

The following installs the Typescript libraries:

```
npm install --save-dev @types/node ts-node tsc-alias tsconfig-paths typescript
```

## Additional Development Libraries

In order to manage the lifecycle of any project (Typescript or not), you need a few helper packages:

* **rimraf** - Phonetically derived from `rm -rf`, provides a means to clean out build folders
* **nodemon** - Provides a monitor to rebuild and rerun code when changes are made
* **npm-run-all** - Provides a short cut to run multiple Node scripts at once

The following installs the additional development helper package:

```
npm install --save-dev rimraf nodemon npm-run-all
```

## Example Packages

To provide a functioning example, this project has an Express driven API.  The following packages provide this functionality:

```
npm install --save express body-parser cors dotenv
```

Not all packages are built with Typescript.  This causes problems when Typescript tries to identify inputs and outputs.  Most non-typescript packages have extra development packages available to provide the missing types.

In this example, `express` and `cors` must have tyepscript types provided.  However, `body-parser` comes with types and does not require an additional library.

```
npm install --save-dev @types/express @types/cors
```

# Package.json

Two things need to be set up in the `package.json` file to enable the development lifecyle:

* Scripts
* Nodemon configuration

The scripts enable basic behaviours like `npm start`, `npm test`, `npm run build`, etc:

```json
  "scripts": {
    "start": "nodemon",
    "dev": "ts-node -r tsconfig-paths/register ./src",
    "test": "ts-node -r tsconfig-paths/register ./test/runTest.spec.ts",
    "clean": "rimraf dist",
    "compile": "tsc --build",
    "alias": "tsc-alias",
    "build": "npm-run-all clean compile alias"
  },
```

## Scripts

* **start** - Invokes `nodemon` to start a development cycle
* **dev** - Runs your code for development.  `start` will cycle on `dev` when changes are made
* **test** - Runs your tests.  This example does not use a testing framework, but one can easily be added
* **clean** - Removes the `dist` folder if one exists
* **compile** - Compiles your Typescript to generic Javascript for distribution
* **alias** - Post compile step that fixes paths in the Javascript
* **build** - Composite scripts that cleans, compiles and aliases the code for distribution

## Nodemon Configuration

Nodemon must be configured to include the script to run (`npm run dev`), the folders to watch (`src` and `test`), and which files specs to watch (anything ending in `ts` or `json`).  This can easily be expanded to include other files or folders that change during development.

```json
  "nodemonConfig": {
    "exec": "npm run dev",
    "watch": [
      "src/*",
      "test/*"
    ],
    "ext": "ts, json"
  }
```

# Typescript Configration

Finally, Typescript itself must be configured.  To avoid distributing test files, there are two configuration files requied - one for the main project, and one specifically for test.

Having two configuration files allows for relative paths to be managed uniquely between the main project and the test files.  It's important for test files to have relative access to the main project to make it easy to import tested modules.

## Main Project

The main project's `tsconfig.json` in its simpilest form:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "forceConsistentCasingInFileNames": true,
    "module": "NodeNext",
    "outDir": "dist",
    "baseUrl": "src",
  },
  "include": ["src/**/*"],
}
```

There are dozens of other options, but these are the bare minimum.

* **strict** - Ensures typing is strictly adhered to
* **target** - Indicates the resulting JavaScript should be compatible with the latest version of the ECMA Script specification (ECMAScript is the _true_ name of JavaScript)
* **forceConsistentCasingInFileNames** - Forces Mac and Windows to behave
* **module** - Forces the compiled module output be compatible with the latest version of ECMA Script
* **outDir** - Location of final distribution files
* **baseUrl** - Location of the source code
* **include** - Indicates which folders to include in the distribution

## Test folder 

To ensure the test project has access to the main project files, you must create a special `tsconfig.json` file under the `/test` folder:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["."],
}
```

This file includes the main package, but it also includes a configuration that prevents test code from going to the main distribution, and it indicates that the main project files should be included.

And yes, the relative paths here make zero-sense.  But it works.

# The Example

The example project is a simple Express application with a module that "gets stuff".  The stuff module itself is the "testable unit":

## `folder1/getStuff.ts`

```typescript
const getStuff = () => {
  return "Stuff"
}

export default getStuff;
```

## `index.ts`

The `cors` is designed to handle local traffic from a React application.  The API listens on port `9080`.

```typescript
import getStuff from "folder1/getStuff";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import 'dotenv/config'

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://localhost:3000"
  })
);

app.use("/api", (req, res) => {
  res.status(200).send(getStuff());
})

const port = process.env.PORT
app.listen(port, () => console.log(`Listening on port ${port}`))
```

# Development Lifecycle

To run the API locally, simply run `npm start`.  Any changes made should automatically trigger a restart of the server.

To run the server once, run `npm dev`

# Distribution

The application can be built by running `npm run build`.  You can test the build by going into the `dist` folder and running the app directly with `node`:

```bash
cd dist
node index.js
```