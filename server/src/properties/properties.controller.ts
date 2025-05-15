import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
    constructor(private readonly propertiesService: PropertiesService) { }

    @Post()
    create(@Body() createPropertyDto: any) {
        return this.propertiesService.create(createPropertyDto);
    }

    @Get()
    findAll() {
        return this.propertiesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.propertiesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePropertyDto: any) {
        return this.propertiesService.update(id, updatePropertyDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.propertiesService.remove(id);
    }
} 