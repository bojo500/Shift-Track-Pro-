import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Record } from './record.entity';

@Entity('ccs_record_details')
export class CcsRecordDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'record_id', unique: true })
  recordId: number;

  @OneToOne(() => Record, (record) => record.ccsDetails)
  @JoinColumn({ name: 'record_id' })
  record: Record;

  @Column({ name: 'baf_in', type: 'int', nullable: true })
  bafIn: number;

  @Column({ name: 'baf_out', type: 'int', nullable: true })
  bafOut: number;

  @Column({ name: 'crm_in', type: 'int', nullable: true })
  crmIn: number;

  @Column({ name: 'crm_out', type: 'int', nullable: true })
  crmOut: number;

  @Column({ name: 'shipped_out', type: 'int', nullable: true })
  shippedOut: number;

  @Column({ name: 'tugger_in', type: 'int', nullable: true })
  tuggerIn: number;

  @Column({ name: 'tugger_off', type: 'int', nullable: true })
  tuggerOff: number;

  @Column({ name: 'total_trucks_in', type: 'int', nullable: true })
  totalTrucksIn: number;

  @Column({ name: 'total_trucks_out', type: 'int', nullable: true })
  totalTrucksOut: number;

  @Column({ name: 'total_movements', type: 'int', nullable: true })
  totalMovements: number;

  @Column({ name: 'total_trucks', type: 'int', nullable: true })
  totalTrucks: number;

  @Column({ name: 'hook', type: 'int', nullable: true })
  hook: number;

  @Column({ name: 'down_time', type: 'decimal', precision: 5, scale: 2, nullable: true })
  downTime: number;

  @Column({ name: 'moved_of_shipping', type: 'int', nullable: true })
  movedOfShipping: number;

  @Column({ name: 'slitter_on', type: 'int', nullable: true })
  slitterOn: number;

  @Column({ name: 'slitter_off', type: 'int', nullable: true })
  slitterOff: number;

  @Column({ name: 'coils_hatted', type: 'int', nullable: true })
  coilsHatted: number;

  @Column({ name: 'issues', type: 'text', nullable: true })
  issues: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
