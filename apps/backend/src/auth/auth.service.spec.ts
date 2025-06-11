import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let model: Model<UserDocument>;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$test-hashed-password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signup', () => {
    it('should create a new user and return token with user data', async () => {
      const signupDto: SignupDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      };

      jest.spyOn(model, 'findOne').mockResolvedValue(null);
      jest.spyOn(model, 'create').mockResolvedValue(mockUser as any);

      const result = await service.signup(signupDto);

      expect(result).toEqual({
        token: 'test-token',
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      const signupDto: SignupDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password456',
      };

      await expect(service.signup(signupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return token and user data for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(model, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        token: 'test-token',
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(model, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
}); 