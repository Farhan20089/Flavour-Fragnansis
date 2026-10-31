CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submitterUid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "productName" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "application" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "attachmentUrl" TEXT NOT NULL DEFAULT '',
    "inquiryType" TEXT NOT NULL DEFAULT 'Quote',
    "cartItemsJson" TEXT NOT NULL DEFAULT '[]',
    "estimatedTotal" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");
