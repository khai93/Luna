/**
 * Tests MemoryServiceModule class
 * 
 * @group unit/modules/service
 */

import InstanceId from '../../common/instanceId'
import { Name } from '../../common/name'
import { ServiceInfo } from '../../common/serviceInfo'
import { ServiceInfoRaw } from '../../common/serviceInfo/serviceInfo'
import { MemoryServiceModule } from './memory'

let serviceModule = new MemoryServiceModule()

const fakeServiceInfo = new ServiceInfo({
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
})

const fakeServiceInfo2 = new ServiceInfo({
    instanceId: InstanceId.fromString('mock2:0.0.0.0:80').raw,
    name: 'mockName',
    description: 'mockDesc',
    version: '1',
    status: 'OK',
    balancerOptions: {
        weight: 1,
    },
    url: 'http://localhost',
    last_heartbeat: 0,
})

const fakeServiceInfo3 = new ServiceInfo({
    instanceId: InstanceId.fromString('mock3:0.0.0.0:80').raw,
    name: 'mockName',
    description: 'mockDesc',
    version: '1',
    status: 'OK',
    balancerOptions: {
        weight: 1,
    },
    url: 'http://localhost',
    last_heartbeat: 0,
})

beforeEach(() => {
    serviceModule = new MemoryServiceModule()
})

describe('Service Module: Memory', () => {
    describe('#add', () => {
        it('should add service to database', async () => {
            expect.assertions(1)

            await serviceModule.add(fakeServiceInfo)

            return expect(
                serviceModule.findByInstanceId(
                    fakeServiceInfo.value.instanceId,
                ),
            ).resolves.toEqual(fakeServiceInfo)
        })

        it('should reject when adding a service that already exists', async () => {
            expect.assertions(2)

            await serviceModule.add(fakeServiceInfo)

            await expect(
                serviceModule.findByInstanceId(
                    fakeServiceInfo.value.instanceId,
                ),
            ).resolves.toEqual(fakeServiceInfo)
            await expect(
                serviceModule.add(fakeServiceInfo),
            ).rejects.toMatchInlineSnapshot(
                `"Attempted to add service that already exists."`,
            )
        })
    })

    describe('#update', () => {
        it("should update the service with instanceId 'mock:0.0.0.0:8'", async () => {
            expect.assertions(1)

            await serviceModule.add(fakeServiceInfo)

            const updatedServiceInfo = new ServiceInfo({
                ...fakeServiceInfo.raw,
                status: 'DOWN',
            } as ServiceInfoRaw)

            await serviceModule.update(updatedServiceInfo)

            return expect(
                serviceModule.findByInstanceId(
                    fakeServiceInfo.value.instanceId,
                ),
            ).resolves.toEqual(updatedServiceInfo)
        })

        it('should reject when called with a instanceid that does on exist on the database', () => {
            expect.assertions(1)

            return expect(
                serviceModule.update(fakeServiceInfo),
            ).rejects.toThrowErrorMatchingInlineSnapshot(`undefined`)
        })
    })

    describe('#remove', () => {
        it("should remove the service with instanceId 'mock:0.0.0.0:8'", async () => {
            expect.assertions(2)

            await serviceModule.add(fakeServiceInfo)

            await expect(
                serviceModule.findByInstanceId(
                    fakeServiceInfo.value.instanceId,
                ),
            ).resolves.toEqual(fakeServiceInfo)

            await serviceModule.remove(fakeServiceInfo.value.instanceId)

            await expect(
                serviceModule.findByInstanceId(
                    fakeServiceInfo.value.instanceId,
                ),
            ).resolves.toBeUndefined()
        })

        it('should reject when called with instanceId that does not exist', () => {
            expect.assertions(1)

            return expect(
                serviceModule.remove(InstanceId.fromString('fake:dadada:2832')),
            ).rejects.toThrowErrorMatchingInlineSnapshot(`undefined`)
        })
    });

    describe('#findByInstanceId', () => {
        it("should return fakeServiceInfo object when called with instanceId 'mock:0.0.0.0:8'", async () => {
            expect.assertions(1)

            await serviceModule.add(fakeServiceInfo)

            await expect(
                serviceModule.findByInstanceId(
                    fakeServiceInfo.value.instanceId,
                ),
            ).resolves.toEqual(fakeServiceInfo)
        })

        it('should return null when called with instanceId that does not exist on the database', () => {
            expect.assertions(1)

            return expect(
                serviceModule.findByInstanceId(
                    fakeServiceInfo.value.instanceId,
                ),
            ).resolves.toBeUndefined()
        })
    });

    describe('#findAllByName', () => {
        it("should return an array of length 1 when called with the fakeServiceInfo's name", async () => {
            expect.assertions(1)

            await serviceModule.add(fakeServiceInfo)

            await expect(
                serviceModule.findAllByName(fakeServiceInfo.value.name),
            ).resolves.toHaveLength(1)
        })

        it("should return an array of length 3 when called with three services registered with service name 'mockName'", async () => {
            expect.assertions(2)

            await expect(serviceModule.getAll()).resolves.toHaveLength(0)

            await serviceModule.add(fakeServiceInfo)
            await serviceModule.add(fakeServiceInfo2)
            await serviceModule.add(fakeServiceInfo3)

            await expect(
                serviceModule.findAllByName(new Name('mockName')),
            ).resolves.toHaveLength(3)
        })

        it('should return an array of length 0 when called with instanceId that does not exist on the database', async () => {
            expect.assertions(1)

            await expect(
                serviceModule.findAllByName(
                    fakeServiceInfo.value.name,
                ),
            ).resolves.toHaveLength(0)
        })
    })

    describe('#getAll', () => {
        it('should return an empty array when called with no services registered', () => {
            expect.assertions(1)

            return expect(serviceModule.getAll()).resolves.toHaveLength(0)
        })

        it('should return an array of length 1 when called with one service registered', async () => {
            expect.assertions(2)

            await expect(serviceModule.getAll()).resolves.toHaveLength(0)

            await serviceModule.add(fakeServiceInfo)

            await expect(serviceModule.getAll()).resolves.toHaveLength(1)
        })

        it('should return an array of length 3 when called with three services registered', async () => {
            expect.assertions(2)

            await expect(serviceModule.getAll()).resolves.toHaveLength(0)

            await serviceModule.add(fakeServiceInfo)
            await serviceModule.add(fakeServiceInfo2)
            await serviceModule.add(fakeServiceInfo3)

            await expect(serviceModule.getAll()).resolves.toHaveLength(3)
        })
    })
})
