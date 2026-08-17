import type { PhysiotherapyContact } from '../domain/medicalServices'

export const initialPhysiotherapyContacts: PhysiotherapyContact[] = [{
  id: 'physio-laia-serra', name: 'Laia Serra', sessionCost: 25,
  availabilityNotes: ['Atiende con cita previa en una clínica cercana.', 'Cada jugador acuerda y paga sus propias sesiones.'],
}]
