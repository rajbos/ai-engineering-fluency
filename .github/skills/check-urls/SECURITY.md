# Security model: check-urls

Lightweight model derived from reading `check-urls.js`. Update it in the same PR as any
change that adds or alters a trigger surface (see "Skill security classification" in the
repository `AGENTS.md`).

## What the scripts do and talk to

- `check-urls.js` collects every `.ts` file under the repo-root `src/`, extracts all
  `http(s)://` URLs with a regex (lines 56-69) and requests each one, sequentially.
- Network: a `HEAD` request, retried as `GET` on any status >= 400 (lines 74-82), to
  whatever host the URL names, over `http` or `https`, with a 10 second timeout. The
  response body is never read and redirects are not followed (a 3xx is reported as a
  warning).
- It prints each URL, its status and the source file(s) to stdout. Exit code 1 if any URL
  is broken.

## Credentials used and where they come from

None. The only header sent is `User-Agent: copilot-token-tracker-url-checker/1.0`
(line 102). No environment variables are read.

## Untrusted inputs parsed

- The text of `src/**/*.ts`. In a local run this is the operator's own checkout. Nothing
  in the repository's workflows runs this script today; if it were run in CI over a pull
  request, URLs added by a fork would be requested from the runner.
- HTTP status codes and error messages from the contacted hosts (only the status code and
  `err.message` are used).

## What it writes and where

Nothing on disk. Output is stdout only.

## External programs run

None.

## Mitigations in the code

- Only `src/` is scanned and only `.ts` files are read (lines 26, 41-53).
- Hardcoded skip list for `localhost` and the JSON Schema meta-schema URL (lines 33-37).
- URLs containing `${` template interpolations are skipped (line 65).
- Requests are sequential with a fixed timeout and are abandoned after the status line
  (`req.destroy()`, line 109), which bounds time and data pulled per URL.
- Malformed URLs are caught by `new URL()` and reported as broken.

## Known gaps

Recorded, not fixed here.

- No guard against internal targets: a URL such as `http://169.254.169.254/...` or a
  private-range host in `src/` is requested like any other (lines 95-105). This only
  matters when the script runs somewhere with reachable internal services and untrusted
  source.
- Plain `http:` URLs are fetched without any warning.
- The `GET` retry is triggered by any 4xx or 5xx on `HEAD`, so a URL that is meant to be
  side-effect free on `HEAD` but not on `GET` will be fetched with `GET`.
