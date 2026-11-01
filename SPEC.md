# Specification: Child Activity Planner PWA

## 1. Project overview

Develop a mobile-first Progressive Web Application (PWA) that helps parents choose suitable daily activities for their children.

The application maintains a child profile, recommends one personalized activity every day, collects feedback after activities, and uses this feedback to improve future recommendations.

The application is intended to support parents in everyday interactions and play. It is not a medical application and must not diagnose developmental conditions or assess developmental delays.

### Main user scenario

1. A parent creates a child profile.
2. The parent enters the child's date of birth, skills, interests and preferences.
3. The application recommends an activity for the current day.
4. The parent reads the instructions and optionally watches a related video.
5. The parent performs the activity with the child.
6. The parent provides feedback.
7. The application updates its understanding of the child's interests and preferences.
8. Future recommendations take this information into account.

The main goal is to make choosing an appropriate activity effortless for the parent.

## 2. Technical requirements

- Use plain HTML, CSS and JavaScript.
- Do not use frameworks, libraries or external dependencies.
- Do not introduce a build system or bundler.
- Use browser-native APIs.
- The application must work as an installable PWA.
- The application must support offline usage.
- Store user data locally using `localStorage`.
- Store the activity catalogue in a separate JSON file.
- Do not require a backend, authentication or an internet connection for core functionality.
- External video links may require an internet connection.
- Use UTF-8 encoding.
- Interface language: Russian. Structure the code so that localization can be added later.
- Use modern JavaScript and arrow functions.
- Prefer simple, readable implementations over abstractions and unnecessary complexity.
- Avoid duplicating logic.
- Keep the implementation compact but maintainable. Put application logic in `script.js` unless separating a module provides a clear benefit.
- Do not introduce unnecessary validation, state management or defensive code.
- Do not modify unrelated functionality or refactor working code without a clear reason.

If an existing project is provided, inspect its structure and conventions first. Preserve existing working code, naming and design decisions wherever possible.

## 3. Application structure

The application should have the following main sections:

1. Today — today's recommended activity.
2. Activities — activity catalogue.
3. History — completed and skipped activities.
4. Child — child profile and development observations.
5. Settings — application settings and data management.

Use a compact bottom navigation on mobile.

The application should support one or more child profiles. The parent can switch between profiles. Each child must have an independent activity history and recommendation state.

## 4. Child profile

Each child profile must contain the following information.

### 4.1. Basic information

- `id` — unique identifier.
- `name` — child's name.
- `birthDate` — date of birth in YYYY-MM-DD format.
- `gender` — optional: male, female or unspecified.
- `createdAt` — creation timestamp.
- `updatedAt` — last modification timestamp.

Calculate the child's current age automatically from the date of birth.

Display age in months for children under two years, with weeks where useful for younger infants.

Do not store age as a permanent field. Calculate it from the date of birth.

Gender must not determine activity eligibility or significantly affect recommendations by default. Activities should be suitable for children regardless of gender unless there is a specific, justified reason otherwise.

### 4.2. Development areas

Track the child's development in the following areas:

- `gross_motor` — gross motor skills.
- `fine_motor` — fine motor skills.
- `sensory` — sensory development.
- `cognitive` — cognitive development.
- `communication` — communication and early language.
- `social_emotional` — social and emotional development.

Each area can contain individual skills.

Each skill must have:
- `id`;
- `level`;
- `updatedAt`.

Possible skill levels:

- `unknown` — not observed.
- `emerging` — beginning to appear.
- `developing` — observed occasionally.
- `confident` — consistently demonstrated.

The parent can update skill levels manually.

Do not automatically infer that a child cannot perform a skill simply because the parent has not observed it.

The application must not present skill levels as a medical or standardized developmental assessment.

### 4.3. Interests and preferences

Store the parent's observations of the child's interests.

Examples:
- music and sounds;
- faces and communication;
- moving objects;
- colorful objects;
- books and pictures;
- different textures;
- water;
- movement and active play;
- calm activities.

Preferences should be represented using tags.

The parent must be able to add or remove preferences manually.

The application should also update preference scores based on feedback from completed activities.

### 4.4. Activity conditions

Store optional preferences affecting activity selection:

- preferred activity duration;
- available materials;
- preferred environment: home, outdoors or either;
- preferred activity intensity: calm, active or either.

These fields should not be mandatory during initial profile creation.

## 5. Activity catalogue

All activities must be stored in `data/activities.json`.

An activity is a predefined, structured item. Do not generate activities dynamically using LLMs.

### 5.1. Activity data structure

Each activity must contain:

- `id` — unique identifier.
- `title` — activity name.
- `description` — short description.
- `goal` — what the activity is intended to support.
- `ageMinMonths` — minimum recommended age.
- `ageMaxMonths` — maximum recommended age.
- `areas` — development areas.
- `skillTags` — related skills.
- `interestTags` — related interests.
- `difficulty` — easy, medium or challenging.
- `duration` — estimated duration in minutes.
- `materials` — required materials.
- `environment` — home, outdoors or either.
- `intensity` — calm or active.
- `instructions` — ordered list of steps.
- `variations` — optional simpler and more challenging versions.
- `safety` — safety instructions.
- `safetyReviewed` — whether the activity has been reviewed for safety.
- `sources` — external information sources.
- `videos` — related video links.
- `enabled` — whether the activity is available for recommendations.

Example:

```json
{
  "id": "sound-exploration-01",
  "title": "Exploring different sounds",
  "description": "Introduce the child to gentle sounds using a suitable rattle.",
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
  "instructions": [
    "Position yourself near the child.",
    "Show the rattle.",
    "Make a gentle sound and observe the child's reaction.",
    "Pause and repeat while the child remains interested."
  ],
  "variations": {
    "easier": "Use only one gentle sound.",
    "harder": "Introduce different sounds with pauses between them."
  },
  "safety": [
    "Use an age-appropriate, undamaged toy.",
    "Keep small objects out of the child's reach."
  ],
  "safetyReviewed": false,
  "sources": [],
  "videos": [],
  "enabled": true
}
```

This is an example of the data structure, not a pre-approved activity. Activities must be reviewed before being enabled for recommendations.

### 5.2. Development areas and tags

Use a consistent set of development areas and tags.

Do not create arbitrary tags every time an activity is added.

The same tags must be used in:
- activity definitions;
- child preferences;
- feedback processing;
- recommendation scoring.

### 5.3. Activity safety

Safety is a mandatory requirement.

Only recommend activities where `enabled === true` and `safetyReviewed === true`.

Each activity must include relevant safety instructions.

Activities must be age-appropriate and must not expose children to choking hazards, unsafe movement, falls, overheating or other foreseeable risks.

All activities involving infants require active adult supervision.

Do not create medical, therapeutic or diagnostic claims.

Never treat an external video as proof that an activity is safe.

### 5.4. Videos and external sources

An activity may contain multiple video links.

Each video should contain:

- `title`;
- `url`;
- `language`;
- `duration` (optional);
- `sourceName`.

Each source should contain:

- `title`;
- `url`;
- `sourceName`.

Display video links within the activity details.

Open external links in a new tab using `target="_blank"` and `rel="noopener noreferrer"`.

Do not download or redistribute third-party videos.

Do not embed arbitrary external video players in the application.

Do not invent video URLs or claim that a source has been verified when it has not.

## 6. Daily recommendations

The application must select one primary activity for each child for the current day.

The recommendation algorithm must be implemented in plain JavaScript and must not depend on an external AI service.

### 6.1. Recommendation pipeline

The recommendation algorithm consists of three steps.

**Step 1: Filter activities**

Exclude activities that:
- are disabled;
- have not passed safety review;
- do not match the child's age;
- are incompatible with the parent's selected conditions;
- have missing mandatory information.

Activities must not be excluded solely because a related skill has not yet been observed.

**Step 2: Calculate activity scores**

Rank the remaining activities according to:

- `AgeFit` — suitability for the child's age.
- `SkillFit` — relevance to the child's current skill profile.
- `InterestFit` — relevance to the child's interests.
- `FeedbackFit` — similarity to activities that the child previously enjoyed.
- `Diversity` — contribution to balanced activities across development areas.
- `PracticalFit` — suitability for available time, materials and environment.

Use a weighted scoring formula:

```text
score =
    ageFit       * W_AGE +
    skillFit     * W_SKILL +
    interestFit  * W_INTEREST +
    feedbackFit  * W_FEEDBACK +
    diversity    * W_DIVERSITY +
    practicalFit * W_PRACTICAL
```

Initial weights:

```js
const RECOMMENDATION_WEIGHTS = {
    age: 0.20,
    skill: 0.20,
    interest: 0.20,
    feedback: 0.20,
    diversity: 0.10,
    practical: 0.10
};
```

The weights should be centralized and easy to adjust.

All scoring components should use a consistent range, preferably 0–100.

The algorithm must remain understandable and predictable. Do not introduce machine learning or complex statistical models.

**Step 3: Apply diversity and repetition rules**

- Avoid recommending the same activity repeatedly.
- Reduce the score of activities similar to recently completed activities.
- Prefer development areas that have received less attention recently.
- Balance familiar activities with new experiences.
- Do not recommend only activities that match existing preferences.
- Occasionally introduce new activity types to explore possible interests.

Use the activity history for at least the previous seven days when calculating repetition penalties.

### 6.2. Daily recommendation persistence

A recommendation must be associated with a specific child and calendar date.

Once a recommendation has been generated for a child on a given day, keep it unchanged when the application is reopened.

Do not silently generate a different recommendation on every page load.

The parent can request another recommendation explicitly.

When a recommendation is replaced:
- preserve the previous recommendation in history;
- do not treat replacement as a negative activity evaluation;
- avoid immediately showing the same activity again.

### 6.3. Empty states

If there are no eligible activities:
- do not recommend an activity that violates age or safety restrictions;
- explain that there are currently no suitable activities;
- allow the parent to browse the catalogue;
- provide an appropriate message rather than showing an error.

## 7. Activity feedback

After an activity, the parent can provide feedback.

Feedback should be quick and require minimal interaction.

### 7.1. Feedback fields

Store:

- `id`;
- `childId`;
- `activityId`;
- `recommendationId`;
- `date`;
- `status`;
- `interest`;
- `difficulty`;
- `reason`;
- `comment` (optional).

Possible `status` values:

- `completed`;
- `partially_completed`;
- `not_completed`;
- `skipped`.

Possible `interest` values:

- `liked`;
- `neutral`;
- `disliked`;
- `not_observed`.

Possible `difficulty` values:

- `too_easy`;
- `appropriate`;
- `too_hard`;
- `not_observed`.

Possible reasons for not completing:

- `no_time`;
- `no_materials`;
- `child_not_in_mood`;
- `not_suitable`;
- `other`.

### 7.2. Feedback processing

Feedback must affect future recommendation scores.

Rules:

- Positive feedback increases the preference score for the corresponding interest tags and related activities.
- Negative feedback decreases the preference score for related activities and tags.
- Neutral feedback does not significantly change preferences.
- Too difficult activities should increase the likelihood of simpler alternatives.
- Too easy activities may increase the likelihood of slightly more challenging alternatives.
- Not completed because of lack of time or materials must not be treated as negative interest feedback.
- Repeated negative feedback should have a stronger influence than a single response.

The system must not permanently exclude a category based on a single negative response.

### 7.3. Manual preference management

The parent must be able to review and modify automatically inferred preferences.

Manual changes should take priority over inferred preferences.

The user must be able to reset inferred preferences without deleting the activity history.

## 8. Today screen

The Today screen is the primary application screen.

It must display:

- selected child;
- child's current age;
- current date;
- primary recommended activity;
- activity goal;
- duration;
- required materials;
- short instructions;
- link to full activity details;
- related videos;
- button to start or complete the activity;
- button to request another recommendation.

The screen should make the recommended activity immediately understandable.

### Activity state

An activity recommendation can have the following states:

- `recommended`;
- `in_progress`;
- `completed`;
- `partially_completed`;
- `not_completed`;
- `replaced`.

The parent should be able to leave an activity and return to it later without losing its state.

After completion, show the feedback interface.

## 9. Activities screen

Display the activity catalogue.

Provide:
- search by activity name;
- filtering by development area;
- filtering by age;
- filtering by duration;
- filtering by interests;
- access to activity details.

Do not show disabled or unreviewed activities as recommendations.

If such entries are included in an administrative or draft catalogue, clearly distinguish them from activities available to the user.

## 10. History screen

Display the child's activity history.

Each history item should show:
- date;
- activity title;
- activity status;
- feedback, if provided.

Allow opening the original activity details.

Provide simple filters:
- all;
- completed;
- skipped;
- by development area.

Do not require the parent to complete every recommended activity.

Missing days must not be treated as negative feedback.

## 11. Child screen

Display the child's profile and allow editing.

Sections:
- basic information;
- development areas and skills;
- interests and preferences;
- activity conditions.

Show the current state of observed skills.

Keep the interface simple. Do not present the child profile as a scorecard or ranking.

## 12. Settings and local data management

Provide the following options:

- export all application data to a JSON file;
- import previously exported JSON data;
- delete all application data;
- reset automatically inferred preferences.

Data export must include:
- child profiles;
- skill observations;
- preferences;
- feedback;
- recommendation history;
- application data version.

Validate the file format before importing.

Do not silently overwrite existing data during import. Ask the user to confirm the action.

Show a clear confirmation before deleting all data.

## 13. Data model and persistence

Use `localStorage` as the primary storage mechanism.

Store application data in a single versioned object under a clearly named key, for example:

```js
const STORAGE_KEY = "childActivityPlanner";
```

Suggested structure:

```js
{
    version: 1,
    children: [],
    activeChildId: null,
    recommendations: [],
    feedback: [],
    preferences: [],
    settings: {}
}
```

The activity catalogue should remain a separate static JSON file.

Do not duplicate the catalogue in `localStorage`.

All data access should go through a small storage layer with functions such as:

```js
loadData()
saveData()
updateData()
exportData()
importData()
```

Initialize default data only when no existing data is available.

Include a data version field and keep future migration in mind.

Do not delete existing user data when changing application code or catalogue contents.

Use unique IDs for entities.

Use timestamps consistently.

Store dates representing calendar days as local date strings (`YYYY-MM-DD`) rather than relying on UTC conversion.

Calculate age using calendar dates and completed months. Avoid timezone-related date errors.

## 14. PWA requirements

Create the following PWA files:

- `index.html`;
- `styles.css`;
- `script.js`;
- `manifest.json`;
- `sw.js`;
- `icons/`;
- `data/activities.json`.

The app must:
- be installable;
- have application name and icons;
- work offline after the first successful load;
- cache the application shell and local catalogue;
- load previously saved user data offline;
- handle service worker updates without unnecessary disruption.

Use a cache version constant in `sw.js`.

When the cache version changes, remove obsolete application caches.

External videos and websites do not need to work offline.

Do not request notification permissions automatically.

Push notifications and daily reminders are outside the initial implementation scope.

## 15. User interface and visual design

Use a modern, minimalistic, mobile-first design.

The application should feel calm, friendly and suitable for parents of young children.

Design principles:

- clear visual hierarchy;
- compact navigation;
- readable typography;
- comfortable touch targets;
- consistent spacing;
- simple icons;
- restrained use of colors;
- no unnecessary decoration;
- avoid excessive cards and borders;
- important information must be visible without excessive scrolling.

The Today screen should prioritize the activity itself.

Instructions should be easy to read while the parent is interacting with the child.

Use responsive CSS and support both narrow mobile screens and desktop browsers.

Avoid horizontal scrolling.

The application should remain usable on devices with different screen sizes.

## 16. Application architecture and JavaScript organization

Use a simple architecture with clearly separated responsibilities.

Suggested logical modules:

- storage — loading and saving data;
- profile — managing children and skills;
- activities — loading and accessing the activity catalogue;
- recommendations — filtering, scoring and selecting activities;
- feedback — storing and processing feedback;
- ui — rendering screens and handling user interactions;
- app — initialization and navigation.

These are logical responsibilities, not a requirement to create a separate file for every module.

Prefer a small number of files.

Avoid:
- unnecessary classes;
- complex inheritance;
- excessive abstraction;
- generic frameworks;
- repeated DOM queries when references can be reused;
- duplicate rendering or validation functions;
- excessive use of global variables.

Use `textContent` for user-provided and catalogue text instead of inserting untrusted strings through `innerHTML`.

Ensure external URLs use safe link attributes.

Handle errors where they can affect data integrity or user experience.

## 17. Privacy and safety

All child profile information must remain on the user's device in the first version.

Do not send personal data to external services.

Do not add analytics or tracking services.

Provide clear information that data is stored locally and is not automatically synchronized between devices.

The application must not:
- diagnose medical conditions;
- assess developmental delays;
- replace pediatric advice;
- make unsupported claims about the effectiveness of activities;
- create pressure to perform activities every day.

Use supportive, non-judgmental language.

## 18. Initial content requirements

The initial application is intended for children aged 0–12 months.

The activity catalogue should be designed to support this complete age range, with activities distributed across:
- gross motor development;
- fine motor development;
- sensory development;
- cognitive development;
- communication;
- social-emotional development.

Create a small initial demonstration catalogue if necessary, but clearly distinguish demonstration content from reviewed content.

Never mark generated sample activities as safety-reviewed.

The application must not be considered ready for real families until it has a sufficient set of reviewed activities covering the supported age groups.

Content management can initially be performed by editing the JSON catalogue manually. An administration interface is not required.

## 19. Implementation order

Implement the application incrementally in the following order.

### Phase 1 — Project foundation
- Create the HTML structure.
- Create the basic responsive layout.
- Set up the PWA manifest and service worker.
- Implement navigation between the main sections.

### Phase 2 — Data and child profile
- Implement data storage.
- Implement child profile creation and editing.
- Implement age calculation.
- Implement development areas and skill observations.
- Implement interests and activity conditions.

### Phase 3 — Activity catalogue
- Load `data/activities.json`.
- Implement activity listing and filtering.
- Implement activity details.
- Implement external source and video links.

### Phase 4 — Recommendations
- Implement activity eligibility filtering.
- Implement recommendation scoring.
- Implement diversity and repetition rules.
- Implement daily recommendation persistence.
- Implement replacing the current recommendation.

### Phase 5 — Feedback
- Implement the feedback interface.
- Store activity outcomes.
- Update inferred preferences.
- Implement difficulty adaptation.
- Verify that feedback affects subsequent recommendations.

### Phase 6 — History and settings
- Implement activity history.
- Implement JSON export and import.
- Implement data deletion and preference reset.

### Phase 7 — Testing and refinement
- Test on mobile and desktop.
- Test offline behavior.
- Test date and age calculations.
- Test persistence after page reloads.
- Test multiple child profiles.
- Test recommendation selection and feedback processing.
- Check browser console for errors.
- Verify PWA installation.

Do not implement all phases as one large change. Make the application functional after each phase.

## 20. Acceptance criteria

The implementation is considered complete when all of the following are true.

### Profile
- A parent can create, edit and delete child profiles.
- Child age is calculated correctly.
- Each child has independent skills, preferences and history.
- Skill observations can be updated manually.

### Catalogue
- Activities are loaded from JSON.
- The catalogue supports searching and filtering.
- Each activity displays its instructions, goal, duration and materials.
- External video links work.
- Unreviewed activities are not recommended.

### Recommendations
- The application selects an age-appropriate activity.
- Skills and interests influence recommendation ranking.
- Previous feedback affects future recommendations.
- Recent activities receive repetition penalties.
- Different development areas receive attention.
- The daily recommendation remains stable after reopening the application.
- The parent can explicitly request another activity.
- Replacing an activity does not create negative feedback.

### Feedback
- The parent can record activity results.
- Interest and difficulty ratings are stored.
- Lack of time or materials is not interpreted as dislike.
- Feedback changes subsequent recommendations.
- Manual preference changes are supported.

### Persistence
- Application data survives reloads and browser restarts.
- Data export and import work.
- Deletion is confirmed by the user.
- Existing data is preserved when the application version changes.

### PWA
- The app can be installed.
- The application opens offline after initial loading.
- Saved profiles, activity history and recommendations remain available offline.
- External links are handled separately.

### Quality
- No external JavaScript libraries are used.
- No critical browser console errors occur.
- No unnecessary code duplication is introduced.
- The application works on modern mobile browsers.
- The interface is responsive and usable on desktop.

## 21. Important development instructions

Before making changes:

1. Inspect the current project files and identify existing functionality.
2. Understand the existing data structures and design conventions.
3. Do not recreate functionality that already exists.
4. Implement the specification incrementally.
5. After each phase, check that existing functionality still works.
6. Keep the implementation as simple as possible.
7. Do not introduce additional features that are not required by this specification.
8. Do not invent external sources, video links or safety approvals.
9. Do not silently discard user data during development.
10. At the end, summarize the implemented functionality, changed files and any remaining limitations.

Prioritize a working, reliable application over architectural sophistication.