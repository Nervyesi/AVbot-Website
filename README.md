# AVbot Website

The marketing site and dashboard frontend for AVbot, a Discord bot built for Web3 communities.

Live at: https://www.avbot.app
Documentation: https://www.avbot.app/docs

## What this repository is

This is the public-facing React (Create React App) application that includes:

- Marketing landing page (home, modules showcase, why-AVbot, FAQ, docs, legal pages)
- Dashboard for server admins to configure AVbot per server

The Discord bot backend lives in a separate repository.

The source is published for transparency. See the License section below before reusing it.

## Tech stack

- React 19 (Create React App)
- React Router 7
- Framer Motion for animations
- Inline styles (no external CSS framework)
- React Markdown for legal pages and docs

## Local development

Clone the repository and install dependencies:

    npm install

Copy .env.example to .env.local and configure for local development.

Run the dev server:

    npm start

This serves the site at http://localhost:3000.

To build for production:

    CI=true npm run build

## Contact

- Discord DM: nervyesi1
- Email: ameretaverse@gmail.com
- Community: https://discord.com/invite/ameretaverse

## Security

To report a security vulnerability, follow the disclosure policy at https://www.avbot.app/security. Do not open public issues for security reports.

## License

The AVbot name, logo, and source code are the property of the AVbot operator. The source is made available for transparency and review. It is not licensed for redistribution, for forking into a competing or production service, or for rebranding. See the Terms of Service at https://www.avbot.app/terms for details.
