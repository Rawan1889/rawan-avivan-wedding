/**
 * Injects organic wind sway into any MeshStandardMaterial via onBeforeCompile.
 * Works correctly with InstancedMesh — uses per-instance world translation
 * extracted from instanceMatrix to create unique phase per plant.
 *
 * @param {import('three').MeshStandardMaterial} material
 * @param {{ uWindTime: {value:number}, uWindStrength: {value:number} }} windUniforms
 * @param {number} [maxSway=0.20] - maximum sway amplitude in metres
 */
export function injectWindSway(material, windUniforms, maxSway = 0.20) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime     = windUniforms.uWindTime;
    shader.uniforms.uWindStrength = windUniforms.uWindStrength;

    // Declare uniforms at top of vertex shader
    shader.vertexShader = /* glsl */`
      uniform float uWindTime;
      uniform float uWindStrength;
      ${shader.vertexShader}
    `;

    // Inject sway after begin_vertex so 'transformed' is available
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      /* glsl */`
      #include <begin_vertex>

      // Per-instance phase derived from world translation
      #ifdef USE_INSTANCING
        float iX = instanceMatrix[3][0];
        float iZ = instanceMatrix[3][2];
      #else
        float iX = 0.0;
        float iZ = 0.0;
      #endif

      // Sway grows quadratically with height — base stays anchored
      float swayH = clamp(position.y / 0.55, 0.0, 1.0);
      float swayFactor = swayH * swayH;

      float phase = iX * 0.42 + iZ * 0.31;
      float wave  = sin(uWindTime * 1.9  + phase)       * uWindStrength * swayFactor * ${maxSway.toFixed(2)};
      float wave2 = sin(uWindTime * 3.1  + phase * 1.4) * uWindStrength * swayFactor * ${(maxSway * 0.4).toFixed(2)};

      transformed.x += wave;
      transformed.z += wave2;
      `,
    );
  };
  // Force material to recompile when uniforms change
  material.needsUpdate = true;
}
