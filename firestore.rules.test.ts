/**
 * Firestore Security Rules Test Suite (Dirty Dozen Verification)
 * Verifies all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Product Create',
    operation: 'create',
    path: '/products/prod-1',
    auth: { uid: 'admin-1', email: 'bf25nwcs0357@uetpeshawar.edu.pk', email_verified: true },
    payload: {
      name: 'Mango Flavour',
      sku: 'FLV-001',
      slug: 'mango-flavour',
      isSuperFeatured: true, // Shadow field
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Admin Spoof',
    operation: 'create',
    path: '/products/prod-1',
    auth: { uid: 'spoof-admin', email: 'bf25nwcs0357@uetpeshawar.edu.pk', email_verified: false },
    payload: { name: 'Mango Flavour' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'ID Poisoning with Invalid Characters',
    operation: 'create',
    path: '/inquiries/invalid$id!@#',
    auth: { uid: 'user-1', email: 'buyer@company.com', email_verified: true },
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Identity Spoofing on Inquiry Submission',
    operation: 'create',
    path: '/inquiries/inq-101',
    auth: { uid: 'user-A', email: 'usera@company.com', email_verified: true },
    payload: {
      submitterUid: 'user-B',
      name: 'Buyer A',
      company: 'Acme Foods',
      email: 'usera@company.com',
      phone: '+412200000',
      country: 'Switzerland',
      productName: 'Mango Flavour',
      quantity: '50 kg',
      application: 'Beverage',
      message: 'Need quote',
      status: 'New',
      createdAt: '2026-10-08T10:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'PII Blanket Read on Inquiries by Non-Owner',
    operation: 'get',
    path: '/inquiries/inq-101',
    auth: { uid: 'user-C', email: 'userc@other.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Unauthorized List Scraping on Sample Requests',
    operation: 'list',
    path: '/sampleRequests',
    auth: { uid: 'user-C', email: 'userc@other.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Value Poisoning on Inquiry Update Status Enum',
    operation: 'update',
    path: '/inquiries/inq-101',
    auth: { uid: 'admin-1', email: 'bf25nwcs0357@uetpeshawar.edu.pk', email_verified: true },
    payload: { status: 'INVALID_STATUS' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Oversized String Denial-of-Wallet on Contact Message',
    operation: 'create',
    path: '/contactMessages/msg-1',
    auth: { uid: 'user-1', email: 'buyer@company.com', email_verified: true },
    payload: { message: 'x'.repeat(5000) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Self-Assigned Super Admin Escalation',
    operation: 'create',
    path: '/admins/attacker-uid',
    auth: { uid: 'attacker-uid', email: 'attacker@evil.com', email_verified: true },
    payload: {
      uid: 'attacker-uid',
      email: 'attacker@evil.com',
      name: 'Attacker',
      role: 'Super Admin',
      createdAt: '2026-10-08T10:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable createdAt Tampering on Product Update',
    operation: 'update',
    path: '/products/prod-1',
    auth: { uid: 'admin-1', email: 'bf25nwcs0357@uetpeshawar.edu.pk', email_verified: true },
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'State Shortcutting on Inquiry Creation',
    operation: 'create',
    path: '/inquiries/inq-202',
    auth: { uid: 'user-1', email: 'buyer@company.com', email_verified: true },
    payload: { status: 'Completed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Orphaned Write to Unknown Collection',
    operation: 'create',
    path: '/secretBackdoor/doc-1',
    auth: { uid: 'admin-1', email: 'bf25nwcs0357@uetpeshawar.edu.pk', email_verified: true },
    payload: { hacked: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
