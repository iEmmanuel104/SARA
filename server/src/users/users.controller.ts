import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    @ApiResponse({ status: 409, description: 'Email already exists.' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users.' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({ status: 200, description: 'Return the user.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, description: 'User successfully updated.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 200, description: 'User successfully deleted.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Get(':id/host-profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get host profile' })
    @ApiResponse({ status: 200, description: 'Return the host profile.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 409, description: 'User is not a host.' })
    getHostProfile(@Param('id') id: string) {
        return this.usersService.getHostProfile(id);
    }

    @Patch(':id/host-profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update host profile' })
    @ApiResponse({ status: 200, description: 'Host profile successfully updated.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiResponse({ status: 409, description: 'User is not a host.' })
    updateHostProfile(@Param('id') id: string, @Body() hostProfileData: any) {
        return this.usersService.updateHostProfile(id, hostProfileData);
    }
} 