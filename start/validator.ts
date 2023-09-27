import { validator } from '@ioc:Adonis/Core/Validator'

validator.rule('above', (value, [number], options) => {
  if (typeof value !== 'number') {
    return
  }

  if (value < number) {
    options.errorReporter.report(
      options.pointer,
      'above',
      'above validation failed',
      options.arrayExpressionPointer
    )
  }
})
