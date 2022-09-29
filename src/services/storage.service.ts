import {Storage} from '@google-cloud/storage';
import { /* inject, */ BindingScope, generateUniqueId, injectable} from '@loopback/core';
import {Request, Response} from '@loopback/rest';
import * as fs from 'fs';
import multer from 'multer';

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
      await fs.writeFile(`${uniqueFileName}_${fileName}`, base64Image, {encoding: 'base64'}, () => { })

      const uploadedFile = await bucket.upload(`${uniqueFileName}_${fileName}`, {destination: `${process.env.PROJECT}/${module}/${uniqueFileName}_${fileName}`})

      await fs.unlink(`${uniqueFileName}_${fileName}`, () => { })

      return uploadedFile[0].publicUrl()
    } catch (error) {
      throw new Error('Upload file error')
    }
  }

  public async uploadBufferFiles(module: string, file: any): Promise<string> {
    const storage = new Storage({keyFilename: "storage-key.json"})
    try {
      const bucket = storage.bucket(this.bucketName)
      const fileName = file.originalname

      const uniqueFileName = generateUniqueId()

      await bucket
        .file(`${process.env.PROJECT}/${module}/${uniqueFileName}_${fileName}`,)
        .save(file.buffer)

      const publicUrl = bucket
        .file(`${process.env.PROJECT}/${module}/${uniqueFileName}_${fileName}`)
        .publicUrl()

      return publicUrl;
    } catch (error) {
      throw new Error('Upload file error')
    }
  }

  public async getBodyAndFiles(request: Request, response: Response): Promise<object | null> {
    const storage = multer.memoryStorage();
    const upload = multer({storage});

    return new Promise((resolve, reject) => {
      return upload.any()(request, response, async (err: unknown) => {
        if (err) reject(err)
        else {
          resolve({
            body: request.body,
            files: request.files
          })
        }
      });
    })
  }

  public async getFilesByFieldname(files: any[], fieldname: string): Promise<any[] | null> {
    return files.filter(file => file.fieldname === fieldname)
  }
}
