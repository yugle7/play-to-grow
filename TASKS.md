## Task 1

Update `#today-page` and its feedback form as follows:

**1. Always show the feedback form**
- Always display `#feedback-form` at the bottom of `#today-page`.
- Do not hide or conditionally render the form based on `#fb-status`.
- Keep `skipped` as the default value of `#fb-status`.

**2. Conditional action button**
- If `#fb-status` is `skipped`, show `#today-another` in the bottom-right corner.
- For any other `#fb-status` value, show `#feedback-save` in the bottom-right corner.
- Update the visible button immediately when the feedback status changes.
- Preserve the existing functionality of both buttons.

**3. Header changes**
- Display `#today-back` as a close (X) button in the top-right corner.
- Remove the date currently displayed in the header.
- Instead, display the current child's name and age.
- Keep the child's information up to date when the selected child changes.

Preserve the existing page design and button styling. Keep the implementation simple and avoid duplicating logic or changing unrelated functionality.