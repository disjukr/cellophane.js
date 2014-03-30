var Cellophane = (function () {
  var vertexShaderSource = [
    ''
  ].join('\n');
  function Cellophane() {
    var self = this;
    var gl;
    self.domElement = document.createElement('canvas');
    gl = initWebGL(self.domElement);
    self.__defineGetter__('gl', function () {
      return gl;
    });
    self.render = function () {
      // clear first
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    var layers = [];
    self.addLayer = function (layer) {
      layer.cellophane = self;
      layers.push(layer);
    };
    self.addLayerAt = function (layer, index) {
      //
    };
    self.removeLayer = function (layer) {
      //
    };
    self.removeLayerAt = function (layer, index) {
      //
    };
    self.setLayerIndex = function (layer, index) {
      //
    };
    self.contains = function (layer) {
      return layers.indexOf(layer) !== -1;
    };
    self.__defineGetter__('numLayers', function () {
      return layers.length;
    });
    self.__defineGetter__('layers', function () {
      return layers.concat();
    });
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
    var cellophane = null;
    var texture = null;
    Object.defineProperty(self, 'cellophane', {
      get: function () {
        return cellophane;
      },
      set: function (val) {
        var gl;
        if (cellophane === val) // no need to update
          return;
        if (cellophane != null) { // then, texture is not null
          gl = cellophane.gl;
          // deallocate texture
          gl.deleteTexture(texture);
          texture = null;
          gl = null;
          cellophane = null;
        }
        if (val != null) {
          cellophane = val;
          gl = cellophane.gl;
          texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          if (self.content != null) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, content);
          }
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.bindTexture(gl.TEXTURE_2D, null);
        }
      }
    });
    self.__defineGetter__('texture', function () {
      return texture;
    });
    self.update = function () {
      if (cellophane == null || self.content == null)
        return;
      var gl = cellophane.gl;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, content);
      gl.bindTexture(gl.TEXTURE_2D, null);
    };
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
