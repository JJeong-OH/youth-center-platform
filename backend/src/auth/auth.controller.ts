import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('signup')
  async signup(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      phoneNumber?: string;
      dob?: string;
      gender?: string;
    },
  ) {
    return this.authService.signup(
      body.email,
      body.password,
      body.name,
      body.phoneNumber,
      body.dob,
      body.gender,
    );
  }

  // 로그인
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // 프로필 조회
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  // 프로필 업데이트
  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @Request() req,
    @Body()
    body: {
      name?: string;
      grade?: string;
      phoneNumber?: string;
      interests?: any;
    },
  ) {
    return this.authService.updateProfile(req.user.userId, {
      name: body.name,
      grade: body.grade,
      phoneNumber: body.phoneNumber,
      interests: body.interests,
    });
  }
}