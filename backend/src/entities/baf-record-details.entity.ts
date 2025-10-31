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

@Entity('baf_record_details')
export class BafRecordDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'record_id', unique: true })
  recordId: number;

  @OneToOne(() => Record, (record) => record.bafDetails)
  @JoinColumn({ name: 'record_id' })
  record: Record;

  // Add BAF-specific fields here
  @Column({ name: 'production_count', type: 'int', nullable: true })
  productionCount: number;

  @Column({ name: 'defect_count', type: 'int', nullable: true })
  defectCount: number;

  @Column({ name: 'machine_downtime', type: 'decimal', precision: 5, scale: 2, nullable: true })
  machineDowntime: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
