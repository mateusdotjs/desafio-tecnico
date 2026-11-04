#!/usr/bin/env bash

# Exemplos de requisições para a API.
# Uso:
#   bash curl-requests.sh
#   DOCTOR_ID="<id retornado pela disponibilidade>" bash curl-requests.sh
#
# As variáveis podem ser sobrescritas:
#   BASE_URL=http://localhost:3000 EXAM_ID=1 DATE=2030-01-08 START_TIME=08:00 \
#   DOCTOR_ID="<uuid>" bash curl-requests.sh

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
EXAM_ID="${EXAM_ID:-1}"
DATE="${DATE:-2030-01-08}"
START_TIME="${START_TIME:-08:00}"
PATIENT_NAME="${PATIENT_NAME:-Maria Silva}"

# Lista todos os exames.
curl --fail-with-body --silent --show-error \
  "${BASE_URL}/exams"
printf '\n\n'

# Busca exames por parte do nome, sem diferenciar acentos ou maiúsculas.
curl --fail-with-body --silent --show-error --get \
  --data-urlencode "name=torax" \
  "${BASE_URL}/exams"
printf '\n\n'

# Consulta médicos e horários disponíveis para um exame em uma data.
# Copie um "id" e um horário de "availableSlots" da resposta para criar
# o agendamento abaixo.
curl --fail-with-body --silent --show-error --get \
  --data-urlencode "examId=${EXAM_ID}" \
  --data-urlencode "date=${DATE}" \
  "${BASE_URL}/appointments/availability"
printf '\n\n'

# Lista os agendamentos existentes.
curl --fail-with-body --silent --show-error \
  "${BASE_URL}/appointments"
printf '\n\n'

# Cria um agendamento somente quando DOCTOR_ID for informado.
if [[ -z "${DOCTOR_ID:-}" ]]; then
  printf '%s\n' \
    'Agendamento não criado: defina DOCTOR_ID com um id retornado pela disponibilidade.'
  exit 0
fi

curl --fail-with-body --silent --show-error \
  --request POST \
  --header 'Content-Type: application/json' \
  --data "{
    \"patientName\": \"${PATIENT_NAME}\",
    \"examId\": ${EXAM_ID},
    \"doctorId\": \"${DOCTOR_ID}\",
    \"date\": \"${DATE}\",
    \"startTime\": \"${START_TIME}\"
  }" \
  "${BASE_URL}/appointments"
printf '\n'
