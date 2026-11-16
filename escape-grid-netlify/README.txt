ESCAPE THE GRID — NETLIFY MULTI-DEVICE VERSION

Included:
- Teacher dashboard at /?teacher=1
- Teacher generates a six-character join code.
- Teams join from the normal site URL using that code.
- Teacher-only pause/resume controls.
- Team devices show a paused message but no pause/resume button.
- Netlify Blobs stores shared game sessions and team progress.
- Existing question bank and scoring rules are retained from the supplied index.html.

DEPLOY:
1. Upload this folder to a GitHub repository.
2. In Netlify, choose Add new site > Import an existing project and connect the repository.
3. Deploy. Netlify Functions and Blobs are used for shared state; no external database credentials are required.
4. Open your deployed URL with ?teacher=1 to open the teacher dashboard.
5. Enter teacher code 7410 and generate a game code. Share that code with teams.

SECURITY NOTE:
Change the teacher PIN in BOTH index.html and netlify/functions/game.mjs before using with students.
The current PIN is 7410, matching the supplied original file.

IMPORTANT:
This package uses Netlify Functions and Netlify Blobs, so it must be deployed to Netlify.
Opening index.html directly as a local file will not provide cross-device synchronization.
