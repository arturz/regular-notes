export interface ValetTokenRepositoryInterface {
  consume(valetToken: string): Promise<boolean>
  isUsed(valetToken: string): Promise<boolean>
}
