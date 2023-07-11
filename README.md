![Skeet App Template](https://storage.googleapis.com/skeet-assets/imgs/samples/skeet-app-template.png)

<p align="center">
  <a href="https://twitter.com/intent/follow?screen_name=ELSOUL_LABO2">
    <img src="https://img.shields.io/twitter/follow/ELSOUL_LABO2.svg?label=Follow%20@ELSOUL_LABO2" alt="Follow @ELSOUL_LABO2" />
  </a>
  <br/>

  <a aria-label="npm version" href="https://www.npmjs.com/package/@skeet-framework/cli">
    <img alt="" src="https://badgen.net/npm/v/@skeet-framework/cli">
  </a>
  <a aria-label="Downloads Number" href="https://www.npmjs.com/package/@skeet-framework/cli">
    <img alt="" src="https://badgen.net/npm/dt/@skeet-framework/cli">
  </a>
  <a aria-label="License" href="https://github.com/elsoul/skeet-cli/blob/master/LICENSE.txt">
    <img alt="" src="https://badgen.net/badge/license/Apache/blue">
  </a>
    <a aria-label="Code of Conduct" href="https://github.com/elsoul/skeet-cli/blob/master/CODE_OF_CONDUCT.md">
    <img alt="" src="https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg">
  </a>
</p>

# Skeet Framework Boilerplate

This repo will be generated from _skeet create <project-name>_ .

## Usage

```bash
$ npm i -g firebase-tools
$ npm i -g @skeet-framework/cli
```

```bash
$ skeet create <project-name>
```

```bash
$ cd <project-name>
$ skeet s
```

Open a new terminal and run:

```bash
$ skeet login
$ export ACCESS_TOKEN=<your-token>
```

**※ You need OpenAI API key to get success for default test.**

_./functions/openai/.env_

```bash
CHAT_GPT_KEY=your-key
CHAT_GPT_ORG=your-org
```

Test your app:

```bash
$ skeet test
```

Open http://localhost:4000

## EAS Build

[EAS Build](https://docs.expo.dev/build/introduction/)

You need to run this command to setup EAS Build project.
(Edit app.json for example changing names and deleting "extra" to build new project.)

```
yarn build:configure
```

## Firebase Emulator for iOS and Android

We can't use Firebase Emulator for iOS and Android.
So now we can only test the UI of iOS and Android locally using the production Firebase environment.
We're welcome for who solves this problem.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/elsoul/skeet-app This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The package is available as open source under the terms of the [Apache-2.0 License](https://www.apache.org/licenses/LICENSE-2.0).

## Code of Conduct

Everyone interacting in the SKEET project’s codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/elsoul/skeet-app/blob/master/CODE_OF_CONDUCT.md).
