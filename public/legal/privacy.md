# Privacy Policy

**Last updated**: June 19, 2026
**Effective date**: June 19, 2026

This Privacy Policy explains how AVbot ("we", "us", "the bot", "the service") collects, uses, stores, and protects information when you or your Discord server uses the AVbot Discord application and the website at https://www.avbot.app.

If you do not agree with this policy, do not add AVbot to your Discord server, do not interact with the bot, and do not use the website.

## 1. About AVbot

AVbot is a community engagement and management Discord bot. It is offered free of charge. AVbot is operated as an independent online service.

The bot provides modules including but not limited to: verification, role selection, forms, tickets, engagement systems for X (formerly Twitter), raid coordination, giveaways with role-based ticket multipliers, multi-chain wallet collection, Web3 market intelligence (Radar), protection (anti-spam, anti-raid, anti-scam), analytics, and logging.

## 2. Data Controller and Contact

AVbot is operated by an independent operator. For all privacy-related inquiries, you can contact us via:

- **Email**: ameretaverse@gmail.com
- **Discord DM**: `nervyesi1`
- **Discord support server**: https://discord.com/invite/ameretaverse

For Discord verification teams and similar inquiries, please use the email above with "Privacy Inquiry" in the subject line.

## 3. Information We Collect

We collect only the data needed to operate AVbot's features. We do not collect data for advertising, profiling, or resale.

### 3.1 Data from Discord

When AVbot is added to a Discord server or when a user interacts with the bot, we may collect:

- **Discord user IDs** (numeric identifiers, sometimes called snowflakes)
- **Discord usernames and display names** (for leaderboards, command results, and admin lists)
- **Discord server (guild) IDs** of servers where the bot is installed
- **Discord role IDs** assigned to users (used for role-gated features like role multipliers in giveaways)
- **Channel IDs** where the bot has posted messages or been invoked
- **Message content** when the Protection module is enabled in your server. The bot reads message content only to detect spam, phishing links, scam patterns, and raid coordination. Message content is not stored permanently; it is processed in memory to make a moderation decision and then discarded. Only the moderation outcome (action taken, reason, target user ID, timestamp) is stored, not the original message text.
- **Join and leave events** (used by the Protection module to detect anti-raid patterns and account-age gates)
- **Reaction and button interaction events** when users interact with bot-generated embeds

We do NOT collect:
- Private direct messages between Discord users
- Voice channel audio
- Email addresses or phone numbers from Discord accounts
- Any data from Discord servers where AVbot is not installed

### 3.2 Data from X (formerly Twitter)

For modules that interact with X (Engage-for-Engage, Raid coordination, Giveaway task verification):

- **X usernames** linked to your Discord account during verification
- **Whether you completed a specific engagement action** (like, retweet, comment) on a specific tweet, as verified through a third-party X engagement verification service
- **The X tweet URLs** submitted to the bot by you or other community members for engagement

The bot does not read your full X timeline, direct messages, follower lists, or any private X data. The bot queries only specific actions on specific tweets that are part of an active engage or raid pool.

### 3.3 Wallet addresses

For the Wallet Collection module, when you voluntarily submit a wallet address:

- **The wallet address you submit** (across supported chains: EVM-compatible chains including Ethereum and Layer 2s, Solana, Bitcoin, Cardano, Cosmos, Tron, Aptos, Sui, plus a freeform "other" category)
- **The chain** you specified
- **The Discord user ID** associated with the submission
- **The Discord server ID and wallet collection ID** the submission belongs to
- **Timestamp** of submission

We do NOT collect or process:
- Wallet private keys (we never ask for these; never give your private key to any service)
- Wallet seed phrases
- Wallet signatures (we do not perform on-chain authentication)
- Transaction history
- Token balances

Wallet collection is opt-in per server. You choose whether to submit a wallet to any specific collection. You can update or replace your submitted wallet at any time.

### 3.4 Generated data

As you use the bot, the following is created and stored:

- **Engagement points** (earned by participating in Engage and Raid modules)
- **Community / raid points** balance
- **Giveaway entries** with calculated ticket counts based on role multipliers
- **Verification records** (confirming you completed a captcha or human-verification step)
- **Audit log entries** (admin actions in the dashboard, configuration changes, protection events)
- **Submission records** for forms, tickets, and wallet collections

### 3.5 Website (avbot.app) data

The marketing website at https://www.avbot.app uses a privacy-friendly web analytics service to count page views. This service does not use cookies or browser fingerprinting and does not personally identify visitors. We do not place advertising cookies on the website. We do not sell your browsing data.

When you visit the dashboard at https://www.avbot.app/dashboard, Discord OAuth is used to authenticate you. Your access token is stored in a session cookie required for dashboard functionality and is not used for any other purpose.

## 4. How We Use Your Data

We use collected data only for the following purposes:

| Purpose | Data used |
|---|---|
| Run bot commands and respond to interactions | Discord user IDs, message content (transient), channel IDs |
| Track engagement points and award rewards | Discord user IDs, server IDs, engagement actions |
| Verify X engagement actions | X usernames, tweet URLs, action types |
| Display leaderboards | Discord user IDs and display names, point balances |
| Power role-based ticket multipliers in giveaways | Discord user IDs, server role IDs |
| Wallet collection workflows | Wallet addresses, chain identifiers, Discord user IDs |
| Anti-spam / anti-raid / anti-scam protection | Message content (transient), join/leave events |
| Server analytics for the server's own admin | Aggregated server stats, member counts |
| Public stats on the landing page | Aggregated counts only (no individual user data is exposed publicly) |
| Audit logging for accountability | Configuration changes, admin actions, timestamps |

We do not use your data for:
- Advertising or marketing to you
- Selling or sharing with third-party advertisers
- Profiling or automated decision-making with legal effects
- Cross-server tracking outside of features you explicitly enable

## 5. Legal Basis (GDPR users)

For users in jurisdictions with data protection laws like the GDPR, our legal basis for processing your data is:

- **Performance of a contract / service**: Operating the bot's features that you or your server admin chose to enable.
- **Legitimate interests**: Anti-spam, anti-raid, anti-scam protection (to keep Discord communities safe), audit logging (for accountability and dispute resolution), aggregate analytics (to improve the service).
- **Consent**: Submitting a wallet address, completing X verification linking, and other opt-in features. You can withdraw consent at any time by deleting your data (see Section 9).

## 6. Data Sharing and Third Parties

We share data only with the following categories of third parties, and only as needed to operate the service:

| Category | What is shared | Why |
|---|---|---|
| Discord (Discord Inc.) | All bot interactions go through Discord's API by definition | Discord is the platform AVbot runs on |
| Third-party X (Twitter) engagement verification service | X usernames and specific tweet URLs being verified | To verify X engagement actions for the Engage, Raid, and Giveaway modules |
| Third-party cloud infrastructure providers | Database and bot runtime data | Hosting the bot, database, and website |
| Privacy-friendly web analytics provider | Page view counts and basic browser info (no personal identification) | Anonymous web analytics on the landing page |

The specific names of our third-party infrastructure providers are not published in this policy for operational privacy reasons. We can disclose them on request to authorized parties (e.g., Discord verification team, data protection authorities) via the contact email above.

We do not share data with:
- Advertisers
- Data brokers
- Marketing companies
- Other Discord bots or services not in the categories above

We may disclose information if required by law (court order, subpoena, lawful government request) but only to the extent legally required, and we will notify you when permitted by law.

## 7. Data Storage and Retention

### 7.1 Where data is stored

AVbot uses standard relational database storage hosted with a third-party cloud infrastructure provider. Daily backups are maintained for disaster recovery.

### 7.2 How long we keep data

| Data type | Retention period |
|---|---|
| Discord identifiers and points balances | Retained as long as the bot is in your server and you are an active community member |
| Wallet collection submissions | Retained until you delete your submission, the collection is closed by the server admin, or the wallet collection is permanently deleted by the server admin |
| Engagement and raid logs | Retained for at least 90 days for audit and dispute resolution, then may be summarized or anonymized |
| Protection action logs | Retained for 1 year to support investigations and pattern detection |
| Message content (Protection module) | Not stored. Processed in memory only and discarded after the moderation decision. |
| Audit logs (admin actions) | Retained for 1 year |
| Aggregated public stats | Retained indefinitely (no personal data) |
| Backups | Retained for 30 days |

If the bot is removed from your server, we keep your data for 90 days in case the bot is re-added (to preserve your points and history), after which it may be deleted unless you request otherwise.

If you leave a Discord server, your individual point balance and history for that server remain in our database for 90 days, then may be deleted.

### 7.3 Right to deletion

You can request deletion of your personal data at any time (see Section 9).

## 8. Data Security

We take reasonable steps to protect your data:

- All data is transmitted over HTTPS / TLS between the bot, the API, and the website
- Database access is restricted to authorized infrastructure and the bot's operator
- We do not have payment information on file (the bot is free; no payment processing happens through us)
- Wallet addresses are stored as text and are not encrypted at rest at this time (they are public information on their respective blockchains by nature)

We use standard, industry-typical security practices appropriate to a free Discord bot. We do not claim "military-grade" or "bank-grade" encryption. If you have specific security concerns about your data, please reach out before submitting anything sensitive.

In the event of a data breach affecting your personal information, we will notify you within a reasonable timeframe (and within 72 hours of becoming aware of the breach where required by law), via the AmeretaVerse Discord server announcements and via direct Discord DM where possible.

## 9. Your Rights

You have the right to:

- **Access**: Request a copy of the personal data we hold about you
- **Rectification**: Correct inaccurate data
- **Deletion**: Request that your data be deleted ("right to be forgotten")
- **Restriction**: Request that we limit how we use your data
- **Objection**: Object to certain processing
- **Portability**: Receive your data in a portable format (such as JSON)

To exercise any of these rights, contact us at ameretaverse@gmail.com or message `nervyesi1` on Discord. We aim to respond within 30 days.

For wallet collection submissions specifically, you can:
- View your current submission at any time via the Submit button in your server's wallet collection channel
- Update or replace your submission at any time
- Ask the server admin to remove you from a collection
- Ask us directly to delete your submission

Users in jurisdictions with national data protection authorities additionally have the right to lodge a complaint with their local authority if they believe their data has been mishandled.

## 10. Children's Privacy

AVbot is not directed at children under 13. Discord's own Terms of Service require users to be at least 13 years old (or older in some jurisdictions, where local law sets a higher age for online services).

We do not knowingly collect personal data from anyone under 13. If you become aware that a child under 13 has provided us with personal data, please contact us so we can delete that information.

Where local law requires a higher minimum age for data processing consent (such as 16 in parts of the European Union), Discord's age rules apply and we rely on Discord's age verification.

## 11. International Data Transfers

Data may be processed in countries other than the one you live in, depending on the third-party infrastructure providers we use. These providers maintain standard contractual safeguards for international transfers as required by applicable data protection laws.

## 12. Cookies and Local Storage

The landing page at https://www.avbot.app uses only essential, privacy-friendly analytics (which does not use cookies or fingerprinting).

The dashboard at https://www.avbot.app/dashboard uses:
- A session cookie required to keep you logged in via Discord OAuth
- Local storage to remember your dashboard preferences (which server tab you have open, etc.)

We do not use advertising cookies, third-party tracking cookies, or fingerprinting.

## 13. Changes to This Policy

We may update this Privacy Policy from time to time. When we do:
- The "Last updated" date at the top of this page will change
- Significant changes will be announced in the AmeretaVerse Discord server and via Discord DMs to server admins where possible
- Your continued use of the bot after a policy change indicates acceptance of the updated policy

If you do not agree with a policy change, you may remove the bot from your server and/or request deletion of your data at any time.

## 14. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or your data:

- **Email**: ameretaverse@gmail.com
- **Discord DM**: `nervyesi1` (preferred)
- **Discord support server**: https://discord.com/invite/ameretaverse

For Discord verification teams and law enforcement: please use the email above and include "Privacy Inquiry" in the subject line.

---

*This Privacy Policy reflects current practices as of the effective date.*
