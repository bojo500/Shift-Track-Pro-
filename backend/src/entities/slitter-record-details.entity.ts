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

@Entity('slitter_record_details')
export class SlitterRecordDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'record_id', unique: true })
  recordId: number;

  @OneToOne(() => Record, (record) => record.slitterDetails)
  @JoinColumn({ name: 'record_id' })
  record: Record;

  // Add Slitter-specific fields here
  @Column({ name: 'coils_processed', type: 'int', nullable: true })
  coilsProcessed: number;

  @Column({ name: 'total_weight', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalWeight: number;

  @Column({ name: 'scrap_weight', type: 'decimal', precision: 10, scale: 2, nullable: true })
  scrapWeight: number;

  @Column({ name: 'blade_changes', type: 'int', nullable: true })
  bladeChanges: number;

  @Column({ name: 'remarks', type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
