import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@GetUser() user: User) {
    await this.authService.logout(user._id.toString());
    return { message: 'Successfully logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@GetUser() user: User, @Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(user._id.toString(), refreshToken);
  }
} 