import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Section } from './section.entity';
import { Shift } from './shift.entity';
import { CcsRecordDetails } from './ccs-record-details.entity';
import { BafRecordDetails } from './baf-record-details.entity';
import { SlitterRecordDetails } from './slitter-record-details.entity';

@Entity('records')
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.records)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'section_id' })
  sectionId: number;

  @ManyToOne(() => Section, (section) => section.records)
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @Column({ name: 'shift_id' })
  shiftId: number;

  @ManyToOne(() => Shift, (shift) => shift.records)
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @OneToOne(() => CcsRecordDetails, (details) => details.record, { nullable: true })
  ccsDetails: CcsRecordDetails;

  @OneToOne(() => BafRecordDetails, (details) => details.record, { nullable: true })
  bafDetails: BafRecordDetails;

  @OneToOne(() => SlitterRecordDetails, (details) => details.record, { nullable: true })
  slitterDetails: SlitterRecordDetails;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
