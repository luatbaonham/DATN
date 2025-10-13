import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class ImportLecturerDto {
  @Expose()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  lecturerCode!: string;

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
  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @Expose()
  @IsBoolean()
  @IsOptional()
  isSupervisor?: boolean;
}
