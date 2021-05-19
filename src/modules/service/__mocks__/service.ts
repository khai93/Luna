import InstanceId from "src/common/instanceId";
import { ServiceInfo } from "src/common/serviceInfo";

export const fakeServiceInfo = new ServiceInfo({
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

export const fakeServiceInfo2 = new ServiceInfo({
    instanceId: InstanceId.fromString('mock2:0.0.0.0:80').raw,
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
    instanceId: InstanceId.fromString('mock3:0.0.0.0:80').raw,
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


export const mockAdd = jest.fn();
export const mockUpdate = jest.fn();
export const mockRemove = jest.fn();
export const mockFindByInstanceId = jest.fn();
export const mockFindAllByName = jest.fn();
export const mockGetAll = jest.fn();

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
