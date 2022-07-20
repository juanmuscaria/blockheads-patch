// Helper function
function makeToast(text:string) {
    Java.perform(function () {
        Java.scheduleOnMainThread(function () {
            Java.use("android.widget.Toast")
                .makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(),
                    Java.use("java.lang.String").$new(text), 1).show();
        });
    });
}

// let thread: any = null;
// let canRun = true;
// let canRun2 = true;
// Java.perform(() => {
//     const method = Java.use("com.apportable.gl.GLSurfaceView$1$1")
//         .run.overload();
//     method.implementation = function () {
//         //thread = Java.retain(Java.use("java.lang.Thread").currentThread());
//         if (canRun) {
//             this.run()
//             canRun = false;
//         }
//     }
// });
//
// Java.perform(() => {
//     const method = Java.use("com.apportable.MainThread$2")
//         .run.overload();
//     method.implementation = function () {
//         //thread = Java.retain(Java.use("java.lang.Thread").currentThread());
//         makeToast("tick")
//         if (canRun2) {
//             setTimeout(()=> {
//                 {
//                     let funPointer = Module.getExportByName('libart.so', "_ZN3art17ConditionVariable16WaitHoldingLocksEPNS_6ThreadE");
//                     let funRef = new NativeFunction(funPointer, 'void', ['pointer']);
//                     Interceptor.replace(funPointer,
//                         new NativeCallback((thread) => {
//                             //makeToast("skip lock")
//                             return; // NO-OP prevent locking
//                         }, 'void', ['pointer']));
//                 }
//             }, 1000);
//             this.run()
//             canRun2 = false;
//         }
//     }
// });
//
// // setInterval(() => {
// //     if (thread != null) {
// //         thread.interrupt()
// //     }
// // }, 1000)
//
// Java.perform(() => {
//     const Activity = Java.use('android.app.Activity');
//     Activity.onStop.implementation = function () {
//         this.onStop()
//     };
// });
//
// Java.perform(() => {
//     const Activity = Java.use('android.app.Activity');
//     Activity.onResume.implementation = function () {
//         //canRun = true;
//         //canRun2 = true;
//
//         this.onResume()
//     };
// });

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
            if (library === 'pango') {
                Interceptor.replace(openPtr, new NativeCallback((pathPtr, flags) => {
                    const path = pathPtr.readUtf8String();
                    // Skip android system fonts, it will cause a deferred pointer on CoreText down the line!!!!
                    // Removing the func call may works?
                    if (path?.startsWith("/system/fonts/")) {
                        return -1; // I guess this works, right?
                    }
                    return open(pathPtr, flags);
                }, 'int', ['pointer', 'int']));
            }

            if (library === 'CoreText') {
                Interceptor.revert(openPtr);
                let funPointer = Module.getExportByName('libCoreText.so', 'CTFontCopyPangoDescription');
                let funRef = new NativeFunction(funPointer, 'pointer', ['int', 'pointer', 'pointer', 'pointer']);
                Interceptor.replace(funPointer,
                    new NativeCallback((param1) => {
                        //makeToast("CTFontCopyPangoDescription")
                        return; // NO-OP  deferred pointer from this
                    }, 'void', ['int']));
            }

            if (library === 'CoreGraphics') {
                {
                    let funPointer = Module.getExportByName('libCoreGraphics.so', 'CGFontCopyName');
                    let funRef = new NativeFunction(funPointer, 'pointer', ['int', 'pointer', 'pointer', 'pointer']);
                    Interceptor.replace(funPointer,
                        new NativeCallback((param1, string, param3, param4) => {
                            return string; // NO-OP  deferred pointer from this
                        }, 'pointer', ['int', 'pointer', 'pointer', 'pointer']));
                }
            }
            return loaded;
        } catch (ex) {
            console.log(ex);
        } finally {
        }
    };
});

Interceptor.attach(Module.getExportByName(null, "dlopen"), {
    onEnter: (args) => {
        let text = "Loading library:" + args[0].readCString();
        console.log(text);
        //makeToast(text);
    },
    onLeave: ret => {
        console.log(ret)
    }
})