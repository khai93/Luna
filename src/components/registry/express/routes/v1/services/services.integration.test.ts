/**
 * Tests services route
 * 
 * @group integration/components/registry
 */

import express from 'express';
import request from 'supertest';
import { container } from 'src/di';
import { ExpressRegistryServicesRoute } from './services';
import mockServiceModule, { fakeServices, mockAdd, mockFindByInstanceId, mockGetAll, mockRemove, resetServiceModuleMocks } from 'src/modules/service/__mocks__/service';
import { ServiceInfo } from 'src/common/serviceInfo';
import InstanceId from 'src/common/instanceId';
import { mockUpdate } from '../../../../../../modules/service/__mocks__/service';


describe("Express Registry Component: Services Route", () => {
    const app = express();

    container.register("ServiceModule", { useValue: mockServiceModule });
        
    const serviceRoute = new ExpressRegistryServicesRoute();
        serviceRoute.execute(app);
            
    beforeEach(() => {
        resetServiceModuleMocks();
    });

    describe("GET method", () => {
        it('GET /services -> returns list of services', async () => {
            expect.assertions(1);
    
            mockGetAll.mockImplementation(() => fakeServices);
    
            const { body } = await request(app).get("/services");
    
            expect(body).toEqual(fakeServices);
        });
    
        it('GET /services/mock:0.0.0.0:80 -> returns correct mock data', async () => {
            expect.assertions(1);
    
            mockFindByInstanceId.mockImplementation(() => fakeServices[0]);
    
            const { body } = await request(app).get("/services/mock:0.0.0.0:80");
    
            expect(body).toEqual(fakeServices[0]);
        });
    });
    
    describe("POST method", () => {
        it('POST /services/mockData:0.0.0.0:80 -> registers mock data successfully', async () => {
            expect.assertions(2);
    
            const resp = await request(app)
                .post("/services/mockData:0.0.0.0:80")
                .send({
                    instanceId: InstanceId.fromString('mock:0.0.0.0:80').raw,
                    name: 'mockName',
                    description: 'mockDesc',
                    version: '1',
                    status: 'OK',
                    balancerOptions: {
                        weight: 1,
                    },
                    url: 'http://localhost',
                    last_heartbeat: 0,
                });
                
            expect(mockAdd.mock.calls.length).toBe(1);
            expect(resp.statusCode).toBe(201)
        });

        it('POST /services/mock:0.0.0.0:80 -> errors if instance is already registered', async () => {
            expect.assertions(2);

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
            expect(resp.body).toMatchInlineSnapshot();
        });
    });

    describe("PUT method", () => {
        it("PUT /services/mock:0.0.0.0:80 -> calls update method on service module", async () => {
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

            mockRemove.mockImplementation((serviceInfo) => {
                const foundService = fakeServices.findIndex(service => service.value.instanceId.equals(serviceInfo.value.instanceId));
                
                if (foundService == -1) {
                    fail(new Error("Called delete with service info that is not in the database."));
                }

                delete fakeServices[foundService];
                return Promise.resolve();
            });

            const resp = await request(app)
                .delete('/services/mock:0.0.0.0:80');
            
            expect(resp.statusCode).toBe(200);
        });

        it("DELETE /services/mock2:0.0.0.0:80 -> errors if requested with instance id that is not registered", async () => {
            expect.assertions(1);

            const resp = await request(app)
                .delete('/services/mock2:0.0.0.0:80');
            
            expect(resp.statusCode).toBe(400);
        });
    });
});