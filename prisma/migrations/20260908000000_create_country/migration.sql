-- Country identity only; currency, language, and market policy remain in TypeScript.
CREATE TABLE "Country" (
    "code" CHAR(2) NOT NULL,
    CONSTRAINT "Country_pkey" PRIMARY KEY ("code")
);
