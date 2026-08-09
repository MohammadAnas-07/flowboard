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
    // of the (app) layout, so a cap this size applied globally would break
    // normal navigation. It's opted into per route instead — see
    // AuthController.
    //
    // 100 rather than a tighter number because of how the frontend talks to
    // this API. next.config.ts rewrites /api/* through Vercel so the session
    // cookie stays first-party, which means every legitimate login reaches
    // Render from a Vercel egress IP rather than the end user's. Per-IP
    // limiting therefore buckets all real users together, and a low cap would
    // let one visitor lock out the rest. Someone hammering the Render URL
    // directly is still counted against their own IP, which is the path that
    // actually matters for abuse.
    ThrottlerModule.forRoot([
      {
        ttl: 15 * 60 * 1000, // 15 minutes, in ms
        limit: 100,
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
