<script lang="ts" setup>
import { ref, computed } from "vue";
import { useData, useRoute, withBase } from "vitepress";

// Pages that actually have a translation. Keep this in sync with docs/fr and
// docs/es: bare, extension-less paths, "" for the locale homepage.
const TRANSLATED_PAGES: Record<string, string[]> = {
    fr: ["", "self-hosting/prerequisites", "self-hosting/authentication"],
    es: ["", "self-hosting/prerequisites", "self-hosting/authentication"],
};

const props = withDefaults(defineProps<{ mode?: "nav" | "screen" }>(), { mode: "nav" });

const { site, theme } = useData();
const route = useRoute();
const open = ref(false);
const el = ref<HTMLElement>();

function stripBase(pathname: string): string {
    const base = site.value.base;
    const p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
    return p.replace(/^\/+/, "").replace(/\/+$/, "");
}

function localePrefix(key: string): string {
    const link = (site.value.locales as any)[key]?.link || `/${key}/`;
    return link.replace(/^\/+/, "").replace(/\/+$/, "");
}

// Current locale and the bare (locale-stripped) path, derived from the
// route's actual pathname rather than VitePress's page.relativePath, which
// it corrupts (leaves the base prefix in) after a client-side 404.
const current = computed(() => {
    const path = stripBase(new URL(route.path, "http://a.com").pathname);
    for (const key of Object.keys(site.value.locales)) {
        if (key === "root") continue;
        const prefix = localePrefix(key);
        if (path === prefix || path.startsWith(prefix + "/")) {
            return { locale: key, bare: path.slice(prefix.length).replace(/^\/+/, "") };
        }
    }
    return { locale: "root", bare: path };
});

const links = computed(() =>
    Object.entries(site.value.locales)
        .filter(([key, value]: [string, any]) => key !== current.value.locale && value.label)
        .map(([key, value]: [string, any]) => {
            const translated = TRANSLATED_PAGES[key]?.includes(current.value.bare) ?? key === "root";
            const target =
                key === "root"
                    ? translated
                        ? `/${current.value.bare}`
                        : "/"
                    : translated
                      ? `/${localePrefix(key)}/${current.value.bare}`.replace(/\/+$/, "") + (current.value.bare ? "" : "/")
                      : `/${localePrefix(key)}/`;
            return { key, label: value.label as string, link: withBase(target) };
        })
);

const currentLabel = computed(
    () => (site.value.locales as any)[current.value.locale]?.label ?? ""
);

function toggle() {
    open.value = !open.value;
}

function onBlur(e: FocusEvent) {
    if (!el.value?.contains(e.relatedTarget as Node)) {
        open.value = false;
    }
}
</script>

<template>
  <div
    v-if="links.length && props.mode === 'nav'"
    class="VPFlyout LangSwitcher"
    ref="el"
    @mouseenter="open = true"
    @mouseleave="open = false"
    @focusout="onBlur"
  >
    <button
      type="button"
      class="button"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-label="theme.langMenuLabel || 'Change language'"
      @click="open = !open"
    >
      <span class="text">
        <span class="vpi-languages option-icon" />
        <span class="vpi-chevron-down text-icon" />
      </span>
    </button>

    <div class="menu">
      <div class="VPMenu">
        <div class="items">
          <p class="title">{{ currentLabel }}</p>
          <div v-for="l in links" :key="l.key" class="VPMenuLink">
            <a class="link" :href="l.link">{{ l.label }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else-if="links.length && props.mode === 'screen'"
    class="VPNavScreenTranslations LangSwitcherScreen"
    :class="{ open }"
  >
    <button class="title" @click="toggle">
      <span class="vpi-languages icon lang" />
      {{ currentLabel }}
      <span class="vpi-chevron-down icon chevron" />
    </button>

    <ul class="list">
      <li v-for="l in links" :key="l.key" class="item">
        <a class="link" :href="l.link">{{ l.label }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.LangSwitcher {
  display: none;
  position: relative;
}

@media (min-width: 1280px) {
  .LangSwitcher {
    display: flex;
    align-items: center;
  }
}

.LangSwitcher .button {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: var(--vp-nav-height);
  color: var(--vp-c-text-1);
  transition: color 0.5s;
}

.LangSwitcher .text {
  display: flex;
  align-items: center;
  line-height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.LangSwitcher .option-icon {
  font-size: 16px;
}

.LangSwitcher .text-icon {
  margin-left: 4px;
  font-size: 14px;
}

.LangSwitcher .menu {
  position: absolute;
  top: calc(var(--vp-nav-height) / 2 + 20px);
  right: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
}

.LangSwitcher .button[aria-expanded="true"] + .menu,
.LangSwitcher:hover .menu {
  opacity: 1;
  visibility: visible;
}

.LangSwitcher .VPMenu {
  border-radius: 12px;
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
  min-width: 128px;
  border: 1px solid var(--vp-c-divider);
}

.LangSwitcher .items {
  padding: 12px;
}

.LangSwitcher .title {
  padding: 0 12px 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.LangSwitcher .VPMenuLink .link {
  display: block;
  border-radius: 6px;
  padding: 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  transition: background-color 0.25s, color 0.25s;
}

.LangSwitcher .VPMenuLink .link:hover {
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-default-soft);
}

.LangSwitcherScreen {
  height: 24px;
  overflow: hidden;
}

.LangSwitcherScreen.open {
  height: auto;
}

.LangSwitcherScreen .title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.LangSwitcherScreen .icon {
  font-size: 16px;
}

.LangSwitcherScreen .icon.lang {
  margin-right: 8px;
}

.LangSwitcherScreen .icon.chevron {
  margin-left: 4px;
}

.LangSwitcherScreen .list {
  padding: 4px 0 0 24px;
}

.LangSwitcherScreen .link {
  display: block;
  line-height: 32px;
  font-size: 13px;
  color: var(--vp-c-text-1);
}
</style>
