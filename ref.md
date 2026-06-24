The easiest and most professional way is:

Architecture
Website Form
    ↓
API / Backend
    ↓
1. Save to Database
2. Send Email
3. Send WhatsApp Notification
    ↓
Success Message
If you're using Next.js (recommended)
Step 1: Create Database Table
CREATE TABLE enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Step 2: Frontend Form
<form>
    <input name="name" />
    <input name="company" />
    <input name="phone" />
    <input name="email" />
    <textarea name="message"></textarea>

    <button type="submit">
        Get Quote
    </button>
</form>
Step 3: Backend API

When user clicks Submit:

POST /api/enquiry

Data sent:

{
  "name":"John",
  "company":"ABC Hospital",
  "phone":"9876543210",
  "email":"john@gmail.com",
  "message":"Need quotation"
}
Step 4: Save to Database
await db.query(
  "INSERT INTO enquiries (...) VALUES (...)"
);

Now every enquiry is permanently stored.

Step 5: Send Email

Use:

SMTP (Hostinger, Zoho, Google Workspace)
Or better: Resend

Email sent to:

sales@royalcleanse.com

Example:

New Website Enquiry

Name: John
Company: ABC Hospital
Phone: 9876543210
Email: john@gmail.com

Message:
Need quotation
Step 6: WhatsApp Notification

There are 2 ways.

Method A (Free)

After submission:

window.open(
  `https://wa.me/919876543210?text=New enquiry received`
)

This requires manual sending.