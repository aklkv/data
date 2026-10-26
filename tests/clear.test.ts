import { Collection } from '#/src/collection.js'
import type { HookEventListener } from '#/src/hooks.js'
import { z } from 'zod'

const schema = z.object({ id: z.number() })

it('does nothing when called on an empty collection', async () => {
  const users = new Collection({ schema })
  users.clear()

  expect(users.all()).toEqual([])
})

it('deletes all records in the collection', async () => {
  const users = new Collection({ schema })
  await users.create({ id: 1 })

  users.clear()
  expect(users.all()).toEqual([])

  await users.create({ id: 2 })
  await users.create({ id: 3 })

  users.clear()
  expect(users.all()).toEqual([])
})

it('invokes the delete hook for every record', async () => {
  const users = new Collection({ schema })

  const hook = vi.fn<HookEventListener<typeof users, 'delete'>>()
  users.hooks.on('delete', hook)

  await users.createMany(4, (index) => ({ id: index + 1 }))
  users.clear()

  expect(hook).toHaveBeenCalledTimes(4)
  expect(hook.mock.calls.map(([event]) => event.data.deletedRecord.id)).toEqual(
    [1, 2, 3, 4],
  )
})
