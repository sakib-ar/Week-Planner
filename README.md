# Week Planner: Features

A lightweight, Google Calendar-style weekly scheduler built with plain HTML, CSS and JavaScript. No frameworks, no build step, no notification system.

## 🌐 Live Website
> [!NOTE]
> View the live website on [Weekly Planner](https://sakib-ar.github.io/Week-Planner/).

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure: top bar, calendar container, event dialog |
| `style.css` | Layout, colours, light/dark themes, event blocks, dialog |
| `script.js` | Rendering, event logic, navigation, storage, data management |

To run it, put the three files in one folder and open `index.html` in a browser.

## Calendar view

- **Week layout:** 7 day columns, always starting on **Sunday** and ending on Saturday.
- **24-hour grid:** each hour is 48 px tall, with faint hour lines and time labels (1 AM to 11 PM) in a left gutter.
- **Sticky day header:** weekday name and date number stay visible while scrolling vertically.
- **Today highlight:** today's date is shown in an accent-coloured circle and its column has a tinted background.
- **Week range label:** shows the visible range, for example `Oct 11 – 17, 2026`. It includes both months when the week spans two.
- **Current-time line:** a red line with a dot marks the current time in today's column and updates every minute.
- **Auto-scroll:** the view opens scrolled to about 7 AM.

## Navigation

- **Previous week** and **Next week** buttons.
- **Today** button, which jumps back to the current week.
- After saving an event, the view jumps to the week that contains it.

## Creating events

- **Click any empty slot** in a day column to open the event dialog.
  - The click position snaps to the nearest 30 minutes.
  - Start time is prefilled with the clicked slot and end time defaults to one hour later (capped at 11:59 PM).
- **New event button** in the top bar opens the dialog for today, starting at the next full hour.
- **Event dialog fields:**
  - Title (optional, up to 80 characters; shown as "(No title)" if left empty)
  - Date
  - Start time
  - End time
  - Colour (5 choices)
- **Validation:** the date is required and the end time must be after the start time, otherwise an error message appears in the dialog.

## Event blocks

- **Sized by duration:** a block's top position and height come from its start and end time (minimum height 18 px).
- **Shows details:** title plus a formatted time range, such as `1:30 PM – 3 PM`.
- **Compact layout for short events:** blocks under 40 px tall show the title and time on one line.
- **Overlap handling:** events that overlap in time sit side by side in the same column, splitting the width evenly.
- **Colour coding:** teal, indigo, amber, rose or slate.

## Editing and deleting

- Click an existing block to open the dialog with its details filled in.
- Change any field and press **Save**, or press **Delete** to remove the event.
- **Cancel** closes the dialog without changes.

## Data and storage

- **AutoSave:** Every change (add, edit, delete, import, reset) is immediately persisted to the browser's `localStorage` automatically, meaning progress will never disappear on refresh.
- **Download JSON:** Click the "Download" button to export all events as a `.json` backup.
- **Import JSON:** Restore a downloaded routine by clicking "Import" and selecting a valid planner `.json` file.
- **Reset Progress:** Clear all active events via the "Reset" button (requires user confirmation).
- All storage calls are wrapped in `try/catch`. If storage is unavailable, the app still works for the current session.
- Each event is a plain object:

```js
{
  id: "e1760000000000ab12",
  title: "Study group",
  date: "2026-10-14",   // YYYY-MM-DD
  start: 600,           // minutes from midnight (10:00)
  end: 690,             // minutes from midnight (11:30)
  color: "#0f766e"
}