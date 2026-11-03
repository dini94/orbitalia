"""Placeholder only. Do not connect this to an exposed Docker socket without review."""
class LocalDockerExecutor:
    def submit(self, job_request):
        raise NotImplementedError(
            "Configure a least-privilege ORCA container, isolated job workspace, "
            "input validation, timeout and resource limits before implementing."
        )
