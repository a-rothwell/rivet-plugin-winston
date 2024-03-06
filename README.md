<h1 align="center"><img src="https://rivet.ironcladapp.com/img/logo-banner-wide.png" alt="Rivet Logo"></h1>

# Rivet Winston Plugin

This plugin add one node to improve logging in rivet. Currently this plugin only works in the node runtime. Currently the only supported logging transport is the file transport. If you would like to add more transport options please open a PR.

## Local Development

1. Run `yarn dev` to start the compiler and bundler in watch mode. This will automatically recombine and rebundle your changes into the `dist` folder. This will also copy the bundled files into the plugin install directory.
2. After each change, you must restart Rivet to see the changes.
