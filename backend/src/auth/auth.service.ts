import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // 회원가입
  async signup(
    email: string,
    password: string,
    name: string,
    phoneNumber?: string,
    dob?: string,
    gender?: string,
  ) {
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해싱
    const password_hash = await bcrypt.hash(password, 10);

    // User와 Profile을 함께 생성
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        name,
        role: 'USER',
        profiles: {
          create: {
            phone: phoneNumber || null,
            grade: dob || null,
          },
        },
      },
      include: {
        profiles: true,
      },
    });

    return {
      message: '회원가입이 완료되었습니다.',
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  // 로그인
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 잘못되었습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 잘못되었습니다.',
      );
    }

    // JWT 토큰 생성
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    console.log('토큰 페이로드:', payload);

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  // 프로필 조회
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const profile = user.profiles[0];

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: profile
        ? {
            grade: profile.grade,
            phone: profile.phone,
            interests: profile.interests,
          }
        : null,
    };
  }

  // 프로필 업데이트
  async updateProfile(
    userId: number,
    data: {
      name?: string;
      grade?: string;
      phoneNumber?: string;
      interests?: any;
    },
  ) {
    // User의 name 업데이트 (있는 경우)
    if (data.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profiles: true },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    let profile;

    if (user.profiles.length > 0) {
      profile = await prisma.profile.update({
        where: { id: user.profiles[0].id },
        data: {
          grade: data.grade,
          phone: data.phoneNumber,
          interests: data.interests,
        },
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          user_id: userId,
          grade: data.grade,
          phone: data.phoneNumber,
          interests: data.interests,
        },
      });
    }

    return {
      message: '프로필이 업데이트되었습니다.',
      profile,
    };
  }
}