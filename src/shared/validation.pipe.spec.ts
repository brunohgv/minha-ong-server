import { ValidationPipe } from './validation.pipe';
import { ArgumentMetadata, HttpStatus, HttpException } from '@nestjs/common';
import {
  IsNotEmpty,
  IsEmail,
  IsNumber,
  Length,
  IsOptional,
} from 'class-validator';

class TestModel {
  @IsNotEmpty()
  @IsOptional()
  notEmpty?: string;
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsNumber()
  @IsOptional()
  number?: number;
  @Length(3)
  @IsOptional()
  minChar3?: string;
}

describe('Validation Pipe', () => {
  let target: ValidationPipe;
  beforeAll(() => {
    target = new ValidationPipe();
  });

  it('Throw error when body is empty', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestModel,
      data: '',
    };
    const value = {};

    async function doTransform() {
      return await target.transform(value, metadata);
    }

    try {
      await doTransform();
    } catch (error) {
      expect(error.message).toBe('Validation Failed: No body submitted');
      expect(error.status).toBe(HttpStatus.BAD_REQUEST);
    }

    expect(doTransform).rejects.toThrowError(HttpException);
  });

  it('Throw error when property is invalid', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestModel,
      data: '',
    };
    const value: TestModel = {
      email: 'imnotanemail',
    };

    async function doTransform() {
      return await target.transform(value, metadata);
    }

    try {
      await doTransform();
    } catch (error) {
      expect(error.message.split(':')[0]).toBe('Validation Failed');
      expect(error.status).toBe(HttpStatus.BAD_REQUEST);
    }

    expect(doTransform).rejects.toThrowError(HttpException);
  });

  it('should return the original value when input is valid', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestModel,
      data: '',
    };

    const value: TestModel = {
      email: 'test@test.com',
      minChar3: 'moreThan3CharactersString',
      notEmpty: 'filled',
      number: 100,
    };

    expect(await target.transform(value, metadata)).toEqual(value);
  });

  it('should return the original value when it does not have metatype', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: null,
      data: '',
    };

    const value: TestModel = {
      email: 'invalidemail',
      minChar3: 'a',
      notEmpty: '',
    };

    expect(await target.transform(value, metadata)).toEqual(value);
  });
});
