var Cellophane = (function () {
  function Cellophane() {
    var self = this;
    var gl;
    self.domElement = document.createElement('canvas');
    gl = initWebGL(self.domElement);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  function initWebGL(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }
    catch (e) {}
    if (gl == null)
      throw 'your browser may not support webgl';
    return gl;
  }
  return Cellophane;
})();
