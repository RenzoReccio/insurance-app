import { DataSource, Repository } from 'typeorm';
import { EndorsementTemplate } from '../models';

export interface ITemplateRepository {
  findByProductAndType(
    productCode: string,
    endorsementTypeCode: string
  ): Promise<EndorsementTemplate | null>;
}

export class TemplateRepository implements ITemplateRepository {
  private readonly repo: Repository<EndorsementTemplate>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(EndorsementTemplate);
  }

  async findByProductAndType(
    productCode: string,
    endorsementTypeCode: string
  ): Promise<EndorsementTemplate | null> {
    const template = await this.repo
      .createQueryBuilder('template')
      .innerJoinAndSelect('template.product', 'product')
      .innerJoinAndSelect('template.endorsementType', 'endorsementType')
      .leftJoinAndSelect('template.fieldConfigs', 'fieldConfigs')
      .leftJoinAndSelect('template.eventConfigs', 'eventConfigs')
      .where('LOWER(product.code) = LOWER(:productCode)', { productCode })
      .andWhere('LOWER(endorsementType.code) = LOWER(:endorsementTypeCode)', {
        endorsementTypeCode,
      })
      .andWhere('template.isActive = true')
      .orderBy('fieldConfigs.displayOrder', 'ASC')
      .addOrderBy('eventConfigs.orderEvent', 'ASC')
      .getOne();

    return template;
  }
}
