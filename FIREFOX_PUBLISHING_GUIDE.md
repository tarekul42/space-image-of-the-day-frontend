# 🌌 Space Image of the Day: Firefox Publishing Guide

To make this extension live on the Firefox Add-ons (AMO) store, follow this step-by-step guideline.

---

## 1. Build the Extension
The project is already configured for Firefox. Run the build script:

```bash
npm run build:firefox
```
This generates the **`dist-firefox/`** folder.

---

## 2. Test Locally
Always test the build in an actual Firefox browser before submitting.

1. Open **Firefox**.
2. Navigate to `about:debugging#/runtime/this-firefox`.
3. Click "Load Temporary Add-on...".
4. Select the `manifest.json` file inside `dist-firefox/`.
5. Open a new tab to see it in action.

---

## 3. Package for Submission
Firefox requires a ZIP file for upload. Ensure the `manifest.json` is at the top-level of the archive.

```bash
cd dist-firefox
zip -r ../space-image-extension.zip . *
```

---

## 4. Publish to Firefox Add-ons (AMO)
1. Go to the [Firefox Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/).
2. Submit your ZIP file (`space-image-extension.zip`).
3. **Upload Source Code**: Because we use Vite/React, you MUST upload the source code (ZIP of your project root minus `node_modules` and `dist`) to satisfy Mozilla's review requirements.
4. Fill in the metadata (Description, Screenshots) and submit for review.

### Pro-Tip: Automated Testing
You can use Mozilla's `web-ext` tool for easier testing:
```bash
npm install -g web-ext
web-ext run --source-dir dist-firefox
```
