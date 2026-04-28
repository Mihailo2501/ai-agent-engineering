// Sandbox stub. Loaded as a regular (non-module) script in <head>, so it runs
// during page parse before any inline `Sandbox.register(...)` calls in the body.
// When the real js/sandbox.js script loads later at the end of body, it
// drains the queue and replaces this stub with the real implementation.

(function () {
  if (window.Sandbox && !window.Sandbox._isStub) return;
  const queue = [];
  window.Sandbox = {
    _isStub: true,
    _queue: queue,
    register(id, config) { queue.push([id, config]); }
  };
})();
