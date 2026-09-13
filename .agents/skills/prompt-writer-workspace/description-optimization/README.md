# Description Optimization Notes

**Date:** 2026-09-08  
**Status:** Automated loop failed; manual optimization applied

## Automated run

```bash
python -m scripts.run_loop \
  --eval-set evals/trigger_eval_set.json \
  --skill-path . \
  --model qwen3.8:27b \
  --max-iterations 3 \
  --runs-per-query 2
```

**Result:** Failed at `improve_description` step — local Claude Code config uses `qwen3.8:27b` which is not a recognized model for `claude -p`. Trigger eval showed 0% recall on should-trigger queries (skills never invoked), likely due to local Ollama routing not supporting skill discovery the same way as hosted Claude.

## Manual description update

Applied a more assertive description per skill-creator guidance:

**Before:** "Crafts copy-paste-ready prompts... Use whenever the user asks..."

**After:** "Writes copy-paste-ready prompts... ALWAYS use when the user asks... Also use when the user describes work meant for another AI even if they never say 'prompt'."

## Re-run optimization (when on hosted Claude)

```bash
cd .agents/skills/skill-creator
python -m scripts.run_loop \
  --eval-set ../prompt-writer/evals/trigger_eval_set.json \
  --skill-path ../prompt-writer \
  --model sonnet \
  --max-iterations 5 \
  --results-dir ../prompt-writer-workspace/description-optimization
```
