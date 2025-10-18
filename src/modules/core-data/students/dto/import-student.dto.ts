import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class ImportStudentDto {
  @IsNotEmpty({ message: 'Mã sinh viên là bắt buộc' })
  @IsString()
  studentCode!: string;

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

  @IsNotEmpty({ message: 'Tên lớp là bắt buộc' })
  @IsString()
  className!: string; // FE chỉ nhập tên lớp
}
