export const OrderStatus = (status: string, orderName: string) =>
  `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; background-color: #232f3e; padding: 20px; border: 1px solid #ddd; color: #fff;">
          <p style="font-size: 18px; margin: 0;">Hello there,</p>
          <p style="font-size: 16px; margin: 10px 0;">Your Order Status is Updated to <strong>${status}</strong></p>
          <p style="font-size: 14px; margin: 5px 0;">Item <strong>${orderName}</strong></p>
        </div>
      </body>
      </html>      
`;

export const OrderCreated = (
  customerName: string,
  orderDate: Date,
  orderTotal: number,
  shippingAddress: string,
  paymentMethod: string,
  orderItems: {
    quantity: number;
    price: number;
    variant: {
      name: string;
    };
  }[]
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f2f2f2; margin: 0; padding: 0;">

  <!-- Header -->
  <div style="background-color: #232f3e; color: #fff; text-align: center; padding: 20px;">
    <h2>Order Confirmation</h2>
  </div>

  <!-- Order Details -->
  <div style="padding: 20px;">
    <p>Hello ${customerName},</p>
    <p>Thank you for your order!</p>

    <h3>Order Details</h3>
    <p>Order Date: ${orderDate}</p>
    <p>Order Total: ${orderTotal}</p>

    <h3>Shipping Address</h3>
    <p>${shippingAddress}</p>

    <h3>Payment Method</h3>
    <p>${paymentMethod}</p>

    <h3>Ordered Items</h3>
    <ul>${orderItems.map(
      (item) =>
        `<li> ItemName: ${item.variant.name} -Quantity: ${item.quantity} - Price: ${item.price} </li>`
    )}
    </ul>

    <p>For any questions or concerns, please contact our customer support at support@example.com.</p>
    <p>Thank you for shopping with us!</p>
  </div>

  <!-- Footer -->
  <div style="background-color: #232f3e; color: #fff; text-align: center; padding: 10px;">
    <p>&copy; 2023 PrintBrix.com. All rights reserved.</p>
  </div>

</body>
</html>


`;

export const UserSignUp = (
  userName: string,
  userEmail: string
) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sign Up Notification</h1>
        </div>
        <p>Hello ${userName},</p>
        <p>Thank you for signing up on our platform! We're excited to have you join our community.</p>
        <p>Your account details:</p>
        <ul>
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <!-- Add more account details if needed -->
        </ul>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p>Best regards,</p>
        <p>The Villop Team</p>
    </div>
</body>
</html>
`;

export const UserVerify = (userName: string, link: string) => `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>User Verification Alert</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>User Verification Alert</h1>
          </div>
          <p>Hello ${userName},</p>
          <p>Verify yourself by clicking on this link ${link}</p>
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          <p>Best regards,</p>
          <p>The PrintBrix's Team</p>
      </div>
  </body>
  </html>
  `;

export const UserLogin = (userName: string) => `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PrintBrix - Account Login Alert</title>
    <style>
        /* Add your styling here */
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .message {
            padding: 20px;
        }
        .button {
            display: inline-block;
            background-color: #ff9900;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 3px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="" alt="PrintBrix Logo" width="120">
        </div>
        <div class="message">
            <h2>Account Login Alert</h2>
            <p>Hello ${userName},</p>
            <p>We noticed a recent login to your PrintBrix account. If you authorized this activity, you can disregard this email.</p>
            <p>If you did not perform this action, we recommend taking these steps:</p>
            <ol>
                <li>Change your PrintBrix password immediately.</li>
                <li>Review your account settings for any unauthorized changes.</li>
                <li>Contact our support team if you need assistance or have concerns.</li>
            </ol>
            <p>Thank you for choosing PrintBrix!</p>
        </div>
        <hr>
        <p>If you have any questions or need help, please visit our <a href=" ">Help & Customer Service</a> page.</p>
    </div>
</body>
</html>
`;

export const orderCancelled = (customerName: string, orderId: string) => `
<!DOCTYPE html>
<html>
<head>
    <title>Order Cancellation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        h2 {
            color: #e74c3c;
        }
        p {
            color: #333333;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Order Cancellation</h2>
        <p>Dear ${customerName},</p>
        <p>We regret to inform you that your order with reference id${orderId} has been cancelled.</p>
        <p>If you believe this is an error or have any questions, please don't hesitate to contact our customer support.</p>
        <p>We apologize for any inconvenience this may have caused.</p>
        <p>Thank you for considering PrintBrix.</p>
        <p>Sincerely,</p>
        <p>The PrintBrix Team</p>
    </div>
</body>
</html>

`;

export const forgotPassword = (otp: Number) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
</head>
<body>
    <p>Hello,</p>
    <p>You have requested to reset your password. Please enter the OTP below to set your new password:</p>
    <p>OTP: ${otp}</p>
    <br />
    <p>If you did not make this request, you can safely ignore this email.</p>
    <p>Thank you!</p>
</body>
</html>`;

export const addUser = (
  userName: string,
  userEmail: string,
  userRole: string
) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sign Up Notification</h1>
        </div>
        <p>Hello ${userName},</p>
        <p>Congrats you have been added as ${userRole} to our platform! We're excited to have you join our community.</p>
        <p>Your account details:</p>
        <ul>
            <li><strong>Name:</strong> ${userName}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            
            <!-- Add more account details if needed -->
        </ul>
        <p>NOTE: This is temporary password we recommend you to set a new password</p>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p>Best regards,</p>
        <p>The Viloop Team</p>
    </div>
</body>
</html>`;

export const addUserCr = (
  userName: string,
  userEmail: string,
  userRole: string,
  password?: string
) => `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign Up Notification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Sign Up Notification</h1>
          </div>
          <p>Hello ${userName},</p>
          <p>Congrats you have been added as ${userRole} to our platform! We're excited to have you join our community.</p>
          <p>Your account details:</p>
          <ul>
              <li><strong>Name:</strong> ${userName}</li>
              <li><strong>Email:</strong> ${userEmail}</li>
              <li><strong>Password:</strong> ${password}</li>
              <!-- Add more account details if needed -->
          </ul>
          <p>NOTE: This is temporary password we recommend you to set a new password</p>
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          <p>Best regards,</p>
          <p>The Viloop Team</p>
      </div>
  </body>
  </html>`;

export const sendReplyEmail = (
  userName: string,
  title: string,
  message: string
) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <p>Hello ${userName},</p>
        <p>${message}</p>
        
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p>Best regards,</p>
        <p>The Viloop Team</p>
    </div>
</body>
</html>`;

export const invoice = (
  orderInfo: any,
  subTotal: any,
  invoiceNo: string
) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>invoiceThree</title>
    <link rel="stylesheet" href="invoice.css" />
    <style>
      * {
        padding: 0%;
        margin: 0%;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
      }

      .container {
        width: 100%;
        max-width: 860px;
        /* height: 100vh; */
        padding: 0.5rem;
        margin: auto;
      }
      table {
        border-collapse: collapse;
      }
      .table_one {
        height: 100%;
        width: 100%;
        background-color: white;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }

      .img_one {
        width: 100%;
        max-width: 11rem;
        padding: 1rem;
        /* margin-left: 2rem; */
      }

      #td_2 {
        /* float: right; */
        /* margin-right: 2rem; */
        /* background-color: #C0F5FF; */
        color: white;
        /* padding: 10px; */
      }
      .invoiceIdWarper {
        background-color: #C0F5FF;
        width: 100%;
        padding: 1rem;
      }
      #td_3 {
        background: #000;
        width: 100%;
        height: 1px;
      }

      #td_3 p {
        font-size: 1px;
      }

      .td_5 {
        float: left;
        padding-left: 2rem;
        padding-top: 1rem;
        padding-bottom: 0.5rem;
      }

      .td_4 {
        padding-left: 2rem;
        padding-top: 1rem;
        padding-bottom: 0.5rem;
      }

      #td_6 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        color: #C0F5FF;
      }

      #td_7 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        color: #C0F5FF;
      }

      #td_8 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_9 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_10 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_11 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_12 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_13 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_17 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;
      }

      #td_19 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_18 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;
      }

      #td_14 {
        padding-left: 2rem;
        padding-bottom: 1rem;
        padding-top: 1rem;
      }

      #td_15 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 1rem;
        padding-top: 1rem;
      }

      #td_16 {
        background-color: black;
        width: 100%;
        width: 1px;
        font-size: 1px;
      }

      .table_two {
        height: 100%;
        width: 100%;
        background-color: white;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }

      .description {
        width: 40%;
      }

      #td-1 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-2 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-3 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-4 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-5 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }
      .img_two {
        height: 2.5rem;
        width: 2.5rem;
      }

      #td-6 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-7 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-8 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-9 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-10 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-11 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-12 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-13 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-14 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-15 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
      .border {
        background: #000;
        width: 100%;
        height: 1px;
        font-size: 1px;
      }
      .heading {
        background: #C0F5FF;
      }
      .table_head {
        padding-left: 2rem;
        text-align: start;
        width:50%;
      }
      .table_three {
        width: 100%;
      }
      .table_body {
        padding-left: 2rem;
        padding-top: 0.5rem;
      }
      .table_span {
        padding: 5px;
        border: 1px solid black;
      }
      #sign {
        text-align: end;
        padding-top: 7rem;
        padding-bottom: 1rem;
        padding-right: 2rem;
      }
      .finalCalc{
        font-size: 1rem;
        margin: 1em 0em 2em 0em;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <table class="table_one">
        <tr class="tr_one">
          <td id="td_1">
            <img
              src="./../public/images/viloop-logo.png"
              
              alt=""
              class="img_one"
            />
          </td>
          <td id="td_2">
            <div class="invoiceIdWarper">
              <h1>INVOICE</h1>
              <p>INVOICE NO: ${invoiceNo}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" id="td_3">
            <p>.</p>
          </td>
        </tr>
        <tr>
          <td class="td_4" style="text-transform: uppercase">
            <h3>Buyer :</h3>
          </td>
        </tr>
        <tr>
          
          <td id="td_5">
            <h3>${orderInfo?.customer?.name}</h3>
            ${
              orderInfo?.deliveryAddress?.addressLineOne
                ? `<b>${orderInfo?.deliveryAddress?.addressLineOne}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.landmark
                ? `<b>${orderInfo?.deliveryAddress?.landmark}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.city
                ? `<b>${orderInfo?.deliveryAddress?.city}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.state
                ? `<b>${orderInfo?.deliveryAddress?.state}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.country
                ? `<b>${orderInfo?.deliveryAddress?.country}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.zip
                ? `<b>${orderInfo?.deliveryAddress?.zip}, </b>`
                : ""
            }
            <b>Phone: ${
              (orderInfo?.deliveryAddress?.country,
              orderInfo?.deliveryAddress?.phone)
            }</b>
          </td>
        </tr>
        <tr>
          <td colspan="2" id="td_16">.</td>
        </tr>
        <tr>
          <td id="td_17">
            <p><b>Payment Method : </b>${orderInfo?.paymentMethod}</p>
          </td>
          <td id="td_18">
            <p><b>Issue Date : </b>${
              new Date(orderInfo?.createdAt).toLocaleString().split(",")[0]
            }</p>
          </td>
        </tr>
        <tr>
          <td id="td_19">
            <p><b>Order Number : </b>${orderInfo?.orderId}</p>
          </td>
        </tr>
      </table>
      <table class="table_two">
        <tr class="heading">
          <th id="td-1">
            <b>Item</b>
          </th>
          <th class="description" id="td-2">Description</th>
          <th id="td-3">Price</th>
          <th id="td-4">Quantity</th>
          <th id="td-5">Total</th>
        </tr>
        <!-- item start -->
        ${orderInfo?.OrderedItems?.map(
          (order: any) =>
            `<tr>
            <td id="td-6">
              <img src="${order?.product?.imageUrl}" alt="" class="img_two" />
            </td>
            <td class="description" id="td-7">
              <p>
                ${order?.product?.description}
              </p>
            </td>
            <td id="td-8">${order?.product?.salePrice.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</td>
            <td id="td-9">${order?.quantity}</td>
            <td id="td-10">${order?.price?.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</td>
          </tr>
          <tr>
            <td colspan="5" class="border">.</td>
          </tr>`
        )}
        <!-- item end -->
      </table>
      <table class="table_three finalCalc">
        
        <tr>
        <th class="table_head headId">
        </th>
          <td class="table_body">
            <h4>Total</h4>
          </td>
          <td class="table_body">
            <h4>${orderInfo?.total.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</h4>
          </td>
        </tr>
      </table>
      <table style="width: 100%; text-align: center">
        <tr>
          <td style="width: 30%">
            <hr style="background-color: black" />
          </td>
          <td style="border: 1px solid black; padding: 5px">
            Thank You
          </td>
          <td style="width: 30%">
            <hr style="background-color: black" />
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;

export const invoiceOld = (
  orderInfo: any,
  subTotal: any,
  invoiceNo: string
) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>invoiceThree</title>
    <link rel="stylesheet" href="invoice.css" />
    <style>
      * {
        padding: 0%;
        margin: 0%;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
      }

      .container {
        width: 100%;
        max-width: 860px;
        /* height: 100vh; */
        padding: 0.5rem;
        margin: auto;
      }
      table {
        border-collapse: collapse;
      }
      .table_one {
        height: 100%;
        width: 100%;
        background-color: white;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }

      .img_one {
        width: 100%;
        max-width: 11rem;
        padding: 1rem;
        /* margin-left: 2rem; */
      }

      #td_2 {
        /* float: right; */
        /* margin-right: 2rem; */
        /* background-color: #C0F5FF; */
        color: white;
        /* padding: 10px; */
      }
      .invoiceIdWarper {
        background-color: #C0F5FF;
        width: 100%;
        padding: 1rem;
      }
      #td_3 {
        background: #000;
        width: 100%;
        height: 1px;
      }

      #td_3 p {
        font-size: 1px;
      }

      .td_5 {
        float: left;
        padding-left: 2rem;
        padding-top: 1rem;
        padding-bottom: 0.5rem;
      }

      .td_4 {
        padding-left: 2rem;
        padding-top: 1rem;
        padding-bottom: 0.5rem;
      }

      #td_6 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        color: #C0F5FF;
      }

      #td_7 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        color: #C0F5FF;
      }

      #td_8 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_9 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_10 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_11 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_12 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_13 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_17 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;
      }

      #td_19 {
        padding-left: 2rem;
        padding-bottom: 0.5rem;
      }

      #td_18 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 0.5rem;
        padding-top: 0.5rem;
      }

      #td_14 {
        padding-left: 2rem;
        padding-bottom: 1rem;
        padding-top: 1rem;
      }

      #td_15 {
        float: left;
        padding-left: 2rem;
        padding-bottom: 1rem;
        padding-top: 1rem;
      }

      #td_16 {
        background-color: black;
        width: 100%;
        width: 1px;
        font-size: 1px;
      }

      .table_two {
        height: 100%;
        width: 100%;
        background-color: white;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }

      .description {
        width: 40%;
      }

      #td-1 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-2 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-3 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-4 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }

      #td-5 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background: #C0F5FF;
        color: white;
        text-align: start;
      }
      .img_two {
        height: 2.5rem;
        width: 2.5rem;
      }

      #td-6 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-7 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-8 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-9 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-10 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-11 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-12 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-13 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-14 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      #td-15 {
        padding-left: 2rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
      .border {
        background: #000;
        width: 100%;
        height: 1px;
        font-size: 1px;
      }
      .heading {
        background: #C0F5FF;
      }
      .table_head {
        padding-left: 2rem;
        text-align: start;
        width:50%;
      }
      .table_three {
        width: 100%;
      }
      .table_body {
        padding-left: 2rem;
        padding-top: 0.5rem;
      }
      .table_span {
        padding: 5px;
        border: 1px solid black;
      }
      #sign {
        text-align: end;
        padding-top: 7rem;
        padding-bottom: 1rem;
        padding-right: 2rem;
      }
      .finalCalc{
        font-size: 1rem;
        margin: 1em 0em 2em 0em;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <table class="table_one">
        <tr class="tr_one">
          <td id="td_1">
            <img
              src="${process.env.LOGO_URL}"
              alt=""
              class="img_one"
            />
          </td>
          <td id="td_2">
            <div class="invoiceIdWarper">
              <h1>INVOICE</h1>
              <p>INVOICE NO: ${invoiceNo}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" id="td_3">
            <p>.</p>
          </td>
        </tr>
        <tr>
          <td class="td_4" style="text-transform: uppercase">
            <h3>supplier :</h3>
          </td>
          <td class="td_5" style="text-transform: uppercase">
            <h3>Client :</h3>
          </td>
        </tr>
        <tr>
          <td id="td_6">
            <h3>${orderInfo?.customer?.name}</h3>
            ${
              orderInfo?.deliveryAddress?.addressLineOne
                ? `<b>${orderInfo?.deliveryAddress?.addressLineOne}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.landmark
                ? `<b>${orderInfo?.deliveryAddress?.landmark}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.city
                ? `<b>${orderInfo?.deliveryAddress?.city}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.state
                ? `<b>${orderInfo?.deliveryAddress?.state}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.country
                ? `<b>${orderInfo?.deliveryAddress?.country}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.zip
                ? `<b>${orderInfo?.deliveryAddress?.zip}, </b>`
                : ""
            }
            <b>+${
              (orderInfo?.deliveryAddress?.country,
              orderInfo?.deliveryAddress?.phone)
            }</b>
          </td>
          <td id="td_7">
            <h3>${orderInfo?.customer?.name}</h3>
            ${
              orderInfo?.deliveryAddress?.addressLineOne
                ? `<b>${orderInfo?.deliveryAddress?.addressLineOne}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.landmark
                ? `<b>${orderInfo?.deliveryAddress?.landmark}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.city
                ? `<b>${orderInfo?.deliveryAddress?.city}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.state
                ? `<b>${orderInfo?.deliveryAddress?.state}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.country
                ? `<b>${orderInfo?.deliveryAddress?.country}, </b>`
                : ""
            }
            ${
              orderInfo?.deliveryAddress?.zip
                ? `<b>${orderInfo?.deliveryAddress?.zip}, </b>`
                : ""
            }
            <b>+${
              (orderInfo?.deliveryAddress?.country,
              orderInfo?.deliveryAddress?.phone)
            }</b>
          </td>
        </tr>
        <tr>
          <td colspan="2" id="td_16">.</td>
        </tr>
        <tr>
          <td id="td_17">
            <p><b>Payment Method : </b>${orderInfo?.paymentMethod}</p>
          </td>
          <td id="td_18">
            <p><b>Issue Date : </b>${
              new Date(orderInfo?.createdAt).toLocaleString().split(",")[0]
            }</p>
          </td>
        </tr>
        <tr>
          <td id="td_19">
            <p><b>Order Number : </b>${orderInfo?.orderId}</p>
          </td>
        </tr>
      </table>
      <table class="table_two">
        <tr class="heading">
          <th id="td-1">
            <b>Item</b>
          </th>
          <th class="description" id="td-2">Description</th>
          <th id="td-3">Price</th>
          <th id="td-4">Quantity</th>
          <th id="td-5">Total</th>
        </tr>
        <!-- item start -->
        ${orderInfo?.OrderedItems?.map(
          (order: any) =>
            `<tr>
            <td id="td-6">
              <img src="${order?.product?.imageUrl}" alt="" class="img_two" />
            </td>
            <td class="description" id="td-7">
              <p>
                ${order?.product?.description}
              </p>
            </td>
            <td id="td-8">${order?.product?.salePrice.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</td>
            <td id="td-9">${order?.quantity}</td>
            <td id="td-10">${order?.price?.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</td>
          </tr>
          <tr>
            <td colspan="5" class="border">.</td>
          </tr>`
        )}
        <!-- item end -->
      </table>
      <table class="table_three finalCalc">
        <tr>
          <th class="table_head headId">
          </th>
          <th class="table_head">
            <h4>SubTotal</h4>
            <p style="font-size: 0.8rem;">(Tax ${orderInfo?.billing?.GST?.toLocaleString(
              "en-ZA",
              { style: "currency", currency: "ZAR" }
            )}/-)</p>
          </th>
          <th class="table_head">
            <h4>${subTotal?.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</h4>
          </th>
        </tr>
        ${
          orderInfo?.billing?.deliveryCharge
            ? `<tr>
          <td class="table_body headId">
          </td>
          <td class="table_body">
            <h4>Delivery Charge</h4>
          </td>
          <td class="table_body">
            <h4>${orderInfo?.billing?.deliveryCharge?.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</h4>
          </td>
        </tr>`
            : ""
        }
        <tr>
        ${
          orderInfo?.billing?.couponDiscount?.benefitAmount
            ? `<th class="table_head headId">
          </th>
          <td class="table_body">
            <h4>Coupon Discount</h4>
          </td>
          <td class="table_body">
            <h4>${orderInfo?.billing?.couponDiscount?.benefitAmount.toLocaleString(
              "en-ZA",
              { style: "currency", currency: "ZAR" }
            )}/-</h4>
          </td>
        </tr>`
            : ``
        }
        <tr>
        <th class="table_head headId">
        </th>
          <td class="table_body">
            <h4>Total</h4>
          </td>
          <td class="table_body">
            <h4>${orderInfo?.billing?.totalPrice.toLocaleString("en-ZA", {
              style: "currency",
              currency: "ZAR",
            })}/-</h4>
          </td>
        </tr>
      </table>
      <table style="width: 100%; text-align: center">
        <tr>
          <td style="width: 30%">
            <hr style="background-color: black" />
          </td>
          <td style="border: 1px solid black; padding: 5px">
            Thank You
          </td>
          <td style="width: 30%">
            <hr style="background-color: black" />
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
