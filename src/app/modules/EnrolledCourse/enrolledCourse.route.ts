import express, { Request, Response } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { EnrolledCourseValidation } from "./EnrolledCourse.validation";
import { EnrolledCourseController } from "./enrolledCourse.controller";
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore
import SSLCommerzPayment from "sslcommerz-lts"



const store_id = 'bakin62b84b547d1c3'
const store_passwd = 'bakin62b84b547d1c3@ssl'
const is_live = false 


const router = express.Router();

router.post('/free',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createFreeEnrolledCourse),EnrolledCourseController.createFreeEnrolledCourse )
router.post('/paid/init',auth(USER_ROLE.student),validateRequest(EnrolledCourseValidation.createPaidEnrolledCourse),EnrolledCourseController.createPaidEnrolledCourse )

// router.post("/paid/init",async(req:Request,res:Response)=>{
//     const { course_id, totalPrice } = req.body

//     const transactionId = uuidv4();;

//     const data = {
//         total_amount: totalPrice,
//         currency: 'BDT',
//         tran_id: transactionId, // use unique tran_id for each api call
//         success_url: 'http://localhost:5000/api/v1/enroll-course/paid/success',
//         fail_url: 'http://localhost:5000/fail',
//         cancel_url: 'http://localhost:5000/cancel',
//         ipn_url: 'http://localhost:5000/api/v1/enroll-course/paid/ipn',
//         shipping_method: 'Courier',
//         product_name: 'Computer.',
//         product_category: 'Electronic',
//         product_profile: 'general',
//         cus_name: 'Customer Name',
//         cus_email: 'customer@example.com',
//         cus_add1: 'Dhaka',
//         cus_add2: 'Dhaka',
//         cus_city: 'Dhaka',
//         cus_state: 'Dhaka',
//         cus_postcode: '1000',
//         cus_country: 'Bangladesh',
//         cus_phone: '01711111111',
//         cus_fax: '01711111111',
//         ship_name: 'Customer Name',
//         ship_add1: 'Dhaka',
//         ship_add2: 'Dhaka',
//         ship_city: 'Dhaka',
//         ship_state: 'Dhaka',
//         ship_postcode: 1000,
//         ship_country: 'Bangladesh',
//     };
//     const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
//     sslcz.init(data).then((apiResponse:any) => {
//         // Redirect the user to payment gateway
//         let GatewayPageURL = apiResponse.GatewayPageURL
//         // res.redirect(GatewayPageURL)
//         console.log('Redirecting to: ', GatewayPageURL)
//     });

// })



// router.post("/paid/success",async(req:Request,res:Response)=>{

//     console.log("payment success"
//     );
//     // const {val_id}=req.body
//     // const data = {
//     //     val_id:val_id//that you go from sslcommerz response
//     // };
//     // const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
//     // sslcz.validate(data).then((data:any) => {
//     //     //process the response that got from sslcommerz 
//     //    // https://developer.sslcommerz.com/doc/v4/#order-validation-api
//     // });
// })

// router.get('/validate', async(req:Request,res:Response) => {
//  console.log("payment validate");
// }) 

// router.post('/paid/ipn', async(req:Request,res:Response) => {
//     console.log("payment ipn");
//    }) 



export const EnrolledCourseRoute = router;