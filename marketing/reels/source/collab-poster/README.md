# Collab poster template

Movie-poster style "new collab" announcement: thriftub × a shop.

```bash
# from this folder (needs playwright installed, see ../README.md)
node make.mjs --name "Shop name" --logo their-logo.png --handle @their_instagram [--district "Хан-Уул"] [--symbol vs]
```

Writes `marketing/posters/collabs/collab-<name>-post.png` (1080×1350) and `-story.png` (1080×1920).
The background green is picked from the shop name, the same as the shop's generated cover on the site.
Long names shrink automatically to fit one line.
