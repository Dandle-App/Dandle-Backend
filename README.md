To run this you need to use the `build` script and then run `bin/www`

With Jetbrains IDEs (WebStorm or Intellij IDEA) you can create a config using the Node.js preset and set the javascript 
file to `bin\www` and then in `Before launch` at the bottom add a `Run npm script` and set that to `build`.

That will build the Typescript and then run the built JS files.