import { NextFunction, Request, Response } from "express";
import B2 from 'backblaze-b2';
import config from "../config";
import fs from 'fs';
import path from 'path';

const uploadB2 = async (req: Request, res: Response, next: NextFunction) => {
    // move on to the next middleware if file is missing
    if (!req.file) {
        next();
    } else {
        // step 1: b2 = new b2({ appKeyId, appKey })
        // creating backblaze instance with secret keys
        const b2 = new B2({
            applicationKeyId: config.backblaze_key_id,
            applicationKey: config.backblaze_app_key
        })

        // step 2: b2.authorize()
        // authorizing backblaze
        const authResponse = await b2.authorize();
        // console.log("Authorization response from b2", authResponse.data);
        const { downloadUrl } = authResponse.data;

        // step 3: b2.getUploaderUrl({bucketId})
        // fetching the upload url
        const getUploadUrlResponse = await b2.getUploadUrl({ bucketId: config.backblaze_bucket_id });
        // {
        //     authorizationToken: '4_004bc2f80651f8e0000000002_01b8135e_c840a7_upld_wjo9hC4dK4Vc2bLN7EenCMxZdws=',
        //     bucketId: '4b6c02ef68a0d665912f081e',
        //     uploadUrl: 'https://pod-040-2019-17.backblaze.com/b2api/v2/b2_upload_file/4b6c02ef68a0d665912f081e/c004_v0402019_t0045'
        // }
        const { authorizationToken, uploadUrl } = getUploadUrlResponse.data;

        // read the file contents as buffer
        const filePath = path.resolve(req.file?.path as string);
        const fileBufferData = fs.readFileSync(filePath);

        // step 4: b2.uploadFile(params)
        // upload the image/file
        // setting the params for file upload
        const params = {
            uploadUrl: uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: `profilePhoto/${req.user.userId}${req.file?.originalname}`,
            data: fileBufferData
        }
        const fileInfo = await b2.uploadFile(params);

        // Friendly URL: https://f004.backblazeb2.com/file/teacher/profilePhoto/6719efb5ad82a865d3f6798aavatar.png
        const imgUrl = `${downloadUrl}/file/teacher/${fileInfo.data.fileName}`;
        req.body.imgUrl = imgUrl;
        // passing to the next middleware
        next();
    }

}

export default uploadB2;