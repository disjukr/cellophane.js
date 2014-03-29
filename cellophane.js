var Cellophane = (function () {
  var vertexShaderSource = [
    ''
  ].join('\n');
  function Cellophane() {
    var self = this;
    var gl;
    self.domElement = document.createElement('canvas');
    gl = initWebGL(self.domElement);
    self.render = function () {
      // clear first
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    self.layers = [];
  }
  Cellophane.BlendMode = {
    NORMAL: 'normal'
  };
  Cellophane.Layer = function (content, blendMode, opacity, visibility) {
    var self = this;
    self.content = content || null;
    self.blendMode = blendMode || Cellophane.BlendMode.NORMAL;
    self.opacity = (typeof opacity === 'undefined') ? 1.0 : opacity;
    self.visibility = (typeof visibility === 'undefined') ? true : visibility;
  };
  function prepareShader(gl, source, vertex) {
    var shaderType = vertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw gl.getShaderInfoLog(shader);
    return shader;
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
