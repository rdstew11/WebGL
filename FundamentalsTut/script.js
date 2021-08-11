
main();



function main(){
    //Document querys for canvas
    var canvas = document.querySelector("#glcanvas");

    //Creating webGL context and exiting program if unsuccessful
    var gl = canvas.getContext('webgl');
    if(gl == null){
        alert("Unable to initialize WebGL. Your browser or machine may no support it.");
        return;
    }

    //Getting shader sources from HTML doc
    var vsSource = document.querySelector('#vert_shader_3d').text;
    var fsSource = document.querySelector('#frag_shader').text;

    //creating shaders from source code
    var vertShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    //Now we need to link these two shaders into a program
    var shaderProgram = createProgram(gl, vertShader, fragShader);

    var attribLocations = {
        position: gl.getAttribLocation(shaderProgram, "a_position"),
        color: gl.getAttribLocation(shaderProgram, "a_color"),
    }

    var uniformLocations = {
        matrix: gl.getUniformLocation(shaderProgram, "u_matrix"),
    }

    var m4 = {
        translation: function(tx, ty, tz) {
            return [
               1,  0,  0,  0,
               0,  1,  0,  0,
               0,  0,  1,  0,
               tx, ty, tz, 1,
            ];
          },
         
        xRotation: function(angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
        
            return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
            ];
        },
        
        yRotation: function(angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
        
            return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
            ];
        },
        
        zRotation: function(angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
        
            return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
            ];
        },
    
        scaling: function(sx, sy, sz) {
            return [
            sx, 0,  0,  0,
            0, sy,  0,  0,
            0,  0, sz,  0,
            0,  0,  0,  1,
            ];
        },

        translate: function(m, tx, ty, tz) {
            return m4.multiply(m, m4.translation(tx, ty, tz));
        },
        
        xRotate: function(m, angleInRadians) {
            return m4.multiply(m, m4.xRotation(angleInRadians));
        },
        
        yRotate: function(m, angleInRadians) {
            return m4.multiply(m, m4.yRotation(angleInRadians));
        },
        
        zRotate: function(m, angleInRadians) {
            return m4.multiply(m, m4.zRotation(angleInRadians));
        },
        
        scale: function(m, sx, sy, sz) {
            return m4.multiply(m, m4.scaling(sx, sy, sz));
        },

        multiply: function(a, b) {
            var b00 = b[0 * 4 + 0];
            var b01 = b[0 * 4 + 1];
            var b02 = b[0 * 4 + 2];
            var b03 = b[0 * 4 + 3];
            var b10 = b[1 * 4 + 0];
            var b11 = b[1 * 4 + 1];
            var b12 = b[1 * 4 + 2];
            var b13 = b[1 * 4 + 3];
            var b20 = b[2 * 4 + 0];
            var b21 = b[2 * 4 + 1];
            var b22 = b[2 * 4 + 2];
            var b23 = b[2 * 4 + 3];
            var b30 = b[3 * 4 + 0];
            var b31 = b[3 * 4 + 1];
            var b32 = b[3 * 4 + 2];
            var b33 = b[3 * 4 + 3];
            var a00 = a[0 * 4 + 0];
            var a01 = a[0 * 4 + 1];
            var a02 = a[0 * 4 + 2];
            var a03 = a[0 * 4 + 3];
            var a10 = a[1 * 4 + 0];
            var a11 = a[1 * 4 + 1];
            var a12 = a[1 * 4 + 2];
            var a13 = a[1 * 4 + 3];
            var a20 = a[2 * 4 + 0];
            var a21 = a[2 * 4 + 1];
            var a22 = a[2 * 4 + 2];
            var a23 = a[2 * 4 + 3];
            var a30 = a[3 * 4 + 0];
            var a31 = a[3 * 4 + 1];
            var a32 = a[3 * 4 + 2];
            var a33 = a[3 * 4 + 3];
         
            return [
              b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
              b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
              b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
              b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
              b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
              b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
              b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
              b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
              b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
              b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
              b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
              b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
              b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
              b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
              b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
              b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
            ];
        },

        projection: function(width, height, depth) {
            // Note: This matrix flips the Y axis so 0 is at the top.
            return [
               2 / width,   0,              0,          0,
               0,           -2 / height,    0,          0,
               0,           0,              2 / depth,  0,
              -1,           1,              0,          1,
            ];
        },

        orthographic: function(left, right, bottom, top, near, far) {
            return [
              2 / (right - left), 0, 0, 0,
              0, 2 / (top - bottom), 0, 0,
              0, 0, 2 / (near - far), 0,
         
              (left + right) / (left - right),
              (bottom + top) / (bottom - top),
              (near + far) / (near - far),
              1,
            ];
        },

        perspective: function(fieldOfViewInRadians, aspect, near, far) {
            var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
            var rangeInv = 1.0 / (near - far);
         
            return [
              f / aspect, 0, 0, 0,
              0, f, 0, 0,
              0, 0, (near + far) * rangeInv, -1,
              0, 0, near * far * rangeInv * 2, 0
            ];
          },
    };



    //Tells webgl how to convert from clip space to pixels
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);


    //Clearing background to a color
    var color = {
        r: 41.,
        g: 142.,
        b: 234.
    }

    var rVal = color.r / 255.;
    var gVal = color.g / 255.;
    var bVal = color.b / 255.;

    gl.clearColor(rVal, gVal, bVal, 1);
    //Clearing color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Enabling Depth buffer and culling
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    //Tells webGL which shader to use
    gl.useProgram(shaderProgram);

    //create VBO and fill it
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //filling VBO from function
    setGeometry(gl);

    //Turns on attribute position vertex
    gl.enableVertexAttribArray(attribLocations.position);

    //bind VBO so webGL can use it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        
    //Tells the attribute how to get data out of buffer
    var size = 3;           // 3 components per iteration
    var type = gl.FLOAT;    // data is 32bit floats
    var normalize = false;  // don't normalize data
    var stride = 0;         // # of (size * sizeof(type)) to jump each iteration
    var offset = 0;         // where in buffer to begin
    

    gl.vertexAttribPointer(attribLocations.position, size, type, normalize, stride, offset);


    // Creating a color buffer
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    //filling color buffer from function
    setColors(gl);

    //turing on Color attribute
    gl.enableVertexAttribArray(attribLocations.color);
    var size = 3;                   // 3 Components per iteration
    var type = gl.UNSIGNED_BYTE;    // data is 8bit unsigned values
    var normalize = true;           // normalize the data (convert from 0-255 to 0-1)
    var stride = 0;                 
    var offset = 0;
    gl.vertexAttribPointer(attribLocations.color, size, type, normalize, stride, offset);


    //setting uniforms;
    gl.uniform4f(uniformLocations.color, 1, 0, 0, 1);


    //transformation values
    var translation = [200, 100, 0];
    var rotation = [0, .5, .5];
    var scale = [1, 1, 1];

    //Applying projection and transforming matrix
    var matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);


    //Giving shader program the matrix
    gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);
    
    var primitiveType = gl.TRIANGLES;
    var drawOffset = 0;
    var count = 16 * 6;

    gl.drawArrays(primitiveType, drawOffset, count);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
  }

function setColors(gl){
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new  Uint8Array([
             // left column front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // top rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // middle rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // left column back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // middle rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,

          // top rung right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

          // under top rung
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,

          // between top rung and middle
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,

          // top of middle rung
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,

          // right of middle rung
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,

          // bottom of middle rung.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,

          // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,

          // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,

          // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220
        ]),
        gl.STATIC_DRAW
    );
}
   


// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0]),
        gl.STATIC_DRAW);
  }
  

//fills buffer with rectangle
function setRectangle(gl, x, y, width, height){
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);
}


//Returns compiled shader from source code
function createShader(gl, type, source)
{
    //creates a blank shader from webgl
    var shader = gl.createShader(type);
    //attaches source code to shader
    gl.shaderSource(shader, source);
    //compiles shader
    gl.compileShader(shader);

    //checks to ensure a successful compile before returning shader
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success){
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

//returns linked shader program from compiled vertex and fragment shaders
function createProgram(gl, vShader, fShader){
    //creating a blank program from webgl
    var program = gl.createProgram();

    //attaching shaders to the program
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);

    //Linking shaders in program
    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success){
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
      canvas.width  = width;
      canvas.height = height;
      return true;
    }
    return false;
}



//3x3 matrix functions
var m3 = {
    multiply: function(a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
     
        return [
          b00 * a00 + b01 * a10 + b02 * a20,
          b00 * a01 + b01 * a11 + b02 * a21,
          b00 * a02 + b01 * a12 + b02 * a22,
          b10 * a00 + b11 * a10 + b12 * a20,
          b10 * a01 + b11 * a11 + b12 * a21,
          b10 * a02 + b11 * a12 + b12 * a22,
          b20 * a00 + b21 * a10 + b22 * a20,
          b20 * a01 + b21 * a11 + b22 * a21,
          b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
    translation: function(tx, ty) {
        return [
          1, 0, 0,
          0, 1, 0,
          tx, ty, 1,
        ];
      },
     
      rotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
          c,-s, 0,
          s, c, 0,
          0, 0, 1,
        ];
      },
     
      scaling: function(sx, sy) {
        return [
          sx, 0, 0,
          0, sy, 0,
          0, 0, 1,
        ];
      },

      identity: function() {
        return [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
        ];
    },
    projection: function(width, height) {
        // Note: This matrix flips the Y axis so that 0 is at the top.
        return [
          2 / width, 0, 0,
          0, -2 / height, 0,
          -1, 1, 1
        ];
      },

    translate: function(m, tx, ty) {
        return m3.multiply(m, m3.translation(tx, ty));
    },
    
    rotate: function(m, angleInRadians) {
        return m3.multiply(m, m3.rotation(angleInRadians));
    },
    
    scale: function(m, sx, sy) {
        return m3.multiply(m, m3.scaling(sx, sy));
    },
};