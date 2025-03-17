import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  private static extractJWT(req): string | null {
    if (
      req.cookies &&
      'token' in req.cookies &&
      req.cookies.user_token.length > 0
    ) {
      return req.cookies.token;
    }
    return null;
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
