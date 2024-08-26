#version 460

in float depth;
out vec4 color;

vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void main()
{
    color = vec4(1.0, 1.0, 0.0, 1.0);
}
