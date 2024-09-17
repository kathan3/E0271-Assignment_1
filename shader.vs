#version 460
in vec3 Position;
out float depth;
uniform mat4 gWorld;
uniform float zmin;
uniform float zmax;
void main()
{
    
    float distanceFromCamera = length(Position);
    // depth = (distanceFromCamera-zmin) / (zmax - zmin);
    depth = (1.0 - (Position.z - zmin) / (zmax - zmin));
    // depth = clamp(depth, 0.0, 1.0);
    gl_Position = gWorld * vec4(0.07 * Position, 1.0);
}
