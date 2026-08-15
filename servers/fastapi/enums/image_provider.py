from enum import Enum


class ImageProvider(Enum):
    PEXELS = "pexels"
    PIXABAY = "pixabay"
    # WS14: Gemini image tiers retired — replaced by Prodia Flux Schnell
    # via Vercel AI Gateway (~$0.001-0.0025/img, 33-67x cheaper).
    PRODIA_FLUX = "prodia_flux"
    DALLE3 = "dall-e-3"
    GPT_IMAGE_1_5 = "gpt-image-1.5"
    COMFYUI = "comfyui"
    OPEN_WEBUI = "open_webui"
    OPENAI_COMPATIBLE = "openai_compatible"
