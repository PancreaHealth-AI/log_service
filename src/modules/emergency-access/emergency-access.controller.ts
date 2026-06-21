import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmergencyAccessService } from './emergency-access.service';
import { ReviewEmergencyAccessDto } from '../audit/dto/review-emergency-access.dto';
import { Permission } from '../../common/decorators/permission.decorator';

@ApiTags('Emergency Access')
@ApiBearerAuth()
@Controller('audit/emergency-access')
export class EmergencyAccessController {
  constructor(private readonly service: EmergencyAccessService) {}

  @Get('review')
  @Permission('emergency_access.read')
  @ApiOperation({ summary: 'List emergency access requests pending review' })
  @ApiResponse({ status: 200, description: 'List of pending access requests' })
  async getPendingReviews() {
    return this.service.getPending();
  }

  @Post(':id/review')
  @Permission('emergency_access.review')
  @ApiOperation({ summary: 'Approve or reject an emergency access request' })
  @ApiParam({ name: 'id', description: 'Emergency access request ID' })
  @ApiBody({ type: ReviewEmergencyAccessDto })
  @ApiResponse({ status: 200, description: 'Review recorded' })
  async review(@Param('id') id: string, @Body() dto: ReviewEmergencyAccessDto) {
    return this.service.review(id, dto);
  }
}
