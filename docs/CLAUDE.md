# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The OBJECTIVE TEUI (Total Energy Use Intensity) Calculator is a web-based energy modeling tool for buildings in Ontario, Canada. The codebase has three main versions:

1. **4011RF** (Current stable) - Production-ready calculator with dual-state (Target/Reference) architecture
2. **4012** (Framework rewrite) - Next-gen architecture using functional programming and modern CSS
3. **OBC Matrix** - Ontario Building Code compliance matrix tool

## Commands

```bash
# Linting and formatting
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm run format:check # Check Prettier formatting
npm run format:write # Auto-format with Prettier

# Open calculators locally
open "OBJECTIVE 4011RF/index.html"     # Main calculator
open "OBJECTIVE 4012/index.html"       # New framework version
open "OBJECTIVE 4011RF/obc/indexobc.html" # OBC Matrix
```

## Architecture

### 4011RF (Current Production)
- **Entry**: `OBJECTIVE 4011RF/index.html`
- **Core**: StateManager handles dual-state (Target/Reference) calculations
- **Sections**: 18 calculator sections in `sections/4011-Section*.js`
- **State Flow**: Input → StateManager → Calculator → UI Update
- **Key Pattern**: Every field has Target and Reference variants (e.g., `d_10_target`, `d_10_reference`)

### 4012 Framework (Next Generation)
- **Goal**: 50% code reduction, sub-100ms recalculation
- **Pattern**: Tuple-based calculations returning `{target, reference}` pairs
- **Structure**: 
  - `core/` - State management, calculations, UI rendering
  - `sections/` - Individual calculator sections (S01, S02, S03 complete)
- **No ES6 modules** - Uses IIFE pattern for browser compatibility

### Critical Files
- `4011-StateManager.js` - Central state management for dual calculations
- `4011-Calculator.js` - Core calculation engine
- `4011-ReferenceValues.js` - Building code minimum values
- `4011-FieldManager.js` - UI component creation and management

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
2. Verify downstream dependencies using `4011-Dependency.js`
3. Test with Reference toggle on/off
4. Ensure Excel export maintains all values

### Field ID Convention:
- Format: `[column]_[row]` (e.g., `d_10` for column D, row 10)
- Target variant: `d_10_target`
- Reference variant: `d_10_reference`

### State Management:
```javascript
// Always use StateManager for values
TEUI.StateManager.setValue('d_10', value);
const value = TEUI.StateManager.getValue('d_10');

// For dual-state fields
TEUI.StateManager.setTargetValue('d_10', targetValue);
TEUI.StateManager.setReferenceValue('d_10', referenceValue);
```

### Adding New Sections:
1. Follow naming: `4011-Section[XX].js` or `4012-S[XX].js`
2. Register with StateManager and SectionIntegrator
3. Define field mappings in section's `fields` object
4. Implement `calculate()` and `updateUI()` functions

## Common Issues & Solutions

### Reference Values Not Updating:
- Check `4011-ReferenceValues.js` for field mappings
- Verify dual-state architecture in section implementation
- Ensure `updateReferenceIndicators()` is called after calculations

### Excel Import/Export Issues:
- Field mappings in `4011-ExcelMapper.js`
- Check cell references match Excel template
- Verify data types (numeric vs string)

### Calculation Dependencies:
- Use `4011-Dependency.js` to track field relationships
- Ensure proper calculation order in `4011-Calculator.js`
- Check for circular dependencies

## Testing Approach

No formal test framework is configured. Testing is done manually:
1. Compare calculations with Excel reference files in `data/`
2. Test Reference mode toggle functionality
3. Verify Excel import/export round-trip
4. Check responsive design on mobile devices

## Data Sources
- Climate data: `4011-ClimateValues.js`
- Building codes: `sources of truth 3037/CODE-VALUES.csv`
- Formulas: `sources of truth 3037/FORMULAE-3039.csv`