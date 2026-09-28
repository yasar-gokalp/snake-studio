# SnakeStudio

A lightweight desktop canvas to build, test, and export genomic pipelines without wrestling with CLI flags.

![SnakeStudio Preview](frontend/src/assets/hero.png)

## Why?

Writing Snakemake rules or chaining CLI tools like `bedtools` and `samtools` usually means digging through man pages just to check flag syntax. 

SnakeStudio lets you connect your data visually, tweak parameters (window sizes, MAPQ filters, subsampling seeds) with live controls, preview the execution directly on your local machine, and copy clean Snakemake rules when you are done.

Everything runs locally. No data leaves your machine.

---

## Supported Tools (v0.1)

- **BEDTools Window**: Genomic distance and window analysis (`-w`, `-l`, `-r`, strand flags).
- **SAMtools View**: Alignment filtering by MAPQ (`-q`), mapped reads (`-F 4`), and format conversions.
- **Seqtk**: Subsampling (`sample -s`) and region extraction (`subseq`).

---

## Running Locally

Requires Node.js (18+), Python (3.10+), and Linux.

```bash
git clone https://github.com/yasar-gokalp/snake-studio.git
cd snake-studio

# First run: install dependencies
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm install
cd ..

# Launch
./run.sh