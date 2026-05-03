import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { ReviewEmergencyAccessDto } from '../audit/dto/review-emergency-access.dto';

@Injectable()
export class EmergencyAccessService {
  private readonly index = 'audit_logs'; // ou index dédié

  constructor(private readonly elastic: ElasticsearchService) {}

  async getPending() {
    const query = {
      bool: {
        must: [
          { term: { 'action': 'EMERGENCY_ACCESS' } },
          { term: { 'status': 'PENDING' } },
        ],
      },
    };
    const result = await this.elastic.search({ index: this.index, query });
    const hits = (result as any).hits?.hits || [];
    return hits.map((h: any) => h._source);
  }

  async review(id: string, dto: ReviewEmergencyAccessDto) {
    await this.elastic.update(this.index, id, {
      status: dto.approved ? 'APPROVED' : 'REJECTED',
      reviewed_by: dto.reviewerId,
      reviewed_at: new Date().toISOString(),
    });
    return { success: true };
  }
}
