import Charity from '../models/Charity.js'
import { memoryStore } from '../services/memoryStore.js'

const SAMPLE_CHARITIES = [
  {
    _id: '65f000000000000000000001',
    name: 'Youth Golf Access Fund',
    description: 'Helping kids access coaching, gear, and green fees.',
    tags: ['youth', 'sports'],
  },
  {
    _id: '65f000000000000000000002',
    name: 'Cancer Care Support Network',
    description: 'Supporting patients and families with critical care costs.',
    tags: ['health'],
  },
  {
    _id: '65f000000000000000000003',
    name: 'Clean Water Initiative',
    description: 'Building sustainable access to safe drinking water.',
    tags: ['water', 'global'],
  },
]

async function listCharities(req, res) {
  if (memoryStore.enabled) {
    return res.json({ charities: memoryStore.listCharities() })
  }

  let charities = await Charity.find({}).sort({ name: 1 }).lean()

  if (!charities.length) {
    await Charity.insertMany(SAMPLE_CHARITIES)
    charities = await Charity.find({}).sort({ name: 1 }).lean()
  }

  return res.json({ charities })
}

async function createCharity(req, res) {
  const { name, description, tags, featured, images, events } = req.body || {}
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' })

  if (memoryStore.enabled) {
    const charity = memoryStore.createCharity({
      name: name.trim(),
      description: description || '',
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      images: Array.isArray(images) ? images : [],
      events: Array.isArray(events) ? events : [],
    })
    return res.status(201).json({ charity })
  }

  const charity = await Charity.create({
    name: name.trim(),
    description: description || '',
    tags: Array.isArray(tags) ? tags : [],
    featured: Boolean(featured),
    images: Array.isArray(images) ? images : [],
    events: Array.isArray(events) ? events : [],
  })
  return res.status(201).json({ charity })
}

async function updateCharity(req, res) {
  const { charityId } = req.params
  if (!charityId) return res.status(400).json({ message: 'charityId is required' })

  const payload = req.body || {}

  if (memoryStore.enabled) {
    const updated = memoryStore.updateCharity(charityId, payload)
    if (!updated) return res.status(404).json({ message: 'Charity not found' })
    return res.json({ charity: updated })
  }

  const charity = await Charity.findById(charityId)
  if (!charity) return res.status(404).json({ message: 'Charity not found' })

  if (payload.name) charity.name = payload.name
  if (payload.description !== undefined) charity.description = payload.description
  if (payload.tags !== undefined) charity.tags = payload.tags
  if (payload.images !== undefined) charity.images = payload.images
  if (payload.featured !== undefined) charity.featured = payload.featured
  if (payload.events !== undefined) charity.events = payload.events

  await charity.save()
  return res.json({ charity })
}

async function deleteCharity(req, res) {
  const { charityId } = req.params
  if (!charityId) return res.status(400).json({ message: 'charityId is required' })

  if (memoryStore.enabled) {
    const ok = memoryStore.deleteCharity(charityId)
    if (!ok) return res.status(404).json({ message: 'Charity not found' })
    return res.json({ ok: true })
  }

  const charity = await Charity.findById(charityId)
  if (!charity) return res.status(404).json({ message: 'Charity not found' })
  await charity.deleteOne()
  return res.json({ ok: true })
}

export { listCharities, createCharity, updateCharity, deleteCharity }
