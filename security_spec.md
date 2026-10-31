# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: All unmatched paths in Firestore are unconditionally denied (`allow read, write: if false;`).
2. **Verified Authentication & Admin RBAC**:
   - Every write operation across all collections requires `isSignedIn()` and `request.auth.token.email_verified == true`.
   - Administrative operations (`products`, `categories`, `industries`, `blogPosts`, `media`, `certificates`, `pages`, `settings`, `admins`, and status updates on `inquiries`, `sampleRequests`, `contactMessages`) require `isAdmin()`, which verifies either the bootstrapped owner email (`bf25nwcs0357@uetpeshawar.edu.pk` with `email_verified == true`) or the existence of `/admins/$(request.auth.uid)`.
3. **Path Variable Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates the path ID using `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **PII Isolation (`inquiries`, `sampleRequests`, `contactMessages`, `admins`)**:
   - Collections storing PII (`email`, `phone`, `shippingAddress`) never permit blanket public or `isSignedIn()` reads.
   - `get` and `list` on `inquiries`, `sampleRequests`, and `contactMessages` are strictly restricted to `isAdmin() || (isVerifiedUser() && resource.data.submitterUid == request.auth.uid)`.
   - `submitterUid` on creation must strictly equal `request.auth.uid`.
5. **Strict Schema & Volumetric Validation (`hasAll` + `hasOnly` + `.size()`)**:
   - Every `create` and `update` invokes its entity validation helper (`isValidProduct`, `isValidCategory`, `isValidIndustry`, `isValidInquiry`, `isValidSampleRequest`, `isValidContactMessage`, `isValidBlogPost`, `isValidMedia`, `isValidCertificate`, `isValidPage`, `isValidSiteSetting`, `isValidAdminUser`).
   - All string fields have explicit `.size() <= maxLength` boundaries matching `firebase-blueprint.json`.
   - Immutable fields (`createdAt`, `submitterUid`, `uid`) cannot be altered during `update`.
6. **Terminal State Locking**:
   - Once an `Inquiry` or `SampleRequest` reaches `status == 'Completed'`, non-admin updates are locked (`existing().status != 'Completed' || isAdmin()`).

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Shadow Field Injection on Product Create)**:
   - Target: `/products/prod-1`
   - Attack: Includes unauthorized field `"isSuperFeatured": true` alongside valid fields.
   - Expected: `PERMISSION_DENIED` via `data.keys().hasOnly(...)`.
2. **Payload 2 (Unverified Email Admin Spoof)**:
   - Target: `/products/prod-1`
   - Attack: User token has `email: "bf25nwcs0357@uetpeshawar.edu.pk"` but `email_verified: false`.
   - Expected: `PERMISSION_DENIED` via `isVerifiedUser()` gate.
3. **Payload 3 (ID Poisoning / 1.5KB Document ID)**:
   - Target: `/inquiries/<1500-char-junk-id>`
   - Attack: Injects oversized document ID with special characters.
   - Expected: `PERMISSION_DENIED` via `isValidId(inquiryId)`.
4. **Payload 4 (Identity Spoofing on Inquiry Submission)**:
   - Target: `/inquiries/inq-101`
   - Attack: Authenticated user `uid: "user-A"` sets `submitterUid: "user-B"`.
   - Expected: `PERMISSION_DENIED` via `data.submitterUid == request.auth.uid`.
5. **Payload 5 (PII Blanket Read on Inquiries)**:
   - Target: `GET /inquiries/inq-101`
   - Attack: Authenticated user `uid: "user-C"` attempts to read an inquiry owned by `user-A`.
   - Expected: `PERMISSION_DENIED` via `isAdmin() || resource.data.submitterUid == request.auth.uid`.
6. **Payload 6 (Unauthorized List Scraping on Sample Requests)**:
   - Target: `LIST /sampleRequests`
   - Attack: Non-admin user attempts an unfiltered list query across all sample requests.
   - Expected: `PERMISSION_DENIED` via `resource.data.submitterUid == request.auth.uid` check in `allow list`.
7. **Payload 7 (Value Poisoning on Inquiry Update)**:
   - Target: `UPDATE /inquiries/inq-101`
   - Attack: Admin updates `status` to `"HackedStatus"` (not in enum `['New', 'Contacted', 'In Progress', 'Completed']`).
   - Expected: `PERMISSION_DENIED` via `isValidInquiry(incoming())` wrapper on `allow update`.
8. **Payload 8 (Denial-of-Wallet 1MB String on Contact Message)**:
   - Target: `CREATE /contactMessages/msg-1`
   - Attack: Sends a 50,000-character string in `message` (exceeding `maxLength: 3000`).
   - Expected: `PERMISSION_DENIED` via `data.message.size() <= 3000`.
9. **Payload 9 (Self-Assigned Super Admin Escalation)**:
   - Target: `CREATE /admins/attacker-uid`
   - Attack: Regular verified user attempts to create their own document in `/admins/{adminUid}` with `role: "Super Admin"`.
   - Expected: `PERMISSION_DENIED` because `/admins` write requires `isAdmin()`.
10. **Payload 10 (Immutable `createdAt` Tampering on Product Update)**:
    - Target: `UPDATE /products/prod-1`
    - Attack: Attempts to modify `createdAt` during an update.
    - Expected: `PERMISSION_DENIED` via `incoming().createdAt == existing().createdAt`.
11. **Payload 11 (State Shortcutting on Inquiry Creation)**:
    - Target: `CREATE /inquiries/inq-202`
    - Attack: Submitter attempts to create an inquiry directly with `status: "Completed"`.
    - Expected: `PERMISSION_DENIED` via `incoming().status == 'New'` on creation.
12. **Payload 12 (Orphaned Write to Unknown Collection)**:
    - Target: `CREATE /secretBackdoor/doc-1`
    - Attack: Attempts to write to an undocumented collection.
    - Expected: `PERMISSION_DENIED` via global default-deny catch-all.
