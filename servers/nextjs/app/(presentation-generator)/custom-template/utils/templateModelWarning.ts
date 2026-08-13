import { notify } from "@/components/ui/sonner";
import type { LLMConfig } from "@/types/llm_config";

const NON_SOTA_TEMPLATE_TOAST_KEY = "presenton.nonSotaTemplateToastDismissed";
const NON_SOTA_TEMPLATE_TOAST_ID = "non-sota-template-generation";

const OPENAI_SOTA_VISION_MODELS = [
    "gpt-5.5",
    "gpt-5.5-pro",
    "gpt-5.4",
    "gpt-5.4-pro",
    "gpt-5",
    "gpt-5-pro",
    "gpt-5-chat-latest",
    "gpt-4.1",
    "gpt-4o",
    "gpt-4-turbo",
];

function selectedTextModel(config: LLMConfig): string {
    switch (config.LLM) {
        case "openai":
            return config.OPENAI_MODEL || "";
        case "azure":
            return config.AZURE_OPENAI_MODEL || "";
        case "openrouter":
            return config.OPENROUTER_MODEL || "";
        case "anthropic":
            return config.ANTHROPIC_MODEL || "";
        case "bedrock":
            return config.BEDROCK_MODEL || "";
        case "codex":
            return config.CODEX_MODEL || "";
        // ClickDz fork: Gemini/Vertex are vision-capable — surface the model
        // name so isSotaTemplateModel can recognize it. Without these cases the
        // function returned "" for LLM=google, falsely triggering the
        // "Template V2 works best with vision-capable models" warning even
        // though Gemini accepts image inputs.
        case "google":
            return config.GOOGLE_MODEL || "";
        case "vertex":
            return config.VERTEX_MODEL || "";
        // ClickDz fork: LLM=custom routes through the Vercel AI Gateway with
        // an OpenAI-compatible model id like "alibaba/qwen3.7-flash". Surface
        // CUSTOM_MODEL so isSotaTemplateModel can evaluate vision capability.
        // Without this the function returned "" for LLM=custom, falsely
        // triggering the "Template V2 works best with vision-capable models"
        // warning even though qwen3.7-flash accepts image inputs.
        case "custom":
            return config.CUSTOM_MODEL || "";
        default:
            return "";
    }
}

function normalizeModelName(model: string): string {
    return model.trim().toLowerCase().split("/").pop()?.replace(/^.*anthropic\./, "") || "";
}

function matchesOpenAIModel(model: string, family: string): boolean {
    return model === family || model.startsWith(`${family}-20`);
}

function isSotaTemplateModel(config: LLMConfig): boolean {
    const model = normalizeModelName(selectedTextModel(config));

    if (!model) return false;
    if (OPENAI_SOTA_VISION_MODELS.some((family) => matchesOpenAIModel(model, family))) return true;
    if (model.includes("claude-") && (model.includes("opus") || model.includes("sonnet"))) return true;
    // ClickDz fork: Gemini (google/vertex) is vision-capable — Template V2
    // sends a slide screenshot to the text model, and Gemini accepts image
    // inputs. Recognize gemini-2.5/3/3.1 (flash/pro) so the warning doesn't
    // show falsely. The "models/" prefix presenton uses by default is stripped
    // by normalizeModelName's split("/").pop().
    if (model.startsWith("gemini-") && /flash|pro|2\.5|3\b|3\.1/i.test(model)) return true;
    // ClickDz fork: Qwen 3.x VL models (qwen3.5/3.6/3.7-flash/plus/max) are
    // native vision-language models — they accept image inputs, so Template V2's
    // slide-screenshot-to-text-model flow works. normalizeModelName strips the
    // "alibaba/" provider prefix via split("/").pop(), leaving "qwen3.7-flash".
    if (model.startsWith("qwen") && /flash|plus|max|vl/i.test(model)) return true;
    return false;
}

function hasDismissedNonSotaToast(): boolean {
    try {
        return typeof window !== "undefined" && window.localStorage.getItem(NON_SOTA_TEMPLATE_TOAST_KEY) === "1";
    } catch {
        return false;
    }
}

function rememberNonSotaToastDismissed() {
    try {
        window.localStorage.setItem(NON_SOTA_TEMPLATE_TOAST_KEY, "1");
    } catch {
        // Best effort only.
    }
}

export function showTemplateV2ModelWarningIfNeeded(config: LLMConfig) {
    if (isSotaTemplateModel(config) || hasDismissedNonSotaToast()) return;

    notify.warning(
        "Template model warning",
        "Template V2 works best with vision-capable models. Use a recent OpenAI vision model or Claude Opus/Sonnet for reliable template generation.",
        {
            id: NON_SOTA_TEMPLATE_TOAST_ID,
            duration: Infinity,
            className: "template-v2-model-warning-toast",
            action: {
                label: "Don't show again",
                onClick: () => {
                    rememberNonSotaToastDismissed();
                    dismissTemplateV2ModelWarning();
                },
            },
        }
    );
}

export function dismissTemplateV2ModelWarning() {
    notify.dismiss(NON_SOTA_TEMPLATE_TOAST_ID);
}
