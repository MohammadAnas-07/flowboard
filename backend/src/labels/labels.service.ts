import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.label.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const label = await this.prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new NotFoundException(`Label ${id} not found`);
    }
    return label;
  }

  create(dto: CreateLabelDto) {
    return this.prisma.label.create({ data: dto });
  }

  async update(id: string, dto: UpdateLabelDto) {
    await this.findOne(id);
    return this.prisma.label.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.label.delete({ where: { id } });
  }
}
