import InstanceId from "src/common/instanceId";
import { ServiceInfo } from "src/common/serviceInfo";

export const fakeServiceInfo = new ServiceInfo({
    instanceId: 'mock:0.0.0.0:80',
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

export const fakeServiceInfo2 = new ServiceInfo({
    instanceId: 'mock2:0.0.0.0:80',
    name: 'mock2',
    description: 'mockDesc',
    version: '1',
    status: 'OK',
    balancerOptions: {
        weight: 1,
    },
    url: 'http://localhost',
    last_heartbeat: 0,
});

export const fakeServiceInfo3 = new ServiceInfo({
    instanceId: 'mock3:0.0.0.0:80',
    name: 'mock3',
    description: 'mockDesc',
    version: '1',
    status: 'OK',
    balancerOptions: {
        weight: 1,
    },
    url: 'http://localhost',
    last_heartbeat: 0,
});

export let fakeServices = [
    fakeServiceInfo,
    fakeServiceInfo2,
    fakeServiceInfo3
];

export const resetServiceModuleMocks = () => {
    fakeServices = [
        fakeServiceInfo,
        fakeServiceInfo2,
        fakeServiceInfo3
    ];

    mockAdd.mockClear();
    mockUpdate.mockClear();
    mockRemove.mockClear();
    mockFindByInstanceId.mockClear();
    mockFindAllByName.mockClear();
    mockGetAll.mockClear();
    mockServiceModule.mockClear();
}


export const mockAdd = jest.fn((s) => Promise.resolve(s));
export const mockUpdate = jest.fn((s) => Promise.resolve(s));
export const mockRemove = jest.fn((instanceId) => {
    const foundService = fakeServices.findIndex(service => service.value.instanceId.equals(instanceId));
                
    if (foundService == -1) {
        fail(new Error("Called delete with service info that is not in the database."));
    }

    delete fakeServices[foundService];
    return Promise.resolve();
});
export const mockFindByInstanceId = jest.fn((instanceId) => {
    return fakeServices.find(service => service.value.instanceId.equals(instanceId))
});
export const mockFindAllByName = jest.fn();
export const mockGetAll = jest.fn(() => fakeServices);

const mockServiceModule = jest.fn().mockImplementation(() => {
    return {
        add: mockAdd,
        update: mockUpdate,
        remove: mockRemove,
        findByInstanceId: mockFindByInstanceId,
        findAllByName: mockFindAllByName,
        getAll: mockGetAll
    }
});

export default mockServiceModule;
