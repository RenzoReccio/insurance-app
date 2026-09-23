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

@Entity('template_event_configs')
@Unique(['templateId', 'orderEvent'])
export class TemplateEventConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string;

  @ManyToOne(() => EndorsementTemplate, (template) => template.eventConfigs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template!: EndorsementTemplate;

  @Column({ name: 'event_description', type: 'varchar', length: 100 })
  eventDescription!: string; // e.g. 'SolicitarEndoso', 'AprobarEndoso'

  @Column({ name: 'order_event', type: 'int' })
  orderEvent!: number; // 1, 2, ...

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
