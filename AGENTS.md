Go outside of this project and read luxethread/docs/ai first!

# Luxethread Frontend modification instructions

This project is being migrated from nestar-next to luxethread-next

## Rules

- Preserve current project artitecture
- Keep GraphQL/Apollo integration
- Do not rewrite the whole app
- Improve UI incrementally

## Backend Context

Before making any changes, read: 

- docs/ai/BACKEND_MIGRATION.md
- docs/ai/DESICIONS.md
- docs/ai/FRONTEND_MIGRATION.md
and etc inside of luxethread/docs/ai

## Workflow

1. Analyze before editing
2. Backend is running on port http://localhost:3007/graphql now.
3. Make small incremental changes.
4. Run typcheck after each phase.
5. Do not remove the working logic unless replaced safely.  
6. Update luxethread/docs/ai/COMPLETED_TASKS.md after major changes.

## Package manager

- Use yarn for all frontend commands.
- Do not use npm or pnpm.
- Install dependencies with:

```bash
yarn
```