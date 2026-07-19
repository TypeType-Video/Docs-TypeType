import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid({
    title: "TypeType Docs",
    description: "Documentation for the TypeType ecosystem: web app, server, downloader, and remote login.",
    base: "/Docs-TypeType/",
    lang: "en-US",
    cleanUrls: true,
    appearance: "dark",

    head: [
        ["link", { rel: "icon", href: "/Docs-TypeType/typetype.svg" }],
        ["meta", { name: "theme-color", content: "#ef4444" }],
    ],

    themeConfig: {
        logo: "/typetype.svg",
        search: { provider: "local" },

        nav: [
            { text: "Home", link: "/" },
            { text: "Self-hosting", link: "/self-hosting/introduction" },
            { text: "User guide", link: "/guide/" },
            {
                text: "Version",
                items: [
                    { text: "latest", link: "/" },
                    { text: "1.1", link: "/" },
                ],
            },
            {
                text: "Project",
                items: [
                    { text: "Main repository", link: "https://github.com/TypeType-Video/TypeType" },
                    { text: "Frontend", link: "https://github.com/TypeType-Video/TypeType-Frontend" },
                    { text: "Server", link: "https://github.com/TypeType-Video/TypeType-Server" },
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
                        { text: "Privacy & blocking", link: "/guide/privacy" },
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

    vite: {
        optimizeDeps: { include: ["mermaid"] },
        ssr: { noExternal: ["mermaid"] },
    },
});
