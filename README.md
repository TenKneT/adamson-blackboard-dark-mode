# Adamson Blackboard Dark Mode

An OLED dark theme for Adamson Blackboard on Firefox 140 or newer. It uses black backgrounds, softer colors, and less glaring grade badges. You can turn it off from the extension's toolbar panel, and it remembers your choice.

I vibe-coded this with OpenAI Codex, then worked through bugs using screenshots and feedback from using Blackboard. Local automated checks passed, but Firefox testing is still limited. Some pages may still need fixes.

## Installation

1. Download and extract the extension ZIP from the [GitHub releases page](https://github.com/TenKneT/adamson-blackboard-dark-mode/releases).
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select `manifest.json` from the extracted folder.
4. Open or refresh Adamson Blackboard.

If you're updating, remove the old temporary extension first and refresh your Blackboard tabs afterward.

Firefox removes temporary extensions when it restarts, so you'll need to load it again. Permanent installation requires a [Mozilla-signed version](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/). This release is unsigned.

## Privacy and limits

The extension only runs on `adamson.blackboard.com`. It saves your theme preference locally and changes how the site looks. It doesn't collect or send your personal data, and it doesn't change your grades or submissions.

External tools, PDFs, and document contents aren't themed. Blackboard updates may break parts of the styling. Other browsers and Firefox for Android haven't been tested.

If something looks wrong or feels slow, open an issue with the page name and a screenshot. Hide any personal information before posting.
