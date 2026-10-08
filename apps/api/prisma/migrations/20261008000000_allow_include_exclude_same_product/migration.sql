PRAGMA foreign_keys=OFF;

CREATE TABLE "new_CouponProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "couponId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    CONSTRAINT "CouponProduct_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CouponProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_CouponProduct" ("id", "couponId", "productId", "mode")
SELECT lower(hex(randomblob(16))), "couponId", "productId", "mode"
FROM "CouponProduct";

DROP TABLE "CouponProduct";
ALTER TABLE "new_CouponProduct" RENAME TO "CouponProduct";

CREATE UNIQUE INDEX "CouponProduct_couponId_productId_mode_key" ON "CouponProduct"("couponId", "productId", "mode");
CREATE INDEX "CouponProduct_couponId_productId_idx" ON "CouponProduct"("couponId", "productId");

PRAGMA foreign_keys=ON;
