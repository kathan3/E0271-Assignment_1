#version 460 core

layout (triangles) in;
layout (triangle_strip, max_vertices = 9) out;

in VS_OUT {
    vec3 Position;
    vec3 Normal;
} gs_in[];

out vec3 gsNormal;
out vec3 gsFragPos;

uniform vec3 planeNormal;
uniform vec3 planeOffset;
uniform float detachDistance;

void createVertex(vec4 pos, vec3 normal) {
    gl_Position = pos;
    gsNormal = normal;
    gsFragPos = vec3(pos);
    EmitVertex();
}

// Interpolates between two points and their normals to find the intersection point with the plane
vec4 interpolate(vec4 p1, vec4 p2, vec3 n1, vec3 n2, float d1, float d2, out vec3 interpolatedNormal) {
    float t = abs(d1 / (d1 - d2)); // Linear interpolation factor
    interpolatedNormal = normalize(mix(n1, n2, t)); // Interpolate and normalize the normal
    return mix(p1, p2, t); // Interpolated position
}

// Function for geometry blending
vec4 geometryBlend(vec4 pos, vec3 normal, float offset) {
    return pos + offset * vec4(normal, 0.0); // Offset position along the normal
}

// Function for averaging normals
vec3 averageNormals(vec3 n1, vec3 n2) {
    return normalize(n1 + n2); // Normalize the average
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
            vec4 pos;
            if (dist[i] < 0.0) {
                pos = geometryBlend(gl_in[i].gl_Position, -planeNormal, detachDistance);
            } else {
                pos = geometryBlend(gl_in[i].gl_Position, planeNormal, detachDistance);
            }
            createVertex(pos, gs_in[i].Normal);
        }
        EndPrimitive();
    } 
    // Case 2: One vertex is on one side of the plane, the other two are on the other side
    else {
        int below[3], above[3];
        int bIdx = 0, aIdx = 0;

        // Categorize vertices based on their distance to the plane
        for (int i = 0; i < 3; i++) {
            if (dist[i] < 0.0) {
                below[bIdx++] = i;
            } else if (dist[i] > 0.0) {
                above[aIdx++] = i;
            } else {
                // Handle the case where dist[i] == 0.0
                below[bIdx++] = i; // Optionally add to below
                above[aIdx++] = i; // Optionally add to above
            }
        }

        vec3 interpolatedNormal1;
        vec3 interpolatedNormal2;

        if (bIdx == 1 && aIdx == 2) {
            // One vertex below the plane, two above
            vec4 newV1 = interpolate(gl_in[below[0]].gl_Position, gl_in[above[0]].gl_Position, 
                                     gs_in[below[0]].Normal, gs_in[above[0]].Normal, dist[below[0]], dist[above[0]], interpolatedNormal1);
            vec4 newV2 = interpolate(gl_in[below[0]].gl_Position, gl_in[above[1]].gl_Position, 
                                     gs_in[below[0]].Normal, gs_in[above[1]].Normal, dist[below[0]], dist[above[1]], interpolatedNormal2);
            
            if(above[0] == 0 && above[1] == 2) {
                // First clip triangle
                createVertex(geometryBlend(gl_in[above[1]].gl_Position, planeNormal, detachDistance), gs_in[above[1]].Normal);
                createVertex(geometryBlend(gl_in[above[0]].gl_Position, planeNormal, detachDistance), gs_in[above[0]].Normal);
                createVertex(geometryBlend(newV2, planeNormal, detachDistance), interpolatedNormal2);
                EndPrimitive();

                // Second clip triangle
                createVertex(geometryBlend(gl_in[above[0]].gl_Position, planeNormal, detachDistance), gs_in[above[0]].Normal);
                createVertex(geometryBlend(newV1, planeNormal, detachDistance), interpolatedNormal1);
                createVertex(geometryBlend(newV2, planeNormal, detachDistance), interpolatedNormal2);
                EndPrimitive();

                // Triangle on the negative side
                createVertex(geometryBlend(gl_in[below[0]].gl_Position, -planeNormal, detachDistance), gs_in[below[0]].Normal);
                createVertex(geometryBlend(newV2, -planeNormal, detachDistance), interpolatedNormal2);
                createVertex(geometryBlend(newV1, -planeNormal, detachDistance), interpolatedNormal1);
                EndPrimitive();
            }else{
                // First clip triangle
                createVertex(geometryBlend(gl_in[above[0]].gl_Position, planeNormal, detachDistance), gs_in[above[0]].Normal);
                createVertex(geometryBlend(gl_in[above[1]].gl_Position, planeNormal, detachDistance), gs_in[above[1]].Normal);
                createVertex(geometryBlend(newV1, planeNormal, detachDistance), interpolatedNormal1);
                EndPrimitive();

                // Second clip triangle
                createVertex(geometryBlend(gl_in[above[1]].gl_Position, planeNormal, detachDistance), gs_in[above[1]].Normal);
                createVertex(geometryBlend(newV2, planeNormal, detachDistance), interpolatedNormal2);
                createVertex(geometryBlend(newV1, planeNormal, detachDistance), interpolatedNormal1);
                EndPrimitive();

                // Triangle on the negative side
                createVertex(geometryBlend(gl_in[below[0]].gl_Position, -planeNormal, detachDistance), gs_in[below[0]].Normal);
                createVertex(geometryBlend(newV1, -planeNormal, detachDistance), interpolatedNormal1);
                createVertex(geometryBlend(newV2, -planeNormal, detachDistance), interpolatedNormal2);
                EndPrimitive();
            }

        } else if (bIdx == 2 && aIdx == 1) {
            // Two vertices below the plane, one above
            vec4 newV1 = interpolate(gl_in[above[0]].gl_Position, gl_in[below[0]].gl_Position, 
                                     gs_in[above[0]].Normal, gs_in[below[0]].Normal, dist[above[0]], dist[below[0]], interpolatedNormal1);
            vec4 newV2 = interpolate(gl_in[above[0]].gl_Position, gl_in[below[1]].gl_Position, 
                                     gs_in[above[0]].Normal, gs_in[below[1]].Normal, dist[above[0]], dist[below[1]], interpolatedNormal2);

            if(below[0] == 0 && below[1] == 2){
                // First clip triangle
                createVertex(geometryBlend(gl_in[below[1]].gl_Position, -planeNormal, detachDistance), gs_in[below[1]].Normal);
                createVertex(geometryBlend(gl_in[below[0]].gl_Position, -planeNormal, detachDistance), gs_in[below[0]].Normal);
                createVertex(geometryBlend(newV1, -planeNormal, detachDistance), interpolatedNormal1);
                EndPrimitive();

                 // Second clip triangle
                createVertex(geometryBlend(gl_in[below[1]].gl_Position, -planeNormal, detachDistance), gs_in[below[1]].Normal);
                createVertex(geometryBlend(newV1, -planeNormal, detachDistance), interpolatedNormal1);
                createVertex(geometryBlend(newV2, -planeNormal, detachDistance), interpolatedNormal2);
                EndPrimitive();

                // Triangle on the positive side
                createVertex(geometryBlend(gl_in[above[0]].gl_Position, planeNormal, detachDistance), gs_in[above[0]].Normal);
                createVertex(geometryBlend(newV2, planeNormal, detachDistance), interpolatedNormal2);
                createVertex(geometryBlend(newV1, planeNormal, detachDistance), interpolatedNormal1);
                EndPrimitive();
            }else{
                // First clip triangle
                createVertex(geometryBlend(gl_in[below[0]].gl_Position, -planeNormal, detachDistance), gs_in[below[0]].Normal);
                createVertex(geometryBlend(gl_in[below[1]].gl_Position, -planeNormal, detachDistance), gs_in[below[1]].Normal);
                createVertex(geometryBlend(newV2, -planeNormal, detachDistance), interpolatedNormal2);
                EndPrimitive();

                // Second clip triangle
                createVertex(geometryBlend(gl_in[below[0]].gl_Position, -planeNormal, detachDistance), gs_in[below[0]].Normal);
                createVertex(geometryBlend(newV2, -planeNormal, detachDistance), interpolatedNormal2);
                createVertex(geometryBlend(newV1, -planeNormal, detachDistance), interpolatedNormal1);
                EndPrimitive();

                // Triangle on the positive side
                createVertex(geometryBlend(gl_in[above[0]].gl_Position, planeNormal, detachDistance), gs_in[above[0]].Normal);
                createVertex(geometryBlend(newV1, planeNormal, detachDistance), interpolatedNormal1);
                createVertex(geometryBlend(newV2, planeNormal, detachDistance), interpolatedNormal2);
                EndPrimitive();
            }
        }
    }
}
