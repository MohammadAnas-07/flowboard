import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { CommentsModule } from './comments/comments.module';
import { LabelsModule } from './labels/labels.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Rate limiting for unauthenticated auth routes. Deliberately NOT wired
    // up as a global APP_GUARD: GET /api/auth/me runs on every server render
    // of the (app) layout, so a 10-per-15-minutes cap applied globally would
    // break normal navigation after a handful of page loads. It's opted into
    // per route instead — see AuthController.
    ThrottlerModule.forRoot([
      {
        ttl: 15 * 60 * 1000, // 15 minutes, in ms
        limit: 10,
      },
    ]),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    SubtasksModule,
    CommentsModule,
    LabelsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
