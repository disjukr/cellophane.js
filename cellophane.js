var Cellophane = (function () {
  function Cellophane() {
    var self = this;
    self.domElement = document.createElement('canvas');
    var gl = initWebGL(self.domElement);
    var verticeBuffer = initBuffer(gl);
    var shaderPrograms = initShaders(gl);
    self.__defineGetter__('gl', function () {
      return gl;
    });
    self.render = function () {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      layers.forEach(function (layer) {
        layer.cellophane = self;
        renderLayer(layer);
      });
    }
    function renderLayer(layer) {
      var shaderProgram = shaderPrograms[layer.blendMode];
      var vertexLocation = gl.getAttribLocation(shaderProgram, 'vertex');
      gl.useProgram(shaderProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
      gl.enableVertexAttribArray(vertexLocation);
      gl.vertexAttribPointer(vertexLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    var layers = [];
    self.addLayer = function (layer) {
      layer.cellophane = self;
      layers.push(layer);
      return layer;
    };
    self.addLayerAt = function (layer, index) {
      layer.cellophane = self;
      layers.splice(index, 0, layer);
      return layer;
    };
    self.removeLayer = function (layer) {
      var index = layers.indexOf(layer);
      if (index === -1)
        throw 'remove what?';
      layer.cellophane = null;
      layers.splice(index, 1);
      return layer;
    };
    self.removeLayerAt = function (index) {
      if (index < 0 || index >= layers.length)
        throw 'out of range';
      var layer = layers[index];
      layer.cellophane = null;
      layers.splice(index, 1);
      return layer;
    };
    self.setLayerIndex = function (layer, index) {
      var _index = layers.indexOf(layer);
      if (_index === -1)
        throw 'where is that layer?';
      if (index < 0 || index >= layers.length)
        throw 'out of range'
      layers.splice(_index, 1);
      layers.splice(index, 0, layer);
    };
    self.swapLayers = function (layer1, layer2) {
      var index1 = layers.indexOf(layer1);
      var index2 = layers.indexOf(layer2);
      if (index1 === -1 || index2 === -1)
        throw 'swap what?';
      layers[index1] = layer2;
      layers[index2] = layer1;
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
  var vertices = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ];
  var vertexShaderSource = [
    'attribute vec2 vertex;',
    'varying highp vec2 textureCoord;',
    'void main() {',
    '  gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);',
    '  textureCoord = vertex;',
    '}'
  ].join('\n');
  var fragmentShaderSources = {};
  fragmentShaderSources[Cellophane.BlendMode.NORMAL] = [
    'varying highp vec2 textureCoord;',
    'void main() {',
    '  gl_FragColor = vec4(textureCoord, 0.9, 1);',
    '}'
  ].join('\n');
  function initShaders(gl) {
    var programs = {};
    var vertexShader = compileShader(gl, vertexShaderSource, true);
    for (var source in fragmentShaderSources) {
      if (!fragmentShaderSources.hasOwnProperty(source))
        return;
      var program = gl.createProgram();
      var fragmentShaderSource = fragmentShaderSources[source];
      var fragmentShader = compileShader(gl, fragmentShaderSource);
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      programs[source] = program;
    }
    return programs;
  }
  function compileShader(gl, source, vertex) {
    var shaderType = vertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw [
        'shader compile failed:',
        source,
        gl.getShaderInfoLog(shader)
      ].join('\n');
    }
    return shader;
  }
  function initBuffer(gl) {
    var verticeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return verticeBuffer;
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
