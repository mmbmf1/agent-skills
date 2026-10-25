# code-comments — examples

Language-agnostic patterns. Adapt comment syntax to the file you are editing.

## Restating the code (remove)

**Before**

```text
// Add one to the counter
counter = counter + 1
```

**After**

```text
counter = counter + 1
```

---

## Business rule (keep)

**Before**

```text
if (order.total < MIN_CHARGE) {
  applyMinimumFee(order)
}
```

**After**

```text
// Contract: orders below MIN_CHARGE still incur the platform minimum fee (billing policy §4.2).
if (order.total < MIN_CHARGE) {
  applyMinimumFee(order)
}
```

---

## Workaround (keep, link when possible)

**Before**

```text
sleep(50)
sendRequest(payload)
```

**After**

```text
// Vendor API drops connections opened in the same tick as TLS handshake (vendor-1234).
sleep(50)
sendRequest(payload)
```

---

## Prefer code over comment

**Before**

```text
// 86400000 ms = 24 hours
if (now - lastSeen > 86400000) { ... }
```

**After**

```text
const DAY_MS = 24 * 60 * 60 * 1000
if (now - lastSeen > DAY_MS) { ... }
```

---

## Public API doc (short contract)

**Before**

```text
export function resolveUser(id) { ... }
```

**After**

```text
/**
 * Loads the active user record for `id`.
 * Returns null when the user is deleted or not visible to the caller.
 * Throws StorageUnavailable when the backing store cannot be reached.
 */
export function resolveUser(id) { ... }
```

---

## Stale comment (fix or remove)

**Before**

```text
// Sends email synchronously before persisting the order.
async function checkout(cart) {
  await persistOrder(cart)
  await queueReceiptEmail(cart)
}
```

**After**

```text
async function checkout(cart) {
  await persistOrder(cart)
  await queueReceiptEmail(cart)
}
```

---

## Audit output (example)

When reviewing without editing:

```markdown
- **remove** `src/fees.ts:42` — duplicates the `if` condition
- **improve** `src/api/handlers.ts:resolveUser` — document null vs throw (public export)
- **keep** `src/sync.ts:118` — documents non-obvious retry cap tied to vendor SLA
```
