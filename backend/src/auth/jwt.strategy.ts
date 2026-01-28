import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,  // ✅ undefined 체크 후 전달
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    console.log('✅ JWT Payload 검증:', payload);
    
    if (!payload.userId || !payload.email) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
    
    return { 
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  }
}