# Patching
Currently, the only official place to find the apk is https://noodlecake.com/wp-content/uploads/2021/02/theblockheads1.7.6.apk
## On Linux
### How to patch the apk (Requires [Objection](https://github.com/sensepost/objection) installed)
```sh
$ git clone https://github.com/juanmuscaria/blockheads-patch/
$ cd blockheads-patch/
$ npm install
$ npm run build
* Drop the game apk inside the repo folder and rename it to base.apk
$ ./patchApk.sh
```
#### Notes about installing objection
It will require a few extra [android tools](https://github.com/sensepost/objection/wiki/Patching-Android-Applications#patching---dependencies) to be able to patch apk files.

If patching doesn't work, [this](https://github.com/sensepost/objection/wiki/Android-APK-Patching#debugging-failed-patches) can help you figure out the problem.

## On Windows
TODO, you should be able to use the linux steps under WSL

### Development workflow

### How to compile & load (Requires a rooted device with [frida server](https://frida.re/docs/android/) installed on the device)
```sh
$ git clone https://github.com/juanmuscaria/blockheads-patch/
$ cd blockheads-patch/
$ npm install
$ npm run live
```

To continuously recompile on change, keep this running in a terminal:

```sh
$ npm run watch
```

And use an editor like Visual Studio Code for code completion and instant
type-checking feedback.
