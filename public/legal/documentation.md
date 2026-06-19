# AVbot Documentation

Complete guide to setting up, configuring, and using AVbot for your Discord community.

**Last updated**: June 19, 2026

---

## Table of Contents

- [Getting Started](#getting-started)
  - [What is AVbot](#what-is-avbot)
  - [Invite AVbot to your server](#invite-avbot-to-your-server)
  - [First-time setup](#first-time-setup)
  - [Dashboard overview](#dashboard-overview)
- [Core Concepts](#core-concepts)
  - [Per-guild isolation](#per-guild-isolation)
  - [Visual customization tiers](#visual-customization-tiers)
  - [Permissions](#permissions)
  - [Brand customization](#brand-customization)
  - [Engagement points and community points](#engagement-points-and-community-points)
  - [Audit logging](#audit-logging)
- [Modules](#modules)
  - [Verification](#verification)
  - [Role Selection](#role-selection)
  - [Forms](#forms)
  - [Tickets](#tickets)
  - [Engage-for-Engage](#engage-for-engage)
  - [Raid](#raid)
  - [Giveaway](#giveaway)
  - [Wallet Collection](#wallet-collection)
  - [Radar](#radar)
  - [Protection](#protection)
  - [Analytics](#analytics)
  - [Embed Messages](#embed-messages)
  - [Logs](#logs)
  - [Server Settings](#server-settings)
- [Workflows](#workflows)
- [Troubleshooting](#troubleshooting)
- [Glossary](#glossary)

---

# Getting Started

## What is AVbot

AVbot is a Discord bot built for Web3 communities. It bundles fourteen modules in one bot: verification, role selection, forms, tickets, engagement systems for X (formerly Twitter), raid coordination, giveaways with role-based ticket multipliers, multi-chain wallet collection, Web3 market intelligence, protection, analytics, embed messages, logs, and server settings (including levels).

It's free to add. There's no SaaS subscription, no per-seat pricing, no premium gates on functionality. The only paid-feature-like thing right now is visual customization, which is available in the AmeretaVerse main server while we build it out. Every other server uses default visual settings.

## Invite AVbot to your server

1. Go to https://www.avbot.app
2. Click **Add AVbot to Discord** in the navigation bar
3. Discord shows you the OAuth screen with the list of servers you have admin access to. Pick the server you want to add AVbot to.
4. Review the requested permissions and click **Authorize**
5. AVbot joins your server

You need the **Manage Server** permission on the target server. If you don't have it, ask your server owner to either grant it to you or invite the bot themselves.

Once invited, AVbot is online but most modules are inactive until you configure them. Time to head to the dashboard.

## First-time setup

After AVbot joins your server:

1. Go to https://www.avbot.app/dashboard
2. Log in with Discord (OAuth)
3. Select the server you just added AVbot to from the sidebar
4. You'll see all fourteen modules as tabs at the top

Recommended first three things to set up:

### 1. Branding (Server Settings)

If you're in the AmeretaVerse main server, this is where you set your community's color and logo for AVbot's embeds. For other servers, AVbot uses its default brand (gold accent + AVbot logo) and you can skip this for now.

### 2. Verification

Stops bots and scammers at the door. Configure the verification channel where new members will be prompted to verify, choose what kind of verification (captcha is the default), and pick which role to assign on successful verification.

### 3. Protection

Anti-spam, anti-raid, anti-scam guardrails. Enable the defaults to start. You can fine-tune later. Once on, the bot quietly handles phishing links, suspicious account ages, and raid patterns.

Once those three are running, your server has the basics. Add other modules as you need them.

## Dashboard overview

The dashboard at https://www.avbot.app/dashboard is your control center. It has:

- **Server selector** (left sidebar): All servers where AVbot is installed and you have access
- **Module tabs** (top, within a server): One tab per module
- **Save button** (bottom right or per-section): Saves your changes. Always save before switching modules.
- **Live preview** (where applicable): Shows what your embed will look like in Discord
- **History/audit panel** (logs module): See who changed what and when

Most settings save with a single click. Some modules have list views (giveaways, wallet collections) where you can create new entries, edit existing ones, and delete completed ones with confirmation.

---

# Core Concepts

## Per-guild isolation

Every server's data is isolated. Your AmeretaVerse settings don't leak into the partner server's settings. Your engagement points balance in one community is separate from another. The bot treats each Discord server as its own private context.

This applies to:

- Module configurations
- Member points balances
- Engagement / raid pools
- Giveaway entries
- Wallet collections
- Audit logs

Cross-server features (like a giveaway task requiring membership in a partner Discord) work only because:

1. The admin explicitly opts in by adding the partner server as a task requirement
2. AVbot must be in that partner server too, so it can verify role membership
3. AVbot only reads the data it needs (whether the user has a specific role), nothing more

Per-guild isolation is intentional and structural. It protects your community's privacy.

## Visual customization tiers

AVbot's visual customization (custom embed colors, custom brand images in module messages) is currently in two tiers:

- **AmeretaVerse main server**: Full customization. Pick your color from the palette, upload custom images for module embeds.
- **All other servers**: Default visual settings only (AVbot's gold accent color, AVbot's logo). You can configure all functional aspects of every module, but visual customization is locked.

This is a temporary state while we build out the customization system. Your server's functionality is identical regardless of tier. Once the customization system is fully built, all servers will get full access.

If you try to customize visual settings outside AmeretaVerse, you'll see a "Visual Customization coming soon" notice. That's expected and not an error.

## Permissions

When you invite AVbot, it asks for a set of Discord permissions. Each is used for specific modules:

| Permission | Modules using it |
|---|---|
| Read Messages | All modules |
| Send Messages | All modules |
| Embed Links | All modules (embed-heavy bot) |
| Attach Files | Verification, Wallet Collection (for image attachments) |
| Manage Channels | Tickets (creates per-ticket channels), Verification (channel locks) |
| Manage Roles | Verification, Role Selection, Forms (auto-roles), Giveaway (role gating verification) |
| Manage Messages | Protection (deleting spam/scam messages) |
| Kick Members | Protection (anti-raid) |
| Ban Members | Protection (severe abuse) |
| Timeout Members | Protection (moderate abuse) |
| Read Message History | Tickets, Protection |
| Add Reactions | Role Selection, interactive embeds |
| Use External Emojis | Brand consistency in embeds |
| View Audit Log | Protection (anti-raid pattern detection) |

If you want to use only some modules, you can technically revoke permissions you don't need. But the bot is easiest to use with all default permissions granted.

For role-based features (giveaway role multipliers, role selection), AVbot's role must be higher in the role hierarchy than the roles it manages. If AVbot can't assign a role, check this first.

## Brand customization

In the Server Settings module (AmeretaVerse only for now):

- **Color**: Pick from a curated palette or use a color picker. This applies to module embed accents.
- **Logo**: Upload an image (PNG, JPG, GIF). This appears in the top-right corner of module embeds (thumbnail).
- **Banner image**: Upload an image for large embed display in select modules.

These settings are global to your server (one set of brand values, used across all modules unless a specific module overrides). The dashboard shows live previews.

## Engagement points and community points

AVbot has two parallel point systems:

- **Engagement points**: Earned via the Engage-for-Engage module. Spent on submitting your own tweets to the engage pool. The economic loop of the engagement flywheel.
- **Community points** (also called "raid points"): Earned via the Raid module. Used for leaderboards, role rewards, and other recognition systems.

Both are per-guild (your AmeretaVerse points don't transfer to another server) and persistent (they don't reset).

The new `/leaderboard` command shows a unified view combining both points, while `/engage leaderboard` and `/raid leaderboard` show the individual systems.

## Audit logging

Every meaningful action AVbot performs is logged:

- Configuration changes (who changed what, when)
- Admin actions (giveaway draws, wallet collection deletions, role assignments)
- Protection events (spam blocked, raid mode triggered)
- Module-specific events (verification success/failure, ticket creation/close)

Server admins can review these in the **Logs** module. This is your accountability trail. If something went wrong, the log will tell you what happened and when.

Logs are retained for 1 year (audit logs) or longer (aggregated/anonymized for analytics).

---

(Continues in Part 2: Modules)

---

# Modules

Each section describes one module: what it does, why it matters, how to set it up, the commands it provides, and best practices.

## Verification

### What it does

Verification stops bot accounts and unverified users from accessing your server's content. New members land in a verification channel where they must complete a captcha and human-verification step. Once verified, they're assigned a role that grants access to the rest of the server.

### Why it matters

Discord is full of self-bots, raid bots, and scam accounts. Without verification, anyone can join and immediately start spamming or scamming your members. With verification on, you gain a buffer.

### Setup

1. Go to the **Verification** tab in the dashboard
2. Pick the **Verification Channel** (where new members will be prompted)
3. Pick the **Verified Role** (assigned on successful verification)
4. (Optional) Customize the welcome / instructions embed
5. Save

When a new member joins:

1. AVbot detects the join event
2. The member is sent a verification embed in the chosen channel (or DMed if you configured DM mode)
3. They click the "Verify" button → a captcha appears
4. On successful solve, the verified role is added and they can access the rest of the server

### Commands

- `/verify` — Manually trigger verification (typically not needed since AVbot handles auto-prompts)
- `/verification-stats` — Admin command showing recent verification activity

### Configuration options

| Setting | What it does |
|---|---|
| Verification channel | Where prompts appear |
| Verified role | Role assigned on success |
| Unverified role (optional) | Role assigned on join (typically locks them out of other channels) |
| DM mode | Send verification in DM instead of a channel |
| Embed customization (AmeretaVerse only) | Color, image, title, description |

### Best practices

- Use an unverified role + channel permissions to restrict pre-verification members to only the verification channel
- Pin the verification instructions in your verification channel
- Test the flow yourself in a private test server before announcing it
- If members get stuck, you can grant them the verified role manually via Discord's right-click menu

---

## Role Selection

### What it does

Members pick their own roles via beautiful Discord embeds with buttons or reactions. Useful for self-selecting interests, regional roles, pronouns, notification preferences, and similar.

### Why it matters

Manual role assignment scales badly. The first 10 members are fine, but at 10,000 members, your mods will burn out responding to "can I get the [region] role please". Role selection panels remove the bottleneck.

### Setup

1. Go to **Role Selection** tab in the dashboard
2. Click **+ New Panel**
3. Configure:
   - Panel title and description
   - Channel to post the panel in
   - Add roles to the panel, each with its own emoji and label
   - Pick interaction mode: buttons (modern) or reactions (legacy)
4. Save and post

Members see the panel, click their preferred roles, and the role is toggled on/off.

### Commands

- `/role-panel post` — Post a panel to a channel
- `/role-panel edit` — Edit an existing panel (admin)
- `/role-panel delete` — Remove a panel

### Configuration options

| Setting | What it does |
|---|---|
| Panel title | Header shown in the embed |
| Description | Body text of the embed |
| Channel | Where the panel posts |
| Roles | List of roles available for selection (with emoji + label per role) |
| Interaction mode | Buttons or reactions |
| Multi-select | Can members pick more than one role from this panel? |
| Embed customization (AmeretaVerse only) | Color, image |

### Best practices

- Group related roles in the same panel (regions in one, languages in another, interests in a third) instead of one giant panel
- Use emoji that intuitively match the role (🌍 for regions, 🔔 for notifications)
- Avoid using role selection for verification-critical roles. Use the Verification module for that.
- Buttons feel more modern; reactions work better on mobile

---

## Forms

### What it does

Build dynamic forms inside Discord. Used for applications, audits, verification follow-ups, partner requests, anything that needs structured input. Each form has a workflow: submitter fills it out, designated reviewers approve or reject, optionally auto-assign a role on approval.

### Why it matters

Discord conversations are noisy. Important decisions get lost in chat. Forms force structured input and a clean audit trail. Every applicant tracked, every decision logged.

### Setup

1. Go to **Forms** tab
2. Click **+ New Form**
3. Configure:
   - Form name and description
   - Fields (text, multi-line, dropdown, multi-select, etc.)
   - Reviewer role (who can approve/reject)
   - Approval action (assign a role, send a DM, etc.)
4. Save and post the form trigger to a channel

When a member triggers the form:

1. They get an ephemeral message with a "Start" button
2. Clicking opens the form (multi-step modal)
3. On submit, the submission goes to the reviewer role
4. Reviewers approve or reject from a dashboard or via Discord interactions
5. On approval, configured actions fire (role assigned, DM sent)

### Commands

- `/form post` — Post a form trigger to a channel
- `/form list` — List all forms (admin)
- `/form review` — Quick-access reviewer interface (admin)

### Configuration options

| Setting | What it does |
|---|---|
| Form name + description | Shown to submitters |
| Fields | The actual questions (configurable types) |
| Reviewer role | Who can approve/reject submissions |
| Auto-role on approval | Optional role assignment |
| DM submitter | Send a confirmation when approved/rejected |
| Audit notes | Reviewers can leave notes (visible to other reviewers only) |
| Embed customization (AmeretaVerse only) | Color, image |

### Best practices

- Keep forms short. 5-7 fields max. Long forms have low completion rates.
- Always include a "Why are you applying?" or similar open-ended field — that's where signal lives
- Designate at least 2 reviewers so submissions don't sit pending when one is offline
- Auto-assign a "Pending Review" role to submitters so they're visible to reviewers in member lists

---

## Tickets

### What it does

Members open support tickets that create private channels visible only to them, your mods, and AVbot. Each ticket has a status (open, in progress, resolved), an audit trail, and can be assigned to specific team members.

### Why it matters

Forum-style support in a public channel doesn't scale. Members talk over each other, mods get pinged at random hours, and the conversation gets lost when the channel moves. Tickets solve all three.

### Setup

1. Go to **Tickets** tab
2. Configure:
   - Ticket category (where private ticket channels are created)
   - Support role (who can see and respond)
   - Categories (e.g., "Bug Report", "Partnership", "General Help")
3. Post a ticket trigger to a public channel

When a member opens a ticket:

1. They click the trigger and pick a category
2. AVbot creates a private channel with them, the support role, and AVbot
3. The support team responds inside that channel
4. When resolved, the ticket is closed (channel deleted or archived)

### Commands

- `/ticket post` — Post a ticket trigger to a channel
- `/ticket close` — Close the current ticket (used inside a ticket channel)
- `/ticket assign @user` — Assign the ticket to a specific team member

### Configuration options

| Setting | What it does |
|---|---|
| Ticket category | Discord category where ticket channels are created |
| Support role | Who can see and respond to tickets |
| Categories | What kinds of tickets are available (each with its own template) |
| Templates | Optional per-category opening message |
| Max open tickets per user | Prevent spam (default 3) |
| Auto-close inactivity timeout | Close tickets that have been silent for X hours (default off) |
| Archive vs delete | What to do on close |

### Best practices

- Create categories that match your actual support workflow (don't make 10 categories if your team handles 3)
- Assign tickets to specific team members so no one's "covering everything"
- Close tickets promptly to keep the support category clean
- Use Logs to review past tickets (audit trail)

---

## Engage-for-Engage

### What it does

A peer-to-peer engagement marketplace for X (Twitter). Members earn engagement points by helping each other amplify tweets, then spend those points to submit their own tweet to the pool. The flywheel runs without admin intervention.

### Why it matters

Web3 lives on X. Organic engagement is gold. AVbot's engage-for-engage system turns engagement from a chore into a community habit.

### How it works (full lifecycle)

1. **Submitter**: A member uses `/engage submit <tweet_url>`. They pay a small cost in engagement points (e.g., 50 points). Their tweet enters the pool.
2. **Submitter chooses tasks**: When submitting, they pick what they want engagers to do (Like only, Like + Comment, Like + Comment + Retweet, or any combination).
3. **Engagers**: Other members use `/engage` to see a list of 10 tweets in the pool waiting for engagement. They see the X handle and the tasks required for each.
4. **They engage on X**: Members go to X, do the tasks, then come back to verify.
5. **Verification**: The bot verifies via a third-party X engagement verification service.
6. **Reward**: On successful verification, engagers earn engagement points.
7. **Refresh**: Submitters' tweets cycle out of the pool after enough engagements or after a time limit.

### Commands

- `/engage` — See the current pool (10 tweets you can engage with)
- `/engage submit <tweet_url>` — Submit your tweet (costs engagement points)
- `/engage submit <tweet_url> --tasks like,retweet` — Specify required tasks
- `/engage balance` — Check your engagement point balance
- `/engage leaderboard` — Top engagers
- `/engage-list <tweet_url>` — Admin: see everyone who engaged with a specific tweet
- `/my-engagers-list <tweet_url>` — Submitter-only: see who engaged with your tweet

### Configuration options

| Setting | What it does |
|---|---|
| Engage channel | Where users run `/engage` |
| Submission cost | Points required to submit a tweet (default 50) |
| Reward per task | Points earned per task type (configurable) |
| Pool size | How many tweets sit in the active pool (default 10) |
| Cooldowns | Prevent abuse (e.g., one submission per user per 24h) |
| Embed customization (AmeretaVerse only) | Color, image |

### Best practices

- Keep submission cost meaningful but not punitive. 50 points is a good default.
- Reward Like at 5-10 points, Comment at 15-25, Retweet at 20-30. Vary by task complexity.
- Set per-user submission cooldowns to prevent flooding
- Use `/my-engagers-list` to thank top engagers — it builds community
- The leaderboard naturally rewards consistent contributors

---

## Raid

### What it does

When your community's official X account posts something important, the Raid module turns it into a coordinated engagement effort. Members get rewarded for amplifying the post.

### Why it matters

A creator posts a thread, you want it to land. Without Raid, your reach is whoever happens to see it. With Raid, your community shows up.

### How it works

1. An admin (or trusted role) uses `/raid <tweet_url>` to create a raid
2. AVbot posts a raid notification in the raids channel with the post details and the tasks
3. Members see the raid and can engage (Like, Reply, Retweet) on X
4. They verify in the bot, earning community/raid points
5. The raid stays active for a configured duration (default 24 hours)
6. The leaderboard tracks per-raid participation

Raid points are typically separate from engagement points (used for community recognition, role rewards, leaderboards).

### Commands

- `/raid <tweet_url>` — Start a raid (admin / trusted role)
- `/raid status` — See the current active raid
- `/raid leaderboard` — Top raiders
- `/raiders <tweet_url>` — See who participated in a specific raid

### Configuration options

| Setting | What it does |
|---|---|
| Raid channel | Where raids are posted |
| Reward per task | Points earned per Like/Reply/Retweet |
| Raid duration | How long a raid stays active (default 24h) |
| Allowed roles | Which roles can start raids (default Admin) |
| Embed customization (AmeretaVerse only) | Color, image |

### Best practices

- Don't raid every tweet. Save it for the ones that matter (announcements, launches, big news).
- Set raid rewards higher than engage-for-engage rewards. Raids matter more, so they should pay more.
- Acknowledge top raiders publicly. Visibility builds loyalty.
- Pair raids with timed announcements for maximum effect.

---

(Continues in Part 3: Giveaway, Wallet Collection, and remaining modules)

---

## Giveaway

### What it does

The Giveaway module lets you run role-gated, ticket-weighted giveaways with multi-step entry verification. It's the flagship module: most other Discord giveaway bots are basic random pickers. AVbot turns giveaways into community recognition with proper fairness math.

### Why it matters

Real communities reward real participants. A flat random pick gives the same probability to a brand-new member and a year-long contributor. AVbot's role multipliers and weighted draws fix that.

### Core concepts

**Entry tasks**: Things a user must do to enter a giveaway. Configurable per giveaway:

- Follow on X (up to 5 follow tasks per giveaway)
- Like or Retweet a specific tweet (1 task, can be like-only, retweet-only, or both)
- Join a Discord server and optionally have a specific role (up to 2 Discord tasks per giveaway)

**Role multipliers**: Within a Discord task, you can configure roles to give the entrant extra tickets. Two types:

- **BASE roles**: The user's "base ticket count" equals the highest BASE multiplier among the BASE roles they hold.
- **STACK roles**: STACK multipliers add to the base.

Example:
- User has `Verified` (BASE 1x), `Degen` (BASE 5x), `Booster` (STACK +2)
- Base = max(1, 5) = 5
- Stack = +2
- Total tickets = 5 + 2 = 7

**Weighted draw**: When the giveaway ends, AVbot uses `random.choices` with the ticket counts as weights. A user with 7 tickets has 7x the probability of being drawn vs a user with 1 ticket. Higher tickets = more chances, not guaranteed wins.

**Entry cost**: Each entry can cost engagement points or community points (configurable). Spending reduces the user's balance.

### Setup

1. Go to **Giveaway** tab
2. Click **+ New Giveaway**
3. Configure:
   - Title and prize description
   - Number of winners (any integer, typeable)
   - Duration (when does it end)
   - Cost source (engagement points or community points) and entry cost
   - Tasks (Follow, Like/Retweet, Discord)
   - For Discord tasks: server (paste invite URL or ID, bot resolves), optional roles with multipliers
4. Save as draft, then **Post to Channel** when ready

When the giveaway is posted:

1. AVbot posts an embed in the configured channel with all task details, prize, deadline, ticket cost
2. A "Enter Giveaway" button is attached
3. Members click → AVbot checks they meet all task requirements → enters them with calculated tickets
4. At end time, AVbot draws winners and posts the result

### Commands

- `/giveaway list` — See active giveaways in the server (admin)
- `/giveaway end` — End a giveaway early (admin)
- `/giveaway redraw` — Pick new winners (admin)

### Configuration options

Per giveaway:

| Setting | What it does |
|---|---|
| Prize | What the winner gets |
| Winner count | How many winners (1 to 1000) |
| Duration | Auto-end timer |
| Cost source | Engagement points or community points |
| Entry cost | How much per entry (default 1) |
| Tasks | Follow (up to 5), Like/Retweet (up to 1), Discord (up to 2) |
| Role multipliers | Per Discord task, BASE + STACK roles |
| Embed customization (AmeretaVerse only) | Color, image |

### How task verification works

When a user clicks "Enter Giveaway":

1. AVbot immediately responds with "Verifying tasks..."
2. In parallel, the bot:
   - Checks each Follow task via the X verification service
   - Verifies Like/Retweet via the X verification service
   - Checks Discord membership (and optional roles) for each Discord task
3. After ~1-2 seconds, the result appears:
   - If all tasks passed: "You're entered!" with their ticket count
   - If some failed: A task list with ✅/❌/⚠️ per task and a "Try again" button

The user can complete the missing tasks and click again.

### Best practices

- Pair giveaways with engagement requirements (Follow + Like/Retweet) so winners are actual community members
- Use role multipliers to reward long-time supporters without locking out new members
- Don't over-stack Discord tasks. Asking for 3+ partner server joins kills entry rates.
- For NFT drops, combine Giveaway + Wallet Collection (see Workflows section)
- Set entry cost to a meaningful number, not 1. It filters spam.

### Display format

In the giveaway embed and entry verification:

```
Tasks:
Follow: [@account](https://x.com/account)
Like & Retweet: [this tweet](https://x.com/...)
Join Discord ([AmeretaVerse](https://discord.com/invite/ameretaverse)) and have the role 
  (Verified 1x) (Degen 5x) (🎟️ Booster +2)
```

BASE roles show as `(RoleName Nx)`. STACK roles show as `🎟️ (RoleName +N)`. Each role is bolded.

---

## Wallet Collection

### What it does

Collect wallet addresses from your community across multiple blockchains. Members opt in by submitting their wallet to a collection you created. Used for whitelist mints, airdrops, holder verification workflows, and similar.

### Why it matters

Web3 communities frequently need wallet lists from their members. Doing this in Google Forms or DMs is messy. Wallet Collection is purpose-built for Discord-native workflows.

### Supported chains

- EVM (Ethereum, Arbitrum, Base, Optimism, Polygon, BSC, etc.) — single address format
- Solana
- Bitcoin
- Cardano
- Cosmos (and Cosmos SDK chains)
- Tron
- Aptos
- Sui
- Other (freeform — you specify the chain name)

The bot validates address format where applicable (e.g., EVM addresses start with `0x` and are 42 chars). Other chain validations are more relaxed.

### Setup

1. Go to **Giveaway** tab → **Wallet Collections** sub-tab
2. Click **+ New Collection**
3. Configure:
   - Name (e.g., "AmeretaVerse Mint Whitelist")
   - Chain (pick from supported list, or specify "other")
   - Description (shown in the embed)
   - Channel where the submit panel will be posted
   - (AmeretaVerse only) Embed color and images
4. Save and **Post** to the channel

The bot posts an embed with a **Submit** button. Members click → modal opens → they paste their wallet → submit.

If they've already submitted, the bot shows their current wallet first and asks if they want to update it.

### How resubmission works

If a member already submitted a wallet to a collection:

1. They click **Submit** again
2. AVbot responds ephemerally: "Your current wallet: `0x...`. Click Update Wallet to change it."
3. They click **Update Wallet** → new modal with empty field
4. They paste the new wallet, submit
5. Old wallet is replaced

This pattern prevents accidental edits.

### Commands

- `/wallet-collection-post` — Post a collection's embed to a channel (admin)
- `/wallet-collection-close` — Close a collection (admin)
- `/wallet-list` — See and copy all submissions for a collection (admin)

### Configuration options

| Setting | What it does |
|---|---|
| Collection name | Identifier in dashboard and embed |
| Chain | Validation logic and chain label |
| Channel | Where the embed posts |
| Status | Open or closed |
| Embed customization (AmeretaVerse only) | Color, top-right thumbnail, large bottom image |

### Exporting wallets

In the dashboard's submissions table, the **Copy All** button copies the list in tab-separated format:

```
nervyesi1    0x52f7ca34f44a1d22f470253a06af5110c7cfa05b
degenmsa    0xde709f2102306220921060314715629080e2fb77
web3kid    0x8617e340b3d01fa5f11f306f4090fd50e238070d
```

When pasted into Google Sheets or Excel, each value lands in its own column (Discord username in column A, wallet in column B).

You can also use `/wallet-list` in Discord. It shows the list in a code block + a downloadable `.txt` file if the list is large.

### Best practices

- Be explicit in the embed description about what the wallets will be used for (mint? airdrop? holder check?)
- Set a clear deadline (e.g., "submissions close Friday at 6pm UTC")
- Close the collection when done. Closed collections don't accept new submissions.
- For NFT drops, combine with Giveaway role-gating so only qualifying members can submit

---

## Radar

### What it does

Radar delivers Web3 market intelligence directly to your Discord. Five feed types:

- **Crypto**: Major coin prices (BTC, ETH, etc.) with hourly/daily changes
- **NFT**: Collection floor prices and volume (Pudgy Penguins, Azuki, etc.)
- **Meme**: Trending meme coins
- **Forex**: Currency pairs (EUR/USD, USD/JPY)
- **Commodities**: Gold, Silver, Oil, etc.

Each feed posts digests to a channel on a configurable schedule, plus real-time alerts for significant moves (default ±3% in 1 hour).

### Why it matters

Your community talks about markets. Instead of everyone refreshing CoinGecko or X separately, the data shows up where the conversation already happens.

### Setup

1. Go to **Radar** tab
2. Pick which feeds to enable for your server
3. For each enabled feed:
   - Pick a channel (digests post here)
   - Configure schedule (e.g., every 6 hours, daily at 9am)
   - Optional: set alert thresholds (e.g., alert if price moves > 5% in 1h)
4. Save

The bot posts on schedule and pings on threshold breaches.

### Commands

- `/radar` — See current state of all enabled feeds (admin)
- `/radar enable <feed>` — Enable a specific feed
- `/radar disable <feed>` — Disable a feed
- `/radar alert-threshold` — Adjust alert sensitivity

### Configuration options per feed

| Setting | What it does |
|---|---|
| Channel | Where digests + alerts post |
| Schedule | How often digests are sent |
| Alert threshold | % move that triggers an alert |
| Items to track | Which coins/collections to include (or default top N) |
| Embed customization (AmeretaVerse only) | Color, image |

### Best practices

- Don't enable all 5 feeds with frequent digests — your channel will turn into a spam fountain
- Use one dedicated `#market-radar` channel
- Set alert thresholds higher than you think (5-10%) to avoid noise
- For NFT-focused communities, prioritize NFT + Crypto feeds
- For meme-focused communities, prioritize Meme + Crypto

### Data sources

Radar pulls from public market data sources. Prices may be delayed by minutes. AVbot's Radar is for community awareness, NOT for trading decisions. Don't make financial decisions based on Radar data alone.

---

## Protection

### What it does

Anti-spam, anti-raid, anti-scam guardrails. Quietly works in the background to keep your server clean.

### What it stops

- **Phishing links**: Known phishing domains in messages are blocked
- **Spam patterns**: Repeated identical messages, mass DM attempts, etc.
- **Scam patterns**: Common scam phrases ("free nitro", "earn $X/day", etc.)
- **Account age**: Suspiciously young accounts that look like raid bots can be flagged
- **Raid coordination**: Sudden joins of many accounts gets the server into lockdown mode

### How it works

The bot:

1. Listens to message events (only if Protection is enabled)
2. Listens to join events
3. Reads message content in memory to detect patterns — does NOT store the content
4. When it detects a threat, takes the configured action (delete, timeout, kick, ban)
5. Logs every action to the audit log

### Setup

1. Go to **Protection** tab
2. Enable the protections you want:
   - Anti-spam
   - Anti-raid
   - Anti-scam
   - Account age gate
   - Phishing blocklist
3. Configure per-protection actions (warn, mute, kick, ban)
4. Configure raid mode threshold (e.g., enter lockdown if >10 joins in 60s)
5. Save

### Commands

- `/protection status` — See current protection state and recent events
- `/protection lockdown` — Manually enter raid mode
- `/protection lift` — Exit raid mode manually
- `/protection threshold` — Adjust thresholds on the fly

### Configuration options

| Setting | What it does |
|---|---|
| Enabled protections | Toggle each protection type |
| Action per protection | What to do when detected (delete/timeout/kick/ban) |
| Raid mode threshold | Joins per minute to trigger lockdown |
| Account age gate | Minimum account age to join (e.g., 7 days) |
| Phishing blocklist | Auto-updated list of known phishing domains |
| Embed customization (AmeretaVerse only) | Color, image (for action embed posts) |

### Logs

Protection actions appear in:

- The dedicated protection log channel (if configured)
- The unified Logs module
- The Analytics dashboard (aggregated)

### Best practices

- Start with the defaults. Don't over-tune until you see real problems.
- For high-profile launches (NFT mint, token drop), temporarily lower the raid mode threshold
- Pair Protection with Verification — together they're much stronger than either alone
- Review your Protection logs weekly to spot patterns
- False positives happen. Whitelist trusted users via roles or per-user exceptions in the dashboard.

---

(Continues in Part 4: Analytics, Embed Messages, Logs, Server Settings, Workflows, Troubleshooting, Glossary)

---

## Analytics

### What it does

A real-time dashboard showing your community's heartbeat: member growth, engagement activity, module performance, and trends.

### Why it matters

Without data, you're guessing. Analytics turns "I think engagement is up this month" into facts.

### What it shows

- **Members**: Total, active, growth over time
- **Engagement**: Engage submissions, raid participation, total points awarded
- **Module activity**: Verifications completed, tickets opened, forms submitted, giveaways drawn
- **Protection events**: Threats blocked, raid mode activations
- **Voice activity**: Time spent in voice channels per user (if voice tracking is enabled in Server Settings)

### Setup

1. Go to **Analytics** tab
2. Choose default time range (7-day, 30-day, 1-day)
3. (Optional) Enable per-channel breakdown
4. View the dashboards

There's no member-facing setup. Analytics is admin-only.

### Commands

- `/analytics summary` — Quick summary of the last 7 days (admin)
- `/analytics export` — Export raw data as JSON or CSV (admin)

### Configuration options

| Setting | What it does |
|---|---|
| Default time range | What loads by default in the dashboard |
| Voice tracking | Enable per-user voice activity tracking (Server Settings) |
| Export format | JSON or CSV |

### Best practices

- Check Analytics weekly. Trends emerge over weeks, not days.
- Compare engagement before and after launching new modules to see impact
- Use the data when pitching partnerships ("we drive X engagements per week")
- Don't obsess over short-term dips. Communities ebb and flow.

---

## Embed Messages

### What it does

Build branded Discord embeds visually in the dashboard. Customize titles, descriptions, colors, images, buttons. Post them as one-off announcements or save them as templates for repeated use.

### Why it matters

Discord's default message styling is plain. Embeds make announcements feel professional and on-brand. The embed builder removes the friction of crafting them.

### Setup

1. Go to **Embed Messages** tab
2. Click **+ New Embed**
3. Use the visual builder:
   - Title, description, fields
   - Color (AmeretaVerse only)
   - Thumbnail image (top-right, AmeretaVerse only)
   - Large image (bottom, AmeretaVerse only)
   - Footer text
   - Buttons (with custom labels and URLs)
4. Live preview shows the result
5. Save as a template OR post directly to a channel

### Commands

- `/embed post <template-name>` — Post a saved template (admin)
- `/embed list` — List saved templates

### Configuration options

| Setting | What it does |
|---|---|
| Title | Bold top line |
| Description | Main body |
| Fields | Discord field name/value pairs |
| Color (AmeretaVerse) | Embed accent bar |
| Thumbnail (AmeretaVerse) | Small top-right image |
| Image (AmeretaVerse) | Large bottom image |
| Footer | Small bottom-left text |
| Buttons | Click-to-URL or custom interaction buttons |

### Best practices

- Save templates for recurring announcements (weekly updates, partner posts)
- Keep descriptions under 2000 characters (Discord's limit)
- Use fields for structured info (Date, Where, Time) instead of cramming everything in description
- Test before posting — the preview shows exactly what members will see

---

## Logs

### What it does

A unified audit trail of every meaningful action across every module. Who did what, when, and what changed.

### Why it matters

Accountability. When something goes wrong (a member is confused about a missing role, a giveaway result is questioned), the audit log tells you the truth.

### What's logged

- Configuration changes (which admin changed what setting)
- Module-specific events:
  - Verification: who verified when, who failed, who got the verified role
  - Tickets: opening, closing, assignment changes
  - Giveaway: entries, draws, prize distributions
  - Wallet Collection: submissions, updates, deletions
  - Protection: actions taken, lockdown enter/exit
- Admin actions in the dashboard (every save, every delete)
- Bot operational events (cogs loaded, restarts)

### Setup

1. Go to **Logs** tab
2. (Optional) Configure a log channel — events also get posted there as embeds
3. (Optional) Filter what gets logged (you can disable noisy event types)

### Commands

- `/logs recent` — Show recent log entries (admin)
- `/logs filter <module>` — Filter by module
- `/logs export` — Export logs as CSV or JSON (admin)

### Retention

- Admin action logs: 1 year
- Protection action logs: 1 year
- Module-specific events: 90 days (some shorter, some longer; the Privacy Policy has exact retention per data type)

### Best practices

- Review Logs after any significant event (giveaway, large mint, partnership launch)
- Use Logs when investigating disputes — it's the source of truth
- Configure a private mod-only log channel so you see events in real time without flooding public channels
- Don't disable logs. The cost is minimal; the value is huge.

---

## Server Settings

### What it does

The central place to configure your server-wide settings: brand, points, levels, member preferences, and other cross-cutting concerns.

### Why it matters

Settings that affect multiple modules (like brand color) shouldn't live inside each module. Server Settings centralizes them.

### What's inside

#### Branding (AmeretaVerse only — for now)

- **Primary color**: Used across all module embeds
- **Brand logo (thumbnail)**: Top-right of embed
- **Brand image (large)**: Used in select modules

Outside AmeretaVerse, these use defaults and can't be customized yet.

#### Points

Configure how engagement and community points are awarded:

- **Engage submission cost**: Default 50 points
- **Engage rewards**: Points per Like / Comment / Retweet
- **Raid rewards**: Points per Like / Reply / Retweet
- **Daily caps**: Maximum points a member can earn per day (anti-grind)

#### Levels

Tracks members' XP and assigns roles at certain thresholds:

- **XP sources**: Messages, voice time, engagement actions
- **Level thresholds**: When to assign which role (e.g., Level 10 = Active Member role)
- **XP rates**: How fast members level up

Levels is optional. Some communities use it; some don't.

#### Voice tracking

If enabled, AVbot tracks how much time each member spends in voice channels. This data feeds Analytics and Levels.

#### Member preferences

Per-member opt-outs for DM notifications, mentions in raid notifications, etc.

### Setup

1. Go to **Server Settings** tab
2. Configure each sub-section as needed
3. Save

### Commands

- `/settings` — Quick admin view of current server settings
- `/level` — Member command: see your current level and XP
- `/level top` — Top-leveled members in the server

### Best practices

- Pick brand color and logo BEFORE enabling visual-heavy modules (so all embeds match)
- Set daily point caps to prevent grinding (e.g., 500 max engagement points per day)
- If you enable Levels, communicate the system to members so they know what to expect
- Voice tracking is privacy-relevant — let members know if you enable it

---

# Workflows

Common end-to-end patterns that combine multiple modules.

## Workflow 1: Set up a new Web3 community from scratch

You just created a Discord server. Here's the recommended setup order:

### Step 1: Branding

- Pick a brand color
- Upload a logo
- Set the server name and description

### Step 2: Add AVbot

- Invite from https://www.avbot.app
- Authorize the default permissions

### Step 3: Verification

- Enable the Verification module
- Set up an unverified role + a verified role
- Restrict pre-verification members to only the verification channel

### Step 4: Protection

- Enable Protection with defaults
- Add a few extra paranoid rules for launch day (lower raid threshold, higher account-age gate)
- Set up a protection log channel

### Step 5: Role Selection

- Create panels for common roles (regions, interests, notification preferences)
- Post panels to a `#roles` channel

### Step 6: Engage-for-Engage

- Set up the engage channel
- Configure submission cost (start at 50) and rewards
- Announce the system to members

### Step 7: Server Settings

- Configure points caps
- Enable Levels if you want XP rewards
- Set up brand-wide defaults

### Step 8: Analytics

- Make sure analytics is enabled
- Check it weekly

You're done. Your server is now bot-protected, role-flexible, engagement-incentivized, and instrumented for data.

## Workflow 2: Host an NFT mint with whitelist + giveaway

You're launching an NFT collection. You want to use AVbot for:

- Whitelist collection (using Wallet Collection)
- Whitelist allocation via giveaway (using Giveaway with role multipliers)

### Setup

1. **Create roles for your community tiers**:
   - `Verified` (everyone who verified)
   - `Active` (engaged community member)
   - `Holder` (existing project holder)
   - `OG` (top-tier supporter)

2. **Create a Wallet Collection**:
   - Name: "Mint Whitelist"
   - Chain: EVM (assuming Ethereum)
   - Channel: `#whitelist`
   - Description: Explain what the whitelist is for and the deadline

3. **Create a Giveaway**:
   - Title: "Mint Whitelist Allocation"
   - Winners: 100 (or whatever your allocation is)
   - Tasks:
     - Follow @YourProject on X
     - Like + Retweet your launch tweet
     - Join Discord (your server) with role multipliers:
       - `Verified` BASE 1x
       - `Active` BASE 3x
       - `Holder` BASE 5x
       - `OG` STACK +3
   - Duration: 48 hours

4. **Announce both**: In `#announcements`, post the giveaway and direct members to submit their wallet in `#whitelist` as soon as they enter.

5. **On draw day**: AVbot picks 100 winners weighted by their tickets. The Holder tier has 5x odds, the OG tier stacks on top.

6. **Distribute**: Use `/wallet-list` to export the winners' wallets (cross-reference with the giveaway entries to find their wallet submissions). Paste into your mint contract whitelist.

7. **Notify winners**: AVbot automatically DMs or @-mentions winners when the giveaway ends.

This workflow ensures that:
- Active community members have real advantage
- Existing holders are rewarded (BASE 5x)
- Server boosters get a stack bonus (+3)
- The draw is mathematically fair (weighted, not deterministic)

## Workflow 3: Run an engage-for-engage flywheel

You want your community to amplify each other's X content organically.

### Setup

1. **Create an `#engage` channel** restricted to the verified role
2. **Configure Engage-for-Engage**:
   - Submission cost: 50 points
   - Reward per like: 5 points
   - Reward per comment: 15 points
   - Reward per retweet: 20 points
   - Pool size: 10 (default)
3. **Seed the pool**: Have 5-10 community members submit their tweets right away so the pool has something to engage with
4. **Announce**: Explain the system in `#announcements`. Pin instructions in `#engage`.
5. **Monitor**: Check `/engage leaderboard` weekly. Recognize top contributors publicly.

The flywheel:

- Members earn points by engaging with others
- They spend points to submit their own tweets
- Their submissions get engagement from others
- Their X reach grows
- They engage more to earn more

Once it gets going, it runs itself.

## Workflow 4: Coordinate a community raid

Your project just posted a major announcement on X. You want maximum amplification.

### Setup (if not already done)

1. Have the Raid module enabled with rewards configured
2. Have a `#raids` channel set up

### Run the raid

1. Use `/raid <tweet_url>` to start the raid (only admin or trusted role can do this)
2. AVbot posts a raid notification with the tweet, required tasks, and reward per task
3. Members see it, engage on X, verify in the bot, earn raid points
4. The raid stays active for 24 hours (or whatever you configured)
5. Use `/raid leaderboard` afterward to recognize top raiders

### Best practices

- Don't raid every tweet. Save it for the truly important ones (launches, partnerships, big news).
- Higher rewards = more participation. Don't be stingy.
- Pair raid announcements with a community goal ("if we get to 1000 likes, we'll do a giveaway").

## Workflow 5: Protect against a coordinated raid

A coordinated raid is underway: 50 new accounts just joined and started spamming.

### What AVbot does automatically

- **Raid mode triggers** if joins exceed your configured threshold
- **All new joins are quarantined** in an unverified state until raid mode lifts
- **Phishing/spam messages are deleted** in real-time
- **Suspicious accounts are kicked**
- **Pattern detection** flags coordinated message content

### What you do

1. **Don't panic**. AVbot is handling the technical response.
2. **Monitor `/protection status`** to see what's happening
3. **Lock down public channels** if needed via Discord's slowmode or role-restrictions
4. **Ban any survivors** that AVbot missed
5. **Review the protection log** after the storm to understand what happened
6. **Adjust thresholds** for next time based on what worked and what didn't

Raids are stressful, but with Protection on, they're survivable.

---

# Troubleshooting

## Bot is offline / not responding

**Check**:

1. The bot's status icon in your Discord member list — is it green (online), yellow (idle), or gray (offline)?
2. Does the bot have permission to read and send messages in the channel?
3. Has Discord shut down the bot temporarily? Check the AVbot announcement channel in the AmeretaVerse server.

**If offline globally**: Wait. We aim for high uptime, but outages happen. Major outages are announced in the AmeretaVerse server.

**If offline only for your server**: Reinvite the bot. If still failing, contact `nervyesi1`.

## Commands aren't appearing

**Check**:

1. Type `/` in any channel — do AVbot commands appear?
2. If not, the bot might lack the "Use Application Commands" permission. Re-check.
3. Try refreshing your Discord client (Ctrl+R or restart the app).

If commands work in some channels but not others, the bot's role hierarchy or channel permissions might block them. Check Discord's channel settings.

## A member didn't receive their role after verification

**Possible causes**:

1. **AVbot's role is below the role it's assigning**: Discord requires the bot's role to be ABOVE the role it manages. Move AVbot's role up in the hierarchy.
2. **The role was deleted**: Check that the verified role still exists.
3. **The bot lacks "Manage Roles" permission**: Check the bot's permissions.

If all checks pass and it still fails, send the member ID to `nervyesi1` for investigation.

## A giveaway picked the wrong winner

**Reminder**: The bot uses a weighted random draw. Higher tickets = higher probability, not guaranteed win. A user with 1 ticket CAN still beat a user with 7 tickets — it's just much less likely (1/8 = ~12% vs 7/8 = ~87%).

If you believe there's an actual bug:

1. Note the giveaway ID
2. Note the winner and any expected winners
3. Send to `nervyesi1` with the details
4. The audit log will show exactly how the draw happened

## My wallet submission isn't showing up

**Check**:

1. Did you click **Submit** AND confirm the modal?
2. Is the collection still open (admin might have closed it)?
3. Was your wallet format valid for the chain? (EVM should start with `0x` and be 42 chars)

If still missing, ask the server admin to check the dashboard's submissions table for your Discord username.

## Protection is being too aggressive

**Symptoms**: Legitimate members are being warned, muted, or kicked by Protection.

**Solution**:

1. Go to **Protection** tab
2. Increase thresholds (e.g., raise minimum account age from 30 days to 7 days)
3. Whitelist specific roles (the dashboard has a "trusted roles" list per-protection)
4. Review the protection log to see what's triggering false positives
5. Adjust the specific protection that's misfiring

False positives are usually fixable with a 5-minute config change. Don't disable Protection entirely.

## Dashboard isn't saving my changes

**Check**:

1. Did you click **Save** after making changes? (Many sections have a Save button per-area.)
2. Did you see a green "Saved" confirmation?
3. Is your browser blocking cookies (the dashboard needs them for the Discord OAuth session)?

If the Save button is missing or doesn't respond, hard-refresh the page (Ctrl+Shift+R) and re-log in. If still failing, contact `nervyesi1`.

## The Radar feed isn't posting

**Check**:

1. Is the feed enabled for your server?
2. Is the channel still in the correct state (not deleted, AVbot has access)?
3. Has the scheduled time arrived?

Radar posts on schedule. If your schedule is daily at 9am UTC and it's 8:59am, wait one more minute.

## I lost engagement / community points

**Possible causes**:

1. You submitted a tweet to engage (which deducts the submission cost)
2. Daily caps reset, but your balance shouldn't go down — only your earnable-per-day resets
3. Server admin manually adjusted (visible in audit log)
4. Bug

If you suspect a bug, contact `nervyesi1` with your Discord ID and a description.

---

# Glossary

**AmeretaVerse**: The flagship AVbot community at https://discord.com/invite/ameretaverse. Also the term for the "main server" that has full visual customization access.

**Audit log**: A record of every meaningful action AVbot takes, maintained for accountability.

**BASE multiplier**: In giveaway role multipliers, a multiplier that sets the user's base ticket count. The user's actual base = highest BASE among the BASE roles they hold.

**Community points**: Synonym for raid points. Earned via the Raid module.

**Embed**: Discord's rich message format with colored side-bars, fields, images. AVbot uses embeds extensively.

**Engage points / Engagement points**: Earned via the Engage-for-Engage module. Spent on submitting tweets.

**Engage pool**: The current set of tweets waiting for engagement. Members see this when they run `/engage`.

**Guild**: Discord's internal term for "server". You'll see "guild" in some technical contexts.

**Module**: One of AVbot's 14 functional units (Verification, Role Selection, etc.).

**Per-guild isolation**: Each Discord server's data is fully separate. Settings in one server don't affect another.

**Raid (community usage)**: When a community coordinates to amplify a specific X post.

**Raid (Protection usage)**: A coordinated attack on a Discord server, typically many fake accounts joining at once to spam.

**Raid points**: Synonym for community points. Earned via the Raid module.

**Snowflake**: A 17-20 digit numeric identifier Discord uses for users, servers, channels, roles, etc.

**STACK multiplier**: In giveaway role multipliers, a multiplier that adds to the user's base ticket count. STACK values from multiple matching roles are summed.

**Ticket (giveaway sense)**: An entry weight in the giveaway draw. A user with 7 tickets has 7x the probability of being drawn vs a user with 1 ticket.

**Ticket (support sense)**: A private support channel created via the Tickets module.

**Verification**: The process of confirming a new Discord member is human (via captcha) before granting full server access.

**Weighted draw**: Picking winners from a pool where each entrant has a different probability based on their ticket count. AVbot uses `random.choices(entrants, weights=tickets)` for this.

---

*Documentation last updated: June 19, 2026*

For real-time help, message `nervyesi1` on Discord or visit the AmeretaVerse server: https://discord.com/invite/ameretaverse
