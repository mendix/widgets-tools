## mpx

Building widgets with rolldown

> NOTE: This tool in alpha

## Getting started

### 1. Create tarball

Let's assume you cloned this repo to `~/code/widgets-tools`

1. `$ cd ~/code/widgets-tools/packages/mpx`
2. `$ pnpm install`
3. `$ pnpm pack` to create tarball

### 2. Install to widget

with `npm`

> `$ npm install ~/code/mpx/mendix-mpx-0-y-z.tgz`

with `pnpm`

> `pnpm install <path>/mpx/mendix-mpx-0-y-z.tgz`

### 3. Change scripts

In your `package.json`

```diff
- "build": "pluggable-widgets-tools build:web"
+ "build": "mpx"
```

and

```diff
- "start": "pluggable-widgets-tools start:server"
+ "start": "mpx -w"
```

## Usage

```
mpx/0.1.0

Usage:
  $ mpx [options] [dir]

Build the widget in the specified directory. If the directory is omitted, use the current directory.

Options:
  -w, --watch                watch for changes and rebuild (default: false)
  -m, --minify               minify the output (this option is 'on' in CI environment) (default: false)
  -p, --platform <platform>  build platform (web or node) (default: web)
  --show-config              print project config and exit (default: false)
  -h, --help                 Display this message
  -v, --version              Display version number

```
