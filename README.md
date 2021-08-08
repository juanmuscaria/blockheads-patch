### How to compile & load (Requires a rooted device with [frida server](https://frida.re/docs/android/) installed on the device)

```sh
$ git https://github.com/juanmuscaria/blockheads-patch/
$ cd blockheads-patch/
$ npm install
$ frida -U -f com.example.android --no-pause -l _agent.js
```

### How to patch the apk (Requires [Objection](https://github.com/sensepost/objection) installed on your pc)
```sh
$ git https://github.com/juanmuscaria/blockheads-patch/
$ cd blockheads-patch/
$ npm install
* Drop the game apk inside the repo folder and rename it to base.apk
$ objection patchapk -s base.apk -c config.json -l _agent.js --architecture armeabi-v7a
```

### Development workflow

To continuously recompile on change, keep this running in a terminal:

```sh
$ npm run watch
```

And use an editor like Visual Studio Code for code completion and instant
type-checking feedback.
