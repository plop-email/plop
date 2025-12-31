# Remove AI code slop

Check the diff against `main` and remove AI-generated noise introduced in this branch.

This includes:
- Unnecessary comments that don't match local style
- Over-defensive checks or try/catch blocks where inputs are already validated
- Casts to `any`/`unknown` used to silence type errors
- Dynamic imports added without a clear need
- Any inconsistent naming/structure vs surrounding code

At the end, report with only a 1–3 sentence summary of what you changed.

