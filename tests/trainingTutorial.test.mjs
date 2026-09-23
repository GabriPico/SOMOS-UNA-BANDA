import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

let vite
let gameStateData
let onboarding
let gameFlow

before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' })
  gameStateData = await vite.ssrLoadModule('/src/data/gameState.ts')
  onboarding = await vite.ssrLoadModule('/src/domain/onboarding.ts')
  gameFlow = await vite.ssrLoadModule('/src/domain/gameFlow.ts')
})

after(async () => vite?.close())

test('el tutorial de entrenamiento empieza pendiente y en el primer paso', () => {
  const state = gameStateData.createNewGameState(84731)
  assert.equal(state.onboarding.trainingTutorialCompleted, false)
  assert.equal(state.onboarding.trainingTutorialStep, 0)
})

test('el paso pendiente sobrevive a una serialización del estado', () => {
  const state = onboarding.setTrainingTutorialStep(gameStateData.createNewGameState(84731), 3)
  const restored = JSON.parse(JSON.stringify(state))
  assert.equal(restored.onboarding.trainingTutorialStep, 3)
  assert.equal(restored.onboarding.trainingTutorialCompleted, false)
})

test('terminar el tutorial no avanza el onboarding ni ejecuta sesiones', () => {
  const initial = gameStateData.createNewGameState(84731)
  const completed = onboarding.completeTrainingTutorial(initial)
  assert.equal(completed.onboarding.trainingTutorialCompleted, true)
  assert.equal(completed.onboarding.active, initial.onboarding.active)
  assert.deepEqual(completed.training.sessions, initial.training.sessions)
  assert.equal(completed.temporal.currentDateTime, initial.temporal.currentDateTime)
})

test('los estados antiguos se normalizan sin repetir un tutorial ya superado', () => {
  const normalized = onboarding.normalizeOnboardingState({
    completed: ['INTRO', 'TRAINING_PLANNING'],
    active: 'FIRST_TRAINING',
  })
  assert.equal(normalized.trainingTutorialCompleted, true)
  assert.equal(normalized.trainingTutorialStep, 0)
})

test('la planificación no bloquea los pasos anteriores del onboarding', () => {
  const state = gameStateData.createNewGameState(84731)
  for (const active of ['STAFF', 'TACTICS', 'SQUAD', 'INBOX']) {
    state.onboarding.active = active
    assert.equal(gameFlow.areWeeklySessionsPlanned(state), false)
    assert.equal(gameFlow.shouldValidateTrainingPlanning(state), false)
  }
  state.onboarding.active = 'TRAINING_PLANNING'
  assert.equal(gameFlow.shouldValidateTrainingPlanning(state), true)
})

test('la validación semanal sigue activa después de superar la planificación inicial', () => {
  const state = gameStateData.createNewGameState(84731)
  state.onboarding.active = 'SECOND_TRAINING'
  state.onboarding.completed.push('TRAINING_PLANNING')
  assert.equal(gameFlow.shouldValidateTrainingPlanning(state), true)
})

test('la charla inicial queda entre la planificación y el primer entrenamiento', () => {
  let state = gameStateData.createNewGameState(84731)
  state.onboarding.active = 'TRAINING_PLANNING'
  state = onboarding.completeOnboardingMilestone(state, 'TRAINING_PLANNING')
  assert.equal(state.onboarding.active, 'FIRST_TRAINING_TALK')
  state = onboarding.completeOnboardingMilestone(state, 'FIRST_TRAINING_TALK')
  assert.equal(state.onboarding.active, 'FIRST_TRAINING')
  assert.equal(state.onboarding.completed.filter((item) => item === 'FIRST_TRAINING_TALK').length, 1)
  const repeated = onboarding.completeOnboardingMilestone(state, 'FIRST_TRAINING_TALK')
  assert.equal(repeated.onboarding.completed.filter((item) => item === 'FIRST_TRAINING_TALK').length, 1)
})
