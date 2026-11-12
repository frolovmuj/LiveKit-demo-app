import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MeetingsService } from './meetings.service.js';

@Injectable()
export class MeetingsCron {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpiredMeetings() {
    await this.meetingsService.purgeExpired();
  }
}
