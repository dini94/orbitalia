# Backend gateway skeleton

This API is **not an execution service yet**. It provides health/status endpoints and a protected submission endpoint that deliberately returns 503/501 rather than executing a command.

1. Copy `.env.example` to `.env` and set a long random token.
2. Install `requirements.txt`.
3. Run on loopback for local development only.
4. Add a reviewed authentication and authorization strategy, audit logs, job isolation, storage cleanup, strict input/resource validation, and a queue before any real deployment.
5. Implement either `executors/local_docker.py` or `executors/hpc_slurm.py` against the host's policies.
6. Never expose the Docker daemon, SSH keys, or unrestricted shell commands to browser code.

The example does not load `.env` automatically; export environment variables in your shell or add a deliberate dotenv loading step for local development.
