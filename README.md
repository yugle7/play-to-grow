# Activities with Your Baby

A mobile web application (PWA) for parents of babies aged 0–12 months. Every day, it suggests one suitable activity based on the child's age, skills, and interests. After the activity, the parent briefly records how it went, and future suggestions take this feedback into account.

The app works offline, does not send any data to a server, and stores all information locally on the device.

> **Important.** The activity catalogue in `data/activities.json` is currently for demonstration purposes: all 29 activities have `"safetyReviewed": false`. The app only recommends reviewed activities, so the Today screen will display "No suitable activities for today" until a specialist has reviewed the activities. See Safety Review for details.

## Table of Contents

- Features
- Getting Started
- Project Structure
- Code Architecture
- User Data
- Activity Catalogue
- How the Daily Activity Is Selected
- How Feedback Works
- Offline Mode and Updates
- Translations
- Styling
- Common Tasks
- Pre-release Checklist
- Limitations
- Development Guidelines

## Features

The app supports parents; it does not assess children. It does not diagnose medical conditions, evaluate developmental delays, or replace a paediatrician. Skipping days is perfectly fine: there are no streaks or reminders.

The app has five sections in the bottom navigation:

| Section        | Description                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**      | Today's activity: goal, duration, materials, steps, safety instructions, and videos. "Start" / "Complete" and "Another Activity" buttons.                                  |
| **Activities** | The full catalogue, with search by title and filters by developmental area, age, duration, and interest. Tap an activity to open its full description.                     |
| **History**    | Previously suggested activities and their outcomes. Filters: all, completed, skipped, and developmental area.                                                              |
| **Child**      | Child profile: name, date of birth, estimated due date (optional), age, and gender (optional). Skills, interests, and activity conditions. Multiple children can be added. |
| **Settings**   | Export and import data as JSON, reset feedback-based preferences, and delete all data.                                                                                     |

Typical user flow:

1. The parent creates a child profile by entering the child's name and date of birth.
2. Optionally, the parent adds the child's skills and interests, as well as activity preferences: available time, preferred location, and materials on hand.
3. The Today screen displays one activity. If it is not suitable, the parent taps "Another Activity".
4. The parent taps "Start", does the activity with the child, and then taps "Complete".
5. The parent provides feedback: whether the activity was successful, whether the child enjoyed it, and whether it was too difficult.
6. Future activities are selected based on this feedback.

## Getting Started

All you need is a modern browser. Nothing needs to be installed: there is no `npm`, build process, or dependencies.

### Run Locally

The app must be opened through a local web server. Opening `index.html` directly by double-clicking it (the address will start with `file://`) will prevent the browser from loading the catalogue and enabling offline mode.

The simplest option, if Python is installed:

```
cd play-to-grow
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

Any other static server will also work, such as the Live Server extension for VS Code.

### Run on a Phone

- **On the same Wi-Fi network:** start the server with `python3 -m http.server 8000 --bind 0.0.0.0` and open `http://<computer-IP>:8000` on your phone. The app will work, but offline mode and installation will be unavailable: browsers only allow these features over `https://` or on `localhost`.
- **Full functionality:** upload the folder to any static hosting service that supports HTTPS (GitHub Pages, Netlify, Cloudflare Pages, etc.). No server configuration is required; the app consists of static files.

### Install as an App

- **Android, Chrome:** menu ⋮ → "Install app".
- **iPhone, Safari:** "Share" → "Add to Home Screen".
- **Desktop, Chrome or Edge:** click the install icon in the address bar.

### Preview Recommendations During Development

The Today screen remains empty until the catalogue contains reviewed activities. To see how the recommendation algorithm works, temporarily set `"safetyReviewed": true` for a few activities on your local machine.

**Do not commit this change to the repository**: an activity should only be marked as reviewed after an actual safety review.

## Project Structure

```
play-to-grow/
├── index.html            markup for all screens, bottom sheets, and confirmation dialog
├── styles.css            all styles, light and dark themes
├── script.js             all application logic
├── sw.js                 service worker: offline mode and caching
├── manifest.json         PWA configuration: name, icons, colours
├── data/
│   └── activities.json   activity catalogue
├── sprite.svg            all UI icons in one file
├── favicon.svg           browser tab icon
└── icons/
    └── icon-*.png        192 and 512 px app icons, regular and maskable
```

There are no frameworks, libraries, or build tools: the browser serves the repository files as they are.

## Code Architecture

### One Script with Numbered Sections

All application logic is in `script.js`. It is a regular script without `import` / `export`, divided into sections with comment headers. To find a specific part, search for its section number, for example `// 11. RECOMMENDATIONS`.

| #     | Section           | Contents                                                                                                                                 |
| ----- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | CONSTANTS         | Configuration and dictionaries: developmental areas, skills, interests, materials, recommendation weights, and feedback adjustment steps |
| 2     | TRANSLATIONS      | All UI text (`STRINGS.ru`)                                                                                                               |
| 3     | STATE             | Current screen, catalogue, feedback draft, selected child                                                                                |
| 4     | HELPERS           | Dates, age calculation, `el()`, `debounce`, formatting                                                                                   |
| 5     | DOM ELEMENTS      | References to page elements, looked up once at startup                                                                                   |
| 6     | LANGUAGE          | Inserting translated text into the markup                                                                                                |
| 7     | STORAGE           | `loadData`, `saveData`, `updateData`, `exportData`, `importData`                                                                         |
| 8     | UI COMPONENTS     | Bottom sheets, confirmation dialog, segments, chips                                                                                      |
| 9     | PROFILE           | Children, skills, conditions, manually selected interests                                                                                |
| 10    | CATALOGUE         | Loading `activities.json`, validating activity completeness                                                                              |
| 11    | RECOMMENDATIONS   | Filtering, scoring, and selecting the daily activity                                                                                     |
| 12    | FEEDBACK          | Saving feedback and updating preferences                                                                                                 |
| 13–19 | HEADER … SETTINGS | Rendering each screen and handling button events                                                                                         |
| 20    | NAVIGATION        | Switching sections, `render()` function                                                                                                  |
| 21    | INIT              | Application startup                                                                                                                      |

### What Happens at Startup

```
translatePage()       inserts text from STRINGS into elements with data-i18n
loadData()            loads user data from localStorage
await loadCatalogue() loads data/activities.json
renderPage("today")   displays the Today screen
register("sw.js")     registers the service worker for offline mode
```

### How the UI Is Updated

There is no reactive framework. The rule is simple:

1. All data changes go through `updateData(change)`: the function modifies the `data` object and immediately saves it to `localStorage`.
2. The UI is then re-rendered: `render()` for the entire current screen, or a function for a specific section, such as `renderInterests(child)`.

`render()` re-renders the header with the child selector and the current section. The rendering function for each section can be found in the `renderers` object.

### Safe Text Insertion

Elements are created using the `el(tag, props, ...children)` function. Strings are always inserted into the page as text, not HTML. This means text from the catalogue or a child's name cannot break the page or execute arbitrary code. Do not use `innerHTML` for data.

```
el("li", {}, el("span", {className: "entry-title", textContent: activity.title}));
```

Empty values (`false`, `null`) are skipped, so you can use expressions such as `condition && element`.

### Bottom Sheets and Confirmation Dialog

Bottom sheets (activity details, feedback, child profile) are `.sheet` elements displayed over the `#overlay` backdrop. They are opened and closed using `openSheet()` / `closeSheet()`. Pressing Esc or tapping the backdrop also closes the sheet.

The `#modal` confirmation dialog is displayed with `showModal()`, while short messages are displayed with `showMessage()`.

The sheet markup is in `index.html`, and the styles are in section `10. BOTTOM SHEETS`.

### Debugging in the Browser Console

All functions and variables from `script.js` are available in the DevTools console:

```
data                                    // all user data
catalogue                               // loaded catalogue
activeChild()                           // currently selected child
rankActivities(activeChild(), dateKey()) // all suitable activities with scores, highest first
```

## User Data

### Where Data Is Stored

Everything is stored in the browser's `localStorage` under a single key, `childActivityPlanner`, as one JSON object. You can inspect it in DevTools: Application → Local Storage.

Data is not synchronised between devices or browsers. To transfer it, use "Export Data" and "Import Data" in Settings.

### Data Structure

```
{
    version: 1,             // data format version
    children: [],           // child profiles
    activeChildId: "...",   // currently selected child
    recommendations: [],    // all suggested activities
    feedback: [],           // feedback records
    preferences: [],        // interests and feedback-based preferences
    settings: {}            // reserved for future use
}
```

**Child** (`children[]`):

```
{
    id: "mh2x8k4a1b2c",
    name: "Anya",
    birthDate: "2026-05-21",          // calendar date, no time
    dueDate: "2026-05-21",            // estimated due date, optional, null
    gender: "unspecified",            // unspecified | female | male; does not affect recommendations
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:05:00.000Z",
    skills: [{id: "head_control", level: "developing", updatedAt: "..."}],
    conditions: {
        duration: 0,                  // 0 = any duration; otherwise maximum minutes: 5, 10, 15
        materials: ["rattle", "ball"],
        environment: "either",        // either | home | outdoors
        intensity: "either"           // either | calm | active
    }
}
```

**Age is not stored**: it is calculated from the date of birth whenever needed. The estimated due date is stored separately and does not affect age calculation.

**Recommendation** (`recommendations[]`): one suggested activity for a specific child and date.

```
{
    id: "...", childId: "...", date: "2026-10-30", activityId: "peekaboo-01",
    status: "recommended",  // recommended | in_progress | completed | partially_completed | not_completed | replaced
    createdAt: "...", updatedAt: "..."
}
```

**Feedback** (`feedback[]`):

```
{
    id: "...", childId: "...", activityId: "...", recommendationId: "...", date: "2026-10-30",
    status: "completed",       // completed | partially_completed | not_completed | skipped
    interest: "liked",         // liked | neutral | disliked | not_observed
    difficulty: "appropriate", // too_easy | appropriate | too_hard | not_observed
    reason: null,              // no_time | no_materials | child_not_in_mood | not_suitable | other
    comment: "She laughed",
    createdAt: "..."
}
```

**Preference** (`preferences[]`): one record per child and per preference item.

```
{
    childId: "...",
    kind: "interest",   // interest | activity | difficulty: an interest, a specific activity, or difficulty in a developmental area
    id: "music",        // interest, activity, or developmental area ID
    score: 25,          // feedback-based score, from -100 to 100
    manual: "like",     // parent's manual selection: like | dislike | null (interests only)
    updatedAt: "..."
}
```

### Dates and Time

- **Calendar dates** (`birthDate`, `dueDate`, `date`) are stored as `YYYY-MM-DD` strings in local time. This prevents dates from shifting because of time zones.
- **Timestamps** (`createdAt`, `updatedAt`) are stored in ISO format.
- Day differences are calculated by the `daysBetween` function and are not affected by daylight saving time.
- **Age** (the `ageOf` function) is the number of completed months. If a child was born on the 31st, their monthly birthday falls on the last day of a shorter month.
- Until 3 months, age is displayed in months and weeks (e.g. "1 mo. 2 wk."). Until 2 years, it is displayed in months; after that, in years and months.

### Data Protection

- If saved data cannot be read (for example, because the JSON is corrupted), the app does not overwrite it. Instead, it saves a backup under the key `childActivityPlanner-unreadable-<timestamp>` and starts with an empty data set.
- Imported files are validated first using `isValidImport`. An invalid file does not change anything. The user must confirm before existing data is replaced.
- Deleting all data also requires confirmation.
- Code and catalogue updates do not affect user data.

### Changing the Data Format

Increment `DATA_VERSION` and add a migration from the old format to the new one in `loadData()` (a comment marks the relevant place). Older export files with a lower version must remain importable.

## Activity Catalogue

### Format

`data/activities.json` is an array of activities. Here is an example of one activity:

```
{
  "id": "sound-exploration-01",
  "title": "Exploring Sounds",
  "description": "Discovering gentle sounds using an age-appropriate rattle.",
  "goal": "Encourage auditory attention and interaction.",
  "ageMinMonths": 3,
  "ageMaxMonths": 6,
  "areas": ["sensory", "cognitive"],
  "skillTags": ["auditory_attention"],
  "interestTags": ["music", "sounds"],
  "difficulty": "easy",
  "duration": 5,
  "materials": ["rattle"],
  "environment": "home",
  "intensity": "calm",
  "instructions": ["Sit next to the child.", "Show the rattle."],
  "variations": {"easier": "Make one gentle sound.", "harder": "Make different sounds with pauses."},
  "safety": ["Use an intact toy that is appropriate for the child's age."],
  "safetyReviewed": false,
  "sources": [],
  "videos": [],
  "enabled": true,
  "demo": true
}
```

| Field                          | Description                                                                                                             | Required |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| `id`                           | Unique identifier using Latin characters. **Do not change** IDs of existing activities: they are referenced in history. | yes      |
| `title`, `description`, `goal` | Title, short description, and what the activity helps develop.                                                          | yes      |
| `ageMinMonths`, `ageMaxMonths` | Age range in completed months, inclusive.                                                                               | yes      |
| `areas`                        | Developmental areas; at least one.                                                                                      | yes      |
| `skillTags`, `interestTags`    | Skills and interests (may be empty arrays).                                                                             | yes      |
| `difficulty`                   | `easy`, `medium`, or `challenging`.                                                                                     | yes      |
| `duration`                     | Approximate duration in minutes.                                                                                        | yes      |
| `materials`                    | Required materials; use an empty array if none are needed.                                                              | yes      |
| `environment`                  | `home`, `outdoors`, or `either`.                                                                                        | yes      |
| `intensity`                    | `calm` or `active`.                                                                                                     | yes      |
| `instructions`                 | Ordered steps; at least one.                                                                                            | yes      |
| `safety`                       | Safety instructions; at least one.                                                                                      | yes      |
| `variations`                   | `{easier, harder}`: ways to simplify or make the activity more challenging.                                             | no       |
| `sources`, `videos`            | Links (may be empty arrays).                                                                                            | yes      |
| `safetyReviewed`               | Whether the activity has passed a safety review.                                                                        | yes      |
| `enabled`                      | Whether the activity is enabled.                                                                                        | yes      |
| `demo`                         | Marks demonstration content.                                                                                            | no       |

If an activity is missing a required field, the app skips it and logs `Incomplete activity skipped: <id>` to the console.

### Dictionary: Areas, Skills, Interests, and Materials

**Only** values from the dictionaries may be used. Do not invent new terms on the fly, or the recommendation algorithm and filters will not recognise them.

The dictionaries are at the beginning of `script.js`:

- `AREAS` — 6 developmental areas: `gross_motor`, `fine_motor`, `sensory`, `cognitive`, `communication`, `social_emotional`.
- `SKILLS` — skills grouped by developmental area.
- `INTERESTS` — interests (`music`, `sounds`, `faces`, ...).
- `MATERIALS` — materials (`rattle`, `ball`, `blanket`, ...).

Their Russian labels are in `STRINGS.ru`, under `areas`, `skills`, `interests`, and `materials`.

### Videos and Sources

```
"videos": [
  {"title": "Video title", "url": "https://...", "language": "en", "duration": "3:20", "sourceName": "Channel or website"}
],
"sources": [
  {"title": "Resource title", "url": "https://...", "sourceName": "Organisation"}
]
```

- Links open in a new tab (`target="_blank" rel="noopener noreferrer"`). Links that do not use `http(s)` are not displayed.
- Videos are not embedded in the app or downloaded.
- Do not invent URLs: only add real, verified links. A video does not prove that an activity is safe.

### Safety Review

An activity is eligible for recommendations only when both `"enabled": true` **and** `"safetyReviewed": true`.

Unreviewed activities are visible in the catalogue with an "Unreviewed" label, but are not suggested on the Today screen.

The review process:

1. A specialist checks whether the activity is age-appropriate, whether it poses choking, falling, or overheating risks, whether the safety instructions are complete, and whether it makes any medical claims.
2. The specialist edits the text if necessary and adds genuine sources.
3. The specialist sets `"safetyReviewed": true` and removes `"demo": true`.

Generated (demonstration) activities must not be marked as reviewed without this process. The app should not be made available to families until there are enough reviewed activities for every age from 0 to 12 months.

## How the Daily Activity Is Selected

The algorithm is in section `// 11. RECOMMENDATIONS` in `script.js`. It is simple and predictable: there is no machine learning or external service. The same input data always produces the same result.

### Step 1. Filtering

An activity is excluded if:

- It is disabled (`enabled`) or has not been reviewed (`safetyReviewed`).
- It is not age-appropriate: the child's age falls outside `ageMinMonths…ageMaxMonths`.
- It does not match the parent's selected conditions: for example, "At home" is selected but the activity is outdoors only, or "Calm" is selected but the activity is active.
- It is missing required fields (such activities are already removed when the catalogue is loaded).

An activity is **not** excluded simply because the parent has not yet recorded the related skill.

### Step 2. Scoring

Each remaining activity receives six scores from 0 to 100. These are then combined using the weights in `RECOMMENDATION_WEIGHTS`, which can be adjusted in one place:

| Score                          | Weight | Calculation                                                                                                                                                                                                                             |
| ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Age fit (`ageFit`)             | 0.2    | 100 if the child is in the middle of the activity's age range; 60 at either end.                                                                                                                                                        |
| Skill fit (`skillFit`)         | 0.2    | How relevant the activity's skills are: "emerging" = 100, "sometimes" = 85, "not observed" = 60, "confident" = 40. Also considers whether the activity difficulty is appropriate: feedback such as "too easy" or "too hard" adjusts it. |
| Interest fit (`interestFit`)   | 0.2    | 50 plus half the average score of the activity's interests. A manual "like" adds +100; "dislike" adds -100.                                                                                                                             |
| Feedback fit (`feedbackFit`)   | 0.2    | How similar the activity is to those the child previously liked or disliked. Similarity is based on shared developmental areas, skills, and interests.                                                                                  |
| Diversity (`diversity`)        | 0.1    | Higher when the activity's developmental areas have appeared less frequently in the past 7 days.                                                                                                                                        |
| Practical fit (`practicalFit`) | 0.1    | Whether the activity fits the selected duration and whether the required materials are available. If the parent has not specified which materials are available, they are treated as unknown (70), not unavailable.                     |

### Step 3. Repetition and Novelty

The total score is adjusted as follows:

- **−60** for the same activity if it was suggested within the past 7 days. The penalty decreases over time: it is almost full yesterday and small a week ago.
- **Up to −20** for similar activities suggested within the past 7 days, proportional to their similarity.
- **+10** for an activity that has never been suggested to the child before.
- **+5** for an activity involving an interest the app does not yet know about. This allows the app to occasionally suggest something new instead of focusing only on known preferences.

The activity with the highest final score wins. In case of a tie, the activity appearing first in the catalogue is selected.

You can inspect the scores of all activities in the console using `rankActivities(activeChild(), dateKey())`.

### One Activity per Day

- The daily activity is selected once for each child and date, then saved. It remains the same after the app is restarted.
- "Another Activity" replaces the current activity. The previous one remains in history with the `replaced` status. Replacement **does not count** as negative feedback. Activities already suggested today are not suggested again until the remaining options have been exhausted.
- If the daily activity has already been completed, the button changes to "One More Activity", and the completed activity remains completed.
- If the daily activity is removed from the catalogue or its review status is revoked, it is replaced with a new one.
- If nothing is suitable, the app explains why and suggests opening the catalogue or changing the conditions.

## How Feedback Works

Feedback logic is in section `// 12. FEEDBACK`. After tapping "Complete", a short form appears with the outcome, the child's interest, difficulty, the reason (if the activity was unsuccessful), and an optional comment.

| Response                                              | Effect                                                                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| "Liked it"                                            | +25 to each of the activity's interests and +25 to the activity itself.                                                               |
| "Didn't like it"                                      | −25 to the same items.                                                                                                                |
| "Neutral", "Not observed"                             | No change.                                                                                                                            |
| "Too hard"                                            | −50 to the difficulty score in each developmental area covered by the activity. More easy activities will be suggested in the future. |
| "Too easy"                                            | +50: somewhat more challenging activities will be suggested in the future.                                                            |
| Reason: "Not suitable"                                | −25 to the activity itself.                                                                                                           |
| "No time", "No materials", "Not in the mood", "Other" | **No change**: these reasons do not mean the child disliked the activity.                                                             |
| "Skipped"                                             | Interest and difficulty are not asked about or changed.                                                                               |

Rules:

- Scores accumulate within the range of −100 to 100. Three negative feedback entries have a greater effect than one, but an activity or interest is never permanently excluded.
- **The parent's manual selection always overrides feedback-based preferences.** In the profile, one tap on an interest marks it as "like", a second as "dislike", and a third removes the selection. The ↑ and ↓ indicators next to interests show what the app has inferred from feedback (starting at ±25).
- "Reset Feedback-based Preferences" in Settings clears the inferred preferences for the selected child. History and manual selections are preserved.
- Skipped days have no effect.

For feedback marked as "Skipped", the recommendation itself receives the `not_completed` status: the recommendation status list does not have a separate `skipped` value. The feedback record stores `skipped`, and the UI displays "Skipped".

## Offline Mode and Updates

Offline functionality is handled by `sw.js` (the service worker).

- On the first load, it caches all application files listed in `APP_SHELL`, including the catalogue.
- On subsequent loads, each file is served from the cache first (which is fast and works offline), while a fresh version is downloaded in the background. This means **changes appear from the second time the app is opened**. An already open page is never reloaded automatically.
- External links (videos and sources) are not cached and cannot be opened without an internet connection.

**When releasing a new version**, increment `CACHE_VERSION` in `sw.js` (for example, `"13"` → `"14"`). The old cache will then be deleted, and the files will be downloaded again. If you add a new file, include it in `APP_SHELL`.

User data is stored in `localStorage`, not in the cache, so app updates do not affect it.

## Translations

The interface is currently available only in Russian, but the code is ready for additional languages:

- All UI text is stored in `STRINGS.ru` in `script.js`. The code accesses it through `S.keyName`.
- Text is inserted into the markup using attributes: `data-i18n` (element text), `data-i18n-aria-label` (`aria-label`), and `data-i18n-placeholder`.
- Text containing numbers or names is implemented as functions, for example `deleteChildQuestion: (name) => ...`.
- Dates are formatted using browser APIs (`toLocaleDateString`, `Intl.RelativeTimeFormat`) according to `S.locale`.

To add a language, copy the `ru` object inside `STRINGS` under a new language code (for example, `en`), translate its values, and select the language using the `LANG` constant.

The activity descriptions in `activities.json` are currently available only in Russian.

## Styling

All styles are in `styles.css`, also organised into sections.

- **Colours** are defined as variables at the beginning of the file (`--bg`, `--text`, `--accent`, etc.). The light and dark themes switch automatically based on the system setting (`prefers-color-scheme`). Do not hardcode new colours in CSS rules; add variables instead.
- **Contrast** of the main text has been checked in both themes. Accent and secondary colours come from the boilerplate palette; recheck contrast whenever they are changed.
- **Signature detail** — the "blocks" from the app icon: step numbers displayed on coloured blocks (`.steps`) and coloured squares for developmental areas (`.area-*`). The rest of the design is intentionally understated.
- **Layout** — a column up to 500 px wide (`.width-500`), bottom navigation that accounts for the safe area, and bottom sheets up to 560 px wide.
- **Components** — pill-shaped buttons (`.tap`, `.tap.selected`), compact chips (`.tap.chip`), segments (`.segment`), input fields (`.input`), bottom sheets (`.sheet` / `.sheet.full`), dialog (`.dialog`), and list selection: a `.select` button opens a shared, centred bottom sheet with `.option` items. The child selector includes an "Add Child" button. There is no need to create similar new elements: look for an existing class first.
- **Fonts** — system fonts only, with no downloaded font files; base font size is 18 px.
- **Icons** are stored in `sprite.svg` and included as follows: `<svg><use href="sprite.svg#name"></use></svg>`.
- **Input fields** must be at least 16 px, otherwise iPhones automatically zoom in when they are tapped.
- All interactive elements have a visible focus outline for keyboard navigation (`:focus-visible`).
- **Animations** are used only when bottom sheets appear and are disabled when the system setting "Reduce Motion" is enabled.

## Common Tasks

### Add an Activity

1. Copy an existing activity in `data/activities.json` and give it a new unique `id`.
2. Fill in the fields using only values from the dictionaries (`AREAS`, `SKILLS`, `INTERESTS`, `MATERIALS`).
3. Keep `"safetyReviewed": false` until the activity has been reviewed.
4. Open the Activities section and make sure the activity appears and there are no warnings in the console.

### Add a New Interest or Material

1. Add an ID to `INTERESTS` or `MATERIALS` at the beginning of `script.js`.
2. Add its label to `STRINGS.ru.interests` or `STRINGS.ru.materials`.
3. Use the new ID in activities.

Skills are added in the same way, using `SKILLS` and `STRINGS.ru.skills`.

### Change the Recommendation Logic

- Scoring weights are defined by `RECOMMENDATION_WEIGHTS`.
- Penalties and bonuses: `SAME_ACTIVITY_PENALTY`, `SIMILAR_ACTIVITY_PENALTY`, `NOVELTY_BONUS`, `EXPLORE_BONUS`, `HISTORY_DAYS`.
- Feedback impact: `PREFERENCE_STEP`, `DIFFICULTY_STEP`.

After making changes, run `rankActivities(activeChild(), dateKey())` in the console to see how the ranking has changed.

### Release a New Version

1. Increment `CACHE_VERSION` in `sw.js`.
2. Upload the files to your hosting service.
3. Open the app twice: the new version should appear on the second load.

### Start with a Clean Data Set

DevTools → Application → Local Storage → delete the `childActivityPlanner` key.

Alternatively, in the app, go to Settings → "Delete All Data".

If the app gets stuck on an old version: DevTools → Application → Storage → Clear site data.

**This will also delete user data.**

## Pre-release Checklist

There are no automated tests in the repository. Before releasing, go through this checklist manually:

- Create, edit, and delete a child. Check that age is calculated correctly.
- Add skills, interests, and conditions. Make sure everything is still there after reloading.
- With two children, each child has their own daily activity, history, and interests.
- The daily activity remains unchanged after reloading; "Another Activity" does not suggest the current activity again.
- Tap "Start", switch to another screen, and return: the status is preserved.
- Feedback is saved and appears in History; "No time" does not change interests.
- Catalogue search and all filters work; activity descriptions open correctly.
- Test export, import (including rejecting an invalid file), and deleting all data.
- Test offline mode: open the app, turn off the network, reload, and make sure everything still works.
- Check a 320 px viewport, a regular phone, and a desktop; both light and dark themes; no horizontal scrolling.
- No errors appear in the browser console.
- The app can be installed (Chrome → DevTools → Application → Manifest, with no errors).

## Limitations

- The catalogue is for demonstration purposes and has not been reviewed by a specialist. There are no sources or videos yet.
- Activity descriptions are available only in Russian.
- Submitted feedback cannot be edited.
- Data is stored in one browser on one device. There is no synchronisation, only export and import.
- There are no reminders or notifications (this is intentional in the first version).
- The app has been tested in Chrome using mobile emulation. It should also be tested on real iPhones and Android devices, including Safari and Firefox.

## Development Guidelines

A summary of `AGENTS.md` and `CLAUDE.md` in the repository root:

- Use only HTML, CSS, and JavaScript. No libraries, frameworks, build tools, or `package.json`.
- Keep all logic in `script.js`, without `import` / `export` or additional JavaScript files.
- Make minimal changes that address the task. Do not rewrite working code "while you're at it".
- Keep the code simple: avoid unnecessary abstractions, excessive defensive checks, and duplication.
- Follow the surrounding code style: arrow functions, `const`, text through `S`, and elements through `el()`.
- Review `git diff` and test the app in a browser before committing.

Resolve the catalogue-count inconsistencyClarify the empty Today screen workflow