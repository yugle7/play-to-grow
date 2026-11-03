# Specification: Child Activity Diary PWA

## 1. Purpose

This document describes the current behavior of the child activity diary PWA.

The app is a mobile-first, offline-capable activity diary for parents of children aged approximately 0 to 12 months. It combines a monthly calendar, an activity entry flow, child-specific statistics, child profile management, and local data management.

The app does not diagnose conditions, assess developmental progress, or replace medical advice.

## 2. Technical constraints

- Use plain HTML, CSS and JavaScript.
- Keep all application logic in `script.js`; do not add JavaScript modules or additional script files.
- Do not use frameworks, libraries, build tools, package managers or external chart libraries.
- Use `localStorage` for user data and `data/activities.json` for the base activity catalogue.
- Keep the app installable and fully usable offline after the first load.
- Use local calendar dates in `YYYY-MM-DD` format.
- Use whole minutes for durations and ISO strings for timestamps.
- Keep all user-visible Russian text in `STRINGS`.
- Preserve existing local data, including older records that lack newer optional fields.

## 3. Navigation and page structure

### 3.1 Bottom navigation

The bottom navigation has five items:

| Item | Behavior |
| --- | --- |
| Calendar | Main page and initial screen |
| Activity | Opens the full-screen activity entry page |
| Statistics | Main page |
| Child | Main page |
| Settings | Main page |

Calendar, Statistics, Child and Settings keep the bottom navigation and the child header visible.

Activity, Search and New Activity are full-screen pages. They hide the bottom navigation and the child header. The user leaves them with their own fixed or header actions.

### 3.2 Page switching

- Pages are separate `section` elements switched through `renderPage(name)`.
- The previous page is hidden, the next page is shown, and the window scroll position is reset.
- Main pages use `width-500`, `safe`, and normal document scrolling with the fixed bottom navigation.
- Full-screen pages use a `.scroll` container with `width-500`, `pad-20`, and `col gap-20`.
- Activity and New Activity add `cta-space` and fixed `fab-round` / `fab-close` actions.
- Search has no fixed bottom action; it uses a back button in its header.
- Pages are not overlays. Activity, Search and New Activity are not sheets or modals.
- The shared options sheet and confirmation dialog are the only overlays.

## 4. Child context header

The global header is shown on Calendar, Statistics, Child and Settings.

It contains:

- the active child's name, which opens the child picker;
- the active child's age;
- a plus button on the Child page for adding another child.

Behavior:

- The child picker uses the shared options sheet.
- Selecting a child updates `activeChildId` and re-renders the current page with child-scoped data.
- Tapping the non-button part of the header opens the Child page.
- The header is hidden on Activity, Search and New Activity.
- A child can also be created from the Calendar or Activity empty state.

## 5. Calendar page

Calendar is the first page displayed on launch.

### 5.1 Layout

The page uses the existing calendar structure:

- month heading with previous and next month buttons;
- weekday headers from Monday to Sunday;
- day buttons in a seven-column grid;
- selected day with a highlighted background and larger number;
- selected date heading;
- daily activity list below the calendar.

The selected date defaults to today. Selecting a day updates the date heading and daily list without changing the month.

### 5.2 Diary entries

A diary entry is a recommendation with saved feedback.

- A recommendation without feedback is not a diary entry.
- The latest feedback for a recommendation is used.
- The entry date is the feedback date.
- The entry duration is the feedback's actual `duration`, falling back to the activity's planned duration for old records.
- The daily list includes completed, partially completed, not completed and skipped entries.
- Days without diary entries show a centered empty state.

### 5.3 Day markers

Only performed activities create day markers. Performed statuses are:

- `completed`;
- `partially_completed`.

For each marked day:

- total duration is the sum of the day's performed diary entries;
- marker size is proportional to total duration, using the largest monthly total as the reference;
- marker size is clamped to 16-36px;
- the marker colour is the duration-weighted dominant developmental area;
- an activity in several areas contributes its duration evenly to each area.

Area colours:

| Area | Colour |
| --- | --- |
| Gross motor | Green |
| Fine motor | Yellow |
| Sensory | Blue |
| Cognitive | Violet |
| Communication | Pink |
| Social and emotional | Sky |

### 5.4 Daily list

Each entry shows:

- activity title;
- duration;
- compact feedback summary;
- status indicator;
- liked-interest or appropriate-difficulty indicator when present;
- reason indicator when present;
- optional comment.

If no child exists, the calendar is hidden and the page shows the add-child welcome state.

## 6. Activity page

### 6.1 Opening, saving and closing

The middle navigation item opens the full-screen Activity page.

- Navigation and child header are hidden.
- The page resolves the selected child's current recommendation for today.
- If no child exists, the welcome/add-child state is shown.
- If no eligible activity exists, an empty explanation is shown; search and creation remain available.
- The fixed Save button is shown when an activity is selected and hidden otherwise.
- Save records feedback and returns to Calendar.
- Close discards the unsaved feedback draft and returns to Calendar.

### 6.2 Activity name and suggestions

The page starts with an activity name input.

- Typing searches normalized activity titles.
- Up to five matching available activities are suggested.
- Suggestions only include activities with `enabled === true` and `safetyReviewed === true`.
- Selecting a suggestion selects that activity for the current child and renders its description.
- Selecting a different activity for today marks the current pending recommendation as `replaced` when necessary, then creates or reuses a recommendation for the selected activity.

### 6.3 Action buttons

Below the input are three icon buttons using the existing input-actions pattern:

| Button | Action |
| --- | --- |
| Search | Opens the full-screen Search page |
| Add | Opens the full-screen New Activity page |
| Refresh | Requests another recommendation for the selected child |

Refresh uses the existing recommendation logic. A pending recommendation is marked `replaced`; completed, partially completed and not-completed recommendations are kept. Replacement is never negative feedback.

### 6.4 Description

The full activity description displays:

- development areas;
- title and description;
- goal;
- recommended age;
- planned duration;
- place and character;
- difficulty;
- skills and interests;
- materials;
- instructions;
- variations;
- safety instructions;
- videos and sources when present.

### 6.5 Feedback form

The form appears when an activity is selected.

Fields:

- status, defaulting to `skipped`;
- interest;
- difficulty;
- actual duration in minutes, defaulting to the planned duration;
- reason;
- optional comment.

The interest and difficulty fields are hidden when the status is `skipped`. The reason field is shown only when the status requires a reason.

Save:

- stores feedback for the current recommendation;
- records actual duration;
- updates the recommendation status;
- updates inferred preferences;
- returns to Calendar with today selected.

Close returns to Calendar without saving.

Skipped feedback is allowed. The feedback status remains `skipped`; the recommendation status becomes `not_completed`.

## 7. Search page

Search is a full-screen page opened from Activity.

Layout:

- header row with a back button and search input;
- horizontally scrollable area filters;
- age, duration and interest filters;
- complete list of available activities;
- empty result state.

Behavior:

- only available activities are listed;
- custom activities are included;
- selecting an activity returns to Activity with that activity selected;
- the back button returns to Activity;
- navigation and the child header remain hidden.

## 8. New Activity page

New Activity is a full-screen page opened from Activity.

Fields:

- title;
- description;
- planned duration;
- minimum and maximum age in months;
- development areas;
- instructions, one step per line;
- safety instructions, one per line.

Validation requires a title, description, at least one development area, instructions, safety text, a positive duration and a valid age range.

The new activity is stored in `data.activities` with the normal activity schema and these defaults:

- goal equals the description;
- empty skill and interest tags;
- medium difficulty;
- no materials;
- either environment and intensity;
- no sources or videos;
- enabled and safety-reviewed flags set to true;
- `custom: true`.

After creation, the activity is selected in the Activity page. Close returns to Activity without adding anything.

Custom activities are included in local storage and data export/import. The creation form is not a specialist safety-review workflow; the safety-reviewed flag should be reconsidered before public release.

## 9. Statistics page

Statistics is a main page for the selected child. It uses plain `.card` sections and `.chart` containers.

All calculations use only the selected child's records. Performed entries are completed or partially completed.

### 9.1 Activity frequency

- Performed entries are grouped by week.
- The chart shows the last eight weeks.
- The card value shows the total number of performed entries for the child.

### 9.2 Time spent

- Actual durations of performed entries are summed by week.
- Planned duration is used when an older feedback record has no actual duration.
- The chart shows the last eight weeks.
- The card value shows total recorded minutes across all performed entries.

### 9.3 Developmental areas

- Performed entries are weighted by duration.
- Multi-area activities split duration evenly across their areas.
- The horizontal chart shows minutes per area, sorted by total.

### 9.4 Consistency

- Active days are days with at least one performed entry.
- The card shows total active days and the longest gap between active dates.
- A 12-week grid shows recent active days and gaps.
- Missed days are neutral and are never treated as failure.

### 9.5 Feedback over time

- All diary entries from the last eight weeks are grouped by week and feedback status.
- The stacked chart shows completed, partially completed, not completed and skipped entries.

### 9.6 Positive feedback

Positive entries are:

- completed entries;
- entries with liked interest;
- entries with appropriate difficulty.

The page lists up to five activities and up to five skills from those entries, ordered by positive-entry count.

This is a summary of recorded feedback only. It does not infer developmental progress.

## 10. Child profile

Each child has:

- `id`;
- `name`;
- `birthDate`;
- optional `dueDate`;
- optional `gender`;
- `createdAt`;
- `updatedAt`;
- `skills`;
- `conditions`.

Age is always calculated from `birthDate`; it is never stored permanently.

### 10.1 Skills

Development areas:

- gross motor;
- fine motor;
- sensory;
- cognitive;
- communication;
- social and emotional.

Skill levels:

- `unknown`;
- `emerging`;
- `developing`;
- `confident`.

The parent can update skill levels. Unknown means not observed, not absent.

### 10.2 Interests

The parent can cycle an interest through like, dislike and no manual mark. Feedback also adjusts inferred preference scores. Manual marks override inferred scores.

### 10.3 Conditions

- preferred duration;
- available materials;
- environment: home, outdoors or either;
- intensity: calm, active or either.

Conditions affect recommendation eligibility and practical scoring. They are optional.

### 10.4 Child management

- A child can be created from the Child page or an empty welcome state.
- The active child is stored in `activeChildId`.
- Deleting a child removes that child's recommendations, feedback and preferences.
- Other children and shared custom activities remain.

## 11. Recommendation engine

### 11.1 Filtering

An activity is eligible when it:

- is a complete catalogue entry;
- has `enabled === true`;
- has `safetyReviewed === true`;
- fits the child's age on the recommendation date;
- fits the selected environment and intensity conditions.

Unobserved skills do not exclude an activity.

### 11.2 Scoring

The weighted score is:

```text
ageFit * 0.20
+ skillFit * 0.20
+ interestFit * 0.20
+ feedbackFit * 0.20
+ diversity * 0.10
+ practicalFit * 0.10
```

Components:

- age fit;
- skill fit, including difficulty shifts from feedback;
- interest fit;
- similarity to liked and disliked activities;
- diversity across recently covered areas;
- practical fit for time and materials.

Recent activities receive repetition penalties over a seven-day window. Novel activities and unexplored interests receive small bonuses.

### 11.3 Current recommendation and replacement

- Recommendations are linked to a child and a date.
- The app uses the last non-replaced recommendation for today.
- If its activity is still available, it is reused.
- If it is unavailable or no longer safety-reviewed, a pending recommendation is marked `replaced` and a new one is selected.
- Refresh replaces a pending recommendation. Finished and not-completed recommendations remain.
- Different activities can be selected manually on the same day, creating additional recommendations and diary entries.
- A replaced recommendation remains stored but is not a diary entry unless it has feedback.

If no activity is eligible, show a supportive empty state. Do not relax age or safety rules.

## 12. Feedback model and preferences

### 12.1 Feedback fields

- `id`;
- `childId`;
- `activityId`;
- `recommendationId`;
- `date`;
- `status`;
- `interest`;
- `difficulty`;
- `reason`;
- `duration`, actual minutes;
- optional `comment`;
- `createdAt`.

The latest feedback for a recommendation is used by the calendar and statistics.

### 12.2 Values

| Field | Values |
| --- | --- |
| Status | `completed`, `partially_completed`, `not_completed`, `skipped` |
| Interest | `liked`, `neutral`, `disliked`, `not_observed` |
| Difficulty | `too_easy`, `appropriate`, `too_hard`, `not_observed` |
| Reason | `no_time`, `no_materials`, `child_not_in_mood`, `not_suitable`, `other` |

Completed and partially completed count as performed.

### 12.3 Recommendation status after saving

- A normal feedback status becomes the recommendation status.
- Skipped feedback stores `not_completed` on the recommendation.

### 12.4 Preference updates

- Liked interest increases preference scores for interest tags and the activity.
- Disliked interest decreases them.
- Not suitable decreases the activity preference score.
- Too easy and too hard shift difficulty preferences for the activity's areas.
- No time, no materials and child mood do not count as negative interest feedback.
- Scores are clamped to -100 to 100.
- Manual marks override inferred scores.
- Reset inferred preferences removes inferred values without deleting diary history or manual marks.

## 13. Data model and storage

### 13.1 Local data

```js
const STORAGE_KEY = "childActivityPlanner";
const DATA_VERSION = 1;
```

```js
{
    version: 1,
    children: [],
    activeChildId: null,
    recommendations: [],
    feedback: [],
    preferences: [],
    settings: {},
    activities: []
}
```

`activities` stores custom activities only. The base catalogue stays in `data/activities.json`.

Older exports without `activities` remain valid. Unreadable local data is preserved under a timestamped backup key and is never silently overwritten.

### 13.2 Child

```js
{
    id,
    name,
    birthDate,
    dueDate,
    gender,
    createdAt,
    updatedAt,
    skills: [{id, level, updatedAt}],
    conditions: {
        duration,
        materials: [],
        environment,
        intensity
    }
}
```

### 13.3 Recommendation

```js
{
    id,
    childId,
    date,
    activityId,
    status,
    createdAt,
    updatedAt
}
```

Statuses include `recommended`, `in_progress`, `completed`, `partially_completed`, `not_completed` and `replaced`.

### 13.4 Preference

```js
{
    childId,
    kind,
    id,
    score,
    manual,
    updatedAt
}
```

Kind is `interest`, `activity` or `difficulty`. Manual is `like`, `dislike` or `null`.

### 13.5 Dates and durations

- Diary dates are local `YYYY-MM-DD` strings.
- Age is calculated from local calendar dates.
- Weeks start on Monday.
- Durations are whole minutes.
- Timestamps are ISO strings.

## 14. Export, import and deletion

Settings provides:

- Export Data: downloads all local app data as JSON.
- Import Data: validates a selected JSON file, asks for confirmation, replaces local data, refreshes the catalogue and opens Calendar.
- Reset Feedback-based Preferences: keeps diary history and manual marks.
- Delete All Data: removes all `childActivityPlanner` keys after confirmation.

Import validation checks:

- data version;
- children, recommendations, feedback and preferences arrays;
- child identity, name, birth date, skills and conditions;
- recommendation links, dates and timestamps;
- preference kinds.

Custom activities are optional in imported data and are accepted as an array.

## 15. Activity catalogue

The base catalogue is `data/activities.json`.

Activities contain:

- id, title, description and goal;
- age range;
- development areas;
- skill and interest tags;
- difficulty;
- planned duration;
- materials;
- environment and intensity;
- instructions;
- optional variations;
- safety instructions;
- safety and enabled flags;
- sources and videos.

Incomplete entries are excluded.

Available activities have `enabled === true` and `safetyReviewed === true`. Only available activities are recommended, searched or suggested.

Custom activities use the same schema and are merged into the catalogue at runtime.

## 16. PWA and offline behavior

- The app has a web manifest, local icons and a service worker.
- The service worker caches the application shell and activity catalogue.
- Cache versioning removes obsolete caches.
- Same-origin GET requests use stale-while-revalidate.
- Saved data in `localStorage` remains available offline.
- External videos and sources are not guaranteed offline.
- No notifications, push subscriptions or reminders are implemented.

## 17. Visual and responsive design

- Use the existing calm, mobile-first visual style.
- Main content is limited to 500px.
- Use safe-area spacing and accessible touch targets.
- Main pages keep the fixed bottom navigation.
- Activity, Search and New Activity use full-screen page layouts.
- Calendar uses the existing seven-column month grid.
- Statistics uses card and chart sections.
- Both light and dark appearance must remain readable.
- The app must work at 320px and 390px without horizontal scrolling.

## 18. Privacy and safety

- All child data remains on the device.
- No analytics, tracking, backend or authentication is used.
- The app must not diagnose, assess developmental delay or replace medical advice.
- Activity completion is not evidence of developmental progress.
- Only activities flagged as available and safety-reviewed are recommended.
- Activity instructions must include relevant safety guidance.
- Adult supervision is required for infant activities.
- Missing days and skipped activities are not failures.
- Use supportive, non-judgmental language.

## 19. Verification

The implementation is complete when these checks pass:

- Calendar opens first and the five navigation items work.
- Activity opens as a full-screen page with navigation and header hidden.
- Activity Save and Close return to Calendar.
- Search opens as a full-screen page, filters available activities, and returns to Activity.
- New Activity is full-screen, validates fields, saves a custom activity and returns to Activity.
- Calendar month navigation and date selection work.
- Completed and partially completed entries create correctly sized, coloured markers.
- The daily list shows titles, durations, status and feedback indicators.
- Skipped and not-completed feedback appears in the daily list without creating markers.
- Activity suggestions, Search, Add and Refresh work.
- Feedback saves status, duration and preferences; the default status is skipped.
- Statistics are scoped to the selected child and show frequency, time, areas, consistency, feedback and positive items.
- Child profiles can be created, edited, switched and deleted.
- Export, import and deletion work, including custom activities.
- The app works offline after the first load.
- Layouts at 320px and 390px have no horizontal overflow.
- Both themes are readable.
- No critical console errors occur.

## 20. Non-goals and limitations

- No medical, diagnostic or developmental-progress claims.
- No backend, account or cross-device synchronization.
- No notifications, reminders or streaks.
- No per-step skipped tracking; skipped is a feedback status and reason.
- No editing or deleting custom activities from the UI.
- No specialist review workflow for custom activities.
- No period selector on Statistics; frequency, time and feedback charts use fixed eight-week windows.
- No external chart library.
- No automatic catalogue imports from external sources.
- A custom activity's safety flag is not a specialist review.

## 21. Implementation rules

- Inspect the current project before changing presentation or navigation.
- Reuse existing page structures, classes and components.
- Keep Activity, Search and New Activity as full-screen pages, not inline panels or modals.
- Keep application logic in `script.js`.
- Preserve the local data key, version and existing user data.
- Do not modify unrelated files.
- Keep changes scoped to the request.
- Review the final diff and verify the app in a browser.
