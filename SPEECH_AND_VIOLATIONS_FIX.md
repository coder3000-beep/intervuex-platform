# SPEECH-TO-TEXT & VIOLATIONS FIX

## Issues Fixed:

### 1. ✅ Speech-to-Text Network Errors
**Problem**: OpenAI API connection timing out (ECONNRESET)

**Solution**:
- Added **30-second timeout** for API requests
- Added **automatic retry** (2 attempts) on network errors
- Added **1-second delay** between retries
- Better error messages for different failure types:
  - Network issues: "Network connection issue. Please check your internet connection..."
  - API key issues: "OpenAI API key is invalid..."
  - Other errors: "Speech-to-text conversion failed..."

### 2. ✅ Too Many Violations
**Problem**: Violations triggering too frequently, causing high violation counts

**Solution**:

#### NO_FACE Violations:
- **Before**: Triggered after 3 seconds (6 checks)
- **After**: Triggers after **5 seconds** (10 checks)
- **Cooldown**: 15 seconds between violations
- **Impact**: Reduced from 5 to **3 points**
- **Severity**: Changed from MEDIUM to **LOW**

#### MULTIPLE_FACES Violations:
- **Before**: Triggered after 1.5 seconds (3 checks)
- **After**: Still 1.5 seconds BUT with **10-second cooldown**
- **Impact**: Stays at 15 points (serious violation)
- **Severity**: Stays HIGH

#### WINDOW_BLUR Violations:
- **Before**: Created violation every time window lost focus
- **After**: **Disabled** (too sensitive, tab switching already tracked)

## New Violation Logic:

```javascript
NO_FACE:
- Consecutive checks: 10 (5 seconds)
- Cooldown: 15 seconds
- Impact: 3 points
- Severity: LOW

MULTIPLE_FACES:
- Consecutive checks: 3 (1.5 seconds)
- Cooldown: 10 seconds
- Impact: 15 points
- Severity: HIGH

WINDOW_BLUR:
- Disabled (not tracked)

TAB_SWITCH:
- Still tracked (3 points per switch)
```

## Speech-to-Text Retry Flow:

```
1. User records voice
2. Send to OpenAI API (30s timeout)
3. If fails → Wait 1 second → Retry
4. If fails again → Wait 1 second → Retry
5. If still fails → Show error message
```

## Benefits:

- ✅ Speech-to-text more reliable with retries
- ✅ Fewer false violation alerts
- ✅ Violations only trigger after sustained issues
- ✅ Cooldown prevents spam
- ✅ Better user experience
- ✅ More accurate integrity scoring

## Testing:

1. **Speech-to-text**: Record voice → Should retry on network issues
2. **NO_FACE**: Move away for 5+ seconds → Should trigger once, then wait 15s
3. **MULTIPLE_FACES**: Show 2 faces for 1.5+ seconds → Should trigger once, then wait 10s
4. **Window blur**: Click outside → Should NOT create violation

## Expected Violation Counts:

**Normal interview (30 minutes)**:
- NO_FACE: 0-2 violations (if candidate moves away briefly)
- MULTIPLE_FACES: 0-1 violations (if someone walks by)
- TAB_SWITCH: 0-3 violations (if candidate accidentally switches)
- TOTAL: 0-6 violations (integrity score: 80-100%)

**Problematic interview**:
- NO_FACE: 3-5 violations
- MULTIPLE_FACES: 2-4 violations
- TAB_SWITCH: 5-10 violations
- TOTAL: 10-19 violations (integrity score: 40-70%)
