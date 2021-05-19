/**
 * Tests services route
 * 
 * @group integration/components/registry
 */

import express from 'express';
import request from 'supertest';
import { container } from 'src/di';
import { ExpressRegistryServicesRoute } from './services';
import mockServiceModule, { fakeServices, mockAdd, mockUpdate, mockFindByInstanceId, mockGetAll, mockRemove, resetServiceModuleMocks } from 'src/modules/service/__mocks__/service';
import InstanceId from 'src/common/instanceId';

describe("Express Registry Component: Services Route", () => {
    const app = express();

    app.use(express.json());

    container.register("ServiceModule", { useClass: mockServiceModule });
        
    const serviceRoute = container.resolve(ExpressRegistryServicesRoute);
    serviceRoute.execute(app);
            
    beforeEach(() => {
        resetServiceModuleMocks();
    });

    describe("GET method", () => {
        it('GET /services -> returns list of services', async () => {
            expect.assertions(1);

            const { body } = await request(app).get("/services");
    
            expect(body).toEqual(fakeServices.map(s => s.raw));
        });
    
        it('GET /services/mock:0.0.0.0:80 -> returns correct mock data', async () => {
            expect.assertions(1);
    
            const { body } = await request(app).get("/services/mock:0.0.0.0:80");
    
            expect(body).toEqual(fakeServices[0].raw);
        });

        it('GET /services/mock2:0.0.0.0:80 -> returns 404 if requested with instance id that is not registered', async () => {
            expect.assertions(1);

            const resp = await request(app).get("/services/mockBad:0.0.0.0:80");
    
            expect(resp.statusCode).toEqual(404);
        });
    });
    
    describe("POST method", () => {
        it('POST /services/mockData:0.0.0.0:80 -> registers mock data successfully', async () => {
            expect.assertions(2);
            
            const fakeData = {
                instanceId: InstanceId.fromString('mockData:0.0.0.0:80').raw,
                name: 'mockName',
                description: 'mockDesc',
                version: '1',
                status: 'OK',
                balancerOptions: {
                    weight: 1,
                },
                url: 'http://localhost',
                last_heartbeat: 0,
            };

            const resp = await request(app)
                .post("/services/mockData:0.0.0.0:80")
                .send(fakeData);
                
            expect(mockAdd.mock.calls.length).toBe(1);
            expect(resp.statusCode).toBe(201)
        });

        it('POST /services/mock:0.0.0.0:80 -> errors if instance is already registered', async () => {
            expect.assertions(1);

            const resp = await request(app)
                .post('/services/mock:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mock:0.0.0.0:80').raw,
                    name: 'mock',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                });
            
            expect(resp.status).toBe(400);
        });

        it("POST /services/mockFake:0.0.0.0:80 -> errors if requested with instance id that doesn't match body's instance id", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .post('/services/mockFake:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mockFake2:0.0.0.0:80').raw,
                    name: 'mockFake',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                });
            
            expect(resp.statusCode).toBe(400);
        });
    });

    describe("PUT method", () => {
        it("PUT /services/mock:0.0.0.0:80 -> updates service successfully", async () => {
            expect.assertions(2);

            const resp = await request(app)
                .put('/services/mock:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mock:0.0.0.0:80').raw,
                    name: 'mock',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                });
            
            expect(resp.statusCode).toBe(200);
            expect(mockUpdate).toBeCalled();
        });

        it("PUT /services/mockFake:0.0.0.0:80 -> errors if requested with instance id that is not registered", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .put('/services/mockFake:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mockFake:0.0.0.0:80').raw,
                    name: 'mockFake',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                });
            
            expect(resp.statusCode).toBe(400);
        });

        it("PUT /services/mockFake:0.0.0.0:80 -> errors if requested with instance id that doesn't match body's instance id", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .put('/services/mockFake:0.0.0.0:80')
                .send({
                    instanceId: InstanceId.fromString('mockFake2:0.0.0.0:80').raw,
                    name: 'mockFake',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                });
            
            expect(resp.statusCode).toBe(400);
        });
    });

    describe("DELETE method", () => {
        it("DELETE /services/mock:0.0.0.0:80 -> deletes service successfully", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .delete('/services/mock:0.0.0.0:80');
            
            expect(resp.statusCode).toBe(200);
        });

        it("DELETE /services/mock5:0.0.0.0:80 -> errors if requested with instance id that is not registered", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .delete('/services/mock5:0.0.0.0:80');
            
            expect(resp.statusCode).toBe(400);
        });
    });
});