// Helper function
function makeToast(text:string) {
    Java.perform(function () {
        var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();

        Java.scheduleOnMainThread(function () {
            var toast = Java.use("android.widget.Toast");
            toast.makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(), Java.use("java.lang.String").$new(text), 1).show();
        });
    });
}
// Failed attempt to fix the webview deadlock
// let isWebViewing = false;
//
// Java.perform(() => {
//     const Render = Java.use("com.apportable.gl.GLSurfaceView$1").run.overload();
//     Render.implementation = function () {
//         if (isWebViewing) {
//             Java.use("com.apportable.MainThread").goNative();
//         } else {
//             console.log("a")
//             this.run()
//         }
//     }
// });
// Java.perform(() => {
//     const Render = Java.use("com.apportable.gl.GLSurfaceView$1$1").run.overload();
//     Render.implementation = function () {
//         if (isWebViewing) {
//             //Java.use("com.apportable.MainThread").goNative();
//         } else {
//             console.log("b")
//             this.run()
//         }
//     }
// });
// Java.perform(() => {
//     const method = Java.use("com.noodlecake.noodlewebview.BlockheadsWebView")
//         .onCreate.overload("android.os.Bundle");
//     method.implementation = function (x:any) {
//         console.log("creating")
//         //this.onCreate(x);
//         isWebViewing = true;
//     }
// });
// Java.perform(() => {
//     const method = Java.use("com.noodlecake.noodlewebview.BlockheadsWebView")
//         .onDestroy.overload();
//     method.implementation = function () {
//         console.log("destroying")
//         this.onDestroy();
//         isWebViewing = false;
//     }
// });

// Disable the webview to avoid a crash.
Java.perform(() => {
    const method = Java.use("com.noodlecake.noodlewebview.NoodleWebView$1")
        .run.overload();
    method.implementation = function () {
        makeToast("Avoiding WM freeze.")
    }
});

// Fix the long startup time by only loading necessary fonts.
const openPtr = Module.getExportByName('libc.so', 'open');
const open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
Java.perform(() => {
    const System = Java.use('java.lang.System');
    const Runtime = Java.use('java.lang.Runtime');
    const SystemLoad_2 = System.loadLibrary.overload('java.lang.String');
    const VMStack = Java.use('dalvik.system.VMStack');

    SystemLoad_2.implementation = (library: string) => {
        console.log("Loading dynamic library => " + library);

        try {
            const loaded = Runtime.getRuntime().loadLibrary0(VMStack.getCallingClassLoader(), library);
            if(library === 'pango') {
                Interceptor.replace(openPtr, new NativeCallback((pathPtr, flags) => {
                    const path = pathPtr.readUtf8String();
                    if (path?.startsWith("/system/fonts/Noto")) {
                        //log('Skipping "' + path + '"');
                        return -1; // I guess this works, right?
                    }
                    return open(pathPtr, flags);
                }, 'int', ['pointer', 'int']));
            }
            if(library === 'CoreText') {
                Interceptor.revert(openPtr);
                makeToast("Skipped bad system fonts!");
            }
            return loaded;
        } catch(ex) {
            console.log(ex);
        } finally {
        }
    };
});

Interceptor.attach(Module.getExportByName(null,"dlopen"),{
    onEnter: (args) => {
        let text = "Loading library:" + args[0].readCString();
        console.log(text);
        //makeToast(text);
    },
    onLeave: ret => {
        console.log(ret)
    }
})