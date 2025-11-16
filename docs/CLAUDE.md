# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The OBJECTIVE TEUI (Total Energy Use Intensity) Calculator is a web-based energy modeling tool for buildings in Canada. The codebase has two components:

1. **4012** (pre-production deployment) - Next-gen architecture using functional programming and modern CSS
2. **OBC Matrix** - Ontario Building Code compliance matrix tool for future integration pending regulator approval

## Commands

```bash
# Linting and formatting
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm run format:check # Check Prettier formatting
npm run format:write # Auto-format with Prettier

# Open calculators locally
open "OBJECTIVE/index.html"     # Main calculator
open "OBJECTIVE/src/obc/index.html" # OBC Matrix
```

## Architecture

### OBJECTIVE 4.012 (Current Pre-Production)
- **Entry**: `OBJECTIVE/index.html`
- **Core**: StateManager handles dual-state (Target/Reference) calculations
- **Sections**: 18 calculator sections in `sections/Section*.js`
- **State Flow**: Input → StateManager → Calculator → UI Update
- **Key Pattern**: Every field has Target and Reference variants (e.g., `d_12`, `ref_d_12`)

### 4.012 Framework (Next Generation)
- **Goal**: 50% code reduction, sub-100ms recalculation
- **Pattern**: Tuple-based calculations returning `{target, reference}` pairs
- **Structure**: 
  - `core/` - State management, calculations, UI rendering
  - `sections/` - Individual calculator sections (S01, S02, S03 complete)
- **No ES6 modules** - Uses IIFE pattern for browser compatibility

### Critical Files
- `StateManager.js` - Central state management for dual calculations
- `Calculator.js` - Core calculation engine
- `ReferenceValues.js` - Building code minimum values
- `FieldManager.js` - UI component creation and management
- `Dependency.js` - Complete dependency graph for all fields (visualized in Section 17)
  - Future use: Topological sort for optimized calculation order
  - Future use: Directed graph traversal for reactive calculations
  - Current: Visualization and debugging tool

## Git Workflow & GitHub Etiquette

### Branch Strategy

All development work follows a feature branch workflow with proper PR etiquette:

1. **Creating Feature Branches**:
   - Always branch from the current development branch (usually `dependency3` or latest feature branch)
   - Use descriptive branch names: `FH-AUGMENT`, `S07-FIX`, `COOLING-CALC`, etc.
   - Keep branches focused on a single feature or fix

2. **Committing Changes**:
   - Make atomic commits with clear messages
   - Follow commit format: `Type: Brief description`
   - Types: `Feat`, `Fix`, `Refactor`, `Docs`, `Improve`, `Clean`
   - Include co-author footer:
     ```
     🤖 Co-Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Andy & Claude <andy@openbuilding.ca>
     ```

3. **Pushing to Remote**:
   ```bash
   git push -u origin BRANCH-NAME
   ```
   - Push feature branches to remote for backup and visibility
   - **Do NOT create PRs immediately** if there are open PRs pending review

4. **Pull Request Protocol**:
   - **NEVER merge your own PRs to main** - wait for CTO review
   - **Respect the PR queue**: If PR#35 is open, don't create PR#36 until #35 is reviewed
   - After existing PR is merged:
     ```bash
     # Rebase your feature branch onto updated main
     git checkout main
     git pull origin main
     git checkout YOUR-BRANCH
     git rebase main
     git push --force-with-lease origin YOUR-BRANCH
     ```
   - Then create PR targeting `main`

5. **Branch Lifecycle**:
   - Keep feature branches small (ideally < 10 commits)
   - Don't stack feature branches (branch from `main`, not from other feature branches)
   - After merge: local branch can be deleted, remote branch preserved

### Example Workflow

```bash
# Starting new feature
git checkout dependency3          # or current dev branch
git pull origin dependency3
git checkout -b NEW-FEATURE

# Work and commit
git add .
git commit -m "Feat: Add new capability"

# Push to remote (but don't create PR yet if queue exists)
git push -u origin NEW-FEATURE

# After PR queue clears and base branch merges
git checkout main
git pull origin main
git checkout NEW-FEATURE
git rebase main
git push --force-with-lease origin NEW-FEATURE

# Now create PR via GitHub UI
```

## Development Guidelines

### When modifying calculations:
1. Check both Target and Reference modes work correctly
2. Verify downstream dependencies using `Dependency.js`
3. Test with Reference toggle on/off
4. Ensure Excel export maintains all values

### Field ID Convention:
- Format: `[column]_[row]` (e.g., `d_12` for column D, row 12)
- Target variant: `d_12`
- Reference variant: `ref_d_10`

### State Management:
```javascript
// Always use StateManager for values
TEUI.StateManager.setValue('d_12', value);
const value = TEUI.StateManager.getValue('d_12');

// For dual-state fields
// Target fields use base field ID (e.g., 'd_12')
TEUI.StateManager.setValue('d_12', targetValue);

// Reference fields use 'ref_' prefix (e.g., 'ref_d_12')
TEUI.StateManager.setValue('ref_d_12', referenceValue);
const refValue = TEUI.StateManager.getValue('ref_d_12');
```

### Adding New Sections:
1. Follow naming: `Section[XX].js` or `S[XX].js`
2. Register with StateManager and SectionIntegrator
3. Define field mappings in section's `fields` object
4. Implement `calculate()` and `updateUI()` functions

## Common Issues & Solutions

### Reference Values Not Updating:
- Check `ReferenceValues.js` for field mappings
- Verify dual-state architecture in section implementation
- Ensure `updateReferenceIndicators()` is called after calculations

### Excel Import/Export Issues:
- Field mappings in `ExcelMapper.js`
- Check cell references match Excel template
- Verify data types (numeric vs string)

### Calculation Dependencies:
- Use `Dependency.js` to track field relationships (complete dependency graph)
- Ensure proper calculation order in `Calculator.js`
- Check for circular dependencies
- Note: Convergence calculation loop currently handles stale values and calculation drift
- Future: Replace with topological sort/directed graph for reactive calculations

## Testing Approach

Automated testing with Playwright is configured (`playwright.config.cjs`). Testing includes:
1. Automated: Playwright test suite in `tests/` directory
2. Manual: Compare calculations with Excel reference files (`docs/source of truth/TEUIv3043.xlsx`)
3. Manual: Test Reference mode toggle functionality
4. Manual: Verify CSV/Excel import/export round-trip (confirmed working)
5. Manual: Check responsive design on mobile devices (partial implementation)

## Data Sources
- Climate data: `src/core/ClimateValues.js`
- Excel formulas (CSV export): `docs/sources of truth 3037/TEUIv3043.csv`
- Building code values: Embedded in `src/core/ReferenceValues.js`

## Repository Structure & File Organization

### Directory Structure
```
objective/                              ← Git repo root
├── .git/                              ← Git metadata
├── docs/
│   ├── CLAUDE.md                      ← This file (primary AI guidance)
│   ├── development/
│   │   ├── Logs.md                    ← Debug logs & console output
│   │   └── SEPT15-RACE-MITIGATION.md  ← Technical documentation
│   └── sources of truth 3037/
│       └── TEUIv3043.csv              ← Excel formulas (CSV export)
├── src/
│   ├── core/                          ← Core modules
│   │   ├── StateManager.js           ← Central state management
│   │   ├── Calculator.js             ← Main calculation engine
│   │   ├── Dependency.js             ← Complete dependency graph
│   │   ├── FieldManager.js           ← UI component management
│   │   ├── FileHandler.js            ← CSV/Excel import/export
│   │   ├── ExcelMapper.js            ← Excel cell mapping
│   │   ├── ReferenceValues.js        ← Building code minimums
│   │   ├── ReferenceManager.js       ← Reference mode coordination
│   │   ├── ReferenceToggle.js        ← Toggle UI control
│   │   ├── SectionIntegrator.js      ← Section coordination
│   │   ├── Cooling.js                ← Cooling calculations module
│   │   ├── ClimateValues.js          ← Climate data
│   │   ├── Orchestrator.js           ← Module initialization
│   │   ├── ZenMaster.js              ← Calculation monitoring
│   │   ├── QCMonitor.js              ← Quality control checks
│   │   ├── TooltipManager.js         ← Tooltip system
│   │   └── init.js                   ← Application initialization
│   ├── sections/                      ← Section modules (S01-S18)
│   │   ├── Section01.js through Section18.js
│   │   ├── Section16C.js             ← Sankey chart variant
│   │   └── SectionXX.js              ← Template
│   ├── styles/                        ← CSS files
│   └── obc/                           ← OBC Matrix tool
├── tests/                             ← Playwright test suite
├── index.html                         ← Application entry point
├── playwright.config.cjs              ← Test configuration
└── package.json
```

### Logs.md Workflow

**Manual Process for Debugging**:
- Human copies/pastes browser console logs into `docs/development/Logs.md`
- Agents cannot access browser console directly
- When debugging, request logs from human, then analyze `Logs.md` content
- Use cases: Forensic debugging, calculation sequence analysis, error tracking

### Common Path Issues

When running commands:
- Use quotes for paths with spaces: `"src/sections/Section10.js"`
- Working directory may not persist between commands - verify with `pwd`
- For git operations, ensure you're in repo root

## Quick Orientation Commands

```bash
# List main codebase
ls -la src/

# Check current sections
ls -la src/sections/

# View recent git activity
git log --oneline -10

# Check current branch and status
git branch
git status
```