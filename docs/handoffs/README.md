# Area handoffs

Each area task maintains one concise file here using the filename in TASK_STARTERS.md.
Create it when work begins; do not prefill twelve empty reports. Commit and push it with the
relevant change, then verify the remote branch/commit before reporting handover complete.

The chief orchestrator owns CURRENT.md priorities, PRODUCT.md decisions and cross-area
integration. Area reports provide evidence and proposed updates; they are not independent
product briefs. An explicit assignment can delegate a shared-document update to one task.

Use this shape:

```markdown
# Area name
Updated: date
Task: task/thread ID or link when available
Branch: remote branch
Starting commit: SHA
State: assessment / in progress / locally verified / committed and pushed / integrated
Owned files: exact paths; note any other task with a dependency

## Scope and outcome
One bounded objective; what changed or was decided; what remains unfinished.

## Verification
Commands/scenarios and actual results. Separate earlier audit evidence from new tests.
List unrun checks and environment limitations. State whether live services were touched.

## Decisions for the chief orchestrator
Wolf's explicit choices with date; proposals labeled separately; cross-area effects.

## Findings and next step
Existing audit IDs or a new evidence-backed finding, severity, owner and one next batch.
```

Report the resulting remote commit link in the task response. A report cannot contain its own
commit hash before that commit is created; the branch/file history supplies that provenance.
Do not put credentials, private financial facts or customer records here. If a remote save
fails, report the remaining local-only work explicitly.
