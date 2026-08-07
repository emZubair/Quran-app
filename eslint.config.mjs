import expoConfig from "eslint-config-expo/flat.js";

export default [
  ...expoConfig,
  // design_handoff_* holds vendored HTML/JS design references, not app code.
  { ignores: ["dist/*", "design_handoff_*/**"] },
];
