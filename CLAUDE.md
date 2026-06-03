# AVbot Website — Claude Context

## Project
React 18 CRA dashboard at www.avbot.app (Vercel). Talks to api.avbot.app.
Bot repo lives separately at D:\Vibecoding\AmeretaVerse.

## Critical constraints
1. **No dashes (— – -) or "premium/upgrade/paid" wording**. Bot launched free. "Web3" never hyphenated.
2. **Inline styles only** — Tailwind is broken in this project. Use `style={{...}}`. Animations come from index.css keyframes (e.g. `@keyframes avspin`).
3. **Discord IDs as STRINGS end-to-end** — JS Number rounds 17-20 digit snowflakes. Use `<input type="text" inputMode="numeric" pattern="[0-9]*">`. Never `Number()`-coerce IDs in state, payload, or compare.
4. **Owner detection** by string compare to `'461460143343927306'`. Coerce candidate to string first (`String(user.id) === '461460143343927306'`).
5. **Mobile-friendly**: every new component wraps on narrow viewports (use flex-wrap + responsive widths).

## Paths
src/
  pages/
    Landing.jsx
    Dashboard.jsx          # all module tabs + Owner section (OwnerBackupPanel, Global Overview)
    Analytics.jsx          # yearly_meta sparse banner; buildYAxis dynamic; voice + engage sections
  components/
    Navbar.jsx
  api.js                    # API helpers; getToken() reads localStorage 'avbot_token'
  index.css                 # CSS vars + @keyframes avspin
public/
  index.html                # title=AVbot, og:image, Cloudflare beacon via %REACT_APP_CF_BEACON%
  logo.png

## Patterns

### Snowflake input
```jsx
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={String(value || '')}
  onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
/>
```

### Owner gate
```jsx
const isOwner = ['user_id','id','sub','discord_id']
  .some(k => String(user?.[k] || '') === '461460143345927306');
```

### Inline styled card
```jsx
<div style={{
  background: '#0a0a0a',
  border: '1px solid #333',
  borderRadius: 12,
  padding: 16,
}}>...</div>
```

### API call
```js
import { getToken } from './api';
const res = await fetch(`${API}/api/...`, {
  headers: { Authorization: `Bearer ${getToken()}` }
});
```

## Build
```bash
CI=true npm run build 2>&1 | tail -8
```
"Compiled successfully" must appear.

## Brand
- Gold primary: #94730D
- Gold lighter: #c89a1f
- Gold hot: #e8c869
- Background: #0a0a0a

## Token storage
localStorage key: `avbot_token`. Use `getToken()` from api.js.

## Things to remember always
- Owner Discord ID: 461460143343927306 (string compare always)
- API base: https://api.avbot.app
- Inline styles only; never add Tailwind classes
- Snowflakes are strings end-to-end
- Push to origin master