-- CreateTable
CREATE TABLE "_SubtaskAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubtaskAssignees_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SubtaskAssignees_B_index" ON "_SubtaskAssignees"("B");

-- AddForeignKey
ALTER TABLE "_SubtaskAssignees" ADD CONSTRAINT "_SubtaskAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "subtasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubtaskAssignees" ADD CONSTRAINT "_SubtaskAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
