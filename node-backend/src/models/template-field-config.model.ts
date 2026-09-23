import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { EndorsementTemplate } from './endorsement-template.model';

@Entity('template_field_configs')
@Unique(['templateId', 'displayOrder'])
export class TemplateFieldConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string;

  @ManyToOne(() => EndorsementTemplate, (template) => template.fieldConfigs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template!: EndorsementTemplate;

  @Column({ type: 'varchar', length: 100 })
  label!: string; // Output key in dynamicData e.g. 'ResponsableAtencion'

  @Column({ name: 'source_field', type: 'varchar', length: 100, nullable: true })
  sourceField!: string | null; // Input key in flat JSON e.g. 'policyNumber' or null

  @Column({ name: 'default_value', type: 'varchar', length: 255, nullable: true })
  defaultValue!: string | null; // e.g. 'SAC' or 'Default' or ''

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ name: 'display_order', type: 'int' })
  displayOrder!: number; // 1, 2, 3 ... guarantees deterministic ordering

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
