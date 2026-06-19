# Frequently Asked Questions

Quick answers to the most common questions about AVbot.

If you don't find what you're looking for, message `nervyesi1` on Discord or join the AmeretaVerse server: https://discord.com/invite/ameretaverse

---

## General

### What is AVbot?

AVbot is a Discord bot built for Web3 communities. It combines fourteen modules in one bot, including verification, role selection, forms, tickets, X engagement systems, raid coordination, giveaways with role-based ticket multipliers, multi-chain wallet collection, Web3 market intelligence, protection (anti-spam, anti-raid, anti-scam), analytics, logging, and more.

If you've ever installed five different Discord bots just to cover all these features, AVbot replaces them with one.

### Is AVbot really free?

Yes. AVbot is completely free to add to your server and use.

Visual customization (custom embed colors, custom logos in module messages) is currently limited to the AmeretaVerse main server while we build out the customization system. All other servers use AVbot's default visual settings. This may change in the future, but no functionality you currently have will be removed without notice.

### Who built AVbot?

AVbot is built and operated independently. Reach out via Discord DM to `nervyesi1` or in the AmeretaVerse server for anything community, support, or partnership related.

### Where can I see AVbot in action?

Join the AmeretaVerse Discord server: https://discord.com/invite/ameretaverse

AmeretaVerse is the flagship community where every module is deployed and used daily.

---

## Setup

### How do I add AVbot to my server?

1. Click "Add AVbot to Discord" on the website (https://www.avbot.app)
2. Choose the server you want to add the bot to (you need "Manage Server" permission for that server)
3. Confirm the permissions AVbot needs
4. The bot joins your server

That's it. Once added, head to the dashboard at https://www.avbot.app/dashboard to configure modules.

### What permissions does AVbot need?

AVbot requests the following permissions:

- **Read Messages** and **Send Messages**: To respond to commands and post embeds
- **Manage Channels**: For tickets module (creating ticket channels) and certain verification flows
- **Manage Roles**: To assign verified/role-based roles to members
- **Kick / Ban / Timeout Members**: For protection module enforcement
- **Manage Messages**: To delete spam/phishing messages caught by protection
- **Embed Links** and **Attach Files**: For rich embeds and module visuals
- **Read Message History**: To process replies and reactions
- **Use External Emojis** and **Add Reactions**: For interactive embeds
- **View Audit Log**: To detect anti-raid patterns

AVbot will only use these permissions for the modules you enable.

### Where do I configure AVbot?

Everything is configured in the dashboard at https://www.avbot.app/dashboard. Log in with your Discord account, pick your server, and you'll see each module as its own tab.

### Do I need to know how to code?

No. The dashboard is fully visual. Module configuration is point-and-click. Discord commands are slash-commands that the bot teaches you how to use.

### What's the AmeretaVerse main server thing about customization?

AVbot's visual customization system (custom embed colors, brand logos in module messages) is currently in beta. While we polish it, custom visual settings are enabled only in the AmeretaVerse main server, which is where we test new features.

All other servers can use every feature of AVbot, just with the default visual style (the AVbot brand colors and logo). Functionality is identical. Only the visual customization layer differs.

---

## Modules

### What does each module do?

In short:

- **Verification**: Captcha + human verification to stop bot accounts at the door
- **Role Selection**: Members pick their own roles via reaction or button panels
- **Forms**: Visual form builder for applications, approvals, audits
- **Tickets**: Categorized support threads with status tracking
- **Engage-for-Engage**: Members earn points by engaging with each other's X posts, spend points to submit their own
- **Raid**: Reward members for engaging with your community's X posts
- **Giveaway**: Role-gated giveaways with ticket multipliers and weighted draws
- **Wallet Collection**: Multi-chain wallet whitelist collection (EVM, Solana, Bitcoin, Cardano, Cosmos, Tron, Aptos, Sui, and more)
- **Radar**: Web3 market intelligence with feeds for Crypto, NFT, Meme coins, Forex, and Commodities
- **Protection**: Anti-spam, anti-raid, anti-scam guardrails
- **Analytics**: Real-time community dashboard
- **Embed Messages**: Build branded Discord embeds from the dashboard
- **Logs**: Unified audit trail across every module
- **Server Settings**: Branding, levels, points configuration

For deep details on each, see the full documentation.

### How does the engage-for-engage system actually work?

1. A member uses `/engage submit` to submit their X tweet to the pool, paying a small engagement-point cost
2. Other members use `/engage` to see a list of tweets waiting for engagement, with the tasks required (Like, Comment, Retweet, or combinations)
3. They complete the tasks on X, then verify in the bot
4. Successful verification rewards them with engagement points
5. They can spend those points to submit their own tweet, completing the flywheel

It's a peer-to-peer engagement marketplace, denominated in points your community already values.

### How does Raid differ from Engage-for-Engage?

Raid is for amplifying YOUR community's official posts (typically the server's announcement or brand X account). Engage-for-Engage is for peer-to-peer engagement among members.

Raid: one creator's post, many members engage, all members earn raid points (sometimes called community points).

Engage-for-Engage: any member can post their tweet to the pool, other members engage, earners get engagement points to spend on their own posts.

Both run on the same X verification infrastructure.

### How do the giveaway role multipliers work?

When you create a giveaway, you can configure Discord roles to give members extra entry tickets:

- **BASE roles**: The user's "base ticket count" equals the highest BASE multiplier among the BASE roles they hold. For example, if a user has `Verified` (1x BASE) and `Degen` (5x BASE), their base is 5.
- **STACK roles**: STACK multipliers add to the base. If that same user also has `Booster` (+2 STACK), their final ticket count is 5 + 2 = 7.

The bot uses these ticket counts as weights when drawing winners. More tickets means more chances, not guaranteed wins.

Example display in the giveaway embed:

```
Join Discord (AmeretaVerse) and have the role
(Verified 1x) (Degen 5x) (🎟️ Booster +2)
```

### What chains does Wallet Collection support?

Out of the box: EVM-compatible chains (Ethereum, Layer 2s like Arbitrum, Base, Optimism, Polygon), Solana, Bitcoin, Cardano, Cosmos, Tron, Aptos, Sui, plus a freeform "other" category for chains you specify manually.

The bot doesn't validate the address against the actual chain (we don't perform on-chain checks). We collect, store, validate format-level (when possible), and let you copy out the list for your downstream workflow.

### Can I download wallet submissions to use in a mint?

Yes. The dashboard has a "Copy All" button on the wallet collection submissions table. It copies the list in tab-separated format (Discord username, then wallet address) so you can paste straight into Google Sheets or Excel — each value lands in its own column.

You can also use `/wallet-list` in Discord to see and copy the list directly there.

---

## Data and Privacy

### Is my data safe?

We collect only what's needed to run the bot. Specifically:

- Discord user IDs, usernames, server IDs, role IDs (everything Discord exposes)
- X usernames you've linked to your Discord account (only after explicit verification)
- Wallet addresses you submit (only ones you submit voluntarily)
- Points balances, giveaway entries, audit logs

We don't read your DMs, sell your data, or use it for advertising. See the Privacy Policy for full details: https://www.avbot.app/privacy

### Can I delete my data?

Yes. Contact `nervyesi1` on Discord or email ameretaverse@gmail.com, and we'll delete your data within 30 days.

For wallet collection submissions specifically, you can delete or update your own submission at any time without needing to contact us.

### Does AVbot read my Discord messages?

Only when the Protection module is enabled in your server, and only to detect spam, phishing, scams, or raid patterns. Message content is processed in memory and discarded after the moderation decision. We don't store original message text.

If Protection isn't enabled in your server, AVbot doesn't read message content at all.

### What if I leave a Discord server?

Your point balance and history for that server are kept for 90 days in case you rejoin, then may be deleted. Your wallet submissions (if any) stay until you delete them or the server admin closes the collection.

### Where is my data stored?

In a relational database hosted on third-party cloud infrastructure. Daily backups for disaster recovery. We use industry-standard practices appropriate to a free Discord bot. Full details in the Privacy Policy.

---

## Troubleshooting

### AVbot isn't responding to my commands

Check:
1. Does the bot have permission to read and send messages in that channel?
2. Is the module you're trying to use enabled in the dashboard?
3. Are you using the correct slash command? Type `/` and look for AVbot commands in the list.

If none of these solve it, the bot might be offline. Check the AmeretaVerse Discord server for status updates.

### I configured a setting but nothing changed

Settings save automatically when you click "Save" in the dashboard. If you don't see the change in Discord:
1. Hard refresh the dashboard (Ctrl+Shift+R)
2. Wait a few seconds for the bot to pick up the change
3. If still not working, message `nervyesi1`

### A giveaway didn't pick the right winner

The bot uses a weighted random draw based on ticket counts. Higher tickets = higher probability, not guaranteed win. If you believe there's a bug (e.g., a user with 0 tickets won, or weighting was clearly broken), report it on Discord with the giveaway ID and we'll investigate.

### The bot is offline

Check the AmeretaVerse Discord server for announcements. If a major outage is happening, we'll post there first.

For real-time status, you can check the bot's online status in any server it's in.

### I think there's a bug

Report bugs by:
- Posting in the AmeretaVerse Discord server in #support
- DM `nervyesi1`
- Email ameretaverse@gmail.com

Please include: what you tried to do, what happened instead, the server ID, and a screenshot if possible.

### I think there's a security vulnerability

Don't post it publicly. Email ameretaverse@gmail.com with the subject "Security Disclosure" or DM `nervyesi1`. See the Security Disclosure policy: https://www.avbot.app/security

---

## Other

### Can multiple Discord bots work alongside AVbot?

Yes. AVbot doesn't conflict with most other Discord bots. The exception: don't run two bots that try to do the same exact thing (e.g., two verification bots). Pick one and stick with it.

### What happens if AVbot shuts down?

If we ever permanently shut down AVbot, we'll announce it at least 30 days in advance in the AmeretaVerse server. During that window, you can export your data. After the shutdown, all data is deleted within a reasonable retention period. See the Terms of Service for full shutdown procedures.

### Can I get AVbot in another language?

Currently AVbot's user-facing messages are in English. Multi-language support is on the roadmap but not yet shipped.

### Can I contribute to AVbot?

The website source code is published in a public repository for transparency. The backend bot code is private. We don't currently accept external contributions, but we welcome feature suggestions and bug reports.

### Is there a roadmap?

Not a public one. New features are announced in the AmeretaVerse Discord server as they ship. Major in-flight items include FAQ + Documentation (this content), additional language support, and continued module polish.

### How do I stay updated?

- Follow `@Nervyesi` on X for major announcements
- Join the AmeretaVerse server: https://discord.com/invite/ameretaverse
- Watch the AVbot website for new features

---

*Last updated: June 19, 2026*

Have a question that isn't answered here? Reach out via Discord DM to `nervyesi1` or in the AmeretaVerse server.
