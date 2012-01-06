#version 150

// Uniforms
uniform float amp;
uniform mat4 mvp;
uniform float phase;
uniform float scale;
uniform float speed;
uniform float width;

// Input attributes
in vec4 vertexIn;

// Output attributes
out vec4 vertex;

// Kernel
void main(void)
{

	// Get vertex position
	vertex = vertexIn;

	// Use time to reposition output vertex
	float wave = (sin((phase * speed) + vertex.x * width)) * (amp * scale);
	vertex = vec4(scale * vertex.x, scale * vertex.y + wave, scale * vertex.z - wave, 1.0);

	// Transform position
	gl_Position = mvp * vertex;

}
