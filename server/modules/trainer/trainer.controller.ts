import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  SupabaseAuthGuard,
  type AuthedRequest,
} from '../../common/auth/supabase-auth.guard';
import type {
  CreateRecordingRequest,
  RecordingItem,
  RemoveMistakeRequest,
  SubmitQuizRequest,
  SubmitQuizResponse,
  ToggleLessonRequest,
  ToggleLessonResponse,
  TrainerState,
} from '../../../shared/api.interface';
import {
  CreateRecordingDto,
  RemoveMistakeDto,
  SubmitQuizDto,
  ToggleLessonDto,
} from './trainer.dto';
import { TrainerService } from './trainer.service';

@Controller('api/trainer')
@UseGuards(SupabaseAuthGuard)
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Get('state')
  async getState(
    @Req() req: AuthedRequest,
  ): Promise<TrainerState> {
    const { userId } = req.userContext;
    return this.trainerService.getState(userId);
  }

  @Post('lessons/toggle')
  async toggleLesson(
    @Req() req: AuthedRequest,
    @Body() dto: ToggleLessonDto,
  ): Promise<ToggleLessonResponse> {
    const { userId } = req.userContext;
    return this.trainerService.toggleLesson(
      userId,
      dto.lessonKey,
      dto.done,
    );
  }

  @Post('quiz/submit')
  async submitQuiz(
    @Req() req: AuthedRequest,
    @Body() dto: SubmitQuizDto,
  ): Promise<SubmitQuizResponse> {
    const { userId } = req.userContext;
    const state: TrainerState = await this.trainerService.submitQuiz(
      userId,
      dto.wrongQuestions,
      dto.scorePercent,
      dto.onlyMistakes,
    );
    return { state };
  }

  @Post('mistakes/remove')
  async removeMistake(
    @Req() req: AuthedRequest,
    @Body() dto: RemoveMistakeDto,
  ): Promise<SubmitQuizResponse> {
    const { userId } = req.userContext;
    const state: TrainerState = await this.trainerService.removeMistake(
      userId,
      dto.question,
    );
    return { state };
  }

  @Get('recordings')
  async listRecordings(
    @Req() req: AuthedRequest,
  ): Promise<RecordingItem[]> {
    const { userId } = req.userContext;
    return this.trainerService.listRecordings(userId);
  }

  @Post('recordings')
  async createRecording(
    @Req() req: AuthedRequest,
    @Body() dto: CreateRecordingDto,
  ): Promise<RecordingItem> {
    const { userId } = req.userContext;
    const input: CreateRecordingRequest = {
      tag: dto.tag,
      task: dto.task,
      duration: dto.duration,
      checks: dto.checks,
      audioUrl: dto.audioUrl,
    };
    return this.trainerService.createRecording(userId, input);
  }

  @Delete('recordings/:id')
  async deleteRecording(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    await this.trainerService.deleteRecording(userId, id);
    return { success: true };
  }
}
