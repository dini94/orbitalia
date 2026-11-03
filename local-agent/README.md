# MacBook local agent (placeholder)

This directory is an intentionally non-executing local API skeleton. It does not invoke Docker.

- Run only on `127.0.0.1`, never on a public interface.
- Set `CCLAB_LOCAL_TOKEN` to a random secret at least 24 characters long.
- Install dependencies and run `uvicorn agent:app --host 127.0.0.1 --port 8766`.
- The `/api/jobs` endpoint currently returns HTTP 501. Implementing execution requires ORCA licensing review, input validation, a fixed container image, a dedicated job directory, CPU/memory/time limits, no privileged container, no arbitrary mounts, and cleanup.
- A browser-based UI does not yet connect to this agent. Configure CORS, HTTPS/local trust, authentication, and origin validation before connecting.
