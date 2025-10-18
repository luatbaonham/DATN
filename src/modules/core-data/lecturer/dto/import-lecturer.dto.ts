import { Expose } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
  IsBoolean,
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsIn,
  IsPhoneNumber,
} from 'class-validator';

export class ImportLecturerDto {
  @IsNotEmpty({ message: 'Mã sinh viên là bắt buộc' })
  @IsString()
  lecturerCode!: string;

  @IsNotEmpty({ message: 'Họ là bắt buộc' })
  @IsString()
  lastName!: string;

  @IsNotEmpty({ message: 'Tên là bắt buộc' })
  @IsString()
  firstName!: string;

  @IsNotEmpty({ message: 'Ngày sinh là bắt buộc' })
  @IsDateString(
    {},
    { message: 'Ngày sinh phải có định dạng hợp lệ (YYYY-MM-DD)' },
  )
  dateOfBirth!: string;

  @IsNotEmpty({ message: 'Giới tính là bắt buộc' })
  @IsIn(['male', 'female', 'other'], {
    message: 'Giới tính phải là male, female hoặc other',
  })
  gender!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  phoneNumber?: string;

  @IsNotEmpty({ message: 'Tên khoa là bắt buộc' })
  @IsString()
  departmentName!: string; // FE chỉ nhập tên khoa

  @IsBoolean({ message: 'Giám thị là 1 trạng thái( true/false)' })
  @IsOptional()
  isSupervisor?: boolean;
}
