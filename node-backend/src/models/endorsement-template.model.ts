import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.model';
import { EndorsementType } from './endorsement-type.model';
import { TemplateFieldConfig } from './template-field-config.model';
import { TemplateEventConfig } from './template-event-config.model';

@Entity('endorsement_templates')
@Unique(['productId', 'endorsementTypeId'])
export class EndorsementTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.templates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'endorsement_type_id', type: 'uuid' })
  endorsementTypeId!: string;

  @ManyToOne(() => EndorsementType, (type) => type.templates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'endorsement_type_id' })
  endorsementType!: EndorsementType;

  @Column({ name: 'event_description', type: 'varchar', length: 100, default: 'SolicitarEndoso' })
  eventDescription!: string;

  @Column({ name: 'structure_metadata', type: 'jsonb', nullable: true })
  structureMetadata!: Record<string, any> | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => TemplateFieldConfig, (field) => field.template, { cascade: true })
  fieldConfigs!: TemplateFieldConfig[];

  @OneToMany(() => TemplateEventConfig, (event) => event.template, { cascade: true })
  eventConfigs!: TemplateEventConfig[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
