<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useData } from "vitepress";

const props = defineProps<{
    graph: string;
    id: string;
}>();

const { isDark } = useData();
const svg = ref("");
const error = ref("");
let renderRevision = 0;

async function renderDiagram(): Promise<void> {
    const revision = ++renderRevision;
    error.value = "";
    try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
            securityLevel: "loose",
            startOnLoad: false,
            theme: isDark.value ? "dark" : "default",
        });
        const result = await mermaid.render(
            `${props.id}-${revision}`,
            decodeURIComponent(props.graph)
        );
        if (revision === renderRevision) {
            svg.value = result.svg;
        }
    } catch (cause) {
        if (revision === renderRevision) {
            error.value = cause instanceof Error ? cause.message : String(cause);
        }
    }
}

onMounted(renderDiagram);
watch(isDark, renderDiagram);
</script>

<template>
    <div v-if="svg" class="mermaid" v-html="svg"></div>
    <pre v-else-if="error" class="mermaid-error">{{ error }}</pre>
    <div v-else class="mermaid-loading" aria-label="Loading diagram"></div>
</template>
