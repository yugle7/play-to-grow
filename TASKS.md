## Task 1 — Add an "Add Child" button to the child selection modal

Update the child selection modal:
- Add an **"Add Child"** button to the modal.
- Clicking it should open the existing child creation form.
- After saving the new child, make sure the child is added to the list and can be selected.
- Preserve the existing selection flow and modal behavior.

Inspect the current implementation and make only the necessary changes. Do not introduce duplicate logic or unrelated refactoring.

## Task 2 — Show an "Add Child" button in the header when no children exist

Update the application header:
- If the user has not added any children, display an **"Add Child"** button in the header.
- Clicking it should open the child creation form.
- Once at least one child has been added, hide this button and restore the normal header behavior.

Make sure the UI updates immediately after a child is created, without requiring a page reload.

## Task 3 — Replace red highlighting with strikethrough and dimming gray

Variants in "#interests" currently use red text and red highlighting to indicate their state.

Replace this visual treatment with:
- Strikethrough text.
- Reduced opacity to make the element appear dimmed.

Do not use red as the primary indicator for these states anymore. Preserve the existing layout and other visual states.

## Task 4 — Update warning styling

Update the appearance of warning messages:
- Use a subtle yellowish background.
- Use yellow-colored text for the warning heading.
- Keep the warning body text readable and maintain sufficient contrast.

Apply the styling consistently to all warning messages. Reuse the existing color palette where possible.

## Task 5 — Show the child's current age instead of childAgeFilter

Update the activity filtering options:
- Replace the **childAgeFilter** option with the selected child's actual current age.
- Calculate the age using the child's date of birth.
- Use the existing age formatting conventions, including months and years where appropriate.
- If no child is selected, remove this option entirely.

Make sure the displayed age stays up to date and does not rely on a hardcoded value.

## Task 6 — Restyle history-filter and history-area

Make `#history-filter` and `#history-area` use the same visual design and layout behavior as `#filter-area`.

Inspect the existing `#filter-area` implementation and reuse its styles and structure where practical:
- Match its spacing, alignment, borders, background, and other visual properties.
- Preserve the existing functionality of both history elements.
- Ensure the layout adapts to narrow screens in the same way as `#filter-area`.

Avoid duplicating CSS when existing styles can be reused.

## Task 7 — Display the child information form instead of child-info

Replace the `#child-info` element with the actual child information input form.

The form should be displayed instead of the current informational element. Reuse the existing child creation/editing form and its validation logic wherever possible.

Preserve the existing data model and saving behavior. Avoid implementing a second version of the same form.

## Task 8 — Add support, mailTo, and privacy links to settings-page

Update `#settings-page` by adding the following links:
- Support
- Email (`mailto`)
- Privacy Policy

Use the same URLs, email address, labels, icons, and visual styling as in the existing project @boilerplate.

Reuse the boilerplate implementation rather than creating a new link style or inventing new URLs. Make sure the links work correctly when tapped on mobile devices.

## Task 9 — Update the activity-sheet header and close button

Change the layout of `#activity-sheet`:
- Remove the existing header that contains the close icon.
- Move the close icon to the top-right corner of the activity sheet.
- Keep the close button easily accessible and visually consistent with the rest of the interface.

Preserve the existing close behavior.

## Task 10 — Simplify activity actions and replace text buttons with SVG icons

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
