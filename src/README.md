# Missing Child Rescue Network - Report Missing Child Module

This is the React version of the Report Missing Child form.

## Technology
- React
- JSX
- Simple CSS
- Your existing project CSS files are reused

## Add to your Vite React project

Copy these files into your existing `src` folder:

- `App.jsx`
- `components/ReportMissingChild.jsx`
- `components/ReportMissingChild.css`
- `css/` (the shared CSS from your project)

Then run:

```bash
npm run dev
```

## How the form works

1. User enters child details.
2. User uploads a child photo.
3. User enters the last-seen location, date and time.
4. User enters parent/guardian contact details.
5. Clicking **Submit Missing Child Report** currently displays a success message and prints the form data in the browser console.

There is no database/backend connection yet.

## How to connect the backend later

Inside `handleSubmit()` in `ReportMissingChild.jsx`, replace the `console.log()` with a `fetch()` request to your backend API.

Example idea:

```js
fetch("http://localhost:5000/api/missing-child", {
  method: "POST",
  body: formData
});
```

The form fields are kept simple and are intentionally easy to modify.
