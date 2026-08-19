# eMSME Individual Quiz - GitHub Pages Deployment

Files for GitHub Pages: `index.html`, `style.css`, `questions.js`, `app.js`. Results are stored in Google Sheets by `apps-script/Code.gs`.

## Setup
1. Create a new Google Sheet named `eMSME Quiz Results`.
2. In the Sheet, open Extensions > Apps Script.
3. Replace all script code with `apps-script/Code.gs`.
4. Deploy > New deployment > Web app. Execute as: Me. Access: Anyone.
5. Copy the `/exec` URL.
6. In `app.js`, replace `PASTE_APPS_SCRIPT_EXEC_URL` and `PASTE_GOOGLE_SHEET_URL`.
7. Upload `index.html`, `style.css`, `questions.js`, and `app.js` to the root of a GitHub repository.
8. Repository Settings > Pages > Deploy from a branch > main / root.

Admin PIN: `ADMIN2026`. Change it in both `app.js` and `Code.gs` before deployment if required.

The Google Sheet automatically creates:
- `Summary`: one latest row per participant.
- `Responses`: one row per participant/question.

Admin can open the result sheet and download it from Google Sheets as Microsoft Excel (.xlsx).
