## Update the activity-sheet header and close button

Change the layout of `#activity-sheet`:
- Remove the existing header that contains the close icon.
- Move the close icon to the top-right corner of the activity sheet.
- Keep the close button easily accessible and visually consistent with the rest of the interface.

Preserve the existing close behavior.

## Simplify activity actions and replace text buttons with SVG icons

Update the activity flow in `#today-activity`:

- remove `#today-details` button
- Remove the `#today-main` button.
- Display the finish activity button immediately when the activity sheet is opened. The user should be able to finish an activity without an intermediate start step.
- Replace the text buttons with icon-only buttons:
  - finish activity button → inline SVG icon `#ok` (from sprite).
  - `#today-another` → inline SVG icon `#refresh` (from sprite).

Requirements:
- Preserve the existing click handlers and functionality of both actions.
- Keep the buttons compact and visually consistent with the application.
- Provide accessible labels or titles for both buttons.
- Use inline SVG icons following the existing project conventions.
- Do not add external libraries or dependencies.

Make only the necessary changes. Avoid unrelated refactoring or duplicated code.
