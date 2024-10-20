"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeferredPromise = void 0;
async function createDeferredPromise() {
    return new Promise((resolveCreate) => {
        const promise = new Promise((resolve, reject) => {
            resolveCreate({ promise: async () => promise, resolve, reject });
        });
    });
}
exports.createDeferredPromise = createDeferredPromise;
//# sourceMappingURL=DeferredPromise.js.map