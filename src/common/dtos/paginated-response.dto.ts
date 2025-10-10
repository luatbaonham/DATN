// paginated-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalItems!: number;
  @ApiProperty() totalPages!: number;
  @ApiProperty() hasNextPage!: boolean;
  @ApiProperty() hasPreviousPage!: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;

  @ApiProperty({ isArray: true })
  data!: T[];

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }

  static from<T>(
    data: T[],
    page: number,
    limit: number,
    totalItems: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(totalItems / limit);
    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
    return new PaginatedResponseDto(data, meta);
  }
}
