import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type {
  CreateRecordingRequest,
  RemoveMistakeRequest,
  SubmitQuizRequest,
  ToggleLessonRequest,
} from '../../../shared/api.interface';

export class ToggleLessonDto implements ToggleLessonRequest {
  @IsString()
  @MaxLength(200)
  lessonKey!: string;

  @IsBoolean()
  done!: boolean;
}

export class SubmitQuizDto implements SubmitQuizRequest {
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  wrongQuestions!: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  scorePercent!: number;

  @IsBoolean()
  onlyMistakes!: boolean;
}

export class RemoveMistakeDto implements RemoveMistakeRequest {
  @IsString()
  @MaxLength(500)
  question!: string;
}

export class CreateRecordingDto implements CreateRecordingRequest {
  @IsString()
  @MaxLength(100)
  tag!: string;

  @IsString()
  @MaxLength(500)
  task!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3600)
  duration!: number;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  checks!: string[];

  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  audioUrl!: string;
}
