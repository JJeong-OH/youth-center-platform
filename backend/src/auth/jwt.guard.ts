import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('🔐 Authorization Header:', authHeader);

    if (!authHeader) {
      console.log('❌ Authorization 헤더 없음');
      throw new UnauthorizedException('토큰이 제공되지 않았습니다.');
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔍 Guard handleRequest:', { err, user, info });

    if (err || !user) {
      console.log('❌ 토큰 검증 실패:', info?.message || err?.message);
      throw err || new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    console.log('✅ 토큰 검증 성공:', user);
    return user;
  }
}