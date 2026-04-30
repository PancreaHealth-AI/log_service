import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EmergencyAccessService } from './emergency-access.service';
import { ReviewEmergencyAccessDto } from '../audit/dto/review-emergency-access.dto';

@ApiTags('Emergency Access')
@Controller('audit/emergency-access')
export class EmergencyAccessController {
  constructor(private readonly service: EmergencyAccessService) {}

  @Get('review')
  @ApiOperation({ summary: 'Obtenir les accès d\'urgence en attente de validation' })
  @ApiResponse({ status: 200, description: 'Liste des accès en attente' })
  async getPendingReviews() {
    return this.service.getPending();
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Valider ou rejeter un accès d\'urgence' })
  @ApiParam({ name: 'id', description: 'ID de la demande' })
  @ApiBody({ type: ReviewEmergencyAccessDto })
  @ApiResponse({ status: 200, description: 'Vérification effectuée' })
  async review(@Param('id') id: string, @Body() dto: ReviewEmergencyAccessDto) {
    return this.service.review(id, dto);
  }
}
