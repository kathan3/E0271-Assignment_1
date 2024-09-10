#version 460 core

layout (triangles) in;
layout (triangle_strip, max_vertices = 6) out;

in VS_OUT {
    vec3 Position;
    vec3 Normal;
} gs_in[];

out vec3 gsNormal;
out vec3 gsFragPos;

uniform vec3 planeNormal;
uniform vec3 planeOffset;
uniform float detachDistance;

void createVertex(vec3 pos, int index) {
    gl_Position = vec4(pos, gl_in[index].gl_Position.w);
    gsNormal = gs_in[index].Normal;
    gsFragPos = pos;
    EmitVertex();
}

// Interpolates between two points to find the intersection point with the plane
vec3 interpolate(vec3 p1, vec3 p2, float d1, float d2) {
    float t = d1 / (d1 - d2); // Linear interpolation factor
    return mix(p1, p2, t);
}

void main() {
    float d = -dot(planeNormal, planeOffset);
    float dist[3];
    
    // Calculate the signed distance of each vertex from the plane
    for (int i = 0; i < 3; i++) {
        dist[i] = dot(planeNormal, vec3(gl_in[i].gl_Position)) + d;
    }

    // Case 1: All vertices are on the same side of the plane
    if ((dist[0] < 0.0 && dist[1] < 0.0 && dist[2] < 0.0) || 
        (dist[0] > 0.0 && dist[1] > 0.0 && dist[2] > 0.0)) {
        // Detach the triangle as a whole
        for (int i = 0; i < 3; i++) {
            vec3 pos;
            if (dist[i] < 0.0) {
                pos = vec3(gl_in[i].gl_Position) - detachDistance * planeNormal;
            } else {
                pos = vec3(gl_in[i].gl_Position) + detachDistance * planeNormal;
            }
            createVertex(pos, i);
        }
        EndPrimitive();
    } 
    // Case 2: One vertex is on one side of the plane, the other two are on the other side
    else {
        int below[2], above[2];
        int bIdx = 0, aIdx = 0;
        
        // Categorize vertices based on their distance to the plane
        for (int i = 0; i < 3; i++) {
            if (dist[i] < 0.0) {
                below[bIdx++] = i;
            } else {
                above[aIdx++] = i;
            }
        }
        
        if (bIdx == 1 && aIdx == 2) {
            // One vertex below the plane, two above
            vec3 newV1 = interpolate(vec3(gl_in[below[0]].gl_Position), vec3(gl_in[above[0]].gl_Position), dist[below[0]], dist[above[0]]);
            vec3 newV2 = interpolate(vec3(gl_in[below[0]].gl_Position), vec3(gl_in[above[1]].gl_Position), dist[below[0]], dist[above[1]]);

            // Triangle on the positive side
            createVertex(vec3(gl_in[above[0]].gl_Position) + detachDistance * planeNormal, above[0]);
            createVertex(vec3(gl_in[above[1]].gl_Position) + detachDistance * planeNormal, above[1]);
            createVertex(newV1 + detachDistance * planeNormal, -1);
            EndPrimitive();

            // Triangle on the negative side
            createVertex(vec3(gl_in[below[0]].gl_Position) - detachDistance * planeNormal, below[0]);
            createVertex(newV1 - detachDistance * planeNormal, -1);
            createVertex(newV2 - detachDistance * planeNormal, -1);
            EndPrimitive();
        } else if (bIdx == 2 && aIdx == 1) {
            // Two vertices below the plane, one above
            vec3 newV1 = interpolate(vec3(gl_in[above[0]].gl_Position), vec3(gl_in[below[0]].gl_Position), dist[above[0]], dist[below[0]]);
            vec3 newV2 = interpolate(vec3(gl_in[above[0]].gl_Position), vec3(gl_in[below[1]].gl_Position), dist[above[0]], dist[below[1]]);

            // Triangle on the negative side
            createVertex(vec3(gl_in[below[0]].gl_Position) - detachDistance * planeNormal, below[0]);
            createVertex(vec3(gl_in[below[1]].gl_Position) - detachDistance * planeNormal, below[1]);
            createVertex(newV1 - detachDistance * planeNormal, -1);
            EndPrimitive();

            // Triangle on the positive side
            createVertex(vec3(gl_in[above[0]].gl_Position) + detachDistance * planeNormal, above[0]);
            createVertex(newV1 + detachDistance * planeNormal, -1);
            createVertex(newV2 + detachDistance * planeNormal, -1);
            EndPrimitive();
        }
    }
}
