import { Injectable, Inject, Logger, HttpStatus, HttpException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { exception } from 'console';

import { CONFIG_CONNECTION_OPTIONS } from '../constants';

/**
 * @export
 * @class AwsS3Service
 */
@Injectable()
export class AwsS3Service {
    private readonly _s3: AWS.S3;

    constructor(@Inject(CONFIG_CONNECTION_OPTIONS) private _options: AWS.S3.Types.ClientConfiguration) {
        Logger.log('initialising Aws Module', 'AWS S3 SERVICE');
        this._s3 = new AWS.S3(_options);
    }

    async upload(params: AWS.S3.Types.PutObjectRequest) {
        return this._s3.putObject(params)
            .promise()
            .then((info: AWS.S3.Types.PutObjectOutput) => {
                Logger.log(`success[S3]: ${JSON.stringify(info)}`);
                return [
                    {
                        statusCode: HttpStatus.OK,
                        message: 'success',
                        data: { url: `https://${params.Bucket}.s3-${this._s3.config.region}.amazonaws.com/${params.Key}` },
                    },
                ];
            })
            .catch((err: AWS.AWSError) => {
                Logger.error(err.message, `success[S3]: ${JSON.stringify(err)}`);
                throw new HttpException({
                    statusCode: err.statusCode,
                    message: 'error',
                    data: err,
                }, HttpStatus.BAD_REQUEST);
            });
    }
    
    async getObject(params: AWS.S3.Types.GetObjectAclRequest){
        try {
            return this._s3
            .getObject(params)
            .promise()
            .then(fileData => {
                return fileData.Body.toString('utf-8');
            })
        } catch (error) {
            throw new HttpException({
                statusCode: error.statusCode,
                message: 'error',
                data: error,
            }, HttpStatus.BAD_REQUEST)
        }

    }
}
