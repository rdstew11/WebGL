
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

    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);



    //Getting shader sources from HTML doc
    var vsSource = document.querySelector('#vert_shader').text;
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
        resolution: gl.getUniformLocation(shaderProgram, "u_resolution"),
        color: gl.getUniformLocation(shaderProgram, "u_color"),
    }



    //create VBO
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //Vertex array holding vertex data
    var vertices = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30,
    ];

    //fill VBO with data from vertices array
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


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

    //setting resolution
    gl.uniform2f(uniformLocations.resolution, gl.canvas.width, gl.canvas.height);

    var numRectangles = 10;
    for(var i = 0; i < numRectangles; ++i){
        //Creates a random rectangle
        setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));
        //Assigns random color
        gl.uniform4f(uniformLocations.color, Math.random(), Math.random(), Math.random(), 1);
        //draw rectangle
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }


}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
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