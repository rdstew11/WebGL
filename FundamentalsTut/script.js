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
    
    var fieldOfView = degToRad(60);     
    var cameraAngle = degToRad(100);
    var rotationSpeed = 1.2;

    var then = 0;
    
    
    requestAnimationFrame(drawScene);


    function drawScene(now){
      // Converts time into seconds
      now *= 0.001; 
      // Substracts previous time from the current time
      var deltaTime = now - then;
      // Remember the current time for the next frame
      then = now;

      cameraAngle += rotationSpeed * deltaTime;
  
      // Tells webgl how to convert from clip space to pixels
      resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
  
  
      // Clearing background to a color
      var rVal = 41. / 255.;
      var gVal = 142. / 255.;
      var bVal = 234. / 255.;
  
      gl.clearColor(rVal, gVal, bVal, 1);
      // Clearing color and depth buffers
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      // Enabling Depth buffer and culling
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.DEPTH_TEST);
  
      // Tells webGL which shader to use
      gl.useProgram(shaderProgram);
  
      // create VBO and fill it
      var vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      // filling VBO from function
      setGeometry(gl, m4);
  
      // Turns on attribute position vertex
      gl.enableVertexAttribArray(attribLocations.position);
  
      // bind VBO so webGL can use it
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
          
      // Tells the attribute how to get data out of buffer
      var size = 3;           // 3 components per iteration
      var type = gl.FLOAT;    // data is 32bit floats
      var normalize = false;  // don't normalize data
      var stride = 0;         // # of (size * sizeof(type)) to jump each iteration
      var offset = 0;         // where in buffer to begin
      
  
      gl.vertexAttribPointer(attribLocations.position, size, type, normalize, stride, offset);
  
  
      // Creating a color buffer
      var colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      // filling color buffer from function
      setColors(gl);
  
      // turing on Color attribute
      gl.enableVertexAttribArray(attribLocations.color);
      var size = 3;                   // 3 Components per iteration
      var type = gl.UNSIGNED_BYTE;    // data is 8bit unsigned values
      var normalize = true;           // normalize the data (convert from 0-255 to 0-1)
      var stride = 0;                 
      var offset = 0;
      gl.vertexAttribPointer(attribLocations.color, size, type, normalize, stride, offset);
  
  
      // setting uniforms;
      gl.uniform4f(uniformLocations.color, 1, 0, 0, 1);
  
  
      //perspective values
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var zNear = 1;
      var zFar = 2000;
  
  
      // Compute the matrix
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var zNear = 1;
      var zFar = 2000;
      var projectionMatrix = m4.perspective(fieldOfView, aspect, zNear, zFar);
  
      // Drawing 5 f's
      var numFs = 5;
      var radius = 200;
  
      // Compute the position of the first f
      var fPosition = [radius, 0, 0];
  
      // Matrix math to compute a position on the circle where the camera is
      var cameraMatrix = m4.yRotation(cameraAngle);
      cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);
  
  
      // Get camera's position out of matrix
      var cameraPosition = [
        cameraMatrix[12],     //x
        cameraMatrix[13],     //y
        cameraMatrix[14]      //z
      ];
  
      var up = [0, 1, 0];
  
      //compute the camera's matrix using lookAt
      cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
  
  
  
      //View matrix is the matrix that moves everything the opposite of the camera
      var viewMatrix = m4.inverse(cameraMatrix);
  
      //Compute a view projection matrix
      var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  
      for(var i = 0; i < numFs; i++){
          var angle = i * Math.PI * 2 / numFs;
          var x = Math.cos(angle) * radius;
          var y = Math.sin(angle) * radius;
  
          //Compute a matrix for the individual F
          var matrix = m4.translate(viewProjectionMatrix, x, 0, y);
  
          //Giving shader program the matrix
          gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);
  
          var primitiveType = gl.TRIANGLES;
          var drawOffset = 0;
          var count = 16 * 6;
      
          gl.drawArrays(primitiveType, drawOffset, count);
      }
  
      requestAnimationFrame(drawScene);
  }
  
  // Returns a random integer from 0 to range - 1.
  function randomInt(range) {
      return Math.floor(Math.random() * range);
  }
  
  function radToDeg(r) {
      return r * 180 / Math.PI;
  }
  
  function degToRad(d) {
      return d * Math.PI / 180;
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
      var positions = new Float32Array([
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
          0, 150,   0]);
  
      // Center the F around the origin and Flip it around. We do this because
      // we're in 3D now with and +Y is up where as before when we started with 2D
      // we had +Y as down.
  
      // We could do by changing all the values above but I'm lazy.
      // We could also do it with a matrix at draw time but you should
      // never do stuff at draw time if you can do it at init time.
      var matrix = m4.xRotation(Math.PI);
      matrix = m4.translate(matrix, -50, -75, -15);
  
      for (var ii = 0; ii < positions.length; ii += 3) {
      var vector = m4.vectorMultiply([positions[ii + 0], positions[ii + 1], positions[ii + 2], 1], matrix);
      positions[ii + 0] = vector[0];
      positions[ii + 1] = vector[1];
      positions[ii + 2] = vector[2];
      }
  
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
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
main();