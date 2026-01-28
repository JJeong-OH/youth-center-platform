import { 
  IsDateString, 
  IsEmail, 
  IsIn, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  MinLength,
  Matches 
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/, { message: '전화번호는 10-11자리 숫자여야 합니다.' })
  phoneNumber?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;
}