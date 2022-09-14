import {Storage} from '@google-cloud/storage';
import { /* inject, */ BindingScope, generateUniqueId, injectable} from '@loopback/core';
import * as fs from 'fs';

@injectable({scope: BindingScope.TRANSIENT})
export class StorageService {
  private bucketName = "kunlatek_fundamento_storage";

  constructor(
    /* Add @inject to inject parameters */
  ) { }

  /*
   * Add service methods here
   */
  public async uploadFiles(module: string, file: any): Promise<string> {
    const storage = new Storage({keyFilename: "storage-key.json"})
    try {
      const bucket = storage.bucket(this.bucketName)
      const fileName = file.fileName

      const uniqueFileName = generateUniqueId()

      const base64Image = file.base64.split(';base64,').pop();
      fs.writeFile(`${uniqueFileName}_${fileName}`, base64Image, {encoding: 'base64'}, () => { })

      const uploadedFile = await bucket.upload(`${uniqueFileName}_${fileName}`, {destination: `${process.env.PROJECT}/${module}/${uniqueFileName}_${fileName}`})

      fs.unlink(`${uniqueFileName}_${fileName}`, () => { })

      return uploadedFile[0].publicUrl()
    } catch (error) {
      throw new Error('Upload file error')
    }
  }
}
