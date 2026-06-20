# AVbot Documentation

Complete guide to setting up, configuring, and using AVbot for your Discord community.

---

## Table of Contents

- [Getting Started](#getting-started)
  - [What is AVbot](#what-is-avbot)
  - [Invite AVbot to your server](#invite-avbot-to-your-server)
  - [First time setup](#first-time-setup)
  - [Dashboard overview](#dashboard-overview)
- [Core Concepts](#core-concepts)
  - [Per guild isolation](#per-guild-isolation)
  - [Permissions](#permissions)
  - [Brand and visual customization](#brand-and-visual-customization)
  - [Engage points and community points](#engage-points-and-community-points)
  - [Audit logging](#audit-logging)
- [Modules](#modules)
  - [Verification](#verification)
  - [Role Selection](#role-selection)
  - [Forms](#forms)
  - [Tickets](#tickets)
  - [Engage](#engage)
  - [Raid](#raid)
  - [Giveaway](#giveaway)
  - [Wallet Collection](#wallet-collection)
  - [Radar](#radar)
  - [Protection](#protection)
  - [Analytics](#analytics)
  - [Embed Messages](#embed-messages)
  - [Logs](#logs)
  - [Server Settings](#server-settings)
- [Profile, Points, and Leaderboards](#profile-points-and-leaderboards)
- [Workflows](#workflows)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)

---

# Getting Started

## What is AVbot

AVbot is a Discord bot built for Web3 communities. It bundles fourteen modules in one bot: verification, role selection, forms, tickets, engagement systems for X (formerly Twitter), raid coordination, giveaways with role based ticket multipliers, multi chain wallet collection, Web3 market intelligence, protection, analytics, embed messages, logs, and server settings (including levels).

It's free to add. There's no SaaS subscription, no per seat pricing, no premium gates on functionality.

## Invite AVbot to your server

1. Go to https://www.avbot.app
2. Click **Add AVbot to Discord** in the navigation bar
3. Discord shows you the OAuth screen with the list of servers you have admin access to. Pick the server you want to add AVbot to.
4. Review the requested permissions and click **Authorize**
5. AVbot joins your server

You need the **Manage Server** permission on the target server. If you don't have it, ask your server owner to either grant it to you or invite the bot themselves.

Once invited, AVbot is online but most modules are inactive until you configure them. Time to head to the dashboard.

## First time setup

After AVbot joins your server:

1. Go to https://www.avbot.app/dashboard
2. Log in with Discord (OAuth)
3. Select the server you just added AVbot to from the sidebar
4. You'll see all fourteen modules as tabs at the top

Recommended first three things to set up:

### 1. Verification

Stops bots and scammers at the door. Configure the verification channel where new members will be prompted to verify, and pick which role to assign on successful verification.

### 2. Protection

Anti spam, anti raid, anti scam guardrails. Enable the defaults to start. You can fine tune later. Once on, the bot quietly handles phishing links, suspicious account ages, and raid patterns.

### 3. Role Selection

Let members pick their own interests, regions, or notification preferences from a panel of buttons or a dropdown. Reduces the manual ask of "what roles should I have?"

Once those three are running, your server has the basics. Add other modules as you need them.

## Dashboard overview

The dashboard at https://www.avbot.app/dashboard is your control center. It has:

- **Server selector** (left sidebar): All servers where AVbot is installed and you have access
- **Module tabs** (top, within a server): One tab per module
- **Save button** (bottom right or per section): Saves your changes. Always save before switching modules.
- **Live preview** (where applicable): Shows what your embed will look like in Discord
- **History and audit panel** (logs module): See who changed what and when

Most settings save with a single click. Some modules have list views (giveaways, wallet collections) where you can create new entries, edit existing ones, and delete completed ones with confirmation.

---

# Core Concepts

## Per guild isolation

Every server's data is fully isolated. Members, points, giveaway entries, wallet submissions, audit logs, and module settings in server A are completely invisible to server B, even if the same Discord user is in both servers.

This means a user who has 100 engage points in one server starts at 0 in another. A wallet they submitted to one server's collection is not visible to a different server's admin. A giveaway running in one server is independent of giveaways elsewhere.

The benefit: you can install AVbot in multiple Web3 communities without cross contamination. The same brand or partner can run distinct campaigns in different servers.

## Permissions

AVbot requests **Administrator** permission when you add it to your server.

Administrator is requested because AVbot spans fourteen modules with very different needs. Role assignment for verification and giveaway gating, channel creation for tickets, message filtering for protection, audit log access for anti raid detection, role management for level rewards, and many other operations across modules would otherwise require a long list of granular permissions. Requesting Administrator keeps the install flow simple and lets every module work correctly out of the box.

AVbot uses this access only for the modules you enable in the dashboard. You can disable any module at any time, and the bot will stop using the corresponding parts of its access.

If you'd prefer to use a narrower set of permissions for a specific deployment, message `nervyesi1` on Discord and we can talk about it.

## Brand and visual customization

AVbot currently uses a single default visual style across all servers it's installed in. The default style uses the AVbot logo and brand colors for module embeds, panels, and notifications.

Custom visual settings (embed colors, custom logos, branded module messages, per server brand overrides) are a planned feature on the roadmap. When the feature ships, server admins will be able to configure their community's colors and logo from the dashboard, and AVbot's embeds will use those settings in that server.

If you want early access to visual customization for your server before it's broadly available, message `nervyesi1` on Discord and we can talk.

## Engage points and community points

AVbot tracks two related but distinct point types:

- **Engage points** (sometimes called "engagement points"): Earned by engaging with other members' submitted tweets in the Engage module. Spent when you submit your own tweet for engagement. The currency of the peer to peer engagement market.

- **Community points** (sometimes called "raid points"): Earned by participating in raids posted by the server's team. Used as a general community contribution score, displayed on leaderboards and visible in profile cards.

The dashboard distinguishes between them, and the `/leaderboard` command shows both side by side.

## Audit logging

Every meaningful action by AVbot or by admins through the dashboard is recorded in the Logs module. Configuration changes, point adjustments, raid creations, giveaway draws, protection actions, wallet collection edits, and verification events all get logged.

Server admins can browse the audit trail from the dashboard's Logs tab. This is also useful when investigating a member's complaint, debugging a setting change, or just understanding what's been happening in the server.

---

# Modules

## Verification

### What it does

Verification keeps bot accounts and scammers out of your server. When a new member joins, they're directed to a verification channel where they click a button and complete a CAPTCHA challenge. On success, they receive the configured verified role and gain access to the rest of the server.

### Why it matters

Web3 communities are prime targets for bot account spam (for inflating member counts) and scam infiltration (sending phishing DMs to your real members). A verification step at the entry point dramatically reduces both.

### Setup

In the dashboard, open the Verification module tab. Configure:

- **Verification channel**: Where the verify panel will be posted and where new members will land
- **Verified role**: The role assigned on successful verification
- **Welcome behavior**: Optional welcome message or actions after a member verifies

Then post the verify panel using the admin command below.

### Commands

- `!sendverify` (prefix command, admin only): Posts the verify panel embed with a "Verify" button in the current channel. Run this in the verification channel you configured.

There are no slash commands in this module. Members interact with the panel by clicking the button, which opens the CAPTCHA modal.

### Best practices

- Set the verification channel as the only channel new members can see by default in your Discord channel settings
- Give the verified role access to all the channels you want members to see
- Don't use the verification channel for anything else; keep it focused

---

## Role Selection

### What it does

Lets members pick their own interests, regions, language preferences, or notification opt ins from a panel of buttons or a dropdown. Self serve role assignment instead of admins manually granting.

### Why it matters

Frees admins from having to manually assign roles, and gives members a clearer sense of what they can sign up for. Particularly useful for large communities where members want to opt into specific notification roles (announcements, NFT alerts, Radar alerts, mint reminders, etc).

### Setup

Fully managed from the dashboard. Open the Role Selection module tab. Configure:

- **Panel name**: Internal label for the panel
- **Channel**: Where the panel will be posted
- **Style**: Buttons or dropdown
- **Roles**: For each role, an emoji, label, and the Discord role to assign

Save, then click "Post Panel" to deploy it to Discord.

### Commands

No slash commands. All interaction is via buttons or the dropdown on the posted panel. Members click to toggle roles on or off.

### Best practices

- Group related roles together (notifications, interests, regions)
- Keep panels focused. Multiple smaller panels read better than one giant panel
- For mutually exclusive choices (one region only, one language only), use a dropdown rather than buttons

---

## Forms

### What it does

A visual form builder for applications, audits, partnership requests, or anything else that benefits from structured input. Members submit a form, your staff sees it, and can approve or reject from inside Discord.

### Why it matters

Replaces ad hoc DMs and Google Forms. Keeps form submissions inside Discord where your community already is, with status tracking and audit trails built in.

### Setup

Fully managed from the dashboard. Open the Forms module tab.

For each form, configure:

- **Title and description**
- **Fields**: Short text, long text, choice list, etc.
- **Submission channel**: Where the apply button is posted
- **Review channel**: Where staff sees submitted forms
- **Approval workflow**: Approve, Reject, or Close with optional reason

### Commands

No slash commands. Members click the "Apply" button on the form embed, which opens a multi step modal. Staff use the Approve, Reject, and Close buttons that appear with each submission in the review channel.

### Best practices

- Keep form fields minimal. Each extra field is friction.
- Use the description field to explain what the form is for and how long review will take
- For sensitive forms, restrict the review channel to staff only

---

## Tickets

### What it does

Creates a structured support ticket system. Members click a button to open a ticket, which spins up a private channel where they can talk to staff. Tickets have status tracking and auto close on inactivity.

### Why it matters

A clean alternative to ad hoc DMs or noisy public support channels. Tickets are scoped, searchable, and don't pollute your main channels.

### Setup

In the dashboard, open the Tickets module tab. Configure:

- **Ticket category**: Where new ticket channels are created
- **Support role**: The role that automatically gets access to every new ticket
- **Panel channel**: Where the "Open Ticket" panel is posted
- **Auto close timer**: How long of inactivity before a ticket is auto closed (default: 15 minutes after the last message)

### Commands

- `/tickets-panel` (admin): Posts the support ticket panel to the configured channel
- `/tickets-stats` (admin): Shows ticket statistics for this server

Members open a ticket by clicking the "Open Ticket" button on the panel. Closing happens with the "Close" button inside the ticket channel, or automatically after the configured inactivity timer.

### Best practices

- Use clear panel text explaining what kind of issues warrant a ticket
- Have at least two staff in the support role so tickets don't wait too long
- Use the stats command periodically to see ticket volume trends

---

## Engage

### What it does

A peer to peer engagement marketplace. Members submit their own X tweets to the engage pool (paying a small engage point cost), other members complete engagement tasks on those tweets and earn engage points, and submitters spend earned points to keep posting. A self sustaining flywheel.

### Why it matters

Most engagement systems in Web3 communities are top down: the team asks members to engage with specific posts. Engage flips it: members organize engagement among themselves, with the bot enforcing fairness and verifying actual engagement.

### Setup

In the dashboard, open the Engage module tab. Configure:

- **Engage channel**: Where members run `/submit` to submit tweets and where the engage interface lives
- **Cost per submission**: How many engage points it costs to add a tweet to the pool
- **Reward per task**: How many engage points each engagement task is worth
- **Pool size limits**: How many tweets can be in the active pool at once
- **Cooldowns**: Optional per user cooldowns between submissions

### Commands

- `/submit` (user): Submit your tweet to the engage pool. Paste the tweet URL when prompted.
- `/engage` (user): Browse tweets in the pool and complete engagement tasks. Opens an ephemeral slideshow view where you can go through each tweet, complete the tasks on X, and verify in the bot.
- `/engage-stats` (user): View your engage points and activity in this pool.
- `/engage-leaderboard` (user): Top engage point earners in this pool.
- `/my-engagers-list` (user): See who engaged with a tweet you submitted.
- `/engagers-list` (admin): See who engaged with any submitted tweet in this server.

### Best practices

- Set the cost per submission and reward per task so the economy is roughly self sustaining (not so cheap people spam, not so expensive nobody participates)
- Use a dedicated engage channel; don't mix it with general chat
- Periodically check `/engage-leaderboard` to spot top engagers and reward them outside the bot if you want

---

## Raid

### What it does

Raid is for amplifying official posts. The server's team or admin posts a tweet through the bot, configures the engagement tasks, and members participate by completing those tasks on X. The bot verifies engagement and awards community points to participants.

### Why it matters

When a server's official X account drops an announcement, you want as many engaged community members as possible interacting with it within the first hour (algorithmic boost is time sensitive). Raid coordinates this without requiring members to lurk on X all day.

### Setup

In the dashboard, open the Raid module tab. Configure:

- **Raid channel**: Where raids are posted
- **Default tasks**: Which engagement tasks (Like, Comment, Retweet, Quote) are checked by default
- **Points awarded**: How many community points each completed task awards
- **Auto end timer**: When raids automatically close (default: hourly auto end task)

### Commands

- `/raid post` (admin): Opens a modal where you paste the tweet URL, pick the engagement tasks, and post the raid embed to the configured channel.
- `/raid leaderboard` (user): Top raiders in this server.
- `/raiders` (admin): Export raid participants as CSV.

Members interact with raids by clicking the "Join Raid" button on the raid embed, which opens an ephemeral panel where they toggle which tasks they've completed and verify.

### Best practices

- Post raids only for important announcements; don't dilute by raiding every tweet
- Use the comment task sparingly; it's the hardest to fake genuinely
- Watch `/raid leaderboard` to identify your most active raiders and recognize them in announcements

---

## Giveaway

### What it does

Run role gated giveaways with weighted ticket draws. Roles can be configured as BASE multipliers (highest one wins) or STACK multipliers (add together), giving you fine grained control over who gets more chances.

### Why it matters

Most Discord giveaway bots use simple "react to enter" with equal odds. AVbot's tickets and multipliers let you reward loyal members with better odds, integrate with your role hierarchy, and run giveaways that actually scale with engagement.

### Setup

Fully managed from the dashboard. Open the Giveaway module tab.

For each giveaway, configure:

- **Title and description**
- **Prize**
- **Channel**: Where the giveaway embed is posted
- **End time**
- **Winner count**
- **BASE roles**: Each with a ticket multiplier (1x, 2x, 5x, etc). User's base ticket count is the highest BASE multiplier among the roles they hold.
- **STACK roles**: Each with a flat add (e.g., +2). Added on top of the base.
- **Tasks** (optional): Twitter follow, like, retweet, Discord member of another server, Discord role check
- **Embed customization** (limited to default style for now)

When you click "Post Giveaway", the bot creates the embed with an "Enter" button.

### Commands

No slash commands. All giveaway management is in the dashboard. Members enter by clicking the "Enter" button on the giveaway embed.

### How the weighted draw works

When a member enters, AVbot calculates their final ticket count:

- Find the highest BASE multiplier among the BASE roles they hold (the base)
- Add together all STACK multipliers from STACK roles they hold (the bonus)
- Final tickets = base + bonus

When the giveaway ends, the bot does a weighted random draw using these ticket counts. A member with 7 tickets has 7 times the chance of winning compared to a member with 1 ticket. The draw is random; nothing is guaranteed.

### Tasks and verification

If you configure tasks (Twitter follow, like, retweet, Discord member, Discord role), the bot verifies each task before counting a member as eligible. Tasks are verified at the moment they click Enter, and again at the time of the draw to prevent gaming.

### Best practices

- Be transparent about ticket counts in your giveaway description so members understand the system
- Don't use too many roles. 3 to 5 BASE roles and 2 to 4 STACK roles is usually plenty
- For high value prizes, add task gating so winners must demonstrate genuine engagement before becoming eligible

---

## Wallet Collection

### What it does

Multi chain wallet collection for whitelist or airdrop workflows. The server's team posts a wallet collection embed, members submit their wallets via button, and the team exports the resulting list.

### Why it matters

If your community runs whitelists, airdrops, or any flow requiring wallet addresses, you need a clean way to collect them. Wallet Collection replaces external forms with a Discord native flow that ties wallets to verified Discord identities.

### Supported chains

EVM compatible chains (Ethereum and Layer 2s like Arbitrum, Base, Optimism, Polygon), Solana, Bitcoin, Cardano, Cosmos, Tron, Aptos, Sui, plus an "other" option for chains you specify manually.

Address format is validated where possible (EVM checksum, Solana base58 length, etc.), but the bot does not perform on chain checks. The team is responsible for any further verification of the addresses collected.

### Setup

In the dashboard, open the Giveaway tab and switch to the Wallet Collections sub tab. For each collection, configure:

- **Title and description**
- **Channel**: Where the collection embed is posted
- **Chain(s) accepted**: One or more from the supported list
- **Role gating** (optional): Restrict who can submit by role
- **Resubmission policy**: Whether members can update their wallet after first submission

### Commands

- `/wallet-collection-post` (admin): Post a wallet collection embed to its configured channel
- `/wallet-collection-close` (admin): Close a wallet collection and disable its button
- `/wallet-list` (admin): List the wallets collected for a collection

Members click the "Submit" button on the collection embed, which opens a wallet modal. If resubmission is allowed, an "Update Wallet" option is available.

### Exporting the collected list

Two ways:

1. **From the dashboard**: The Wallet Collections sub tab has a "Copy All" button on the submissions table. Copies the list in tab separated format (Discord username, then wallet address) for pasting into Google Sheets or Excel.

2. **From Discord**: `/wallet-list` (admin only) replies with a paginated view.

### Best practices

- Be explicit in the description about what the wallets will be used for
- Close the collection (`/wallet-collection-close`) once you have what you need; this disables the button so no late submissions clutter your list
- For airdrops, run a wallet collection AFTER any other eligibility steps so members who don't qualify don't waste time submitting

---

## Radar

### What it does

Web3 market intelligence inside Discord. Live price lookups, top gainers and losers, watchlists, daily alerts, and discovery for crypto, NFT, meme coins, forex, and commodities. Members can check markets without leaving the server.

### Why it matters

Web3 communities live and breathe market data. Radar puts the data inside Discord, branded, scoped to your server's watchlist, with optional daily summary posts so members start the day with context.

### Setup

In the dashboard, open the Radar module tab. Configure:

- **Enabled feeds**: Crypto, NFT, Meme coins, Forex, Commodities (toggle individually)
- **Alert channel**: Where Radar alerts and daily digests are posted
- **Watchlist**: Add assets (tokens, NFT collections, meme coins, forex pairs, commodities) you want tracked
- **Alert thresholds**: Percent change at which the bot alerts (default values are sensible)

### Commands

User commands:

- `/price token` (user): Look up a crypto price by symbol or CoinGecko ID
- `/topgainers` (user): Top 10 24 hour gainers
- `/toplosers` (user): Top 10 24 hour losers
- `/watchlist` (user): Show this server's Radar watchlist

Admin commands:

- `/radar add` (admin): Add an asset to the Radar watchlist
- `/radar remove` (admin): Remove an asset from the watchlist

Coming soon (placeholder commands):

- `/price nft`, `/price meme`, `/price forex`, `/price stock`: These respond with a "coming soon" message today. Full functionality is on the roadmap.

### Daily summary

If enabled, AVbot posts a daily summary at a configured time with movements for everything on the watchlist. Useful as a morning briefing for the community.

### Important note

Radar is informational, not financial advice. Prices and percentage changes are pulled from third party data sources and may have small delays. Make your own decisions about anything you trade or invest in.

### Best practices

- Keep the watchlist focused on assets the community actually cares about
- Use the daily summary as a low effort engagement driver
- For tokens with multiple tickers across chains, double check you're tracking the right one

---

## Protection

### What it does

Anti spam, anti raid, anti scam guardrails. Automatic detection and response to common community attacks: link spam, phishing URLs, impersonator accounts, mass join raids, suspicious new accounts.

### Why it matters

Web3 Discord communities are continuously targeted by scammers, phishers, and raid bots. Manual moderation alone doesn't scale. Protection runs continuously and handles common attacks before a human moderator needs to intervene.

### Setup

In the dashboard, open the Protection module tab. Configure:

- **Spam detection**: Threshold messages per second, action (warn, delete, timeout, kick)
- **Link filtering**: Block known scam domains, allow trusted domains
- **Phishing detection**: Block common phishing URL patterns
- **Anti raid**: Detect mass join patterns (many accounts joining in a short window) and lock down the server
- **Suspicious account filter**: Auto kick or quarantine accounts younger than X days
- **Mod log channel**: Where Protection actions are reported for transparency

### Commands

- `/protection-config` (admin): View or toggle protection module settings
- `/protection-unlock` (admin): Lift anti raid lockdown and re enable server access
- `/protection-stats` (admin): Show protection action counts

Members don't interact with Protection directly. The module runs as background listeners on messages and member joins.

### Anti raid lockdown

If the anti raid detector triggers, AVbot temporarily restricts joins or messaging until the situation is reviewed. Admins lift the lockdown with `/protection-unlock` once the raid has passed.

### Best practices

- Start with default thresholds; tune them only if you see false positives
- Use a dedicated mod log channel so the team sees every action
- Review `/protection-stats` weekly to spot patterns

---

## Analytics

### What it does

Real time community activity dashboard. Member counts, join rates, message activity, voice activity, retention metrics, all visualized in the dashboard.

### Why it matters

You can't improve what you don't measure. Analytics gives you a clear view of community health, growth, and engagement patterns over time.

### Setup

Analytics runs automatically as soon as the module is enabled. No manual configuration needed.

In the dashboard, open the Analytics tab to see:

- Members joined and left over time
- Daily active members
- Message and voice activity counts
- Top channels by activity
- Retention curves
- Snapshot history (auto generated daily)

### Commands

No slash commands. Analytics is dashboard only.

### Best practices

- Check analytics weekly to spot trends
- Compare time periods (week over week, month over month) to identify what's working
- Pair with the Logs module to correlate activity spikes with specific events

---

## Embed Messages

### What it does

Build branded Discord embeds from the dashboard. Useful for announcements, rules channels, welcome messages, info pages, anything that benefits from a structured visual format.

### Why it matters

Discord's built in message formatting is limited. Embeds let you create polished, branded content with titles, descriptions, fields, images, and buttons. The dashboard makes building them trivial.

### Setup

Fully managed from the dashboard. Open the Embed Messages module tab. Click "New Embed" to create one.

Configure:

- **Title, description, color, thumbnail, image**
- **Fields**: Inline or full width sub sections
- **Footer**
- **Channel and post mode**: New message, or update an existing message by ID

Use the live preview to see how it'll look before posting.

Custom embed colors and per server brand styling are part of the visual customization feature on the roadmap. Until that ships, embeds use the default brand style. If you want early access for your server, message `nervyesi1`.

### Commands

No slash commands. Embed Messages is dashboard only.

### Best practices

- Use embeds for any content that members will reference repeatedly (rules, FAQ, contact info)
- Update existing embeds by ID rather than posting new ones; keeps the channel tidy
- Don't overuse images; they break the layout on small screens

---

## Logs

### What it does

Unified audit trail across every module. Every meaningful action by AVbot or by admins through the dashboard is recorded and viewable in the dashboard's Logs tab.

### Why it matters

When something looks off ("why was this user kicked?" or "who changed the giveaway settings?"), Logs has the answer. Indispensable for investigating issues, training new staff, and demonstrating accountability.

### Setup

Logs runs automatically. Optionally, configure a log channel in Discord where summary events are posted (separate from the dashboard view).

In the dashboard, open the Logs module tab to filter by:

- Module (verification, raid, giveaway, etc.)
- Action type
- Actor (which admin or which automated process)
- Time range

### Commands

No slash commands. Logs is dashboard only.

### Best practices

- Configure a Discord log channel for at least the high impact modules (Protection, Giveaway, Raid)
- Review logs after any major event (a raid, a giveaway draw, a mod action) to understand what happened
- Use logs to spot patterns; same admin making the same change repeatedly might indicate a UX issue worth fixing

---

## Server Settings

### What it does

Server level settings that don't fit into other modules: branding (default visuals today, customizable in the future), level system configuration, points configuration, voice tracking settings, member preferences.

### Why it matters

Some settings span multiple modules or aren't specific to any one of them. Server Settings is the home for those.

### Setup

In the dashboard, open the Server Settings module tab. You'll find sub sections for:

- **Branding**: Server name, default visual style. Custom colors and logos are on the roadmap. Message `nervyesi1` if you want early access.
- **Levels**: Configure XP per message, level up rewards, level role assignments. The `/levels` command shows the leaderboard.
- **Points**: View and adjust members' engage and community point balances. Admin only operations.
- **Voice tracking**: Track voice channel activity (toggle on/off, configure thresholds)
- **Member preferences**: Per server settings for notifications, language defaults, etc.

### Commands

Most settings are dashboard only. Level related and points related commands are listed in the [Profile, Points, and Leaderboards](#profile-points-and-leaderboards) section.

### Best practices

- Set up Levels early so the XP system starts accumulating data
- Don't manually adjust points unless you have a specific reason (use the admin commands sparingly; logs every change)
- For voice tracking, decide upfront whether you want it on (helps active communities) or off (saves storage)

---

# Profile, Points, and Leaderboards

These are cross cutting features that touch multiple modules.

### User commands

- `/profile` (user): View your AVbot profile in this server, including points, level, XP, and linked X account. Optionally view another user's profile (admin only).
- `/setx` (user): Link your X (Twitter) username to your profile. Required for participating in Engage and Raid.
- `/leaderboard` (user): Combined raid and engage leaderboard for this server. Top 100 members, paginated 10 per page, with Previous, Next, and Find Me buttons.
- `/levels` (user): Show the top members by level and XP.

### Admin commands

These are for emergency adjustments or moderation actions. All are logged in the audit trail.

- `/add-points` (admin): Add points to a user
- `/remove-points` (admin): Remove points from a user
- `/reset-points` (admin): Reset a user's points to 0
- `/reset-points-all` (admin): Reset ALL users' points in this server. Destructive, requires confirmation.

---

# Workflows

End to end workflows tying multiple modules together.

## Setting up a new Web3 community

1. Add AVbot to the server (`Add AVbot to Discord` button on the website)
2. Configure Verification with a CAPTCHA challenge and a verified role
3. Post the verify panel using `!sendverify` in the verification channel
4. Configure Protection with default thresholds; pick a mod log channel
5. Configure Role Selection with notification and interest roles; post the panel
6. Configure Server Settings → Levels with XP rewards and level roles
7. Optionally enable Analytics, Logs, and Voice Tracking
8. Announce the server is open and share an invite

This baseline gets you a secure, organized community without any X engagement infrastructure yet.

## Running an NFT mint with whitelist and giveaway

1. Configure a **Wallet Collection** for the whitelist
2. Set the role gating to require participation in earlier community events (a verified role, or a level X role)
3. Post the wallet collection (`/wallet-collection-post`) and let it run for the announced duration
4. Run a parallel **Giveaway** for bonus mint slots
5. Configure the giveaway with BASE roles (Verified 1x, OG 5x) and STACK roles (Booster +2)
6. Optionally add task gating (Twitter follow, Discord member of a partner server)
7. When the collection and giveaway both close, export the wallet list via "Copy All" or `/wallet-list`
8. Combine with giveaway winner wallets, send to your contract deployment pipeline

## Running an engage flywheel

1. Configure the **Engage** module with a dedicated channel
2. Set a reasonable cost per submission (e.g., 10 engage points) and reward per task (e.g., 1 to 3 points per task depending on difficulty)
3. Seed the pool by having a few team members submit tweets
4. Announce the system in your server with a guide explaining `/submit` and `/engage`
5. Monitor `/engage-leaderboard` to identify top engagers; recognize them publicly
6. Adjust costs and rewards if the pool grows too fast (raise cost) or stalls (lower cost or raise rewards)

## Running a community raid

1. Make sure the **Raid** module is configured with a raid channel
2. Members link their X username via `/setx` before participating
3. When you have a tweet you want amplified, the team uses `/raid post` to create the raid
4. Configure the engagement tasks (Like, Comment, Retweet, Quote) and the points awarded
5. Members click "Join Raid" on the embed, complete the tasks on X, and verify
6. The bot auto verifies engagement and awards community points
7. Use `/raid leaderboard` to see top participants
8. For records, export with `/raiders` (CSV of all participants and their completed tasks)

## Protecting against a coordinated raid

If you see a sudden flood of new accounts or messages:

1. The **Protection** module's anti raid detector should auto trigger and lock down joins
2. Verify in the Logs (Protection tab) that the action was taken
3. Once the situation is reviewed, use `/protection-unlock` to lift the lockdown
4. Update Protection thresholds if the attack revealed a gap (lower the join rate threshold, for example)
5. Use `/protection-stats` to track frequency over time

---

# Troubleshooting

## Bot doesn't respond to commands

1. Check that AVbot has the required permissions in the channel
2. Check that the module is enabled in the dashboard
3. Type `/` and look for AVbot's commands in the list; if they're missing, the bot may not have synced commands yet (wait a minute and try again)
4. Check the bot is online (look for the green dot next to AVbot in your member list)

## Verification panel button doesn't work

1. Make sure the verification module is enabled in the dashboard
2. Check that the bot has Manage Roles permission and the verified role is below the bot's highest role
3. Re post the panel with `!sendverify` if the original panel was deleted

## Engage submissions don't appear in `/engage`

1. Check the engage channel is configured correctly in the dashboard
2. Confirm the submitter ran `/setx` to link their X account before submitting
3. The bot validates the tweet URL on submission; if invalid, the submission is rejected silently. Ask the user to try again with a fresh URL.

## Raid verification isn't crediting members

1. Make sure each participating member ran `/setx` to link their X account
2. Check the bot's logs for X verification errors (Logs module → filter for Raid)
3. Some X engagement isn't immediately visible to the verification service; ask members to wait a minute and try again
4. If verification fails repeatedly across many members, there may be a temporary upstream issue. Report it in the AmeretaVerse Discord.

## Giveaway didn't pick the right winner

The bot uses a weighted random draw. Higher ticket counts mean higher probability, not guaranteed wins. If you believe there's a genuine bug (a user with 0 tickets won, or weighting was clearly broken), report it with the giveaway ID.

## Wallet collection submissions are missing addresses

The bot validates address format on submission. If the format is invalid, the submission is rejected (the user sees an error in the modal). Common issues: extra spaces, copy paste of more than the address, wrong chain selected.

## Protection actions are too aggressive

Open the Protection settings in the dashboard and adjust thresholds. Common tuning: increase the messages per second threshold, allowlist trusted domains, decrease the "suspicious account" age threshold.

## I see a command in the dashboard but it doesn't exist in Discord

The dashboard sometimes references commands by their conceptual name. Always type `/` in Discord to see the actual list. If something looks missing, the bot may need to re sync commands (usually happens automatically on restart, but contact `nervyesi1` if persistent).

## Dashboard shows different data than Discord

Hard refresh the dashboard (Ctrl+Shift+R). The dashboard caches some data; a hard refresh forces a fresh fetch. If the discrepancy persists, contact support.

---

# Glossary

- **Administrator permission**: The Discord permission AVbot requests when invited. Required because of the breadth of operations across fourteen modules.
- **AVbot**: The Discord bot this documentation describes.
- **BASE multiplier**: In Giveaway, a role's ticket multiplier where only the highest BASE among the user's roles applies.
- **CAPTCHA**: The challenge a new member completes during verification to prove they're human.
- **Community points**: Points earned by participating in raids. Sometimes called raid points. Used as a general community contribution score.
- **Dashboard**: The web interface at https://www.avbot.app/dashboard where most AVbot configuration happens.
- **Engage points**: Points earned and spent in the Engage module. The currency of the peer to peer engagement market.
- **Engage**: The peer to peer engagement module. Members submit tweets, others engage, all parties earn or spend engage points.
- **Forms**: A module for building applications and forms inside Discord.
- **Giveaway**: A module for running role gated, ticket weighted giveaways.
- **Levels**: A module for XP based progression and level role rewards.
- **Logs**: The audit trail module showing every meaningful action.
- **Module**: One of AVbot's fourteen functional units (Verification, Role Selection, etc).
- **Per guild isolation**: The principle that data in one server is invisible to other servers.
- **Profile**: A user's view of their AVbot data in a specific server (points, level, linked X).
- **Protection**: The anti spam, anti raid, anti scam module.
- **Raid**: The module for amplifying official tweets posted by the server's team.
- **Radar**: The Web3 market intelligence module.
- **Role Selection**: Module for self serve role assignment via panels.
- **STACK multiplier**: In Giveaway, a role's ticket multiplier that's added on top of the BASE.
- **Tickets**: The support ticket module.
- **Verified role**: The Discord role assigned to a user on successful CAPTCHA verification.
- **Wallet Collection**: Module for collecting multi chain wallet addresses from members.

---

If something in this documentation is unclear, incorrect, or missing, reach out via Discord DM to `nervyesi1` or in the AmeretaVerse server: https://discord.com/invite/ameretaverse
