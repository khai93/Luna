/**
 * Tests services route
 * 
 * @group integration/components/registry
 */

import express from 'express';
import request from 'supertest';
import { container } from 'src/di';
import { ExpressRegistryServicesRoute } from './services';
import mockServiceModule, { fakeServices, mockGetAll } from 'src/modules/service/__mocks__/service';
import { ServiceInfo } from 'src/common/serviceInfo';
import InstanceId from 'src/common/instanceId';


describe("Express Registry Component: Services Route", () => {
    it('GET /services -> returns list of services', async () => {
        const app = express();

        mockGetAll.mockImplementation(() => fakeServices);
        container.register("ServiceModule", { useValue: mockServiceModule });
        
        const serviceRoute = new ExpressRegistryServicesRoute();
        serviceRoute.execute(app);

        const { body } = await request(app).get("/services");

        expect(body).toEqual(fakeServices);
    });
});