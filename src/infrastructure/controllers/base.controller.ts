import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('base')
@Controller()
export abstract class BaseController<T> {
  abstract create(data: any): Promise<T>;
  abstract getById(id: string): Promise<T | null>;
  abstract getAll(): Promise<T[]>;
  abstract update(id: string, data: any): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}
