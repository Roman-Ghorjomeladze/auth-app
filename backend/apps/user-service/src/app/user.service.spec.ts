/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLogger } from '../common/app-logger.service';
import { RpcException } from '@nestjs/microservices';
import { UpdateProfileDto } from '@app/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;
  let logger: jest.Mocked<AppLogger>;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    setTraceId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            merge: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get(UserService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    logger = module.get(AppLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    const existingUser: UserEntity = {
      id: '123',
      email: 'john@example.com',
      name: 'John Doe',
      location: 'NYC',
    } as UserEntity;

    it('should return the user profile when user exists', async () => {
      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.getProfile('123');

      expect(logger.log).toHaveBeenCalledWith('Fetching user profile', {
        userId: '123',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(existingUser);
    });

    it('should throw RpcException when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('999')).rejects.toThrow(RpcException);

      expect(logger.log).toHaveBeenCalledWith('Fetching user profile', {
        userId: '999',
      });
      expect(logger.error).toHaveBeenCalledWith('User not found');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('updateProfile', () => {
    const existingUser: UserEntity = {
      id: '1',
      email: 'test@test.com',
      name: 'Old name',
    } as UserEntity;

    const updateDto: UpdateProfileDto = {
      name: 'New name',
      location: 'New Location',
    };

    it('should update user profile fields successfully', async () => {
      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.merge.mockImplementation((entity, changes) => {
        return Object.assign(entity, changes);
      });
      userRepository.save.mockResolvedValue({ ...existingUser, ...updateDto });

      const result = await service.updateProfile('1', updateDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(userRepository.merge).toHaveBeenCalledWith(
        existingUser,
        updateDto,
      );
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result).toMatchObject(updateDto);
    });

    it('should throw RpcException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile('missing-id', { name: 'Test' }),
      ).rejects.toThrow(RpcException);

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
  describe('upsertFromGoogle', () => {
    const googleInput = {
      googleId: 'google-12345',
      email: 'john.doe@gmail.com',
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('should update existing user when found by googleId', async () => {
      const existingUser: UserEntity = {
        id: '1',
        googleId: 'google-12345',
        email: 'old.email@gmail.com',
        name: 'Old Name',
      } as UserEntity;

      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.merge.mockReturnValue({ ...existingUser, ...googleInput });
      userRepository.save.mockResolvedValue({
        ...existingUser,
        ...googleInput,
      });

      const result = await service.upsertFromGoogle(googleInput);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { googleId: googleInput.googleId },
          { email: googleInput.email },
        ],
      });

      expect(logger.log).toHaveBeenCalledWith(
        `Merging existing user with google id ${googleInput.googleId}`,
      );

      expect(userRepository.merge).toHaveBeenCalledWith(
        existingUser,
        googleInput,
      );
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(googleInput),
      );
      expect(userRepository.create).not.toHaveBeenCalled();

      expect(result).toMatchObject(googleInput);
      expect(result.id).toBe('1');
    });

    it('should update existing user when found by email (but different googleId)', async () => {
      const existingUser: UserEntity = {
        id: '2',
        googleId: null,
        email: googleInput.email,
        name: 'Different Name',
      } as unknown as UserEntity;

      userRepository.findOne.mockResolvedValue(existingUser);

      const expectedMerged = { ...existingUser, ...googleInput };

      userRepository.merge.mockReturnValue(expectedMerged);
      userRepository.save.mockResolvedValue(expectedMerged);

      const result = await service.upsertFromGoogle(googleInput);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { googleId: googleInput.googleId },
          { email: googleInput.email },
        ],
      });

      expect(logger.log).toHaveBeenCalledWith(
        `Merging existing user with google id ${googleInput.googleId}`,
      );

      expect(userRepository.merge).toHaveBeenCalledWith(
        existingUser,
        googleInput,
      );
      expect(userRepository.save).toHaveBeenCalledWith(expectedMerged);
      expect(userRepository.create).not.toHaveBeenCalled();

      expect(result.email).toBe(googleInput.email);
      expect(result.googleId).toBe(googleInput.googleId);
      expect(result.id).toBe('2');
    });

    it('should create a new user when no match found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const newUser = {
        id: 'new-generated-id',
        ...googleInput,
      };

      userRepository.create.mockReturnValue(googleInput as UserEntity);
      userRepository.save.mockResolvedValue(newUser as UserEntity);

      const result = await service.upsertFromGoogle(googleInput);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { googleId: googleInput.googleId },
          { email: googleInput.email },
        ],
      });

      expect(logger.log).toHaveBeenCalledWith(
        `Creating new user with google id ${googleInput.googleId}`,
      );

      expect(userRepository.create).toHaveBeenCalledWith(googleInput);
      expect(userRepository.merge).not.toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(googleInput);

      expect(result).toMatchObject(googleInput);
    });

    it('should set traceId on logger when provided', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(googleInput as UserEntity);
      userRepository.save.mockResolvedValue({
        id: '3',
        ...googleInput,
      } as UserEntity);

      await service.upsertFromGoogle(googleInput, 'custom-trace-999');

      expect(logger.setTraceId).toHaveBeenCalledWith('custom-trace-999');
    });
  });
});
