# Reporting issues

All issues live in one place: **[TypeType-Video/TypeType](https://github.com/TypeType-Video/TypeType/issues)**.

Open everything there, whether it is about the web app, the API, or downloads, and
pick the form that fits.

You never have to guess which part is at fault. If a report turns out to be
backend-specific, the maintainers take it from there.

There are two ways to report:

- Open an issue **directly on GitHub**, at the link above.
- Use the **in-app reporter**, described below.

## From inside the app

The quickest way to flag something is the built-in **Report a bug** action, for
example from the action bar on the watch page. It opens a short form, and you do not
need a GitHub account to use it.

You fill in just two things:

- a **category**, one of Player, Audio Language, Subtitles, Interface, or Functionality,
- a short **description** of what went wrong.

The app collects everything else for you. The report automatically captures the page
or video you were on, your browser and language, the player state, and any recent
crash logs or API errors, all gathered in the browser as you use the app. You never
have to dig out technical details by hand.

When you submit, the report is saved on your instance. What happens next:

1. The report is saved on your instance.
2. An administrator reviews submitted reports in the **Admin** area.
3. From a report, an admin can open a **prefilled GitHub issue**: the app builds a
   `issues/new` link for your configured repository, with the title, a prefilled body
   (the report and its context), a request for the `bug` label, and, when
   `GITHUB_ISSUE_TEMPLATE` is set, that template. GitHub applies URL-requested labels
   only when the person opening the link has permission. The generator redacts URL
   hostnames and domain-like text it recognises before putting the report in that URL.
   Always review the result before publishing it.

No GitHub token is needed, the app only generates the prefilled link; the issue is
created when someone submits it on GitHub.

::: warning Current in-app GitHub handoff is not aligned
The central [issue chooser](https://github.com/TypeType-Video/TypeType/issues/new/choose)
works and offers the `bug_report.yml` form. The shipped stack nevertheless appends
`bug_report_backend.md`, a filename that exists only in TypeType-Server, to its
central-repository URL.

Changing only that value to `bug_report.yml` is not a complete fix: the central YAML
form expects fields such as `what-happened`, `steps`, and `area`, while the in-app
generator sends one Markdown `body`. Until the application flow is aligned, open the
central chooser directly and transfer the relevant description and diagnostics from
the saved Admin report, removing private values first.

The current **Create GitHub Issue** action only prepares and stores a GitHub
`issues/new` URL. Confirm that the issue was actually submitted on GitHub; the
subsequent **View GitHub Issue** label does not prove that an issue exists.
:::

### Configuration

Two variables decide where in-app reports point (see
[Configuration](./configuration#bug-reports)):

| Variable | Default | Meaning |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Repository the prefilled issue targets |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Template filename currently appended to the link |

To keep every user report in the single tracker above, leave `GITHUB_REPO` at its
default. Use your own fork instead if you run a separate tracker.

## Make a report useful

- Say whether you are on the **main** or **beta** channel (see
  [Beta and main](./beta-and-main)).
- Include steps to reproduce, what you expected, and what happened.
- For playback problems, note the video, the provider (YouTube, NicoNico, BiliBili),
  and the quality.
- Check `docker compose logs typetype-server` for an error around the time it happened.
- Include the deployed component revisions when the problem may depend on an update:

  ```sh
  curl -fsS https://watch.example.com/api/version
  curl -fsS https://watch.example.com/api/version/server
  curl -fsS https://watch.example.com/api/version/token
  curl -fsS https://watch.example.com/api/version/downloader
  ```

  Replace the example origin and remove private hostnames before posting. These
  endpoints contain build metadata, not credentials.

## How issues are organised

Every issue is sorted with labels, so the tracker stays easy to navigate:

- **Type**, what kind of report it is: `bug`, `feature request`, `enhancement`,
  `documentation`, or `question`. The central GitHub forms set their label
  automatically. The current in-app link only requests `bug`, subject to the GitHub
  permission rule above.
- **Area**, which part it touches: `area: frontend`, `area: backend`, `area: token`,
  or `area: downloader`. Maintainers add this during triage, so you never have to.
- **Priority**: `priority: high`, `priority: medium`, or `priority: low`.

In practice, most reports are about the **web app and playback**, the player,
playlists, subtitles, imports, and the interface, with a smaller share on the
**backend** (extraction and the API). Reports are triaged and the large majority get
fixed and closed, so a clear report really does turn into a fix.

Reports that materially improve an explanation or diagnostic are credited in
[Community sources and acknowledgements](/project/community).

### Want to contribute?

Two labels are worth watching:

- [`good first issue`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22good+first+issue%22), approachable starting points.
- [`help wanted`](https://github.com/TypeType-Video/TypeType/issues?q=is%3Aopen+label%3A%22help+wanted%22), where an extra hand is welcome.
