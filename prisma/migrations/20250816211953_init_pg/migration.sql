-- CreateTable
CREATE TABLE "public"."Observation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "meteors" INTEGER NOT NULL,
    "minutes" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);
