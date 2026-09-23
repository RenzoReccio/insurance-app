import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { EndorsementTemplate } from './endorsement-template.model';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string; // e.g. 'Rumbo'

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @OneToMany(() => EndorsementTemplate, (template) => template.product)
  templates!: EndorsementTemplate[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
