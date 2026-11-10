export class CreateUserDto {
  email: string;
  password?: string | null;
  name?: string | null;
  username?: string | null;
  github_id?: string | null;
}
