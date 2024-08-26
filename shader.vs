#version 460
in vec3 Position;

uniform mat4 gWorld;

void main()
{
    gl_Position = gWorld * vec4(0.07 * Position, 1.0);
}
