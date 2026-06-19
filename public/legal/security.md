# Security Disclosure

**Last updated**: June 19, 2026

We take the security of AVbot, its infrastructure, and our users' data seriously. If you discover a security vulnerability, please report it responsibly using the process below.

## Reporting a Vulnerability

If you believe you have found a security vulnerability in AVbot, the AVbot website, the AVbot dashboard, or any associated infrastructure, please email us at:

**ameretaverse@gmail.com**

Subject line: **`Security Disclosure`**

Or reach out via Discord DM to **`nervyesi1`**.

### What to include in your report

Please provide as much information as possible to help us reproduce and fix the issue:

- A clear description of the vulnerability
- Steps to reproduce
- The component(s) affected (e.g., Discord bot, dashboard, public API, website)
- Potential impact (what an attacker could do with this)
- Your proof-of-concept (screenshots, code snippets, or curl commands)
- Whether you have already shared this with anyone else
- How you want to be credited (or if you prefer to remain anonymous)

### What NOT to do

While investigating a potential vulnerability, please:

- Do NOT publicly disclose the issue before we have had a chance to address it
- Do NOT access, modify, or delete data that does not belong to you
- Do NOT perform attacks that disrupt service for other users (denial-of-service, spam, etc.)
- Do NOT use the vulnerability to extract data beyond what is necessary to demonstrate the issue
- Do NOT social engineer AVbot's operator, contributors, or community members

## Scope

The following are in scope for security reports:

- The AVbot Discord bot itself
- The AVbot public API (https://api.avbot.app)
- The AVbot website (https://www.avbot.app)
- The AVbot dashboard (https://www.avbot.app/dashboard)
- Authentication flow (Discord OAuth integration)
- Data storage (any flaw that exposes user data inappropriately)
- Command injection, privilege escalation, or RCE in the bot's code
- XSS, CSRF, or auth bypasses in the dashboard
- Logic flaws that allow point inflation, giveaway manipulation, or wallet submission tampering
- Vulnerabilities in the bot's permission checks (e.g., bypassing role gates)

## Out of Scope

The following are NOT considered security vulnerabilities for the purposes of this disclosure program:

- Reports from automated scanners without manual validation
- Issues that require physical access to a user's device
- Social engineering of AVbot operators or users
- Self-XSS that requires the victim to paste code into their own browser console
- Missing security headers without a demonstrable exploit
- Issues in third-party services we depend on — please report those directly to the relevant providers
- Best-practice suggestions that do not lead to a concrete vulnerability
- Theoretical attacks that require unrealistic preconditions (e.g., already-compromised admin accounts)
- Rate-limiting bypasses that do not cause material harm to the system or other users
- Bot bugs that result in mild incorrect behavior (e.g., embed renders wrong) without a security impact — please report these via normal support channels

If you are unsure whether something is in scope, please report it; we would rather review and decline than miss something genuine.

## Our Response

When we receive a report, we will:

1. **Acknowledge receipt** within 48 hours (often much faster)
2. **Investigate** the issue and confirm whether it is reproducible
3. **Communicate** progress to you as we work on a fix
4. **Fix** the vulnerability as quickly as possible based on its severity
5. **Notify you** when the fix is deployed
6. **Recognize** you (if you wish) in our public acknowledgments

For high-severity issues (data exposure, RCE, full auth bypass), we aim to deploy a fix within 7 days where technically possible. For medium-severity issues, within 30 days. For low-severity issues, on a best-effort basis.

## Recognition

We do not currently offer a paid bug bounty. AVbot is a free, independently operated project.

However, we are happy to:

- Publicly credit you on a security acknowledgments page (with your permission)
- Provide a written thank-you message you can share publicly
- Give you a special Discord role (e.g., "Security Researcher") in the AmeretaVerse server
- Include your name in the announcement of the fix (if you want public recognition)

If you prefer to remain anonymous, that's fine too.

## Safe Harbor

If you make a good-faith effort to comply with this policy when reporting a vulnerability, we will:

- Consider your research as authorized under these Terms
- Not pursue civil action or legal complaints against you
- Help defend you if a third party brings legal action against you for your good-faith research

"Good-faith effort" means: following this disclosure process, not exfiltrating or destroying data, not disrupting service, not exploiting the vulnerability for personal gain, and giving us a reasonable opportunity to fix the issue before public disclosure.

This safe harbor does not apply to research that violates applicable laws or Discord's Terms of Service.

## Public Disclosure

We are committed to transparency. After a vulnerability is fixed, we may:

- Publish an advisory describing the issue, impact, and fix
- Credit the researcher (with permission)
- Share lessons learned with the community

We typically wait at least 30 days after a fix is deployed before public disclosure, to give server admins time to apply any required configuration changes.

If you plan to publicly disclose your findings (e.g., a blog post, conference talk), please coordinate with us on timing.

## Contact

- **Email**: ameretaverse@gmail.com (subject: `Security Disclosure`)
- **Discord DM**: `nervyesi1`
- **Discord support server**: https://discord.com/invite/ameretaverse

Thank you for helping keep AVbot and its community safe.
