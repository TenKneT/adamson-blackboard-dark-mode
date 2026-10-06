# Adamson Blackboard Dark Mode

A Firefox desktop extension for `https://adamson.blackboard.com/`. Version 1.1.3 uses an OLED palette: true black pages, near-black surfaces, muted links, and readable grade badges. Designed for Firefox 140 or later. Dark mode starts enabled. Use the extension's toolbar panel to switch back to Blackboard's original theme. The setting is saved on your device and updates open Blackboard pages and matching frames.

## Updating the previous version

In Firefox's `about:debugging#/runtime/this-firefox` page, remove the previous temporary copy. Choose **Load Temporary Add-on**, select `adamson-blackboard-oled-v1.1.3.zip`, and refresh all open Blackboard tabs so each page uses the new script. The add-on ID remains the same.

This update reduces the extension's work during hover and navigation. Pointer and focus changes now inspect only the elements actually entered or left, without rescanning their descendants. Larger scans run in small background batches; unchanged color attributes are retained. Turning dark mode off cancels queued work. The OLED colors and earlier visual fixes remain in place.

## Use it now

This package is unsigned. For a temporary installation:

1. Open Firefox and enter `about:debugging#/runtime/this-firefox` in the address bar.
2. Choose **Load Temporary Add-on**.
3. Select `adamson-blackboard-oled-v1.1.3.zip`. Alternatively, extract it and select `manifest.json` in the extracted folder.
4. Open or refresh Adamson Blackboard. If Firefox asks for site access, allow it for `adamson.blackboard.com`.
5. Open the extension from Firefox's Extensions menu. Use the **Dark mode** switch to turn the theme on or off. You can pin the extension to the toolbar.

Firefox removes temporary add-ons when it restarts. Load the package again to continue using it. Mozilla explains this workflow in its [temporary installation guide](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/).

## Permanent installation

Regular Firefox requires a Mozilla-signed package for a permanent installation. This ZIP has not been signed or submitted to Mozilla.

To obtain a signed copy, sign in to the [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/), submit this ZIP, and choose self-distribution (unlisted) if it is for personal use. Complete Mozilla's validation and review process, then download and install the signed `.xpi` that Mozilla provides. See Mozilla's [signing and distribution guide](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

## Scope and privacy

- Requests access only to `https://adamson.blackboard.com/*` and extension-local storage.
- Stores one preference, `adamsonDarkEnabled`.
- Reads element and pseudo-element styles to recolor neutral backgrounds, text, and borders. It does not read text content, input values, credentials, messages, or grades.
- Contains no telemetry, network requests, remote code, or third-party libraries.
- Changes presentation in your browser. It does not modify assignments, submissions, account settings, or Blackboard's server.
- Turning it off disables every theme rule and restores the site's original styles.

## Coverage

The live inspection covered all main sections: Activity, Institution Page, Courses, Calendar, Messages, Grades, Tools, and Profile. Representative course navigation views were also inspected: Content, Calendar, Announcements, Discussions, Gradebook, Messages, Groups, and Achievements. Additional inspected states included revealed Activity grades, the Activity filter menu, Calendar day/month/due-date views, and the notification settings drawer. No settings were saved and no assessments were started or submissions opened.

Version 1.1.2 adds inspection of the in-course Courses switcher and attendance panel in English Proficiency. These were closed after inspection and the original Activity page was restored.

The theme overrides Blackboard's component color variables and adapts hard-coded neutral colors in legacy or dynamically loaded components, including pseudo-element decorations. Images and video are not inverted. Course markers keep distinct hues with reduced brightness. All 12 grade states use dark tinted fills and muted, readable status text. The shared grade color variables are muted as well.

Same-site HTML frames can receive the theme. External tools, embedded third-party sites, browser PDF viewers, and the contents of document attachments remain outside its scope. Blackboard updates or custom instructor formatting may require further adjustments.

## Responsiveness

Live inspection found that the previous hover handler could rescan more than 650 Activity elements when entering a section heading. It removed and recreated color hints for every element in that subtree.

The new handler inspects at most five ancestors of each event target, stops at ancestors shared with the previous pointer or focus target, and processes no more than 12 elements per animation callback. New content and class/style changes use a lazy tree walk in 16-element batches with a soft four-millisecond work budget and a hard cap of eight batches per callback. Background work uses [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) with a timeout, or a timer fallback. Existing hints are temporarily suppressed only where needed and changed only when their values differ. Borders with no visible line receive no hints. Loading an unchanged preference no longer starts another page scan.

An instrumented local comparison against version 1.1.2 found about 99% fewer style reads during heading hover on an Activity-sized sample. The reduction also held for a larger sample. These measurements describe extension work on local sample pages, not overall Blackboard speed or network performance. Ordinary unknown descendant hover styles may require a targeted CSS rule; the known Activity, course, menu and grade states retain their explicit overrides.

## Verification

The live Adamson site was inspected through its existing signed-in browser session. No authentication or security control was bypassed.

For version 1.1.1, the Filter label, revealed Activity scores, and empty Grades panels were inspected again on the live site. This identified two white background gradients and transparent score borders that the previous theme had made visible.

For version 1.1.2, live inspection found that the Courses switcher uses a full-screen MUI modal with `role="dialog"` and a transparent backdrop. The earlier broad dialog rule made that whole layer opaque. Attendance uses a separate `attendance-grade-pill` class, so the existing grade rules missed its bright green fill.

The extension's actual CSS, content script, and popup were exercised in local sample pages using simulated Firefox storage APIs. The available Chromium browser passed the existing 63 behavior checks. These include transparent course switcher layers, dark menu panels, course selection and dismissal, ordinary translucent backdrops, legacy dialogs, readable attendance scores, the earlier screenshot regressions, all 12 grade states, dynamic content, focus-triggered pseudo-elements, unchanged image filters, saved-off initialization, theme restoration, and storage failures. Grade and attendance text meet a contrast ratio of at least 4.5:1 against their fills. The sample page reproduces the inspected classes, gradients, nested score borders and full-screen course switcher structure; it contains no account content. Keyboard operation and overflow checks from the previous build remain applicable to the unchanged popup.

An additional 39 performance and lifecycle checks exercise small and larger pages, movement within a row, inherited color changes, pseudo-elements, timer fallback, and disabling with a large scan queued. All 102 checks passed. Instrumented callbacks stayed below the 50-millisecond long-task threshold in the measured runs. Test instrumentation is outside the extension package.

The update has not been rendered inside Firefox itself, and its actual extension APIs have not been tested. In the earlier build, launching an isolated Firefox test process was rejected by automatic approval review because the session disables process approval. The package still needs testing in Firefox and Mozilla signing before permanent distribution.

All executable JavaScript is readable, unbundled source. There is no build step.
