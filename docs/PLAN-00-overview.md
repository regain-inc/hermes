# @regain/hermes — План реализации

> **Спецификации**: `/Users/macbookpro/development/new_unified_health_app/docs/00-vision/00-clinical-agents/03-hermes-specs/`

## Обзор

Hermes — контрактный протокол для взаимодействия между Deutsch (генератор рекомендаций) и Popper (supervisor). Пакет `@regain/hermes` предоставляет:

1. **TypeScript типы** — полный набор типов для всех сообщений
2. **JSON Schema валидация** — runtime проверка сообщений
3. **Сериализация/десериализация** — безопасное преобразование данных
4. **Утилиты** — хелперы для создания trace context, хеширования, etc.
5. **Fixtures** — тестовые данные для conformance testing

## Фазы реализации

| Фаза | Название | Описание | Файл плана |
|------|----------|----------|------------|
| 1 | Core Types | Базовые типы, TraceContext, Mode, Subject | [PLAN-01-phase-1-core.md](./PLAN-01-phase-1-core.md) |
| 2 | Supervision Contract | SupervisionRequest/Response, основной контракт | [PLAN-02-phase-2-supervision.md](./PLAN-02-phase-2-supervision.md) |
| 3 | Epistemology | HTV Score, EvidenceGrade, Uncertainty, Falsification | [PLAN-03-phase-3-epistemology.md](./PLAN-03-phase-3-epistemology.md) |
| 4 | Clinical & Imaging | Clinician Feedback, Imaging, Bias Detection | [PLAN-04-phase-4-clinical.md](./PLAN-04-phase-4-clinical.md) |
| 5 | Testing & CI | Fixtures, Conformance tests, CI pipeline | [PLAN-05-phase-5-testing.md](./PLAN-05-phase-5-testing.md) |

## Архитектура пакета

```
@regain/hermes/
├── src/
│   ├── index.ts                 # Public API exports
│   ├── version.ts               # Package version
│   │
│   ├── types/                   # TypeScript типы
│   │   ├── index.ts
│   │   ├── core.ts              # TraceContext, Mode, Subject, etc.
│   │   ├── supervision.ts       # SupervisionRequest/Response
│   │   ├── proposals.ts         # ProposedIntervention variants
│   │   ├── epistemology.ts      # HTV, Evidence, Uncertainty
│   │   ├── imaging.ts           # Imaging types
│   │   ├── feedback.ts          # Clinician feedback
│   │   ├── bias.ts              # Bias detection
│   │   ├── audit.ts             # Audit events
│   │   ├── control.ts           # Control commands
│   │   └── errors.ts            # HermesError
│   │
│   ├── schema/                  # JSON Schema validation
│   │   ├── index.ts
│   │   ├── hermes-message.schema.json
│   │   └── validator.ts
│   │
│   ├── utils/                   # Утилиты
│   │   ├── index.ts
│   │   ├── trace.ts             # TraceContext helpers
│   │   ├── hash.ts              # Content hashing
│   │   ├── datetime.ts          # ISO datetime helpers
│   │   └── serialization.ts     # JSON serialization
│   │
│   └── fixtures/                # Test fixtures
│       ├── index.ts
│       ├── supervision-request.ts
│       ├── supervision-response.ts
│       └── ...
│
├── docs/                        # Планы и документация
└── tests/                       # Тесты
```

## Ссылки на спецификации

Все таски должны ссылаться на эти документы:

| Документ | Путь | Содержание |
|----------|------|------------|
| Must Read First | `03-hermes-specs/must-read-first.md` | Порядок чтения спек |
| Context | `03-hermes-specs/00-hermes-specs-context.md` | Контекст и цели |
| System Spec | `03-hermes-specs/01-hermes-system-spec.md` | Архитектура системы |
| Contracts | `03-hermes-specs/02-hermes-contracts.md` | Контракты сообщений |
| Epistemology | `03-hermes-specs/04-hermes-epistemological-types.md` | Epistemological types |
| JSON Schema | `03-hermes-specs/schema/hermes-message.schema.json` | JSON Schema |

## Зависимости

```json
{
  "dependencies": {},
  "devDependencies": {
    "@biomejs/biome": "^1.9.0",
    "@types/bun": "latest",
    "typescript": "^5.7.0",
    "ajv": "^8.17.0",
    "ajv-formats": "^3.0.0"
  }
}
```

## Критерии готовности

- [ ] Все типы соответствуют JSON Schema
- [ ] 100% покрытие типов тестами
- [ ] JSON Schema валидация работает
- [ ] Все fixtures проходят валидацию
- [ ] Документация API сгенерирована
- [ ] CI pipeline настроен
