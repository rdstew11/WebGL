
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
    var vsSource = document.querySelector('#vert_shader_2d').text;
    var fsSource = document.querySelector('#frag_shader').text;

    //creating shaders from source code
    var vertShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    var fragShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    //Now we need to link these two shaders into a program
    var shaderProgram = createProgram(gl, vertShader, fragShader);

    var attribLocations = {
        position: gl.getAttribLocation(shaderProgram, "a_position"),
    }

    var uniformLocations = {
        color: gl.getUniformLocation(shaderProgram, "u_color"),
        matrix: gl.getUniformLocation(shaderProgram, "u_matrix"),
    }

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
    };

    //create VBO and fill it
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    setGeometry(gl);

    //Tells webgl how to convert from clip space to pixels
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    var color = {
        r: 41.,
        g: 142.,
        b: 234.
    }

    //Clearing background to a color
    var rVal = color.r / 255.;
    var gVal = color.g / 255.;
    var bVal = color.b / 255.;

    gl.clearColor(rVal, gVal, bVal, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Tells webGL which shader to use
    gl.useProgram(shaderProgram);

    //Turns on attribute
    gl.enableVertexAttribArray(attribLocations.position);

    //bind VBO so webGL can use it
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        
    //Tells the attribute how to get data out of buffer
    var size = 2;           // 2 components per iteration
    var type = gl.FLOAT;    // data is 32bit floats
    var normalize = false;  // don't normalize data
    var stride = 0;          // # of (size * sizeof(type)) to jump each iteration
    var offset = 0;         // where in buffer to begin
    

    gl.vertexAttribPointer(attribLocations.position, size, type, normalize, stride, offset);

    //setting uniforms;
    gl.uniform4f(uniformLocations.color, 1, 0, 0, 1);

    //transformation values
    var translation = [200, 100];
    var rotationAngle = 2;
    var scale = [1, 1];

    //Creating the projection matrix from CSS values
    //this does all the scaling and translating operations to convert clip space into pixels
    var projectionMatrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight)

    //Creating matrices from transformation values
    var translationMatrix = m3.translation(translation[0], translation[1]);
    var rotationMatrix = m3.rotation(rotationAngle);
    var scaleMatrix = m3.scaling(scale[0], scale[1])

    //This allows for transformations to be centered at a different point
    //Most useful for rotations (Without just rotates centered at top left corner)
    var moveOriginMatrix = m3.translation(-50, -75);        //-50, -75 are centerpoints for the F
    

    //combining (multiplying) matrices into transformation matrix
    var matrix = m3.identity();
    matrix = m3.multiply(matrix, projectionMatrix)
    matrix = m3.multiply(matrix, translationMatrix);
    matrix = m3.multiply(matrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);
    //Apply the move origin last
    matrix = m3.multiply(matrix, moveOriginMatrix);

    //Giving shaders the transformation matrix
    gl.uniformMatrix3fv(uniformLocations.matrix, false, matrix);
    
    gl.drawArrays(gl.TRIANGLES, 0, 18);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
  }
   


// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,
  
            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,
  
            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
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