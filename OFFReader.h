#ifndef OFFREADER_H
#define OFFREADER_H

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "glm/glm.hpp"

typedef struct Vt {
	glm::vec3 aPos;
	glm::vec3 aNormal;

}Vertex;


typedef struct offmodel {
	Vertex *vertices;
	unsigned int *indices;
	int numberOfVertices;
 	int numberOfIndices;
	glm::vec3 minBound;
	glm::vec3 maxBound;
}OffModel;



OffModel* readOffFile(char * OffFile) {
	FILE * input;
	char type[4]; 
	int noEdges;
	int i,j;
	float x,y,z;
	int n, v;
	int nv, np;
	OffModel *model;
	input = fopen(OffFile, "r");
	fscanf(input, "%s", type);
	type[3] = '\0';
	/* First line should be OFF */
	if(strcmp(type,"OFF") != 0) {
		printf("Not a OFF file");
		exit(1);
	}
	/* Read the no. of vertices, faces and edges */
	fscanf(input, "%d", &nv);
	fscanf(input, "%d", &np);
	fscanf(input, "%d", &noEdges);

	model = (OffModel*)malloc(sizeof(OffModel));
	model->numberOfVertices = nv;
	model->numberOfIndices = np * 3;
	
	
	/* allocate required data */
	model->vertices = (Vertex*) malloc(nv * sizeof(Vertex));
	model->indices = (unsigned int*) malloc(np * 3 * sizeof(unsigned int));
	
	/* Read the vertices' location*/	
	for(i = 0;i < nv;i ++) {
		fscanf(input, "%f %f %f", &x,&y,&z);
		model->vertices[i].aPos = glm::vec3(x, y, z);
		model->vertices[i].aNormal = glm::vec3(0.0f);
	}

    int c = 0;
	/* Read the Polygons */	
	for(i = 0;i < np;i ++) {
		/* No. of sides of the polygon (Eg. 3 => a triangle) */
		unsigned int n, v1, v2, v3;
		fscanf(input, "%d %d %d %d", &n, &v1, &v2, &v3);
		if(n != 3){
			printf("Only triangles are supported\n");
			exit(1);
		}
		model->indices[c] = v1;
		model->indices[c+1] = v2;
		model->indices[c+2] = v3;

		glm::vec3 A = model->vertices[v1].aPos;
		glm::vec3 B = model->vertices[v2].aPos;
		glm::vec3 C = model->vertices[v3].aPos;

		auto a = C - B;
		auto b = A - B;
		glm::vec3 normal = glm::normalize(glm::cross(a, b));

		model->vertices[v1].aNormal += normal;
		model->vertices[v2].aNormal += normal;
		model->vertices[v3].aNormal += normal;


		c += 3;
	}

	for(i = 0;i < nv; i++){
		model->vertices[i].aNormal = glm::normalize(model->vertices[i].aNormal);
	}
    if(c != model->numberOfIndices){
        printf("Error in reading indices\n");
        exit(1);
    }

	fclose(input);
	return model;
}

void printOffModel(OffModel* model) {
	int i, j;
	printf("OFF\n");
    
	printf("%d %d 0 \n", model->numberOfVertices, model->numberOfIndices/3);
	
	// for(i = 0; i < model->numberOfVertices;i ++) {
	// 	printf("%f %f %f \n", (model->vertices[i]).x, (model->vertices[i]).y, (model->vertices[i]).z);
	// }
	// unsigned int c = 0;
	// while (c < 15) {
	// 	printf("%d \n", 3);
	// 	for(j = 0;j < 3;j ++) {
	// 		printf("\t%d %f %f %f\n", model->indices[c], model->vertices[model->indices[c]].x, model->vertices[model->indices[c]].y, model->vertices[model->indices[c]].z);
	// 		c++;
	// 	}
	// 	printf("\n");
	// }
    
	

}

int FreeOffModel(OffModel* model) {

	if(model == NULL){
		return 0;
	}
	free(model->vertices);
    free(model->indices);
	free(model);
	return 1;
}

#endif

