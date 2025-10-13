import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ImportStudentDto {
  @Expose()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  studentCode!: string;

  @Expose()
  @IsString()
  @MaxLength(50)
  firstName!: string;

  @Expose()
  @IsString()
  @MaxLength(50)
  lastName!: string;

  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(15)
  phoneNumber?: string;

  @Expose()
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @Expose()
  @IsEnum(['male', 'female'])
  @IsOptional()
  gender?: 'male' | 'female';

  @Expose()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;
}
