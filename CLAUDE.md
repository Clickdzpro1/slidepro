# SlidePro — Presenton Fork (ClickDz)

This is a fork of [presenton/presenton](https://github.com/presenton/presenton), customized for the ClickDz SlidePro mini-app inside work.clickdz.ai.

## Customizations over upstream presenton

### 1. NanoBanana2 image provider (`gemini-3.1-flash-image`) — ADDED
The optimal Gemini image model for slides: advanced text rendering (infographics/diagrams), native 16:9 aspect ratio, up to 4K, ~11.5s latency, ~$0.067/image. Upstream presenton's `gemini_flash` maps to the legacy `gemini-2.5-flash-image` and `nanobanana_pro` to `gemini-3-pro-image-preview`; neither exposes the optimal `gemini-3.1-flash-image`, and neither passes aspect ratio or resolution. This fork adds it.

**Files changed:**
- `servers/fastapi/enums/image_provider.py` — added `NANOBANANA2 = "nanobanana2"` enum value.
- `servers/fastapi/utils/image_provider.py` — added `is_nanobanana2_selected()`.
- `servers/fastapi/utils/get_env.py` — added `get_nanobanana2_aspect_ratio_env()` (default `16:9`) and `get_nanobanana2_resolution_env()` (default `2k`).
- `servers/fastapi/services/image_generation_service.py` — added `generate_image_nanobanana2()` (calls `gemini-3.1-flash-image` with `image_config` aspect_ratio + image_size), wired into `get_image_gen_func()`.

**Usage:** set `IMAGE_PROVIDER=nanobanana2` + `GOOGLE_API_KEY=<key>`. Optional overrides: `NANOBANANA2_ASPECT_RATIO` (default `16:9`; supported: `1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9`), `NANOBANANA2_RESOLUTION` (default `2k`; supported: `512, 1k, 2k, 4k`).

### 2. Branding — TODO
Rebrand the UI to SlidePro / ClickDz identity (title, favicon, login, export metadata).

### 3. Sticker library — TODO
SVG + Lottie sticker picker, 200+ stickers (curated Lucide/Tabler/OpenMoji + AI-generated themed packs).

### 4. Slide transitions — TODO
Cinematic transition presets (fade, slide, morph, scale) between slides.

### 5. 50+ templates + 50+ mindmaps — TODO
Diverse template library + mindmap layout type.

## Build & deploy
- GitHub Actions workflow (`.github/workflows/build-image.yml`) builds the Dockerfile and pushes to `ghcr.io/clickdzpro1/slidepro:latest` (+ sha + semver tags) on push to main.
- The `affine-recycler` project's `recycle-slidepro.js` pulls this image and boots it in the `slidepro-prod` Vercel Sandbox. Update the `PRESENTON_IMAGE` constant in that file when changing the image source.

## Upstream sync
Periodically merge from `presenton/presenton` main to pick up new features (templates, themes, MCP, etc.). Re-apply the customizations above (they're surgical and conflict-light).
