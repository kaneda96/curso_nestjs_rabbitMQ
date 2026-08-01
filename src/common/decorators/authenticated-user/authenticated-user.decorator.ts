import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'

export const AuthenticatedUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user

  if (!user.id) {
    throw new UnauthorizedException()
  }
  return user
})
