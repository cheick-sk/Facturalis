import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module'; // Main AppModule
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

describe('EmployeeController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdEmployeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up database before tests
    await prisma.employee.deleteMany({});
  });

  afterAll(async () => {
    // Clean up database after tests
    await prisma.employee.deleteMany({});
    await prisma.$disconnect(); // Disconnect Prisma client
    await app.close();
  });

  describe('POST /employees', () => {
    it('should create a new employee', async () => {
      const createEmployeeDto: CreateEmployeeDto = {
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration.test@example.com',
        jobTitle: 'Tester',
        hireDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };

      const response = await request(app.getHttpServer())
        .post('/employees')
        .send(createEmployeeDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.firstName).toEqual(createEmployeeDto.firstName);
      expect(response.body.email).toEqual(createEmployeeDto.email);
      createdEmployeeId = response.body.id; // Save for later tests
    });

    it('should fail to create an employee with invalid data', async () => {
      const createEmployeeDto = { // Missing required fields
        firstName: 'Test',
      };
      await request(app.getHttpServer())
        .post('/employees')
        .send(createEmployeeDto)
        .expect(400); // Bad Request due to validation
    });
  });

  describe('GET /employees', () => {
    it('should get all employees', async () => {
      const response = await request(app.getHttpServer())
        .get('/employees')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.some(emp => emp.id === createdEmployeeId)).toBeTruthy();
    });
  });

  describe('GET /employees/:id', () => {
    it('should get an employee by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/employees/${createdEmployeeId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toEqual(createdEmployeeId);
      expect(response.body.email).toEqual('integration.test@example.com');
    });

    it('should return 404 for a non-existent employee ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
      await request(app.getHttpServer())
        .get(`/employees/${nonExistentId}`)
        .expect(404);
    });

     it('should return 400 for an invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/employees/invalid-uuid')
        .expect(400); // Bad request due to ParseUUIDPipe
    });
  });

  describe('PATCH /employees/:id', () => {
    it('should update an employee', async () => {
      const updateEmployeeDto: UpdateEmployeeDto = {
        jobTitle: 'Senior Tester',
        phoneNumber: '123-456-7890',
      };

      const response = await request(app.getHttpServer())
        .patch(`/employees/${createdEmployeeId}`)
        .send(updateEmployeeDto)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.jobTitle).toEqual(updateEmployeeDto.jobTitle);
      expect(response.body.phoneNumber).toEqual(updateEmployeeDto.phoneNumber);
    });

    it('should return 404 when trying to update a non-existent employee', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .patch(`/employees/${nonExistentId}`)
        .send({ jobTitle: 'Ghost' })
        .expect(404);
    });
  });

  describe('DELETE /employees/:id', () => {
    it('should delete an employee', async () => {
      await request(app.getHttpServer())
        .delete(`/employees/${createdEmployeeId}`)
        .expect(204); // No Content

      // Verify employee is actually deleted
      await request(app.getHttpServer())
        .get(`/employees/${createdEmployeeId}`)
        .expect(404);
    });

    it('should return 404 when trying to delete a non-existent employee', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .delete(`/employees/${nonExistentId}`)
        .expect(404);
    });
  });
});
