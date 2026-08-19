# eMSME Quiz - Single File GitHub Pages Build

Upload only `index.html` to the GitHub Pages publishing root. This build embeds CSS, questions, and app code in one file, so missing `questions.js` or `app.js` cannot cause a blank login page.

Before upload, edit `index.html` and replace:
- `PASTE_APPS_SCRIPT_EXEC_URL`
- `PASTE_GOOGLE_SHEET_URL`

For Google Sheets storage, paste `apps-script/Code.gs` into the Sheet's Apps Script project and redeploy as a Web App.
