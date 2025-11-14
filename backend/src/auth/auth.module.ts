import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // 우리가 만든 '보안요원'

@Module({
  imports: [
    // '여권' 관련 기능을 등록합니다.
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // '출입증(JWT)' 발급 기능을 등록하고 설정합니다.
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController], // '창구 직원' 배치
  providers: [AuthService, JwtStrategy], // '실무자'와 '보안요원' 배치
})
export class AuthModule {}