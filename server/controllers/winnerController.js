import Winner from '../models/Winner.js'
import Draw from '../models/Draw.js'
import { memoryStore } from '../services/memoryStore.js'

async function listUserWinnings(req, res) {
  if (memoryStore.enabled) {
    return res.json({ winners: memoryStore.listWinnersForUser(req.user._id) })
  }

  const winners = await Winner.find({ userId: req.user._id }).populate('drawId').lean()
  return res.json({ winners })
}

async function listAllWinners(req, res) {
  if (memoryStore.enabled) {
    return res.json({ winners: memoryStore.listWinners() })
  }

  const winners = await Winner.find({}).populate('drawId userId').lean()
  return res.json({ winners })
}

async function submitProof(req, res) {
  const { winnerId } = req.params
  const { proofUrl, note } = req.body || {}
  if (!winnerId) return res.status(400).json({ message: 'winnerId is required' })

  if (memoryStore.enabled) {
    const updated = memoryStore.submitProof(req.user._id, winnerId, { proofUrl, note })
    if (!updated) return res.status(404).json({ message: 'Winner not found' })
    return res.json({ winner: updated })
  }

  const winner = await Winner.findById(winnerId)
  if (!winner) return res.status(404).json({ message: 'Winner not found' })
  if (String(winner.userId) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  winner.proof = {
    url: proofUrl || '',
    note: note || '',
    submittedAt: new Date(),
  }
  await winner.save()
  return res.json({ winner })
}

async function decideWinner(req, res) {
  const { winnerId } = req.params
  const { decision, note } = req.body || {}
  if (!winnerId) return res.status(400).json({ message: 'winnerId is required' })
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ message: 'decision must be approve or reject' })
  }

  if (memoryStore.enabled) {
    const updated = memoryStore.decideWinner(winnerId, decision, note)
    if (!updated) return res.status(404).json({ message: 'Winner not found' })
    return res.json({ winner: updated })
  }

  const winner = await Winner.findById(winnerId)
  if (!winner) return res.status(404).json({ message: 'Winner not found' })

  winner.payoutStatus = decision === 'approve' ? 'pending' : 'rejected'
  winner.proof.reviewedAt = new Date()
  winner.proof.decisionNote = note || ''
  await winner.save()

  return res.json({ winner })
}

async function markPaid(req, res) {
  const { winnerId } = req.params
  if (!winnerId) return res.status(400).json({ message: 'winnerId is required' })

  if (memoryStore.enabled) {
    const updated = memoryStore.markWinnerPaid(winnerId)
    if (!updated) return res.status(404).json({ message: 'Winner not found' })
    return res.json({ winner: updated })
  }

  const winner = await Winner.findById(winnerId)
  if (!winner) return res.status(404).json({ message: 'Winner not found' })
  winner.payoutStatus = 'paid'
  await winner.save()
  return res.json({ winner })
}

async function removeWinner(req, res) {
  const { winnerId } = req.params
  if (!winnerId) return res.status(400).json({ message: 'winnerId is required' })

  if (memoryStore.enabled) {
    const ok = memoryStore.deleteWinner(winnerId)
    if (!ok) return res.status(404).json({ message: 'Winner not found' })
    return res.json({ ok: true })
  }

  const winner = await Winner.findById(winnerId)
  if (!winner) return res.status(404).json({ message: 'Winner not found' })
  await winner.deleteOne()
  return res.json({ ok: true })
}

async function getDrawWithWinners(req, res) {
  const { drawId } = req.params
  if (!drawId) return res.status(400).json({ message: 'drawId is required' })

  if (memoryStore.enabled) {
    const draw = memoryStore.getDraw(drawId)
    if (!draw) return res.status(404).json({ message: 'Draw not found' })
    const winners = memoryStore.listWinnersForDraw(drawId)
    return res.json({ draw, winners })
  }

  const draw = await Draw.findById(drawId).lean()
  if (!draw) return res.status(404).json({ message: 'Draw not found' })
  const winners = await Winner.find({ drawId }).populate('userId').lean()
  return res.json({ draw, winners })
}

export {
  listUserWinnings,
  listAllWinners,
  submitProof,
  decideWinner,
  markPaid,
  removeWinner,
  getDrawWithWinners,
}
