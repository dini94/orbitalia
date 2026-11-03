# Computational Chemistry Laboratory

A static educational website for GitHub Pages, with optional scaffolding for ORCA execution through a MacBook-local Docker agent or an HPC/SLURM gateway.

## What's included

- `index.html` — main dashboard and foundational DFT papers.
- `course.html` — interactive course pages: Schrödinger equation, many-electron complexity, DFT, SCF teaching graph, basis sets, geometry/frequencies, HOMO–LUMO, TD-DFT, conceptual DFT.
- `molecular-builder.html` — SMILES sketch, PubChem name lookup, export controls and a 3D/pre-optimization workflow guide.
- `input-builder.html` — starter ORCA `.inp` and Gaussian `.gjf` generator.
- `results-analyzer.html` — best-effort browser-side text parsing for selected ORCA/Gaussian output patterns, frequency summary, geometry export, excited-state table/plot, and energy-difference descriptors.
- `orca-docker.html` — dual target UI for local Docker and HPC/SLURM. Submission is intentionally disabled until a secure endpoint is configured.
- `backend/` — optional FastAPI execution gateway skeleton with authentication hooks and separate local/HPC executors.
- `local-agent/` — optional localhost agent example for Docker Desktop.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.

## Important scientific and technical limitations

This is a **starter implementation**, not a validated replacement for Avogadro, RDKit, ORCA, Gaussian, Multiwfn, or GaussView.

1. GitHub Pages serves static files. It cannot execute ORCA/Gaussian itself.
2. Molecular builder 2D rendering uses SmilesDrawer from a CDN. The MOL export is intentionally described as a placeholder, not a chemically valid 3D structure. Use RDKit/Avogadro/Open Babel for valid 3D coordinates, conformers, and force-field minimization.
3. Input files are conservative templates. Confirm keywords, functional/basis availability, solvent names, dispersion syntax, and memory/resource settings for your installed version.
4. Output parsing is best-effort and only recognizes some text patterns. Always compare extracted results with the original output. `.gbw`, `.chk`, `.molden`, `.cube`, and `.hess` are not comprehensively parsed/rendered in this starter.
5. The SCF graph and TD-DFT table on the course page are educational illustrations, not calculated or published data.
6. IP/EA should be computed using consistent neutral/cation/anion calculations. Orbital energies are not automatically IP/EA.
7. ORCA licensing and cluster policy must be checked before deployment or containerization.

## Publish on GitHub Pages

1. Create a repository named `computational-chemistry-lab` (or any name you prefer).
2. Upload the **contents** of this folder to the repository root, including `.github/`.
3. In GitHub, open **Settings → Pages** and choose **GitHub Actions** as the build/deployment source.
4. Push to the default branch. The workflow in `.github/workflows/pages.yml` deploys the static site.
5. Visit `https://YOUR-USERNAME.github.io/computational-chemistry-lab/` after the workflow succeeds.

If you prefer branch deployment, choose `Deploy from a branch` and select the root of the default branch, but then the Actions workflow is not needed.

## Optional backend: execution architecture

Recommended production architecture:

`GitHub Pages → authenticated API gateway → job queue → local agent or HPC/SLURM adapter → result staging → browser analyzer`

Do **not** expose a Docker socket or SSH private key to browser JavaScript. Do not allow arbitrary paths, arbitrary shell commands, unrestricted resource requests, or unauthenticated job submissions.

### Backend skeleton

Requirements: Python 3.11+, FastAPI, Uvicorn, Pydantic. Install:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set a long random CCLAB_API_TOKEN before running
uvicorn main:app --host 127.0.0.1 --port 8765
```

The included backend returns a safe status response by default and will **not execute jobs** unless you explicitly configure an executor. It is a skeleton for development, not an internet-ready service.

### Local MacBook Docker

- Install Docker Desktop and a valid ORCA installation/container permitted by your ORCA license.
- Review `local-agent/README.md`.
- Keep the service bound to `127.0.0.1`, require a bearer token, validate all input and resource requests, and use isolated per-job directories.
- Do not bind-mount your home directory or Docker socket into untrusted containers.
- Browser-to-localhost access may require HTTPS/CORS and browser security changes; this starter UI does not automatically connect.

### HPC BRIN / SLURM

- Confirm with BRIN HPC administrators whether ORCA is installed, whether container execution is allowed, and which partitions/runtime are supported.
- This repository does **not** contain BRIN credentials, a working connection, or a site-specific SLURM configuration.
- Do not put SSH keys, passwords, access tokens, or internal host details into this public repository.
- The adapter uses a placeholder command and intentionally does not submit jobs until a site-specific implementation is reviewed and enabled.
- If Docker is not allowed on compute nodes, use the approved ORCA installation or Apptainer/Singularity only if the cluster administrators permit it.

## Local preview

Run a simple static server from the repository root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Citation and attribution

The course links to foundational literature, including Hohenberg & Kohn (1964), Kohn & Sham (1965), Jones (2015), and Becke (2014). Verify citation metadata and relevance before using references in formal teaching or publications.
