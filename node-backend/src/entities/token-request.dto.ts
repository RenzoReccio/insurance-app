import Joi from 'joi';

export interface TokenRequestDto {
  username?: string;
  role?: string;
}

export const TokenRequestSchema = Joi.object<TokenRequestDto>({
  username: Joi.string().default('interface.servicios').description('User identity'),
  role: Joi.string().default('service').description('User access role'),
});
