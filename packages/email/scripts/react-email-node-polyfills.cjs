const { WritableStream } = require("node:stream/web");

const ensureEnumerable = (key, value) => {
  if (!value) return;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
  if (descriptor?.enumerable) return;
  Object.defineProperty(globalThis, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

ensureEnumerable("WritableStream", globalThis.WritableStream || WritableStream);
