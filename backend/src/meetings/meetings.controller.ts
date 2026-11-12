import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { IssueTokenDto } from './dto/issue-token.dto.js';
import { createMeetingTracker } from './meeting-throttle.js';
import { type MeetingUser, MeetingsService } from './meetings.service.js';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard.js';

type RequestWithUser = Request & {
  user?: MeetingUser;
};

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @SkipThrottle({ 'issue-token': true })
  @Throttle({
    'create-meeting': {
      getTracker: createMeetingTracker,
    },
  })
  create(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.meetingsService.create(req.user.id);
  }

  @Post(':id/token')
  @UseGuards(OptionalJwtAuthGuard, ThrottlerGuard)
  @SkipThrottle({ 'create-meeting': true })
  issueToken(
    @Param('id') id: string,
    @Body() body: IssueTokenDto,
    @Req() req: RequestWithUser,
  ) {
    return this.meetingsService.issueToken({
      meetingId: id,
      user: req.user,
      displayName: body?.displayName,
    });
  }
}
