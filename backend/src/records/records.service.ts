import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../entities/record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private recordRepository: Repository<Record>,
  ) {}

  async create(createRecordDto: CreateRecordDto): Promise<Record> {
    const record = this.recordRepository.create(createRecordDto);
    return this.recordRepository.save(record);
  }

  async findAll(): Promise<Record[]> {
    return this.recordRepository.find({
      relations: ['user', 'section', 'shift', 'ccsDetails', 'bafDetails', 'slitterDetails'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Record[]> {
    return this.recordRepository.find({
      where: { userId },
      relations: ['user', 'section', 'shift', 'ccsDetails', 'bafDetails', 'slitterDetails'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Record> {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: ['user', 'section', 'shift', 'ccsDetails', 'bafDetails', 'slitterDetails'],
    });

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    return record;
  }

  async update(id: number, updateRecordDto: UpdateRecordDto): Promise<Record> {
    const record = await this.findOne(id);
    Object.assign(record, updateRecordDto);
    return this.recordRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.recordRepository.remove(record);
  }
}
