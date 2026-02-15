-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "github" TEXT,
    "email" TEXT,
    "title" TEXT NOT NULL DEFAULT '我的博客',
    "description" TEXT NOT NULL DEFAULT '分享知识与生活',
    "updatedAt" DATETIME NOT NULL
);
