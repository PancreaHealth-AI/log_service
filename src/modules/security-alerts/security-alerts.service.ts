import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import { InvestigateAlertDto } from '../audit/dto/investigate-alert.dto';

@Injectable()
export class SecurityAlertsService {
  private readonly index = 'security_alerts';

  constructor(private readonly elastic: ElasticsearchService) {}

  async getActive() {
    const query = { bool: { must: [{ term: { 'status': 'ACTIVE' } }] } };
    const result = await this.elastic.search({ index: this.index, query });
    return ((result as any).hits?.hits || []).map((h: any) => h._source);
  }

  async investigate(id: string, dto: InvestigateAlertDto) {
    await this.elastic.update(this.index, id, {
      status: 'INVESTIGATING',
      investigator: dto.investigatorId,
      investigation_notes: dto.notes,
      updated_at: new Date().toISOString(),
    });
    return { success: true };
  }

  async resolve(id: string) {
    await this.elastic.update(this.index, id, {
      status: 'RESOLVED',
      resolved_at: new Date().toISOString(),
    });
    return { success: true };
  }
}
