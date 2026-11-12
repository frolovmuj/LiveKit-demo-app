import { IsOptional, IsString, Length } from 'class-validator';

export class IssueTokenDto {
  @IsOptional()
  @IsString()
  @Length(1, 40)
  displayName?: string;
}
