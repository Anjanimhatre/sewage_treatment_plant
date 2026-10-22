# AquaPure – Smart Water Systems

A modern, animated landing page for **AquaPure**, a wastewater and sewage treatment company. Built with Next.js, TypeScript and Tailwind CSS.

## Features

- Hero section with live-updating telemetry (flow rate, pH, turbidity, dissolved oxygen)
- Animated stats pipeline with count-up numbers and progress rings
- Interactive treatment process: an animated tank showing how BOD and turbidity drop at each stage
- Solutions grid with hover spotlight effect
- Impact dashboard (litres treated, litres recovered, projects, pollutants removed)
- Water-ripple cursor trail and an animated water footer (canvas)
- Scroll progress bar and active navigation highlighting
- Responsive layout and `prefers-reduced-motion` support

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) icons

## Getting Started

### Prerequisites

- Node.js 18.18 or newer
- npm (or yarn / pnpm)

### Installation

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run lint
npm run build
npm run start
```

## Project Structure

```
app/
  layout.tsx        # Root layout and site metadata (title, description)
  page.tsx          # The full landing page
  favicon.ico
public/
  w1.png            # Image used by the cursor water trail
  static/
    sewage_water.avif   # Hero cover image
```

## Required Assets

Make sure these files exist (names are case-sensitive on Linux hosts):

| File | Used for |
| --- | --- |
| `public/w1.png` | Cursor water-trail effect |
| `public/static/sewage_water.avif` | Hero section image |

## Customization

- **Content:** Edit the data arrays at the top of `app/page.tsx` (`nav`, `steps`, `solutions`, `marks`, `stats`).
- **Colors:** The main accent is `#a6ff4d` and the background is `#030b08`. Search and replace to change the theme.
- **Contact form:** The form currently only shows a "Request received" message and does **not** send data anywhere. Connect it to an API route (for example with Resend or Nodemailer) or a form service such as Formspree before going live.
- **Placeholder numbers:** The stats and claims on the page are sample content. Replace them with your real figures.

## Environment Variables

None are required to run the project as it is. If you add an email service or other API:

- Store secrets in `.env.local` (never commit this file).
- Do **not** prefix secrets with `NEXT_PUBLIC_`, because those values are exposed to the browser.
- Add the same variables in your hosting dashboard.

## Deployment

### Vercel (recommended)

1. Push the project to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Add any environment variables and click **Deploy**.

### Other options

- **Node server / VPS:** `npm run build` then `npm run start`, behind Nginx or Caddy.
- **Docker:** set `output: "standalone"` in `next.config.js`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

## License

All rights reserved © 2026 AquaPure. Update this section with your preferred license.
