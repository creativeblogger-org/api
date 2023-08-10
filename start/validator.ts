/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/
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
