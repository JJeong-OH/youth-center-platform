import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // 토큰 생성 메서드
  generateToken(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // ✅ secret 명시하지 않고 모듈 설정 사용
    return this.jwtService.sign(payload);
  }

  async signup(signupDto: any) {
    // ... 기존 회원가입 로직 ...

    const accessToken = this.generateToken(newUser);

    return {
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      accessToken,
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    console.log('🔍 로그인 시도:', email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    console.log('🔍 찾은 사용자:', {
      id: user.id,
      email: user.email,
      role: user.role,
      roleMatch: user.role === loginDto.role,
    });

    if (loginDto.role && user.role !== loginDto.role) {
      throw new BadRequestException('권한이 없습니다.');
    }

    console.log('🔍 비밀번호 검증 중...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔍 비밀번호 검증 결과:', isPasswordValid);

    if (!isPasswordValid) {
      throw new BadRequestException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    console.log('✅ 로그인 성공!');

    const accessToken = this.generateToken(user);

    return {
      success: true,
      message: '로그인에 성공했습니다.',
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profiles: true },
    });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const profile = user.profiles[0];

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phone_number,
      dateOfBirth: user.date_of_birth,
      gender: user.gender,
      grade: profile?.grade,
      school: profile?.school,
      interests: profile?.interests,
      phone: profile?.phone,
    };
  }

  async updateProfile(userId: number, updateDto: any) {
    // User 테이블 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: updateDto.name,
        phone_number: updateDto.phoneNumber,
        date_of_birth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : undefined,
        gender: updateDto.gender,
      },
    });

    // Profile 테이블 업데이트
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      await prisma.profile.update({
        where: { userId },
        data: {
          grade: updateDto.grade,
          school: updateDto.school,
          interests: updateDto.interests,
          phone: updateDto.phoneNumber,
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          userId,
          grade: updateDto.grade,
          school: updateDto.school,
          interests: updateDto.interests,
          phone: updateDto.phoneNumber,
        },
      });
    }

    return {
      success: true,
      message: '프로필이 업데이트되었습니다.',
    };
  }
}