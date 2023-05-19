declare module '@ioc:Adonis/Core/Validator' {
  interface Rules {
    above(value: number): Rule
  }
}