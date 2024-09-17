#version 460
in float depth;
out vec4 color;

vec3 selectColor(float b){
    float n = 4.;
    vec3 cols[5];
    //colormap 1:
    // cols[0] = vec3(0.0, 0.0, 0.5); // Dark Blue
    // cols[1] = vec3(0.0, 0.5, 1.0); // Light Blue
    // cols[2] = vec3(0.0, 1.0, 0.0); // Green
    // cols[3] = vec3(1.0, 1.0, 0.0); // Yellow
    // cols[4] = vec3(1.0, 0.0, 0.0); // Red

    //colormap 2:
    // cols[0] = vec3(0.5, 0.0, 0.5); // Purple
    // cols[1] = vec3(0.0, 0.5, 0.5); // Teal
    // cols[2] = vec3(0.5, 0.5, 0.0); // Olive
    // cols[3] = vec3(0.5, 0.5, 0.5); // Gray
    // cols[4] = vec3(1.0, 0.5, 0.0); // Orange
    //colormap 3:
    // cols[0] = vec3(0.0, 0.0, 0.0); // Black
    // cols[1] = vec3(0.0, 0.0, 1.0); // Blue
    // cols[2] = vec3(0.0, 1.0, 0.0); // Green
    // cols[3] = vec3(1.0, 1.0, 0.0); // Yellow
    // cols[4] = vec3(1.0, 0.0, 0.0); // Red
      //colormap 4:
    // cols[0] = vec3( 0., 0.24705882352941178, 0.3607843137254902);
    // cols[1] = vec3( 0.34509803921568627, 0.3137254901960784, 0.5529411764705883);
    // cols[2] = vec3( 0.7372549019607844, 0.3137254901960784, 0.5647058823529412);
    // cols[3] = vec3( 1., 0.38823529411764707, 0.3803921568627451);
    // cols[4] = vec3( 1, 0.6509803921568628, 0);

    // colormap 5:
    cols[0] = vec3(0.0, 1.0, 1.0); // Cyan
    cols[1] = vec3(1.0, 0.0, 1.0); // Magenta
    cols[2] = vec3(0.0, 1.0, 0.0); // Lime Green
    cols[3] = vec3(1.0, 0.5, 0.0); // Orange
    cols[4] = vec3(0.5, 0.0, 0.5); // Purple

    float i = floor(b*n);
    float f = fract(b*n);
    int i1 = int(i);
    int i2 = int(i) + 1;
    vec3 col = mix(cols[i1], cols[i2], f);
    //col = col*col*(3.0-2.0*col);
    
    return col;
    
}
void main()
{
    color = vec4(selectColor(depth), 1.0);
}

 
    