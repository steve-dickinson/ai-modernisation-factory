export const CONFIG = {
  COPILOT_TIMEOUT_MS: 5 * 60 * 1000,
  COPILOT_ERROR_PREVIEW_LENGTH: 800,
  COPILOT_DEBUG_PREVIEW_LENGTH: 1200,
  COPILOT_MIN_RESPONSE_LENGTH: 50,
  COPILOT_USE_SDK: true,
  
  MAX_GATE_FIX_ATTEMPTS: 2,
  MAX_FILE_CONTENT_LENGTH: 12000,
  MAX_DIR_FILES_TO_LIST: 50,
  
  PATCH_FILENAME: ".modernise.patch",
  FIX_PATCH_FILENAME: ".modernise.fix.patch",
  
  ALLOWED_PATCH_PATHS: ["src/", "test/", "docs/modernisation/"],
  
  REQUIRED_CDP_FILES: ["README.md", "Dockerfile", "package.json"],
  
  CDP_TEMPLATES: {
    BACKEND: "cdp-node-backend-template",
    FRONTEND: "cdp-node-frontend-template"
  },
  
  TEMPLATE_SUFFIXES: {
    "cdp-node-backend-template": "-backend",
    "cdp-node-frontend-template": "-frontend"
  }
}
