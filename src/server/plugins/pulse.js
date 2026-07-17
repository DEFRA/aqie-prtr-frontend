import hapiPulse from 'hapi-pulse'

import { createLogger } from '../common/helpers/logging/logger.js'

const PULSE_TIMEOUT_MS = 10000

const pulse = {
  plugin: hapiPulse,
  options: {
    logger: createLogger(),
    timeout: PULSE_TIMEOUT_MS
  }
}

export { pulse }
