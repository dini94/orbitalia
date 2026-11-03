"""Placeholder only. Must be adapted to HPC site policy and scheduler configuration."""
ALLOWED_PARTITIONS = {"short", "medium-small", "medium-large", "long", "very-long"}

class HPCSlurmExecutor:
    def submit(self, job_request):
        if job_request.partition not in ALLOWED_PARTITIONS:
            raise ValueError("Partition is not allowed by this adapter.")
        raise NotImplementedError(
            "Configure a secure staging mechanism and site-approved SLURM template. "
            "Do not accept arbitrary shell commands or expose SSH credentials."
        )
