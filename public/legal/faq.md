# Frequently Asked Questions

Quick answers to the most common questions about AVbot.

If you don't find what you're looking for, message `nervyesi1` on Discord or join the AmeretaVerse server: https://discord.com/invite/ameretaverse

---

## General

### What is AVbot?

AVbot is a Discord bot built for Web3 communities. It combines fourteen modules in one bot, including verification, role selection, forms, tickets, X engagement systems, raid coordination, giveaways with role based ticket multipliers, multi chain wallet collection, Web3 market intelligence, protection (anti spam, anti raid, anti scam), analytics, logging, and more.

If you've ever installed five different Discord bots just to cover all these features, AVbot replaces them with one.

### Is AVbot really free?

Yes. AVbot is completely free to add to your server and use.

### Who built AVbot?

AVbot is built and operated independently. Reach out via Discord DM to `nervyesi1` for anything community, support, or partnership related.

### Where can I see AVbot in action?

Join the AmeretaVerse Discord server: https://discord.com/invite/ameretaverse

---

## Setup

### How do I add AVbot to my server?

1. Click "Add AVbot to Discord" on the website (https://www.avbot.app)
2. Choose the server you want to add the bot to (you need "Manage Server" permission for that server)
3. Confirm the permissions AVbot needs
4. The bot joins your server

That's it. Once added, head to the dashboard at https://www.avbot.app/dashboard to configure modules.

### What permissions does AVbot need?

AVbot requests **Administrator** permission when you add it to your server.

Administrator is requested because AVbot spans fourteen modules with very different needs. Role assignment for verification and giveaway gating, channel creation for tickets, message filtering for protection, audit log access for anti raid detection, role management for level rewards, and many other operations across modules would otherwise require a long list of granular permissions. Requesting Administrator keeps the install flow simple and lets every module work correctly out of the box.

AVbot uses this access only for the modules you enable. We don't read DMs, we don't store messages outside of the protection processing pipeline, and we don't change server settings you haven't asked us to change. See the Privacy Policy for what data AVbot accesses and the Terms of Service for the commitments around how we use that access.

### Where do I configure AVbot?

Everything is configured in the dashboard at https://www.avbot.app/dashboard. Log in with your Discord account, pick your server, and you'll see each module as its own tab.

### Do I need to know how to code?

No. The dashboard is fully visual. Module configuration is point and click. Discord commands are slash commands that the bot teaches you how to use.

### Can I customize the visual look of AVbot's messages (colors, logos)?

Visual customization of embeds (custom colors, custom logos, branded module messages) is a feature on the roadmap that is not yet available to every server. Right now AVbot uses its default visual style across all servers it's installed in.

If you want early access to visual customization for your server, message `nervyesi1` on Discord and we can talk.

---

## Modules

### What does each module do?

In short:

- **Verification**: CAPTCHA challenge to keep bot accounts out at the door
- **Role Selection**: Members pick their own roles via panels with buttons and dropdowns
- **Forms**: Visual form builder for applications, approvals, audits
- **Tickets**: Support ticket channels with status tracking and auto close on inactivity
- **Engage**: Members earn engage points by engaging with each other's X posts, spend points to submit their own
- **Raid**: Your team posts a tweet, members engage with it on X, earn community points for participating
- **Giveaway**: Role gated giveaways with ticket multipliers and weighted draws
- **Wallet Collection**: Multi chain wallet collection for whitelist or airdrop workflows (EVM, Solana, Bitcoin, Cardano, Cosmos, Tron, Aptos, Sui, and an "other" option)
- **Radar**: Web3 market intelligence with feeds for Crypto, NFT, Meme coins, Forex, and Commodities
- **Protection**: Anti spam, anti raid, anti scam guardrails
- **Analytics**: Real time community activity dashboard
- **Embed Messages**: Build branded Discord embeds from the dashboard
- **Logs**: Unified audit trail across every module
- **Server Settings**: Branding, levels, points configuration

For deep details on each, see the full documentation at https://www.avbot.app/docs.

### How does the engage system work?

1. A member uses `/submit` in the configured engage channel to submit their X tweet to the pool, paying a small engage point cost
2. Other members use `/engage` to see a list of tweets waiting for engagement, with the tasks required (Like, Comment, Retweet, or combinations)
3. They complete the tasks on X, then verify in the bot
4. Successful verification rewards them with engage points
5. They can spend those points to submit their own tweet, completing the flywheel

It's a peer to peer engagement marketplace, denominated in points your community already values.

### How does Raid differ from Engage?

Raid is for amplifying the server's official posts. The server's team or admin posts a tweet through the bot (using `/raid post`), and members engage with that tweet to earn community points (sometimes called raid points). It's one official post, many participants, all rewarded.

Engage is peer to peer. Any member can submit their own tweet to the pool, other members engage with it, the engager earns engage points to spend on their own future submissions.

Both systems run on the same X verification infrastructure but serve different purposes.

### How do the giveaway role multipliers work?

When you create a giveaway, you can configure Discord roles to give members extra entry tickets:

- **BASE roles**: The user's "base ticket count" equals the highest BASE multiplier among the BASE roles they hold. For example, if a user has `Verified` (1x BASE) and `Degen` (5x BASE), their base is 5.
- **STACK roles**: STACK multipliers add to the base. If that same user also has `Booster` (+2 STACK), their final ticket count is 5 + 2 = 7.

The bot uses these ticket counts as weights when drawing winners. More tickets means more chances, not guaranteed wins.

Example display in the giveaway embed:

```
Join Discord (server name) and have the role
(Verified 1x) (Degen 5x) (🎟️ Booster +2)
```

### What chains does Wallet Collection support?

Out of the box: EVM compatible chains (Ethereum, Layer 2s like Arbitrum, Base, Optimism, Polygon), Solana, Bitcoin, Cardano, Cosmos, Tron, Aptos, Sui, plus a freeform "other" category for chains you specify manually.

The bot doesn't validate the address against the actual chain (we don't perform on chain checks). It collects the address, validates format level when possible, stores the submission, and lets you export the list for your downstream workflow.

### How does the team get the collected wallets?

When you (the server admin or team) set up a wallet collection through the dashboard, members submit their wallets via a button on the embed. Once you've collected enough, you have two ways to get the list:

1. **From the dashboard**: Open the Giveaway → Wallet Collections tab on the dashboard for your server. The submissions table has a "Copy All" button that copies the list in tab separated format (Discord username, then wallet address), so you can paste straight into Google Sheets or Excel with each value in its own column.

2. **From Discord**: Use `/wallet-list` in your server (admin only). The bot replies with a paginated view of the collected wallets.

Either way, you control when to close the collection (`/wallet-collection-close`) and the data is yours to use for whatever workflow needs it.

---

## Data and Privacy

### Is my data safe?

AVbot collects only what's needed to run the bot. Specifically:

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

In a relational database hosted on third party cloud infrastructure. Daily backups for disaster recovery. We use industry standard practices appropriate to a free Discord bot. Full details in the Privacy Policy.

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

The bot uses a weighted random draw based on ticket counts. Higher tickets equals higher probability, not guaranteed win. If you believe there's a bug (for example, a user with 0 tickets won, or weighting was clearly broken), report it on Discord with the giveaway ID and we'll investigate.

### The bot is offline

Check the AmeretaVerse Discord server for announcements. If a major outage is happening, we'll post there first.

For real time status, you can check the bot's online status in any server it's in.

### I think there's a bug

Report bugs by:
- Posting in the AmeretaVerse Discord server
- DM `nervyesi1`
- Email ameretaverse@gmail.com

Please include: what you tried to do, what happened instead, the server ID, and a screenshot if possible.

### I think there's a security vulnerability

Don't post it publicly. Email ameretaverse@gmail.com with the subject "Security Disclosure" or DM `nervyesi1`. See the Security policy: https://www.avbot.app/security

---

## Other

### Can multiple Discord bots work alongside AVbot?

Yes. AVbot doesn't conflict with most other Discord bots. The exception: don't run two bots that try to do the same exact thing (for example, two verification bots). Pick one and stick with it.

### What happens if AVbot shuts down?

If we ever permanently shut down AVbot, we'll announce it at least 30 days in advance in the AmeretaVerse server. During that window, you can export your data. After the shutdown, all data is deleted within a reasonable retention period. See the Terms of Service for full shutdown procedures.

### Can I get AVbot in another language?

Currently AVbot's user facing messages are in English. Multi language support is on the roadmap but not yet shipped.

### Can I contribute to AVbot?

The website source code and backend source code are both published in public repositories for transparency. We don't currently accept external contributions, but we welcome feature suggestions and bug reports.

### Is there a roadmap?

Not a public one. New features are announced in the AmeretaVerse Discord server as they ship.

### How do I stay updated?

- Follow `@Nervyesi` on X for major announcements
- Join the AmeretaVerse server: https://discord.com/invite/ameretaverse
- Watch the AVbot website for new features

---

Have a question that isn't answered here? Reach out via Discord DM to `nervyesi1` or in the AmeretaVerse server.
