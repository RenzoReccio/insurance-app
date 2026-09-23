import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { EndorsementTemplate } from './endorsement-template.model';

@Entity('endorsement_types')
export class EndorsementType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string; // e.g. 'CambioFrecuencia'

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @OneToMany(() => EndorsementTemplate, (template) => template.endorsementType)
  templates!: EndorsementTemplate[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
