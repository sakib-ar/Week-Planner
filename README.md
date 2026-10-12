# Week Planner: Features

A lightweight, Google Calendar-style weekly scheduler built with plain HTML, CSS and JavaScript. No frameworks, no build step, no notification system.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure: top bar, calendar container, event dialog |
| `style.css` | Layout, colours, light/dark themes, event blocks, dialog |
| `script.js` | Rendering, event logic, navigation, storage |

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

- Events persist in the browser's `localStorage`, so they survive a refresh.
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
```

## Appearance and accessibility

- **Light and dark themes** follow the system setting (`prefers-color-scheme`) using CSS variables.
- **Responsive:** the grid keeps a minimum width of 760 px and scrolls horizontally on narrow screens. The page respects device safe-area insets.
- **Keyboard friendly:** visible focus outlines, events are real buttons, and `Esc` closes the dialog.
- **Font:** DM Sans from Google Fonts, falling back to the system font if offline.

## Customisation points

| What | Where |
|---|---|
| Hour row height | `HOUR` in `script.js` **and** `--hour` in `style.css` (keep them equal) |
| Event colours | `COLORS` array in `script.js` |
| Theme colours | CSS variables at the top of `style.css` |
| Storage key | `STORE` in `script.js` |
| Replace local storage with a backend | `load()` and `save()` in `script.js` |

## Not included (by design or for later)

- Notifications and reminders
- Drag to move or resize events
- Month and day views
- Recurring events
- Multiple calendars and sharing