import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('🔐 Authorization Header:', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token:', token);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      console.log('✅ Token Payload:', payload);

      // 관리자 권한 확인
      if (payload.role !== 'ADMIN' && payload.role !== 'admin') {
        console.log('❌ 권한 없음:', payload.role);
        throw new UnauthorizedException('관리자 권한이 필요합니다.');
      }

      request.user = payload;
      return true;
    } catch (error) {
      console.error('❌ 토큰 검증 실패:', error.message);
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}