import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // 설문조사 제출
  @Post('submit')
  @UseGuards(AuthGuard('jwt'))
  async submitSurvey(
    @Request() req,
    @Body()
    body: {
      answers: any;
      aiAnalysis?: string;
    },
  ) {
    return this.surveyService.submitSurvey(
      req.user.userId,
      body.answers,
      body.aiAnalysis,
    );
  }

  // 내 설문 결과 조회
  @Get('my-results')
  @UseGuards(AuthGuard('jwt'))
  async getMyResults(@Request() req) {
    return this.surveyService.getUserSurveyResults(req.user.userId);
  }

  // 특정 설문 결과 상세
  @Get('result/:id')
  @UseGuards(AuthGuard('jwt'))
  async getSurveyResult(@Param('id') id: string) {
    return this.surveyService.getSurveyResult(parseInt(id));
  }

  // 성장 추적
  @Get('growth-tracking')
  @UseGuards(AuthGuard('jwt'))
  async getGrowthTracking(@Request() req) {
    return this.surveyService.getGrowthTracking(req.user.userId);
  }
}