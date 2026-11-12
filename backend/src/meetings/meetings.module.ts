import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from '../auth/auth.module.js';
import { LiveKitService } from './livekit.service.js';
import { MeetingsController } from './meetings.controller.js';
import { MeetingsCron } from './meetings.cron.js';
import { MeetingsService } from './meetings.service.js';

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'create-meeting', ttl: ONE_HOUR_MS, limit: 10 },
        { name: 'issue-token', ttl: ONE_MINUTE_MS, limit: 30 },
      ],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService, LiveKitService, MeetingsCron],
})
export class MeetingsModule {}
