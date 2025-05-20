import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';

interface RequestWithUser extends Request {
  user: object;
}

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (user) {
      return user;
    } else {
      throw new HttpException('Unauthorized', 401);
    }
  },
);
