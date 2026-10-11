import { defineConfig } from "vitepress";

export default defineConfig({
    title: "TypeType Docs",
    description: "User, self-hosting, architecture, and development documentation for the TypeType ecosystem.",
    base: "/Docs-TypeType/",
    lang: "en-US",
    cleanUrls: true,
    appearance: "dark",

    locales: {
        root: {
            label: "English",
            lang: "en-US",
        },
        fr: {
            label: "Français",
            lang: "fr-FR",
            link: "/fr/",
            title: "Documentation TypeType",
            description: "Documentation TypeType pour les utilisateurs et l'auto-hébergement.",
            themeConfig: {
                nav: [
                    { text: "Accueil", link: "/fr/" },
                    { text: "Auto-hébergement", link: "/fr/self-hosting/introduction" },
                    { text: "Guide utilisateur", link: "/fr/guide/" },
                    { text: "Projet", link: "/fr/project/" },
                    { text: "Code source", link: "https://github.com/TypeType-Video/TypeType" },
                ],
                sidebar: {
                    "/fr/self-hosting/": [
                        {
                            text: "Vue d'ensemble",
                            items: [
                                { text: "Introduction", link: "/fr/self-hosting/introduction" },
                                { text: "Architecture", link: "/fr/self-hosting/architecture" },
                                { text: "Limites de sécurité", link: "/fr/self-hosting/security" },
                            ],
                        },
                        {
                            text: "Installation",
                            items: [
                                { text: "Prérequis", link: "/fr/self-hosting/prerequisites" },
                                { text: "Démarrage rapide", link: "/fr/self-hosting/quick-start" },
                                { text: "Installation manuelle", link: "/fr/self-hosting/docker-compose" },
                                { text: "Configuration", link: "/fr/self-hosting/configuration" },
                                { text: "Authentification (OIDC)", link: "/fr/self-hosting/authentication" },
                            ],
                        },
                        {
                            text: "Après l'installation",
                            items: [
                                { text: "Importer vos données", link: "/fr/self-hosting/importing-data" },
                                { text: "Service de recommandations (expérimental)", link: "/fr/self-hosting/recommender" },
                            ],
                        },
                        {
                            text: "Exploitation",
                            items: [
                                { text: "Proxy inverse et HTTPS", link: "/fr/self-hosting/reverse-proxy" },
                                { text: "Maintenance", link: "/fr/self-hosting/maintenance" },
                                { text: "Revenir en arrière après une mise à jour", link: "/fr/self-hosting/rollback" },
                                { text: "Beta et main", link: "/fr/self-hosting/beta-and-main" },
                                { text: "Signaler un problème", link: "/fr/self-hosting/reporting-issues" },
                                { text: "Dépannage", link: "/fr/self-hosting/troubleshooting" },
                            ],
                        },
                    ],
                    "/fr/guide/": [
                        {
                            text: "Guide utilisateur",
                            items: [
                                { text: "Aperçu", link: "/fr/guide/" },
                                { text: "Lecture et le lecteur", link: "/fr/guide/watching" },
                                { text: "Lecteur intégré", link: "/fr/guide/embedding" },
                                { text: "Votre bibliothèque", link: "/fr/guide/library" },
                                { text: "Trouver du contenu", link: "/fr/guide/finding-content" },
                                { text: "Connexion", link: "/fr/guide/accounts" },
                                { text: "Paramètres", link: "/fr/guide/settings" },
                                { text: "Choisir son algorithme", link: "/fr/guide/algorithm" },
                                { text: "Discord Rich Presence", link: "/fr/guide/discord-rich-presence" },
                                { text: "Confidentialité et blocage", link: "/fr/guide/privacy" },
                            ],
                        },
                    ],
                    "/fr/project/": [
                        {
                            text: "Projet",
                            items: [
                                { text: "Vue d'ensemble du projet", link: "/fr/project/" },
                                { text: "Guide des dépôts", link: "/fr/project/repositories" },
                                { text: "Lecture et téléchargements", link: "/fr/project/playback" },
                                { text: "Signals, le service de recommandations", link: "/fr/project/signals" },
                                { text: "Branches et versions", link: "/fr/project/releases" },
                                { text: "Sources de la communauté et remerciements", link: "/fr/project/community" },
                            ],
                        },
                    ],
                },
                search: {
                    provider: "local",
                    options: {
                        translations: {
                            button: {
                                buttonText: "Rechercher",
                                buttonAriaLabel: "Rechercher",
                            },
                            modal: {
                                noResultsText: "Aucun résultat trouvé",
                                resetButtonTitle: "Effacer la recherche",
                                backButtonTitle: "Fermer la recherche",
                            },
                        },
                    },
                },
                outline: { label: "Sur cette page" },
                lastUpdated: { text: "Dernière mise à jour" },
                docFooter: { prev: "Page précédente", next: "Page suivante" },
                editLink: {
                    pattern: "https://github.com/TypeType-Video/Docs-TypeType/edit/main/docs/:path",
                    text: "Modifier cette page sur GitHub",
                },
                darkModeSwitchLabel: "Apparence",
                lightModeSwitchTitle: "Passer au thème clair",
                darkModeSwitchTitle: "Passer au thème sombre",
                langMenuLabel: "Changer de langue",
                sidebarMenuLabel: "Menu",
                returnToTopLabel: "Retour en haut",
                skipToContentLabel: "Aller au contenu",
            },
        },
        de: {
            label: "Deutsch",
            lang: "de-DE",
            link: "/de/",
            title: "TypeType-Dokumentation",
            description: "TypeType-Dokumentation für Nutzer und Selbsthoster.",
            themeConfig: {
                nav: [
                    { text: "Start", link: "/de/" },
                    { text: "Selbst hosten", link: "/de/self-hosting/introduction" },
                    { text: "Benutzerhandbuch", link: "/de/guide/" },
                    { text: "Projekt", link: "/de/project/" },
                    { text: "Quellcode", link: "https://github.com/TypeType-Video/TypeType" },
                ],
                sidebar: {
                    "/de/self-hosting/": [
                        {
                            text: "Überblick",
                            items: [
                                { text: "Einführung", link: "/de/self-hosting/introduction" },
                                { text: "Architektur", link: "/de/self-hosting/architecture" },
                                { text: "Sicherheitsgrenzen", link: "/de/self-hosting/security" },
                            ],
                        },
                        {
                            text: "Einrichtung",
                            items: [
                                { text: "Voraussetzungen", link: "/de/self-hosting/prerequisites" },
                                { text: "Schnellstart", link: "/de/self-hosting/quick-start" },
                                { text: "Manuelle Einrichtung", link: "/de/self-hosting/docker-compose" },
                                { text: "Konfiguration", link: "/de/self-hosting/configuration" },
                                { text: "Authentifizierung (OIDC)", link: "/de/self-hosting/authentication" },
                            ],
                        },
                        {
                            text: "Nach der Einrichtung",
                            items: [
                                { text: "Ihre Daten importieren", link: "/de/self-hosting/importing-data" },
                                { text: "Empfehlungsdienst (experimentell)", link: "/de/self-hosting/recommender" },
                            ],
                        },
                        {
                            text: "Betrieb",
                            items: [
                                { text: "Reverse-Proxy und HTTPS", link: "/de/self-hosting/reverse-proxy" },
                                { text: "Wartung", link: "/de/self-hosting/maintenance" },
                                { text: "Eine Aktualisierung zurücknehmen", link: "/de/self-hosting/rollback" },
                                { text: "Beta und main", link: "/de/self-hosting/beta-and-main" },
                                { text: "Probleme melden", link: "/de/self-hosting/reporting-issues" },
                                { text: "Fehlerbehebung", link: "/de/self-hosting/troubleshooting" },
                            ],
                        },
                    ],
                    "/de/guide/": [
                        {
                            text: "Benutzerhandbuch",
                            items: [
                                { text: "Überblick", link: "/de/guide/" },
                                { text: "Ansehen und der Player", link: "/de/guide/watching" },
                                { text: "Eingebetteter Player", link: "/de/guide/embedding" },
                                { text: "Ihre Bibliothek", link: "/de/guide/library" },
                                { text: "Inhalte finden", link: "/de/guide/finding-content" },
                                { text: "Anmelden", link: "/de/guide/accounts" },
                                { text: "Einstellungen", link: "/de/guide/settings" },
                                { text: "Den eigenen Algorithmus wählen", link: "/de/guide/algorithm" },
                                { text: "Discord Rich Presence", link: "/de/guide/discord-rich-presence" },
                                { text: "Datenschutz und Blockieren", link: "/de/guide/privacy" },
                            ],
                        },
                    ],
                    "/de/project/": [
                        {
                            text: "Projekt",
                            items: [
                                { text: "Projektübersicht", link: "/de/project/" },
                                { text: "Repository-Leitfaden", link: "/de/project/repositories" },
                                { text: "Wiedergabe und Downloads", link: "/de/project/playback" },
                                { text: "Signals, der Empfehlungsdienst", link: "/de/project/signals" },
                                { text: "Branches und Versionen", link: "/de/project/releases" },
                                { text: "Quellen aus der Community und Danksagungen", link: "/de/project/community" },
                            ],
                        },
                    ],
                },
                search: {
                    provider: "local",
                    options: {
                        translations: {
                            button: {
                                buttonText: "Suchen",
                                buttonAriaLabel: "Suchen",
                            },
                            modal: {
                                noResultsText: "Keine Ergebnisse gefunden",
                                resetButtonTitle: "Suche zurücksetzen",
                                backButtonTitle: "Suche schließen",
                            },
                        },
                    },
                },
                outline: { label: "Auf dieser Seite" },
                lastUpdated: { text: "Zuletzt aktualisiert" },
                docFooter: { prev: "Vorherige Seite", next: "Nächste Seite" },
                editLink: {
                    pattern: "https://github.com/TypeType-Video/Docs-TypeType/edit/main/docs/:path",
                    text: "Diese Seite auf GitHub bearbeiten",
                },
                darkModeSwitchLabel: "Erscheinungsbild",
                lightModeSwitchTitle: "Zum hellen Design wechseln",
                darkModeSwitchTitle: "Zum dunklen Design wechseln",
                langMenuLabel: "Sprache wechseln",
                sidebarMenuLabel: "Menü",
                returnToTopLabel: "Nach oben",
                skipToContentLabel: "Zum Inhalt springen",
            },
        },
        zh: {
            label: "简体中文",
            lang: "zh-Hans-CN",
            link: "/zh/",
            title: "TypeType 文档",
            description: "面向用户和自托管者的 TypeType 文档。",
            themeConfig: {
                nav: [
                    { text: "首页", link: "/zh/" },
                    { text: "自托管", link: "/zh/self-hosting/introduction" },
                    { text: "用户指南", link: "/zh/guide/" },
                    { text: "项目", link: "/zh/project/" },
                    { text: "源代码", link: "https://github.com/TypeType-Video/TypeType" },
                ],
                sidebar: {
                    "/zh/self-hosting/": [
                        {
                            text: "概览",
                            items: [
                                { text: "简介", link: "/zh/self-hosting/introduction" },
                                { text: "架构", link: "/zh/self-hosting/architecture" },
                                { text: "安全边界", link: "/zh/self-hosting/security" },
                            ],
                        },
                        {
                            text: "安装",
                            items: [
                                { text: "前提条件", link: "/zh/self-hosting/prerequisites" },
                                { text: "快速开始", link: "/zh/self-hosting/quick-start" },
                                { text: "手动安装", link: "/zh/self-hosting/docker-compose" },
                                { text: "配置", link: "/zh/self-hosting/configuration" },
                                { text: "身份验证（OIDC）", link: "/zh/self-hosting/authentication" },
                            ],
                        },
                        {
                            text: "安装之后",
                            items: [
                                { text: "导入你的数据", link: "/zh/self-hosting/importing-data" },
                                { text: "推荐服务（实验性）", link: "/zh/self-hosting/recommender" },
                            ],
                        },
                        {
                            text: "运维",
                            items: [
                                { text: "反向代理与 HTTPS", link: "/zh/self-hosting/reverse-proxy" },
                                { text: "维护", link: "/zh/self-hosting/maintenance" },
                                { text: "回滚一次更新", link: "/zh/self-hosting/rollback" },
                                { text: "Beta 与 main", link: "/zh/self-hosting/beta-and-main" },
                                { text: "报告问题", link: "/zh/self-hosting/reporting-issues" },
                                { text: "故障排查", link: "/zh/self-hosting/troubleshooting" },
                            ],
                        },
                    ],
                    "/zh/guide/": [
                        {
                            text: "用户指南",
                            items: [
                                { text: "概览", link: "/zh/guide/" },
                                { text: "观看与播放器", link: "/zh/guide/watching" },
                                { text: "嵌入式播放器", link: "/zh/guide/embedding" },
                                { text: "你的媒体库", link: "/zh/guide/library" },
                                { text: "查找内容", link: "/zh/guide/finding-content" },
                                { text: "登录", link: "/zh/guide/accounts" },
                                { text: "设置", link: "/zh/guide/settings" },
                                { text: "选择你的算法", link: "/zh/guide/algorithm" },
                                { text: "Discord Rich Presence", link: "/zh/guide/discord-rich-presence" },
                                { text: "隐私与屏蔽", link: "/zh/guide/privacy" },
                            ],
                        },
                    ],
                    "/zh/project/": [
                        {
                            text: "项目",
                            items: [
                                { text: "项目概览", link: "/zh/project/" },
                                { text: "仓库指南", link: "/zh/project/repositories" },
                                { text: "播放与下载", link: "/zh/project/playback" },
                                { text: "Signals，推荐服务", link: "/zh/project/signals" },
                                { text: "分支与版本", link: "/zh/project/releases" },
                                { text: "社区来源与致谢", link: "/zh/project/community" },
                            ],
                        },
                    ],
                },
                search: {
                    provider: "local",
                    options: {
                        translations: {
                            button: {
                                buttonText: "搜索",
                                buttonAriaLabel: "搜索",
                            },
                            modal: {
                                noResultsText: "没有找到结果",
                                resetButtonTitle: "清除搜索",
                                backButtonTitle: "关闭搜索",
                            },
                        },
                    },
                },
                outline: { label: "本页内容" },
                lastUpdated: { text: "最后更新" },
                docFooter: { prev: "上一页", next: "下一页" },
                editLink: {
                    pattern: "https://github.com/TypeType-Video/Docs-TypeType/edit/main/docs/:path",
                    text: "在 GitHub 上编辑此页",
                },
                darkModeSwitchLabel: "外观",
                lightModeSwitchTitle: "切换到浅色主题",
                darkModeSwitchTitle: "切换到深色主题",
                langMenuLabel: "切换语言",
                sidebarMenuLabel: "菜单",
                returnToTopLabel: "返回顶部",
                skipToContentLabel: "跳到正文",
            },
        },
        es: {
            label: "Español",
            lang: "es-ES",
            link: "/es/",
            title: "Documentación de TypeType",
            description: "Documentación de TypeType para usuarios y administradores.",
            themeConfig: {
                nav: [
                    { text: "Inicio", link: "/es/" },
                    { text: "Autoalojamiento", link: "/es/self-hosting/introduction" },
                    { text: "Guía del usuario", link: "/es/guide/" },
                    { text: "Proyecto", link: "/es/project/" },
                    { text: "Código fuente", link: "https://github.com/TypeType-Video/TypeType" },
                ],
                sidebar: {
                    "/es/self-hosting/": [
                        {
                            text: "Visión general",
                            items: [
                                { text: "Introducción", link: "/es/self-hosting/introduction" },
                                { text: "Arquitectura", link: "/es/self-hosting/architecture" },
                                { text: "Límites de seguridad", link: "/es/self-hosting/security" },
                            ],
                        },
                        {
                            text: "Instalación",
                            items: [
                                { text: "Requisitos previos", link: "/es/self-hosting/prerequisites" },
                                { text: "Inicio rápido", link: "/es/self-hosting/quick-start" },
                                { text: "Instalación manual", link: "/es/self-hosting/docker-compose" },
                                { text: "Configuración", link: "/es/self-hosting/configuration" },
                                { text: "Autenticación (OIDC)", link: "/es/self-hosting/authentication" },
                            ],
                        },
                        {
                            text: "Después de instalar",
                            items: [
                                { text: "Importar tus datos", link: "/es/self-hosting/importing-data" },
                                { text: "Servicio de recomendaciones (experimental)", link: "/es/self-hosting/recommender" },
                            ],
                        },
                        {
                            text: "Operación",
                            items: [
                                { text: "Proxy inverso y HTTPS", link: "/es/self-hosting/reverse-proxy" },
                                { text: "Mantenimiento", link: "/es/self-hosting/maintenance" },
                                { text: "Revertir una actualización", link: "/es/self-hosting/rollback" },
                                { text: "Beta y main", link: "/es/self-hosting/beta-and-main" },
                                { text: "Informar de problemas", link: "/es/self-hosting/reporting-issues" },
                                { text: "Solución de problemas", link: "/es/self-hosting/troubleshooting" },
                            ],
                        },
                    ],
                    "/es/guide/": [
                        {
                            text: "Guía del usuario",
                            items: [
                                { text: "Resumen", link: "/es/guide/" },
                                { text: "Reproducción y el reproductor", link: "/es/guide/watching" },
                                { text: "Reproductor incrustado", link: "/es/guide/embedding" },
                                { text: "Tu biblioteca", link: "/es/guide/library" },
                                { text: "Buscar contenido", link: "/es/guide/finding-content" },
                                { text: "Inicio de sesión", link: "/es/guide/accounts" },
                                { text: "Configuración", link: "/es/guide/settings" },
                                { text: "Elegir tu algoritmo", link: "/es/guide/algorithm" },
                                { text: "Discord Rich Presence", link: "/es/guide/discord-rich-presence" },
                                { text: "Privacidad y bloqueo", link: "/es/guide/privacy" },
                            ],
                        },
                    ],
                    "/es/project/": [
                        {
                            text: "Proyecto",
                            items: [
                                { text: "Visión general del proyecto", link: "/es/project/" },
                                { text: "Guía de repositorios", link: "/es/project/repositories" },
                                { text: "Reproducción y descargas", link: "/es/project/playback" },
                                { text: "Signals, el servicio de recomendaciones", link: "/es/project/signals" },
                                { text: "Ramas y versiones", link: "/es/project/releases" },
                                { text: "Fuentes de la comunidad y agradecimientos", link: "/es/project/community" },
                            ],
                        },
                    ],
                },
                search: {
                    provider: "local",
                    options: {
                        translations: {
                            button: {
                                buttonText: "Buscar",
                                buttonAriaLabel: "Buscar",
                            },
                            modal: {
                                noResultsText: "No se encontraron resultados",
                                resetButtonTitle: "Borrar la búsqueda",
                                backButtonTitle: "Cerrar la búsqueda",
                            },
                        },
                    },
                },
                outline: { label: "En esta página" },
                lastUpdated: { text: "Última actualización" },
                docFooter: { prev: "Página anterior", next: "Página siguiente" },
                editLink: {
                    pattern: "https://github.com/TypeType-Video/Docs-TypeType/edit/main/docs/:path",
                    text: "Editar esta página en GitHub",
                },
                darkModeSwitchLabel: "Apariencia",
                lightModeSwitchTitle: "Cambiar al tema claro",
                darkModeSwitchTitle: "Cambiar al tema oscuro",
                langMenuLabel: "Cambiar idioma",
                sidebarMenuLabel: "Menú",
                returnToTopLabel: "Volver arriba",
                skipToContentLabel: "Ir al contenido",
            },
        },
    },

    head: [
        ["link", { rel: "icon", href: "/Docs-TypeType/typetype.svg" }],
        ["meta", { name: "theme-color", content: "#ef4444" }],
    ],

    markdown: {
        config(markdown) {
            const fence = markdown.renderer.rules.fence?.bind(markdown.renderer.rules);
            if (!fence) {
                return;
            }
            markdown.renderer.rules.fence = (tokens, index, options, env, self) => {
                const token = tokens[index];
                if (token.info.trim() !== "mermaid") {
                    return fence(tokens, index, options, env, self);
                }
                const graph = encodeURIComponent(token.content);
                return `<ClientOnly><MermaidDiagram id="mermaid-${index}" graph="${graph}" /></ClientOnly>`;
            };
        },
    },

    themeConfig: {
        logo: "/typetype.svg",
        search: { provider: "local" },
        i18nRouting: true,

        nav: [
            { text: "Home", link: "/" },
            { text: "Self-hosting", link: "/self-hosting/introduction" },
            { text: "User guide", link: "/guide/" },
            { text: "Project", link: "/project/" },
            {
                text: "Source",
                items: [
                    { text: "Main repository", link: "https://github.com/TypeType-Video/TypeType" },
                    { text: "Frontend", link: "https://github.com/TypeType-Video/TypeType-Frontend" },
                    { text: "Server", link: "https://github.com/TypeType-Video/TypeType-Server" },
                    { text: "All repositories", link: "/project/repositories" },
                ],
            },
        ],

        sidebar: {
            "/self-hosting/": [
                {
                    text: "Overview",
                    items: [
                        { text: "Introduction", link: "/self-hosting/introduction" },
                        { text: "Architecture", link: "/self-hosting/architecture" },
                        { text: "Security boundaries", link: "/self-hosting/security" },
                    ],
                },
                {
                    text: "Setup",
                    items: [
                        { text: "Prerequisites", link: "/self-hosting/prerequisites" },
                        { text: "Quick start (recommended)", link: "/self-hosting/quick-start" },
                        { text: "Manual setup", link: "/self-hosting/docker-compose" },
                        { text: "Configuration", link: "/self-hosting/configuration" },
                        { text: "Authentication (OIDC)", link: "/self-hosting/authentication" },
                    ],
                },
                {
                    text: "After setup",
                    items: [
                        { text: "Importing your data", link: "/self-hosting/importing-data" },
                        { text: "Recommender (experimental)", link: "/self-hosting/recommender" },
                    ],
                },
                {
                    text: "Operations",
                    items: [
                        { text: "Reverse proxy and HTTPS", link: "/self-hosting/reverse-proxy" },
                        { text: "Maintenance", link: "/self-hosting/maintenance" },
                        { text: "Roll back an update", link: "/self-hosting/rollback" },
                        { text: "Beta and main", link: "/self-hosting/beta-and-main" },
                        { text: "Reporting issues", link: "/self-hosting/reporting-issues" },
                        { text: "Troubleshooting", link: "/self-hosting/troubleshooting" },
                    ],
                },
            ],
            "/guide/": [
                {
                    text: "User guide",
                    items: [
                        { text: "Overview", link: "/guide/" },
                        { text: "Watching & the player", link: "/guide/watching" },
                        { text: "Embedded player", link: "/guide/embedding" },
                        { text: "Your library", link: "/guide/library" },
                        { text: "Finding content", link: "/guide/finding-content" },
                        { text: "Signing in", link: "/guide/accounts" },
                        { text: "Settings", link: "/guide/settings" },
                        { text: "Choosing your algorithm", link: "/guide/algorithm" },
                        { text: "Discord Rich Presence", link: "/guide/discord-rich-presence" },
                        { text: "Privacy & blocking", link: "/guide/privacy" },
                    ],
                },
            ],
            "/project/": [
                {
                    text: "Project",
                    items: [
                        { text: "Overview", link: "/project/" },
                        { text: "Repository guide", link: "/project/repositories" },
                        { text: "Playback & downloads", link: "/project/playback" },
                        { text: "Signals, the recommender", link: "/project/signals" },
                        { text: "Branches & releases", link: "/project/releases" },
                        { text: "Community sources", link: "/project/community" },
                    ],
                },
            ],
        },

        socialLinks: [{ icon: "github", link: "https://github.com/TypeType-Video/TypeType" }],

        lastUpdated: { text: "Last updated" },
        docFooter: { prev: "Previous page", next: "Next page" },

        footer: {
            message: `Built by <a href="https://github.com/Priveetee" target="_blank" class="footer-link"><svg class="footer-icon github-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> Priveetee</a> for the <a href="https://github.com/TypeType-Video/TypeType" target="_blank" class="footer-link"><img src="/Docs-TypeType/typetype.svg" class="footer-icon"> TypeType</a> ecosystem`,
            copyright: `Copyright © ${new Date().getFullYear()}`,
        },

        editLink: {
            pattern: "https://github.com/TypeType-Video/Docs-TypeType/edit/main/docs/:path",
            text: "Edit this page on GitHub",
        },
    },

});
