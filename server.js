const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { generatePDF, closeBrowser } = require('./pdf-generator');
const logger = require('./logger');


// Load HTML template as string


const app = express();
const PORT = process.env.PORT || 3000;

app.use('/assets', express.static(path.join(__dirname, 'assets')));


// app.use('/assets', express.static(path.join(__dirname, 'assets'), {
//   setHeaders: (res, path) => {
//     logger.info(`Serving static file: ${path}`);
//   }
// }));

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Sample HTML template for testing (if Priya's HTML is not available)
const sampleHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Approved Proposal</title>
    <style>
   .red-color {
       color: red;
   }
    
</style>
<section style="margin:0 auto;width:98%;">
   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%;font-family: arial, sans-serif;font-size:11px;color:#231f20;line-height:18px;">
       <TR>
           <TD valign="top"><img src="http://localhost:3000/assets/logo-im1.png" alt="IndiaMART InterMESH Ltd." width="164" height="100">
           </TD>
           <TD valign="top" width="100%"
               style="text-transform:uppercase;font-size:20px;color:#231f20; text-align:center"><U>Proposal</U></TD>
           <TD valign="top"><img src="http://localhost:3000/assets/im-add.png" alt="IndiaMART InterMESH Ltd." width="164" height="100">
           </TD>
       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0" style="border-collapse:collapse;width:100%;margin-top:10px">
       <TR>
           <TD style="width:75%">
               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;width:100%;font-family: arial, sans-serif;font-size:11px;color:#231f20;line-height:18px;">
                   <TR>
                       <TD><Strong>To,</Strong></TD>
                   </TR>
                   <TR>
                       <TD>Ajay Kumar</TD>
                   </TR>
                   <TR>
                       <TD>Archana Extrusion Machinery Manufacturing</TD>
                   </TR>
                   <TR>
                       <TD>Raxaul, Bihar, India</TD>
                   </TR>
                   <TR>
                       <TD>24AEVPG7995K1ZJ</TD>
                   </TR>
               </TABLE>
           </TD>
           <TD style="text-align:right; width:25%">
               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;width:100%;font-family: arial, sans-serif;font-size:11px;color:#231f20;line-height:18px;">
                   <TR>
                       <TD>
                           Proposal ID :<span>3219392</span><BR>
                                   Proposal Date :<Span>01-Jan-1970</Span><BR>
                                   Valid Till :<Span>08-Jan-1970</Span><BR>
                                   Approved On :<Span>03-Jun-2025</Span><BR>
                       </TD>
                   </TR>
               </TABLE>
           </TD>
       </TR>
   </TABLE>


   <div style="height:auto;background:url(/assets/approved.jpg) top center no-repeat;">
        <table border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #dddddd; width: 100%; font-family: Arial, sans-serif; font-size: 12px; color: #231f20; line-height: 18px;">
    <thead style="background: #e9e9e9; color: #000;">
        <tr style="text-align: center;">
            <th style="padding: 8px; border: 1px solid #dddddd;">S.No.</th>
            <th style="padding: 8px; border: 1px solid #dddddd;">Description</th>
            <th style="padding: 8px; border: 1px solid #dddddd;">Amount (INR)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">1.</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">
                <strong>Service:</strong> LS20<br>
                <strong>No. of Combination:</strong> 20<br>
                <strong>Duration:</strong> 1 Year<br>
                <strong>Offer Applied:</strong> 1 Month Extra on Old Leader Renewals
            </td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">4,21,200.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">2.</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">Trust Seal <strong>(Complimentary)</strong></td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">0.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">3.</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">India BuyLeads <strong>(Complimentary):</strong> 70 <strong>(Weekly)</strong> + 3 <strong>(Daily Bonus)</strong></td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">0.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">4.</td>
            <td style="padding: 8px; border: 1px solid #dddddd;">Offers Applied: 10% Cashback on 1 Lac+ Deals</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">0.00</td>
        </tr>

        <!-- S.No 5 merged across 6 rows -->
        <tr>
            <td rowspan="6" style="padding: 8px; border: 1px solid #dddddd; text-align: center; vertical-align: middle;"></td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: right;">Total Price</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">4,21,200.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: right;">Discount @ 3.85%</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">(-)16,200.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: right;">Deal Amount</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">4,05,000.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: right;">Deal Amount (Inc. GST)</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">4,77,900.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: right;">IGST @ 18%</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">72,900.00</td>
        </tr>
        <tr>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: right; font-weight: bold;">Total Payable Amount</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">4,77,900.00</td>
        </tr>

        <!-- Installment rows -->
        <tr>
            <td colspan="2" style="padding: 8px; border: 1px solid #dddddd; text-align: right;">Advance Payment</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">Day 0 – 1,70,900.00</td>
        </tr>
        <tr>
            <td colspan="2" style="padding: 8px; border: 1px solid #dddddd; text-align: right;">1st Installment Payment</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">Day 30 – 1,53,500.00</td>
        </tr>
        <tr>
            <td colspan="2" style="padding: 8px; border: 1px solid #dddddd; text-align: right;">2nd Installment Payment</td>
            <td style="padding: 8px; border: 1px solid #dddddd; text-align: center;">Day 60 – 1,53,500.00</td>
        </tr>
    </tbody>
</table>

   </div>
   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%; margin-top:40px;font-family: arial, sans-serif;font-size:11px;color:#231f20;line-height:18px;">
       <TR>
           <TD>
               <ul style="margin:0px 0px 0px 20px;padding:0px;color:#2a2a2a;">
                   <li>This is an application for IndiaMART services. An order confirmation may be done on
                       phone/email before booking the order.</li>
                   <li>Please check all the details given in the proposal before approving, there would not be any
                       changes post deal confirmation.</li>
                   <li>All online content including text & pictures are to be provided by the client who should be the
                       legal copyright owner of the same. IndiaMART
                       shall not be liable for any claims/damages arising out of content posted on your catalog.</li>
                   <li>Charges for subsequent years shall be as per the rate at that time, which may be higher than the
                       current charges.</li>
                   <li>Work on services shall commence only after clearance of cheque/pay order.</li>
                   <li> Pursuant to the approval of this proposal, The Customer hereby allows IndiaMART InterMESH
                       Limited to make commercial
                       calls on its registered mobile number(s) and organization&#39;s contact number(s). This
                       declaration will hold valid even if
                       the customer chooses to get its numbers registered for NDNC at any future date.</li>
                   <li>All services are offered without any performance guarantee in terms of number of enquiries,
                       confirmed orders etc.</li>
                   <li><Strong> Payment to IndiaMART InterMESH Limited. is covered under advertising Contract U/s 194C. TDS, if applicable, will be @ 2%</Strong>
                   </li>
               </ul>
           </TD>
       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%; margin-top:5px;font-family: arial, sans-serif;font-size:11px;color:#231f20;line-height:18px;">
       <TR>
           <TD valign="top">
               <Strong>Note</Strong><BR>
                       Cheque/Draft to be made in favor of IndiaMART InterMESH Ltd.<BR>
                       PAN No.: AAACI5853L, GSTIN: 09AAACI5853L2Z5
           </TD>
           <TD valign="top">
               E. & O.E.<BR>
                       All disputes subject to Delhi jurisdiction<BR>
                       As proposed in budget
           </TD>
       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%; margin-top:5px;font-family: arial, sans-serif;font-size:11px;color:#231f20;line-height:18px;">
       <TR>
           <TD style="border-top:5px solid #ef1d20;width:50%"></TD>
           <TD style="border-top:5px solid #2c358a;width:50%"></TD>
       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%; margin-top:3px;font-family: arial, sans-serif;font-size:11px;color:#231f20;line-height:18px;">
       <TR>
           <TD align="center">Regd. Office: 1st Floor, 29-Daryaganj, Netaji Subash Marg, Delhi - 110002, India |
               CIN:L74899DL1999PLC101534</TD>
       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%; margin-top:5px;font-family: arial, sans-serif;font-size:13px;font-weight:600">
       <TR>
           <TD align="center"><img src="http://localhost:3000/assets/phone.png" alt="IndiaMART InterMESH Ltd." width="15" height="15"
                           align="absmiddle"> 09696969696 &nbsp;&nbsp;&nbsp;&nbsp; <img src="http://localhost:3000/assets/sms.png" alt="IndiaMART InterMESH Ltd."
                           width="15" height="15" align="absmiddle"> customercare@indiamart.com</TD>
       </TR>
   </TABLE>
</section>
<section style="margin:0 auto;width:100%;">
   <table BORDER="0" CELLPADDING="0" CELLSPACING="0" style="border-collapse:collapse;width:100%;margin:120px 0 5px 0">
       <TR>
           <TD style="background:rgba(0,0,0,0.1); height:5px;"></TD>
       </TR>
   </TABLE>
</section>


<section style="margin:0 auto;width:98%;">
   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
       <TR>
           <TD colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Service
               Offerings and Deliverables</TD>
       </TR>
       <TR>
           <TD valign="top" style="padding:5px 5px 0 0" width="50%">


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top: 3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">IM
                           Industry Leader</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Higher Listing (Above
                           Leader)<br />Visibility in Preferred Districts<br />Dynamic Preferred Districts<br />70 Weekly + 2 Daily BLs along with 25+1 Daily BLs (Per Category)<br />
                       </td>
                   </tr>
               </table>






               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">IM
                           Leader</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Higher Listing (Above
                           Star)<br />Visibility in Preferred Districts<br />Dynamic Preferred Districts<br />40 Weekly + 2 Daily BLs along with 14+1 Daily BLs (Per Category)
                       </td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top: 3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">IM Star
                       </td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Higher Listing (Above
                           TrustSEAL)<br />Visibility in Preferred Districts<br />Dynamic Preferred Districts<br />30 Weekly + 2 Daily BLs along with 7+1 Daily BLs (Per Category)<br />
                       </td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Star
                           Supplier</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Base</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Star Supplier visibility
                           (Above
                           TrustSEAL)<br />50(Weekly) + 3(Daily Bonus) India Buyleads under IndiaMART Advantage Program<br />No allocation of Category wise Buyleads
                       </td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top: 3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Mini
                           Dynamic Catalog (MDC)</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Catalog</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Templated Catalog with
                           control panel
                           (seller.indiamart.com)<br />Upto 50 Products addition by IndiaMART<br />Will be hosted as a sub domain example: - www.indiamart.com/companyname<br />Standard (Not Customized) Product Blowup Images
                       </td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Promotional Activities</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Business Listing on
                           IndiaMART Network - dir.indiamart.com</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Client Privilege</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Update Profile / Contact
                           Info<br />Client can add upto 40 categories & 400 products<br />PDF / PPT upload (Provided By Client)<br />Video Upload (Provided By Client)
                       </td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">10(Weekly) + 1(Daily Bonus)
                           India BuyLeads under IndiaMART Advantage Program*</td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">
                           TrustSEAL</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align:middle">Higher
                           Listing (Position above
                           MDC)<br />TrustSEAL Logo<br />Third-party verified report in PDF<br />TrustSEAL Certificate<br />20(Weekly) + 2(Daily Bonus) India BuyLeads under IndiaMART Advantage Program*
                       </td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top: 3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Industry
                           Leader</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Top positioning on
                           Category-City
                           combinations<br />Differentiated branding for IL on IM platform<br />100(Weekly) + 4(Daily Bonus) India BuyLeads under IndiaMART Advantage<br />
                       </td>
                   </tr>
               </table>






           </TD>
           <TD valign="top" style="padding:5px 0 0 5px" width="50%">


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">
                           Preferred Industry Leader</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align:middle">Higher
                           Listing (Above
                           Leader)<br />Visibility in All India Page + Preferred Districts<br />Dynamic Preferred Districts<br />70 Weekly + 2 Daily BLs along with 25+1 Daily BLs (Per Category)
                       </td>
                   </tr>
               </table>






               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">
                           Preferred Leader</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align:middle">Higher
                           Listing (Above
                           Star)<br />Visibility in All India Page +  Preferred Districts<br />Dynamic Preferred Districts<br />40 Weekly + 2 Daily BLs along with 14+1 Daily BLs (Per Category)
                       </td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top: 3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">
                           Preferred Star</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align:middle">Higher
                           Listing (Above
                           TrustSEAL)<br />Visibility in  All India Page +  Preferred Districts<br />Dynamic Preferred Districts<br />30 Weekly + 2 Daily BLs along with 7+1 Daily BLs (Per Category)<br />
                       </td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top: 3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Leading
                           Supplier</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Base</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align: middle;">
                           Leading Supplier visibility (Above Star
                           Supplier)<br />70(Weekly)+ 3(Daily Bonus) India Buyleads under IndiaMART Advantage Program<br />No allocation of Category wise Buyleads
                       </td>
                   </tr>
               </table>


               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr style="background:#e9e9e9;">
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">
                           Maximiser</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Catalog</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Templated Catalog/Website
                           with control panel
                           (seller.indiamart.com)<br />Catalog will be hosted on its domain example:- www.companyname.com<br />Upto 100 Products to be added by IndiaMART<br />Standard (Not Customized) Product Blowup Images
                       </td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Promotional Activities </td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Business Listing on
                           IndiaMART Network - dir.indiamart.com</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Value Added Services</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">4 Email POP A/c</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Client Privilege</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Update Profile / Contact
                           Info<br />Client can add upto 40 categories & 400 products<br />PDF / PPT upload (Provided By Client)<br />Video Upload (Provided By Client)<br />Mobile Site: m.companydomain.com
                       </td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Media Section</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">Templated PDF Brochure (no
                           customization)<br />30 seconds Corporate Video (with no customization)**</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">30(Weekly) + 2(Daily Bonus)
                           India BuyLeads under IndiaMART Advantage program*</td>
                   </tr>
               </table>
               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Featured
                           Leader</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align:middle">
                           Visibility in Category-City combinations of your
                           choice<br />80(Weekly) + 4(Daily Bonus) India BuyLeads under IndiaMART Advantage Program<br />Premium positioning among suppliers in selected Category-City combinations
                       </td>
                   </tr>
               </table>




           </TD>
       </TR>
   </TABLE>
<table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
       <TR>
           <TD colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Service
               Offerings and Deliverables</TD>
       </TR>
   </TABLE>
   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top: 3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
       <tr style="background:#e9e9e9;">
           <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">IM Insta</td>
       </tr>
       <tr>
           <td
               style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
               Deliverables</td>
           <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;">1. Get a WhatsApp Business API account
               linked to your PNS number integrated with our Lead
               Manager.<br />2. Buyers can effortlessly send enquiries directly through WhatsApp.<br />3. Engage freely in conversations initiated by buyers with unlimited outgoing messages and also get 1 templated message per buyer per day (Note: subject to policy changes).<br />4. Get your complete Company profile on WhatsApp which reflects your brand with company logo and company details filled.<br />
           </td>
       </tr>
   </table>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
       <tr>
           <td valign="top" style="padding:5px 5px 0 0" width="50%">
               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Category
                           Leader India</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align:middle">Indian
                           leads in subscribed categories<br />The matchmaking would be real time & fully automated
                       </td>
                   </tr>
               </table>
               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td valign="top" style="padding:5px 5px 0 0" width="100%">
                           <div style="list-style: none;margin:0px;padding:0px;color:#2a2a2a;font-size:10px;">
                               <div>* Free balance of BuyLead allocation would start from the first Sunday post hosting
                               </div>
                               <div>* Any unused balance (of BuyLead) would expire at the end of every week</div>
                               <div>** Video will not be provided to the clients pertaining to the pharmaceutical
                                   industry</div>
                           </div>
                       </td>
                   </tr>
               </table>
           </td>
           <td valign="top" style="padding:5px 0 0 5px" width="50%">
               <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
                   style="border-collapse:collapse;border:1px solid #dddddd; width:100%;margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
                   <tr>
                       <td colspan="2" style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">IM LMS
                           Leads API</td>
                   </tr>
                   <tr>
                       <td
                           style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;background:#e6e7e9;font-weight:600;width:20%">
                           Deliverables</td>
                       <td style="border:1px solid #dddddd;padding:5px 5px;font-size:10px;vertical-align:middle">Pull
                           API: Retrieves IndiaMART Leads based on Hit
                           requests.<br />Push API: Delivers real-time IndiaMART Leads.<br />Lead types include: Enquiries, Buy-Leads, Calls, and View-Catalog Leads.<br />
                       </td>
                   </tr>
               </table>


           </td>
       </tr>
   </table>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%;margin:5px 0 5px 0;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
       <TR>
           <TD style="padding:5px 5px; background:#808285;color:#fff;font-weight:600;">Terms & Conditions</TD>
       </TR>
       <TR>
           <TD valign="top" style="padding:5px 5px 0 0" width="50%">
               <div style="list-style: none;margin:0px;padding:0px;color:#2a2a2a;font-size:10px;">
                   <div>1) IndiaMART InterMESH Ltd (hereafter referred to as 'IndiaMART') excludes any warranty,
                       express or implied, as to the quality, accuracy, timeliness, completeness, performance, fitness,
                       for a particular purpose of any of its contents, hosted on any of IndiaMART servers, unless
                       otherwise specified in writing.</div>
                   <div>2) IndiaMART will not be liable for any damages (including, without limitation, damages for
                       loss of business projects, or loss of profits) arising in contract, tort or otherwise from the
                       use of or inability to use any site or any of its contents, hosted on any of IndiaMART servers.
                   </div>
                   <div>3) You indemnify IndiaMART of all claims, conflicts or legal proceedings arising out of all
                       information, date, text, software, music, sound, photographs, graphics, videos, messages or any
                       other material ("content") posted on the website or privately transmitted. You undertake the
                       sole responsibility to take necessary actions under such circumstances. This means that you, and
                       not IndiaMART, are entirely responsible for all content that is present on your website, posted
                       or transmitted via the service.</div>
                   <div>4) You are responsible for ensuring that material on your site (hosted by IndiaMART) complies
                       with National and International Laws.</div>
                   <div>5) IndiaMART reserves the right to add or change the above terms and conditions as and when
                       required without giving any prior notice or assigning any reasons thereof and it is your
                       responsibility as a user to refer to the terms on accessing this service. Changes made by us
                       will be deemed to have been accepted, if you continue to use the services thereafter.</div>
                   <div>6) Corporate Profile, prepared by third party agencies will be a compilation of information of
                       your organization, and shall not be a credit rating. Third party agencies and IndiaMART will be
                       authorized to use this information for various promotional purposes, including displaying the
                       profile on the website, with no financial liability what-so-ever towards you or other users of
                       the Corporate Profile.</div>
                   <div>7) Refund of any amount is at the sole discretion of the company.</div>
                   <div>8) IndiaMART may have an option to convert your Service to an annual Service plan, if at any
                       time you are unable to pay the outstanding Service amount or choose to discontinue with your
                       Service plan. </div>
                   <div>9) If subscriber decides to unsubscribe from Maximiser, Star Supplier or Leading Supplier
                       Service before one year then add-on services (if any) will lapse simultaneously</div>
                   <div>10) IndiaMART reserves the right to add/modify/discontinue any of the features offered with a
                       service.</div>
                   <div>11) In order to ensure excellent customer service, your calls may be monitored or recorded.
                   </div>
                   <div>12) "We strongly recommend you to respond to all the Buyer Calls through IndiaMART PNS service,
                       failing which the delivery of the agreed services may be affected and curtailed."</div>
                   <div>13) By using the 'IM Insta' services, you agree to be bound by all applicable Meta policies,
                       including those contained herein: https://www.whatsapp.com/legal/meta-terms-whatsapp-business.
                       Non-compliance with Meta&#39;s policies may result in the disabling of your account by Meta.
                       IndiaMART offers no guarantee against such disablement, and your onboarding is contingent on
                       adherence to Meta&#39;s WhatsApp policy.</div>
                   <div>14) For Preferred Services (Star, Leader and Industry Leader), their visibility on preferred
                       district pages depends on preferred districts which are dynamic.</div>
                   <div>15) One time category Selection allowed for IM STAR/LEADER.</div>
                   <div>16) The Cashback Voucher will be invalid upon the expiry of 6 months from its date of issuance.
                   </div>
                   <div>17) It is agreed between the parties that initially (7+1) BuyLeads have been allotted to IM
                       STAR, (14+1) to IM LEADER and (25+1) to IM Industry Leader / Preferred Industry Leader for all
                       categories. Later, BuyLeads will get restricted to a specific category chosen by the subscriber.
                       However, the new subscriber may directly be offered specific category-wise BuyLeads only at a
                       later stage.</div>
                   <div>18) Any discounts offered by IndiaMART are subject to the continuation of Service for the
                       subscribed period. In case of early discontinuation, the services would be deemed to have been
                       subscribed at the applicable annual rates.</div>
                   <div>19) Offering of products/services of Busy Infotech Private Limited ('Busy') as a part of
                       specific subscribed package shall be determined and may be amended, in the sole discretion of
                       IndiaMART and/or Busy. Subscription of such products/services is only valid for a period of 12
                       months. Any such offering or subscription in the manner outlined hereinbefore shall be governed
                       by all the relevant terms and conditions applicable to such offering by Busy. In relation to the
                       Busy offering you are hereby advised to peruse such applicable terms.</div>
                   <div>20) If the service user chooses 3-month mode (NACH) as payment mode for the annual package, the
                       amount shall be discharged in three equal and automatic EMI installments in the first three
                       months.</div>
                   <div></div>
                   <div>By Accepting this document, the advertiser agrees to the terms of this proposal and Terms &
                       Conditions of Use located at http://www.indiamart.com/terms-of-use.html.</div>
               </div>
           </TD>


       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0" style="border-collapse:collapse;width:100%; margin-top:10px;">
       <TR>
           <TD style="border-top:5px solid #ef1d20;width:50%"></TD>
           <TD style="border-top:5px solid #2c358a;width:50%"></TD>
       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%; margin-top:3px;font-family: arial, sans-serif;font-size:12px;color:#231f20;line-height:14px;">
       <TR>
           <TD align="center">Regd. Office: 1st Floor, 29-Daryaganj, Netaji Subash Marg, Delhi - 110002, India |
               CIN:L74899DL1999PLC101534</TD>
       </TR>
   </TABLE>


   <table BORDER="0" CELLPADDING="0" CELLSPACING="0"
       style="border-collapse:collapse;width:100%; margin-top:10px;font-family: arial, sans-serif;font-size:13px;font-weight:600">
       <TR>
           <TD align="center"><img src="http://localhost:3000/assets/phone.png" alt="IndiaMART InterMESH Ltd." width="15" height="15"
                                   align="absmiddle"> 09696969696 &nbsp;&nbsp;&nbsp;&nbsp; <img src="http://localhost:3000/assets/sms.png" alt="IndiaMART InterMESH Ltd."
                                   width="15" height="15" align="absmiddle"> customercare@indiamart.com</TD>
       </TR>
   </TABLE>
</section>
</body>
</html>`
;

// Helper function to replace template variables
function replaceTemplateVariables(html, data) {
  let processedHtml = html;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedHtml = processedHtml.replace(regex, data[key] || '');
  });
  return processedHtml;
}

// Routes
app.post('/generate-pdf', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { html, data, options = {} } = req.body;
    
    // Use provided HTML or sample HTML
    let htmlContent = html || sampleHTML;
    
    // Replace template variables if data is provided
    if (data) {
      htmlContent = replaceTemplateVariables(htmlContent, data);
    } else {
      // Use sample data for testing
      const sampleData = {
        projectName: "PDF Generation Optimization Project",
        projectId: "PROJ-2025-001",
        approvalDate: new Date().toLocaleDateString(),
        budget: "$50,000",
        projectDescription: "This project aims to optimize PDF generation performance to achieve sub-1-second response times using Node.js, Puppeteer, and Docker containerization.",
        planningStart: "2025-06-01",
        planningEnd: "2025-06-15",
        devStart: "2025-06-16",
        devEnd: "2025-07-30",
        testStart: "2025-08-01",
        testEnd: "2025-08-15",
        generatedDate: new Date().toLocaleString()
      };
      
      htmlContent = replaceTemplateVariables(htmlContent, sampleData);
    }
    
    logger.info('Starting PDF generation', {
      htmlLength: htmlContent.length,
      hasCustomData: !!data
    });
    
    const pdfBuffer = await generatePDF(htmlContent, options);
    const generationTime = Date.now() - startTime;
    
    logger.info('PDF generated successfully', {
      generationTime: `${generationTime}ms`,
      pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`
    });
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'X-Generation-Time': `${generationTime}ms`,
      'Content-Disposition': 'attachment; filename="approved-proposal.pdf"'
    });
    
    res.send(pdfBuffer);
    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.error('PDF generation failed', {
      error: error.message,
      timeToError: `${errorTime}ms`,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message,
      timeToError: `${errorTime}ms`
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Performance metrics endpoint
app.get('/metrics', (req, res) => {
  const used = process.memoryUsage();
  res.json({
    memory: {
      rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(used.external / 1024 / 1024)}MB`
    },
    uptime: `${Math.round(process.uptime())}s`,
    pid: process.pid,
    version: process.version
  });
});

// Fixed sample endpoint to test with sample data
app.get('/generate-sample-pdf', async (req, res) => {
  const startTime = Date.now();
  
  try {
//     Define sample data
//     const sampleData = {
//       projectName: 'Sample Project for Testing',
//       projectId: 'SAMPLE-001',
//       approvalDate: new Date().toLocaleDateString(),
//       budget: '$25,000',
//       projectDescription: 'This is a sample project created specifically for testing PDF generation functionality. It demonstrates the complete workflow from HTML template processing to PDF output.',
//       planningStart: '2025-06-01',
//       planningEnd: '2025-06-15',
//       devStart: '2025-06-16',
//       devEnd: '2025-07-30',
//       testStart: '2025-08-01',
//       testEnd: '2025-08-15',
//       generatedDate: new Date().toLocaleString()
//     };
    
//     // Process the HTML template with sample data
//     const processedHtml = replaceTemplateVariables(sampleHTML, sampleData);
    
//     logger.info('Generating sample PDF', {
//       htmlLength: processedHtml.length
//     });
    
    // Generate PDF
    const pdfBuffer = await generatePDF(sampleHTML, {
      timeout: 60000 // 60 seconds timeout
    });
    const generationTime = Date.now() - startTime;
    
    logger.info('Sample PDF generated successfully', {
      generationTime: `${generationTime}ms`,
      pdfSize: `${Math.round(pdfBuffer.length / 1024)}KB`
    });
    
    // Set proper headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'X-Generation-Time': `${generationTime}ms`,
      'Content-Disposition': 'attachment; filename="sample-proposal.pdf"'
    });
    
    res.send(Buffer.from(pdfBuffer));    
  } catch (error) {
    const errorTime = Date.now() - startTime;
    logger.error('Sample PDF generation failed', {
      error: error.message,
      timeToError: `${errorTime}ms`,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Sample PDF generation failed',
      message: error.message,
      timeToError: `${errorTime}ms`
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await closeBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await closeBrowser();
  process.exit(0);
});

// Initialize browser and start server
async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`PDF Generator API started on port ${PORT}`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📄 Test PDF generation: http://localhost:${PORT}/generate-sample-pdf`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();