import { SetMetadata } from '@nestjs/common'
import { VALIDATE_RESOURCES_IDS_KEY } from 'src/consts'

export const ValidateResourcesId = () => SetMetadata(VALIDATE_RESOURCES_IDS_KEY, true)
