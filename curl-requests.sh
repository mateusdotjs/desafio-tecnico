#!/usr/bin/env bash

# 1. Liste ou busque os exames para escolher o examId.
curl http://localhost:3000/exams

curl "http://localhost:3000/exams?name=torax"

# 2. Consulte a disponibilidade para o exame e a data.
# Copie um id de médico e um horário de availableSlots da resposta.
curl "http://localhost:3000/appointments/availability?examId=1&date=2030-01-08"

# 3. Crie o agendamento com o médico e o horário escolhidos.
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Maria Silva",
    "examId": 1,
    "doctorId": "SUBSTITUA_PELO_ID_DO_MEDICO",
    "date": "2030-01-08",
    "startTime": "SUBSTITUA_PELO_HORARIO"
  }'

# 4. Liste os agendamentos para conferir o resultado.
curl http://localhost:3000/appointments
