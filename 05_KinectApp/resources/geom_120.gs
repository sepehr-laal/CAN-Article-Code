#version 120

#extension GL_EXT_gpu_shader4 : enable
#extension GL_EXT_geometry_shader4 : enable

// Uniforms
uniform float brightTolerance;
uniform float depth;
uniform float height;
uniform mat4 mvp;
uniform sampler2D positions;
uniform vec3 scale;
uniform bool transform;
uniform float width;

// Input attributes
varying in vec4 texCoord;
varying in float brightness;
varying in vec4 normal;
varying in vec4 position;
varying in vec4 uvIn;

// Output attributes
varying vec4 normalOut;
varying vec4 positionOut;
varying vec4 uvOut;
varying float brightness;

// Adds a vertex to the current primitive
void addVertex(vec4 vert, vec4 norm, float bright)
{

	// Assign values to output attributes
	normalOut = norm;
	positionOut = vert;
	gl_Position = vert;
	brightnessOut = bright;

	// Passes original vertex and texture coordinate to fragment shader
	uvOut = texCoord;

	// Create vertex
	EmitVertex();

}

// Kernel
void main(void)
{

	// Transform point to quad
	if (transform)
	{

		// Get pixel size
		vec2 pixel = vec2(1.0 / width, 1.0 / height);

		// Get brightness at corners of quad
		float bright0 = texture2D(positions, uv.st).r;
		float bright1 = texture2D(positions, uv.st + vec2(pixel.x, 0.0)).r;
		float bright2 = texture2D(positions, uv.st + pixel).r;
		float bright3 = texture2D(positions, uv.st + vec2(0.0, pixel.y)).r;

		// Find corners of quad
		vec4 vert0 = vertex;
		vec4 vert1 = vertex + vec4(1.0, 0.0, 0.0, 0.0);
		vec4 vert2 = vertex + vec4(1.0, 1.0, 0.0, 0.0);
		vec4 vert3 = vertex + vec4(0.0, 1.0, 0.0, 0.0);

		// Set depth for each vertex
		vert0.z = depth * ((1.0 - bright0) * scale.z);
		vert1.z = depth * ((1.0 - bright0) * scale.z);
		vert2.z = depth * ((1.0 - bright0) * scale.z);
		vert3.z = depth * ((1.0 - bright0) * scale.z);

		// Transform vertices to world position
		vert0 = mvp * (vert0 * vec4(-scale.x, scale.y, 1.0, 1.0));
		vert1 = mvp * (vert1 * vec4(-scale.x, scale.y, 1.0, 1.0));
		vert2 = mvp * (vert2 * vec4(-scale.x, scale.y, 1.0, 1.0));
		vert3 = mvp * (vert3 * vec4(-scale.x, scale.y, 1.0, 1.0));

		// Only draw triangle if three points have brightness
		if (bright0 > brightTolerance && 
			bright1 > brightTolerance && 
			bright3 > brightTolerance)
		{

			// Calculate normals
			vec4 norm0 = vec4(normalize(cross(vec3(vert1.xyz - vert0.xyz), vec3(vert1.xyz - vert3.xyz))), 0.0);

			// Build left face
			addVertex(vert0, norm0, bright0);
			addVertex(vert3, norm0, bright3);
			addVertex(vert1, norm0, bright1);
			EndPrimitive();

		}

		// Only draw triangle if three points have brightness
		if (bright1 > brightTolerance && 
			bright2 > brightTolerance && 
			bright3 > brightTolerance)
		{

			// Calculate normal
			vec4 norm1 = vec4(normalize(cross(vec3(vert2.xyz - vert1.xyz), vec3(vert2.xyz - vert3.xyz))), 0.0);

			// Build right face
			addVertex(vert1, norm1, bright1);
			addVertex(vert3, norm1, bright3);
			addVertex(vert2, norm1, bright2);
			EndPrimitive();

		}

	}
	else
	{

		uvOut = uv;
		brightnessOut = texture2D(positions, uv.st).r;

		// Update position
		position.z = depth * ((1.0 - brightness) * scale.z);
		positionOut = mvp * (position * vec4(-scale.x, scale.y, 1.0, 1.0));
		normalOut = vec4(0., 0., 0., 0.);

		// Pass-thru
		gl_Position = position;

		EmitVertex();
		EndPrimitive();

	}

}
