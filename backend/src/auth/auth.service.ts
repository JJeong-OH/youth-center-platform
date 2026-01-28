import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async signup(signupDto: any) {
    const { email, password, name, phoneNumber } = signupDto;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        name,
        phone_number: phoneNumber ? phoneNumber.replace(/-/g, '') : null,
        role: 'USER',
      },
    });

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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    if (loginDto.role && user.role !== loginDto.role) {
      throw new BadRequestException('권한이 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new BadRequestException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

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
      dateOfBirth: user.dob,
      gender: user.gender,
      grade: profile?.grade,
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
        dob: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : undefined,
        gender: updateDto.gender,
      },
    });

    // Profile 테이블 업데이트
    const existingProfile = await prisma.profile.findFirst({
      where: { user_id: userId },
    });

    if (existingProfile) {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          grade: updateDto.grade,
          interests: updateDto.interests,
          phone: updateDto.phoneNumber,
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          user_id: userId,
          grade: updateDto.grade,
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