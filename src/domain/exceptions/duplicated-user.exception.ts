export default class DuplicatedUserException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicatedUserException';
  }
}
