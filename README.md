# Weekly Routine Planner: Features

A lightweight, generic weekday scheduler built with plain HTML, CSS, and JavaScript. Designed strictly as a repeating schedule (Sunday to Saturday) rather than a date-bound calendar, making it perfect for plotting out classes, shifts, workouts, or recurring personal routines.

## 🌐 Live Website
> [!NOTE]
> View the live website on [Weekly Planner](https://sakib-ar.github.io/Week-Planner/).

## Calendar View

- **Week Layout:** 7 day columns, fixed from Sunday to Saturday. Generic day-of-week model ensures schedules repeat continuously without dates expiring.
- **24-Hour Grid:** Each hour is 48px tall, complete with faint hour division lines and time labels (1 AM to 11 PM) in a sticky left gutter.
- **Current Day Highlight:** Today's column features a distinct accent header and a subtle background tint.
- **Real-Time Line Indicator:** A red indicator line with a tracking node marks the current time in today's column and automatically updates every minute.
- **Auto-Scroll:** Page automatically scrolls to 7 AM on initial load for optimal viewport positioning.

## Creating Events

- **Click Any Time Slot:** Clicking an empty space inside a day column opens the event creation modal.
  - The clicked position automatically snaps to the nearest 30-minute interval.
  - Start time pre-fills based on click position; end time defaults to one hour later (capped at 11:59 PM).
- **New Event Button:** Top bar primary button opens the event dialog for the current day starting at the next full hour.
- **Event Form Fields:**
  - **Title:** Optional (up to 80 characters; displays as "(No title)" if omitted).
  - **Day of Week:** Selector dropdown ranging from Sunday (`0`) to Saturday (`6`).
  - **Start & End Time:** Precise time inputs.
  - **Color Picker Options:** 5 default preset swatches plus a user-defined custom color wheel picker and uppercase Hex text input (`#RRGGBB`).
- **Validation:** Enforces that end time must occur strictly after start time, displaying clear error messages for invalid ranges.

## Color Picker & Custom Swatches

- **Preset Swatches:** Includes default accent shades (teal, indigo, amber, rose, slate).
- **Spectrum Color Picker:** Clicking the rainbow swatch launches the native system color picker.
- **Hex Input Box:** Text field supporting 3-character (`#FFF`) and 6-character (`#FFFFFF`) hex color codes. Automatically strips hashes, sanitizes non-hex characters, and updates the active swatch in real time.

## Event Blocks & Layout

- **Dynamic Sizing:** Event block height and vertical placement directly match duration (1 hour = 48px, minimum height 18px).
- **Block Info:** Displays event title along with formatted start/end times (e.g., `1:30 PM – 3:00 PM`).
- **Compact View:** Short event blocks (under 40px tall) render title and timestamps inline on a single row.
- **Overlap Column Layout:** Overlapping events dynamically divide column width and render side-by-side without visual collision.

## Editing & Deleting

- Click any existing event card to edit its title, day, time range, or assigned color.
- Save updates instantly, or hit **Delete** to remove the event.
- Includes smooth animated modal popups supporting backdrop clicks to dismiss.

## Data & Storage

- **AutoSave:** All creations, edits, deletions, imports, and resets instantly persist to browser `localStorage` (`week-planner-events`).
- **JSON Download:** Export complete weekly routine schedules to a formatted `.json` backup file.
- **JSON Import:** Restore routines from external JSON files via file upload.
- **Data Migration Engine:** Automatically converts legacy date-bound events (`YYYY-MM-DD`) into the day-of-week integer model (`0`–`6`) upon load or import.
- **Safety Reset:** Clear all active events via the Reset button, guarded by a confirmation modal dialog.

### Data Structure Example

```json
[
  {
    "id": "e1760000000000ab12",
    "title": "EEE101 Class",
    "day": 1,
    "start": 420,
    "end": 510,
    "color": "#0F766E"
  }
]