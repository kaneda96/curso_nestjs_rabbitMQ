import { faker } from '@faker-js/faker'
import { Project } from '@prisma-generated/client'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'

export const mockedProjects = faker.helpers.multiple<Project>(
  () => {
    return {
      id: faker.string.uuid(),
      name: faker.lorem.sentence(),
      description: faker.lorem.sentence(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 'user-1',
    }
  },
  { count: 10 },
)

export const mockPaginationQuery: QueryPaginationDTO = {
  page: '1',
  size: '10',
}
