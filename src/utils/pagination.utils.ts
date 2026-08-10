import { NotFoundException } from '@nestjs/common'
import { PaginatedResponseDTO, QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'

const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10

export function paginate(query: QueryPaginationDTO | undefined): { skip: number; take: number } {
  const size = Math.abs(Number(query?.size)) || DEFAULT_PAGE_SIZE
  const page = Math.abs(Number(query?.page)) || DEFAULT_PAGE_NUMBER
  return { skip: (page - 1) * size, take: size }
}

export const paginateOutput = <T>(
  data: T[],
  total: number,
  query?: QueryPaginationDTO,
): PaginatedResponseDTO<T> => {
  const page = Math.abs(Number(query?.page)) || DEFAULT_PAGE_NUMBER
  const size = Math.abs(Number(query?.size)) || DEFAULT_PAGE_SIZE

  const lastPage = Math.ceil(total / size)

  if (!data.length) {
    return {
      data,
      meta: {
        total,
        lastPage,
        currentPage: page,
        totalPerPage: size,
        prevPage: null,
        nextPage: null,
      },
    }
  }

  if (page > lastPage) {
    throw new NotFoundException(`Page ${page} does not exist. Last page is ${lastPage}.`)
  }

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      totalPerPage: size,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < lastPage ? page + 1 : null,
    },
  }
}
