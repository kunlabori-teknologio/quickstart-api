import {Storage} from '@google-cloud/storage';
import { /* inject, */ BindingScope, generateUniqueId, injectable} from '@loopback/core';

@injectable({scope: BindingScope.TRANSIENT})
export class StorageService {
  private bucketName = "kunlatek_fundamento_storage";

  constructor(
    /* Add @inject to inject parameters */
  ) { }

  /*
   * Add service methods here
   */
  public async uploadFiles(module: string, files: any[]): Promise<void> {
    const storage = new Storage({keyFilename: "storage-key.json"})
    try {
      const bucket = storage.bucket(this.bucketName)

      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];

        const uniqueFileName = generateUniqueId()
        const fileToUpdate = Buffer.from(file, 'base64')
        await bucket.file(`${process.env.PROJECT}/${module}/${uniqueFileName}`).save(fileToUpdate)
        console.log("File created: " + uniqueFileName)
      }
    } catch (error) {
      console.log(error.message)
    }
  }
}
