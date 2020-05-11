import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ong')
export class OngEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  createdYear: number;
}
