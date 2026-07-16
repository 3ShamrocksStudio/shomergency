# SHOMER Native — GitHub Actions Build (the chosen method)

## Why this method
Builds a real native Android APK **in the cloud on GitHub's free servers** — no Mac,
no Android Studio, no local setup. The workflow is written, and the Capacitor project
is validated (builds clean, all 8 plugins including background-geolocation load,
permissions apply). Everything is committed EXCEPT the one workflow file, because the
API token I have lacks GitHub's `workflow` scope (GitHub blocks writing to
`.github/workflows/` without it — a deliberate security restriction).

## The ONE thing to do (2 minutes, in the browser)

The workflow file is ready below. Add it via the GitHub web UI (which has full permission):

1. Go to: https://github.com/3ShamrocksStudio/shomer-app
2. Click **Add file → Create new file**
3. Name it exactly: `.github/workflows/android-build.yml`
4. Paste the contents of `native/android-build-workflow.yml` (committed in the repo)
5. Click **Commit changes**
6. Go to the **Actions** tab → select **Build SHOMER Android APK** → **Run workflow**
7. Wait ~5–8 minutes → download the APK from the run's **Artifacts**

That APK installs on any Android phone and has **background geolocation**.

## After the debug APK works — going to Play Store
The debug APK is for testing. For the Play Store you need:
- A signing keystore (one command, or I can generate the config)
- A Google Play Developer account ($25 one-time — unavoidable, Google requires it)
- Then the workflow builds a signed `.aab` for upload

## Alternative if you'd rather not touch GitHub
Give me a token with `workflow` scope and I'll commit the file + trigger the build
entirely autonomously — you'd only need to download the finished APK.
