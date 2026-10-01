Follow Step 5 of .specs/WORKFLOW.md. Ask me for reproduction steps if I
haven't given them. Create .specs/bugfixes/<slug>/analysis.md,
investigate the root cause before filling that section in, then write
a fast-check property test encoding both the fix and the "must not
change" clause. If fast-check isn't a project dependency yet, ask me
before adding it.
