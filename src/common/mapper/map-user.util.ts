import { UserResponseDto } from '@modules/identity/users/dto/user-response.dto';
import { User } from '@modules/identity/users/entities/user.entity';

// user.mapper.ts
export function mapUser(user: User): Partial<UserResponseDto> {
  return {
    id: user.id,
    // firstName: user.firstName,
    // lastName: user.lastName,
    email: user.email,
    roles:
      user.userRoles?.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })) ?? [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
