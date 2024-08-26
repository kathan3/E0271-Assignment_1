#version 460
in vec3 Position;

uniform mat4 gWorld;

out float depth;

void main()
{
    depth = length(Position)/10.0;
    gl_Position = gWorld * vec4(0.07 * Position + vec3(0.0, 0.0, 1.0), 1.0);
}
